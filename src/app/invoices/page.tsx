"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Modal from "@/components/Modal";
import SampleInvoicePreview from "@/components/SampleInvoicePreview";
import UpgradeModal from "@/components/UpgradeModal";
import { supabase } from "@/lib/supabase";
import { fetchAllRows } from "@/lib/fetchAllRows";
import { fetchInvoiceEntries } from "@/lib/invoiceEntries";
import { hasIssuerData } from "@/lib/invoiceIssuer";
import { COUNTRIES, countryFor, localeFor } from "@/lib/countries";
import { setUserProperties } from "@/lib/analytics";
import {
  ENTRY_ADDED_EVENT,
  NEW_INVOICE_EVENT,
  NEW_INVOICE_PARAM,
  useAppEvent,
  useOpenParam,
} from "@/lib/appEvents";
import { downloadInvoicePdf, type InvoiceIssuer } from "@/lib/invoicePdf";
import { fetchIssuer } from "@/lib/profile";
import { FREE_INVOICE_LIMIT, fetchIsPro, isInvoiceLimitError } from "@/lib/plan";
import { capture } from "@/lib/analytics";
import type { Client, Invoice, TimeEntry } from "@/lib/types";
import {
  formatDuration,
  formatMoney,
  formatShortDate,
  setMoneyLocale,
  toISODate,
} from "@/lib/format";
import { invoiceStatusLabel, invoiceStatusStyle } from "@/lib/invoiceStatus";

// Ids por UPDATE al marcar las entradas de un invoice: ~4 KB de URL por tanda.
const MARK_BATCH = 100;

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";

export default function InvoicesPage() {
  return (
    <AppShell>
      <Invoices />
    </AppShell>
  );
}

function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  // Distinto de `loading`, que vuelve a true en cada recarga: esto dice si la
  // lista de clientes ya llegó al menos una vez. El modal lo necesita para no
  // confundir el [] inicial con "no tiene clientes".
  const [clientsLoaded, setClientsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [pro, setPro] = useState(false);
  const [newClientId, setNewClientId] = useState<string | null>(null);
  const [newFrom, setNewFrom] = useState<string | null>(null);
  const [pdfBusyId, setPdfBusyId] = useState<string | null>(null);
  const [issuer, setIssuer] = useState<InvoiceIssuer | null>(null);
  const [unbilled, setUnbilled] = useState<Map<string, { minutes: number; earliest: string }>>(
    new Map()
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    const [invoicesRes, clientsRes, issuerData, unbilledRes] = await Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("*").order("name"),
      fetchIssuer(),
      // Sin rango de fechas: lo pendiente puede pasar el "Max rows" de PostgREST.
      fetchAllRows<Pick<TimeEntry, "client_id" | "duration_minutes" | "entry_date">>((first, last) =>
        supabase
          .from("time_entries")
          .select("client_id, duration_minutes, entry_date", { count: "exact" })
          .is("invoice_id", null)
          .eq("billable", true)
          .order("id")
          .range(first, last)
      ),
    ]);
    if (invoicesRes.error || clientsRes.error) {
      setError(invoicesRes.error?.message ?? clientsRes.error?.message ?? null);
    } else {
      setInvoices(invoicesRes.data);
      setClients(clientsRes.data);
      setClientsLoaded(true);
      setIssuer(issuerData);
      const map = new Map<string, { minutes: number; earliest: string }>();
      for (const e of unbilledRes.data ?? []) {
        const agg = map.get(e.client_id) ?? { minutes: 0, earliest: e.entry_date };
        agg.minutes += e.duration_minutes;
        if (e.entry_date < agg.earliest) agg.earliest = e.entry_date;
        map.set(e.client_id, agg);
      }
      setUnbilled(map);
      // Si solo falló la query de horas sin facturar, lo decimos en vez de
      // esconder el banner en silencio.
      setError(
        unbilledRes.error
          ? `No se pudieron cargar las horas sin facturar: ${unbilledRes.error.message}`
          : null
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetchIsPro().then(setPro);
  }, []);

  // Plan gratis: hasta FREE_INVOICE_LIMIT invoices en total.
  const atInvoiceLimit = !pro && invoices.length >= FREE_INVOICE_LIMIT;
  const openNew = useCallback(() => {
    if (atInvoiceLimit) setShowUpgrade(true);
    else setShowNew(true);
  }, [atInvoiceLimit]);

  // Apertura del modal desde el atajo global (F / ⌘K), vía evento o ?nueva=1,
  // y refresco en vivo cuando se registra tiempo desde el atajo global.
  useAppEvent(NEW_INVOICE_EVENT, openNew);
  useAppEvent(ENTRY_ADDED_EVENT, loadData);
  useOpenParam(NEW_INVOICE_PARAM, openNew);

  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);

  // Cliente activo con más horas facturables pendientes, para sugerir la factura.
  const topUnbilled = useMemo(() => {
    let best: { clientId: string; minutes: number; earliest: string } | null = null;
    for (const [clientId, agg] of unbilled) {
      const client = clientById.get(clientId);
      if (!client || client.archived) continue;
      if (!best || agg.minutes > best.minutes) best = { clientId, ...agg };
    }
    return best;
  }, [unbilled, clientById]);

  async function handleDownloadPdf(inv: Invoice) {
    const client = clientById.get(inv.client_id);
    if (!client) {
      setError("No se encontró el cliente del invoice.");
      return;
    }
    setPdfBusyId(inv.id);
    try {
      const { data: entries, error: err } = await fetchInvoiceEntries(inv.id);
      if (err) {
        setError(err.message);
        return;
      }
      downloadInvoicePdf({
        invoice: inv,
        clientName: client.name,
        clientContact: client.contact_name,
        clientEmail: client.email,
        entries: entries ?? [],
        issuer,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo generar el PDF.");
    } finally {
      // Solo limpiamos si sigue siendo esta fila: si el usuario disparó otra
      // descarga mientras tanto, no le pisamos su estado de carga.
      setPdfBusyId((cur) => (cur === inv.id ? null : cur));
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <div className="flex items-center gap-3">
          {!pro && (
            <span className="hidden text-xs text-slate-400 sm:inline">
              {invoices.length}/{FREE_INVOICE_LIMIT} en plan gratis
            </span>
          )}
          <button
            onClick={openNew}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Nuevo invoice
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {!loading && topUnbilled && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
          <p className="text-sm text-indigo-900">
            Tenés{" "}
            <strong className="font-semibold">{formatDuration(topUnbilled.minutes)}</strong> sin
            facturar de{" "}
            <strong className="font-semibold">
              {clientById.get(topUnbilled.clientId)?.name}
            </strong>
            . ¿Armamos el PDF?
          </p>
          <button
            onClick={() => {
              if (atInvoiceLimit) {
                setShowUpgrade(true);
                return;
              }
              setNewClientId(topUnbilled.clientId);
              // El período arranca en la entrada sin facturar más vieja, para
              // que el modal muestre exactamente las horas que promete el banner.
              setNewFrom(topUnbilled.earliest);
              setShowNew(true);
            }}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Armar invoice
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : invoices.length === 0 ? (
        // Sin invoices todavía: en vez de un hueco, el invoice de muestra. Es
        // lo que la persona vino a ver y lo último que llegaba a ver.
        <div>
          <p className="py-6 text-center text-sm text-slate-400">
            Todavía no generaste invoices. El primero sale de tus horas cargadas, y queda así:
          </p>
          <SampleInvoicePreview />
        </div>
      ) : (
        <>
        {/* Mobile: tarjetas */}
        <div className="space-y-3 md:hidden">
          {invoices.map((inv) => (
            <div key={inv.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/invoices/${inv.id}`}
                  className="truncate font-medium text-indigo-600 hover:underline"
                >
                  {inv.invoice_number}
                </Link>
                <span
                  className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${invoiceStatusStyle(inv)}`}
                >
                  {invoiceStatusLabel(inv)}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-slate-700">
                {clientById.get(inv.client_id)?.name ?? "—"}
              </p>
              <p className="text-xs text-slate-500">
                {formatShortDate(inv.period_start)} – {formatShortDate(inv.period_end)} ·{" "}
                <span className="font-mono">{formatDuration(inv.total_minutes)}</span>
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="font-semibold">
                  {formatMoney(inv.total_amount, inv.currency)}
                </span>
                <div className="flex gap-2">
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                  >
                    Ver
                  </Link>
                  <button
                    onClick={() => handleDownloadPdf(inv)}
                    disabled={pdfBusyId === inv.id}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"
                  >
                    {pdfBusyId === inv.id ? "…" : "Descargar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: tabla */}
        <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Período</th>
                <th className="px-4 py-3">Horas</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{clientById.get(inv.client_id)?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatShortDate(inv.period_start)} – {formatShortDate(inv.period_end)}
                  </td>
                  <td className="px-4 py-3 font-mono">{formatDuration(inv.total_minutes)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatMoney(inv.total_amount, inv.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${invoiceStatusStyle(inv)}`}
                    >
                      {invoiceStatusLabel(inv)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium hover:bg-slate-50"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => handleDownloadPdf(inv)}
                        disabled={pdfBusyId === inv.id}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"
                      >
                        {pdfBusyId === inv.id ? "…" : "Descargar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {showNew && (
        <NewInvoiceModal
          clients={clients.filter((c) => !c.archived)}
          clientsLoaded={clientsLoaded}
          invoiceCount={invoices.length}
          issuer={issuer}
          initialClientId={newClientId}
          initialFrom={newFrom}
          onClose={() => {
            setShowNew(false);
            setNewClientId(null);
            setNewFrom(null);
          }}
          onLimit={() => {
            setShowNew(false);
            setNewClientId(null);
            setNewFrom(null);
            setShowUpgrade(true);
          }}
          onCreated={() => {
            setShowNew(false);
            setNewClientId(null);
            setNewFrom(null);
            loadData();
          }}
        />
      )}

      {showUpgrade && <UpgradeModal reason="invoices" onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}

function NewInvoiceModal({
  clients,
  clientsLoaded,
  invoiceCount,
  issuer,
  initialClientId,
  initialFrom,
  onClose,
  onLimit,
  onCreated,
}: {
  clients: Client[];
  clientsLoaded: boolean;
  invoiceCount: number;
  issuer: InvoiceIssuer | null;
  initialClientId?: string | null;
  initialFrom?: string | null;
  onClose: () => void;
  onLimit: () => void;
  onCreated: () => void;
}) {
  const now = new Date();
  const [clientId, setClientId] = useState(initialClientId ?? "");
  const [from, setFrom] = useState(
    initialFrom ?? toISODate(new Date(now.getFullYear(), now.getMonth(), 1))
  );
  const [to, setTo] = useState(toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
  const [dueDate, setDueDate] = useState("");
  const [preview, setPreview] = useState<TimeEntry[] | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  // Se incrementa para volver a pedir el preview con los mismos filtros.
  const [previewNonce, setPreviewNonce] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Datos del emisor. Se piden acá y no en el wizard de bienvenida porque
  // este es el primer momento en que hacen falta; solo si el perfil está
  // vacío, y siguen siendo opcionales.
  const askIssuer = !hasIssuerData(issuer);
  const [country, setCountry] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [taxId, setTaxId] = useState("");

  // Una vez por apertura del modal: quien llega a la factura sin nada que
  // facturar es la señal de que el orden del producto no le cerró.
  const blockedRef = useRef(false);
  function captureBlocked(reason: "no_clients" | "no_billable_hours") {
    if (blockedRef.current) return;
    blockedRef.current = true;
    capture("invoice_blocked", { reason });
  }
  // Recién cuando la lista cargó: el modal puede abrirse con la query en vuelo
  // (?nueva=1 desde la paleta o la PWA, el atajo F) y `clients` ser el []
  // inicial de alguien que sí tiene clientes.
  const noClients = clientsLoaded && clients.length === 0;
  useEffect(() => {
    if (noClients) captureBlocked("no_clients");
  }, [noClients]);

  const client = clients.find((c) => c.id === clientId);

  useEffect(() => {
    // Mientras carga no queda el preview de otros filtros: "Crear" usaría un
    // total que no corresponde al período elegido.
    setPreview(null);
    setPreviewError(null);
    if (!clientId) return;
    let cancelled = false;
    // Paginado: un período largo pasa el "Max rows" de PostgREST y el total
    // del invoice tiene que incluir todas las entradas.
    fetchAllRows<TimeEntry>((first, last) =>
      supabase
        .from("time_entries")
        .select("*", { count: "exact" })
        .eq("client_id", clientId)
        .eq("billable", true)
        .is("invoice_id", null)
        .gte("entry_date", from)
        .lte("entry_date", to)
        .order("id")
        .range(first, last)
    ).then(({ data, error: err }) => {
      if (cancelled) return;
      if (err) setPreviewError(err.message);
      else {
        setPreview(data);
        if (data.length === 0) captureBlocked("no_billable_hours");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [clientId, from, to, previewNonce]);

  const totalMinutes = preview?.reduce((s, e) => s + e.duration_minutes, 0) ?? 0;
  const totalAmount = client ? (totalMinutes / 60) * client.hourly_rate : 0;

  async function handleCreate() {
    if (!client || !preview || preview.length === 0) return;
    setBusy(true);
    setError(null);
    // Los datos del emisor van a Ajustes (el perfil), no al invoice: el
    // próximo ya los tiene. Solo los campos que se cargaron: un vacío no debe
    // pisar con null lo que ya hay en el perfil (el país, por ejemplo, que
    // puede estar aunque hasIssuerData no lo mire).
    if (askIssuer && (country || businessName.trim() || taxId.trim())) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error: profileErr } = await supabase.from("profiles").upsert({
          user_id: user.id,
          ...(businessName.trim() ? { business_name: businessName.trim() } : {}),
          ...(taxId.trim() ? { tax_id: taxId.trim() } : {}),
          ...(country ? { country } : {}),
        });
        if (profileErr) {
          setBusy(false);
          setError(`No se pudieron guardar tus datos de emisor: ${profileErr.message}`);
          return;
        }
        if (country) {
          setMoneyLocale(localeFor(country));
          setUserProperties({ country });
        }
      }
    }
    // Numeración atómica por usuario (evita duplicados). Si la RPC todavía no
    // fue creada (migración sin aplicar), caemos al conteo local como respaldo.
    const { data: rpcNumber } = await supabase.rpc("next_invoice_number");
    const invoiceNumber =
      typeof rpcNumber === "string"
        ? rpcNumber
        : `INV-${(invoiceCount + 1).toString().padStart(4, "0")}`;
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .insert({
        client_id: client.id,
        invoice_number: invoiceNumber,
        period_start: from,
        period_end: to,
        due_date: dueDate || null,
        hourly_rate: client.hourly_rate,
        currency: client.currency,
        total_minutes: totalMinutes,
        total_amount: Math.round(totalAmount * 100) / 100,
      })
      .select()
      .single();
    if (invErr || !invoice) {
      setBusy(false);
      // El límite del plan gratis lo aplica un trigger de la base: si saltó,
      // abrimos el paywall en vez de mostrar el error crudo.
      if (isInvoiceLimitError(invErr?.message)) onLimit();
      else setError(invErr?.message ?? "No se pudo crear el invoice");
      return;
    }
    // Se marcan exactamente las entradas del preview, que son las que suman el
    // total, y solo si siguen cumpliendo los filtros. Va por tandas de ids: con
    // miles, un solo .in("id", [...]) arma una URL más larga de lo que aceptan
    // los proxies. El count de cada tanda dice cuántas tomó.
    let updErr: { message: string } | null = null;
    let marked = 0;
    let countKnown = true;
    for (let i = 0; i < preview.length; i += MARK_BATCH) {
      const { error: batchErr, count } = await supabase
        .from("time_entries")
        .update({ invoice_id: invoice.id }, { count: "exact" })
        .in(
          "id",
          preview.slice(i, i + MARK_BATCH).map((e) => e.id)
        )
        .eq("client_id", client.id)
        .eq("billable", true)
        .is("invoice_id", null)
        .gte("entry_date", from)
        .lte("entry_date", to);
      if (batchErr) {
        updErr = batchErr;
        break;
      }
      // count null: la respuesta no trajo el total y no hay con qué comparar.
      if (count == null) countKnown = false;
      else marked += count;
    }
    const mismatch = !updErr && countKnown && marked !== preview.length;
    if (updErr || mismatch) {
      // Un invoice con un total que no coincide con sus entradas es peor que
      // ninguno: se sueltan las que se hayan marcado y se borra. Pasa si una
      // tanda falla o si entre el preview y el click una entrada del preview
      // se borró, se editó o se facturó (otra pestaña, el MCP).
      const { error: undoErr } = await supabase
        .from("time_entries")
        .update({ invoice_id: null })
        .eq("invoice_id", invoice.id);
      const { error: delErr } = undoErr
        ? { error: undoErr }
        : await supabase.from("invoices").delete().eq("id", invoice.id);
      setBusy(false);
      const reason = updErr
        ? updErr.message
        : "Las horas del período cambiaron mientras armabas el invoice. Revisá el resumen y volvé a intentar.";
      setError(
        delErr
          ? `${reason} Además no se pudo deshacer el invoice ${invoice.invoice_number}: borralo desde la lista.`
          : reason
      );
      if (mismatch) setPreviewNonce((n) => n + 1);
      return;
    }
    setBusy(false);
    // Recién acá: si el marcado de las entradas falla, el invoice se deshace,
    // así que contarlo antes sería inflar el número que más importa.
    //
    // Sin montos: cuánto factura cada usuario a sus clientes es dato de ellos,
    // no de la analítica. Con las horas y la moneda alcanza para dimensionar.
    capture("invoice_created", {
      currency: client.currency,
      total_minutes: totalMinutes,
      entries: preview.length,
    });
    onCreated();
  }

  return (
    <Modal title="Nuevo invoice" onClose={onClose}>
      <div className="space-y-3">
        {/* Un invoice no es un comprobante de ARCA/DGI/SII. Se dice en el
            momento de armarlo, que es cuando aparece la duda. */}
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
          Es un documento comercial con el detalle de horas y el monto a cobrar: no tiene validez
          fiscal. Tu factura electrónica la seguís emitiendo como siempre.
        </p>

        {noClients && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Todavía no tenés horas cargadas, y el invoice sale de las horas. Cargá la primera en
            el{" "}
            <Link href="/tracker" onClick={onClose} className="font-medium underline">
              Tracker
            </Link>{" "}
            y volvé acá.
          </p>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Cliente</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={`${INPUT_CLASS} bg-white`}
          >
            <option value="">Elegir…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Vencimiento (opcional)
          </label>
          <input
            type="date"
            value={dueDate}
            min={toISODate(now)}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-400">
            Pasada esta fecha, el invoice enviado se marca como vencido.
          </p>
        </div>

        {askIssuer && (
          <div className="space-y-2 rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-700">Tus datos en el invoice</p>
            <p className="text-xs text-slate-500">
              Opcional. Aparecen como “De:” en el PDF y quedan guardados en Ajustes para las
              próximas.
            </p>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              aria-label="País"
              className={`${INPUT_CLASS} bg-white`}
            >
              <option value="">País…</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Tu nombre o razón social"
              aria-label="Nombre o razón social"
              className={INPUT_CLASS}
            />
            <input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder={`${countryFor(country)?.taxIdLabel ?? "CUIT / ID fiscal"} (ej. ${
                countryFor(country)?.taxIdPlaceholder ?? "20-12345678-9"
              })`}
              aria-label={countryFor(country)?.taxIdLabel ?? "CUIT / ID fiscal"}
              className={INPUT_CLASS}
            />
          </div>
        )}

        {client && preview && (
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            {preview.length === 0 ? (
              <p className="text-slate-500">
                No hay horas facturables sin facturar en este período.
              </p>
            ) : (
              <>
                <p className="flex justify-between">
                  <span className="text-slate-500">Entradas a facturar</span>
                  <span className="font-medium">{preview.length}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500">Horas</span>
                  <span className="font-mono font-medium">{formatDuration(totalMinutes)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500">
                    Tarifa ({formatMoney(client.hourly_rate, client.currency)}/h)
                  </span>
                  <span className="font-semibold">
                    {formatMoney(totalAmount, client.currency)}
                  </span>
                </p>
              </>
            )}
          </div>
        )}

        {client && !preview && !previewError && (
          <p className="text-sm text-slate-400">Buscando horas sin facturar…</p>
        )}

        {previewError && <p className="text-sm text-red-600">{previewError}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={busy || !client || !preview || preview.length === 0}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {busy ? "Creando…" : "Crear invoice"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
