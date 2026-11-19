"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import ClientSelect, { NEW_CLIENT_VALUE } from "@/components/ClientSelect";
import UpgradeModal from "@/components/UpgradeModal";
import { supabase } from "@/lib/supabase";
import { capture } from "@/lib/analytics";
import { createClientQuick } from "@/lib/clients";
import {
  NEW_INVOICE_CLIENT_PARAM,
  NEW_INVOICE_FROM_PARAM,
  NEW_INVOICE_PARAM,
  NEW_INVOICE_TO_PARAM,
} from "@/lib/appEvents";
import type { Client } from "@/lib/types";
import {
  DAY_ABBREV,
  clampDuration,
  formatDuration,
  formatMoney,
  parseDuration,
  toISODate,
} from "@/lib/format";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";

/** Minutos válidos de un texto de duración, o null si no se entiende. */
function toMinutes(text: string): number | null {
  const parsed = parseDuration(text);
  return parsed != null && parsed > 0 ? clampDuration(parsed) : null;
}

/**
 * Carga de varios días de un mes en un solo paso, para un cliente.
 *
 * El uso real no es trackear día a día: la gente llega con las horas del mes
 * sabidas, las carga todas juntas y arma el invoice en la misma sesión. Acá
 * eso es una grilla (un campo por día) en vez de N pasadas por el formulario
 * del tracker, y al guardar ofrece el invoice del período ya filtrado.
 */
export default function MonthBulkEntry({
  clients,
  initialClientId,
  initialMonth,
  onClose,
  onSaved,
}: {
  clients: Client[];
  initialClientId?: string;
  /** YYYY-MM. Por defecto, el mes en curso. */
  initialMonth?: string;
  onClose: () => void;
  /** Se guardaron entradas: quien lo abre refresca su lista. */
  onSaved: () => void;
}) {
  const router = useRouter();
  const today = toISODate(new Date());
  const [clientId, setClientId] = useState(
    initialClientId ?? (clients.length === 1 ? clients[0].id : "")
  );
  const [newClientName, setNewClientName] = useState("");
  // Nunca un mes futuro: el tracker puede estar parado en una semana que viene.
  const currentMonth = today.slice(0, 7);
  const [month, setMonth] = useState(
    initialMonth && initialMonth <= currentMonth ? initialMonth : currentMonth
  );
  const [description, setDescription] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [fill, setFill] = useState("8:00");
  // Minutos ya cargados por día para este cliente y mes: evita duplicar.
  const [existing, setExisting] = useState<Map<string, number>>(new Map());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [done, setDone] = useState<{
    clientId: string;
    clientName: string;
    days: number;
    minutes: number;
  } | null>(null);

  const days = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    if (!y || !m) return [];
    const count = new Date(y, m, 0).getDate();
    return Array.from({ length: count }, (_, i) => new Date(y, m - 1, i + 1));
  }, [month]);
  const from = days.length ? toISODate(days[0]) : "";
  const to = days.length ? toISODate(days[days.length - 1]) : "";

  const creatingClient = clients.length === 0 || clientId === NEW_CLIENT_VALUE;
  const client = creatingClient ? undefined : clients.find((c) => c.id === clientId);

  useEffect(() => {
    setExisting(new Map());
    if (!client || !from) return;
    let cancelled = false;
    supabase
      .from("time_entries")
      .select("entry_date, duration_minutes")
      .eq("client_id", client.id)
      .gte("entry_date", from)
      .lte("entry_date", to)
      .then(({ data }) => {
        if (cancelled || !data) return;
        const map = new Map<string, number>();
        for (const e of data) {
          map.set(e.entry_date, (map.get(e.entry_date) ?? 0) + e.duration_minutes);
        }
        setExisting(map);
      });
    return () => {
      cancelled = true;
    };
  }, [client, from, to]);

  const rows = days.map((d) => {
    const iso = toISODate(d);
    const text = (values[iso] ?? "").trim();
    const minutes = text ? toMinutes(text) : null;
    return { d, iso, text, minutes, invalid: text !== "" && minutes == null };
  });
  const filled = rows.filter((r) => r.minutes != null);
  const totalMinutes = filled.reduce((s, r) => s + (r.minutes ?? 0), 0);
  const hasInvalid = rows.some((r) => r.invalid);
  const fillMinutes = toMinutes(fill);
  const canSave =
    filled.length > 0 &&
    !hasInvalid &&
    (creatingClient ? newClientName.trim().length > 0 : clientId !== "");

  // Lunes a viernes sin valor, hasta hoy: los días que todavía no pasaron no
  // tienen horas que cargar.
  function fillWeekdays() {
    if (fillMinutes == null) return;
    const text = formatDuration(fillMinutes);
    setValues((cur) => {
      const next = { ...cur };
      for (const d of days) {
        const iso = toISODate(d);
        const weekday = d.getDay() !== 0 && d.getDay() !== 6;
        if (weekday && iso <= today && !(next[iso] ?? "").trim()) next[iso] = text;
      }
      return next;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError(null);
    let target = client;
    if (creatingClient) {
      const created = await createClientQuick({ name: newClientName, source: "tracker" });
      if (!created.ok) {
        setSaving(false);
        if (created.limit) setShowUpgrade(true);
        else setError(created.message);
        return;
      }
      target = created.client;
    }
    if (!target) {
      setSaving(false);
      return;
    }
    const { error: err } = await supabase.from("time_entries").insert(
      filled.map((r) => ({
        client_id: target.id,
        entry_date: r.iso,
        duration_minutes: r.minutes,
        description: description.trim(),
        billable: true,
      }))
    );
    setSaving(false);
    if (err) {
      setError(
        creatingClient
          ? `${err.message} El cliente "${target.name}" ya quedó creado: cerrá y volvé a abrir para elegirlo.`
          : err.message
      );
      if (creatingClient) onSaved();
      return;
    }
    // Un evento por carga, no por día: `entries` dice cuántas entradas fueron.
    capture("time_entry_created", {
      source: "bulk_month",
      entries: filled.length,
      duration_minutes: totalMinutes,
      billable: true,
    });
    onSaved();
    setDone({
      clientId: target.id,
      clientName: target.name,
      days: filled.length,
      minutes: totalMinutes,
    });
  }

  if (done) {
    const params = new URLSearchParams({
      [NEW_INVOICE_PARAM]: "1",
      [NEW_INVOICE_CLIENT_PARAM]: done.clientId,
      [NEW_INVOICE_FROM_PARAM]: from,
      [NEW_INVOICE_TO_PARAM]: to,
    });
    return (
      <Modal title="Horas cargadas" onClose={onClose}>
        <p className="text-sm text-slate-600">
          ✓ {formatDuration(done.minutes)} h en {done.days} {done.days === 1 ? "día" : "días"} para{" "}
          <strong className="font-semibold text-slate-900">{done.clientName}</strong>.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Listo
          </button>
          <button
            onClick={() => router.push(`/invoices?${params.toString()}`)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Armar el invoice
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal title="Cargar varios días" onClose={onClose}>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-500">Cliente</label>
              <ClientSelect
                clients={clients}
                value={clientId}
                onChange={setClientId}
                newName={newClientName}
                onNewNameChange={setNewClientName}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Mes</label>
              <input
                type="month"
                required
                value={month}
                max={currentMonth}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setValues({});
                }}
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Descripción (opcional, va en todas las entradas)
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Desarrollo, consultoría…"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex items-end gap-2 rounded-lg bg-slate-50 p-3">
            <div className="w-24">
              <label className="mb-1 block text-xs font-medium text-slate-500">Lun a vie</label>
              <input
                value={fill}
                onChange={(e) => setFill(e.target.value)}
                aria-label="Horas por día hábil"
                className={`${INPUT_CLASS} bg-white font-mono`}
              />
            </div>
            <button
              type="button"
              onClick={fillWeekdays}
              disabled={fillMinutes == null}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Rellenar vacíos
            </button>
            <button
              type="button"
              onClick={() => setValues({})}
              className="ml-auto px-1 py-2 text-sm text-slate-500 hover:text-slate-800"
            >
              Limpiar
            </button>
          </div>

          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {rows.map((r) => {
              const weekend = r.d.getDay() === 0 || r.d.getDay() === 6;
              const already = existing.get(r.iso);
              return (
                <li
                  key={r.iso}
                  className={`flex items-center gap-3 px-3 py-1.5 ${weekend ? "bg-slate-50" : ""}`}
                >
                  <label
                    htmlFor={`bulk-${r.iso}`}
                    className={`w-14 shrink-0 text-sm ${
                      weekend ? "text-slate-400" : "text-slate-700"
                    }`}
                  >
                    {DAY_ABBREV[r.d.getDay()]} {r.d.getDate()}
                  </label>
                  <input
                    id={`bulk-${r.iso}`}
                    value={values[r.iso] ?? ""}
                    onChange={(e) => setValues((cur) => ({ ...cur, [r.iso]: e.target.value }))}
                    onBlur={() => {
                      if (r.minutes != null) {
                        setValues((cur) => ({ ...cur, [r.iso]: formatDuration(r.minutes!) }));
                      }
                    }}
                    placeholder="—"
                    aria-invalid={r.invalid}
                    className={`w-20 rounded-lg border bg-white px-2.5 py-1.5 font-mono text-sm focus:outline-none ${
                      r.invalid
                        ? "border-red-400 focus:border-red-500"
                        : "border-slate-300 focus:border-indigo-500"
                    }`}
                  />
                  {already ? (
                    <span className="text-xs text-amber-700">
                      ya hay {formatDuration(already)}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-slate-400">
            Escribí 8, 1:30, 1.5 o 90m. Máximo 8:00 por día; los días vacíos no se cargan.
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <p className="min-w-0 text-sm text-slate-600">
              <strong className="font-mono font-semibold text-slate-900">
                {formatDuration(totalMinutes)}
              </strong>{" "}
              h
              {client && client.hourly_rate > 0 && totalMinutes > 0 ? (
                <span className="block truncate text-xs text-slate-500">
                  {formatMoney((totalMinutes / 60) * client.hourly_rate, client.currency)}
                </span>
              ) : null}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="hidden rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 sm:block"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !canSave}
                className="whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving
                  ? "Guardando…"
                  : `Cargar ${filled.length || ""} ${filled.length === 1 ? "día" : "días"}`}
              </button>
            </div>
          </div>
        </form>
      </Modal>
      {showUpgrade && <UpgradeModal reason="clients" onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
