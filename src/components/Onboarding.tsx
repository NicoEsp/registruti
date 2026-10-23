"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import DurationInput from "@/components/DurationInput";
import { supabase } from "@/lib/supabase";
import { CURRENCIES } from "@/lib/types";
import { createClientQuick } from "@/lib/clients";
import { takeCalculatedRate } from "@/lib/calculatedRate";
import { emitEntryAdded } from "@/lib/appEvents";
import { formatDuration, toISODate } from "@/lib/format";
import { capture } from "@/lib/analytics";

const ONBOARDED_KEY = "registruti_onboarded_v1";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";

/**
 * Wizard de bienvenida para cuentas sin clientes. Se muestra una sola vez.
 *
 * Tres pantallas: bienvenida, la primera entrada de tiempo (que crea el
 * cliente de paso) y listo. La versión anterior pedía país, razón social y
 * CUIT antes del primer proyecto, y el proyecto antes de la primera hora: 3
 * de 5 registros se fueron en ese paso. Los datos de facturación ahora se
 * piden recién al armar la primera factura (NewInvoiceModal). Todo es
 * salteable.
 */
export default function Onboarding() {
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  // Primera entrada
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<number | null>(60);
  // Tarifa: plegada salvo que venga de la calculadora pública.
  const [showRate, setShowRate] = useState(false);
  const [rate, setRate] = useState("");
  const [currency, setCurrency] = useState("");
  /** La tarifa vino de la calculadora pública, no de un default nuestro. */
  const [rateFromCalculator, setRateFromCalculator] = useState(false);

  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  // Si el cliente se creó pero la entrada falló, el reintento lo reutiliza.
  const [createdClient, setCreatedClient] = useState<{ id: string; name: string } | null>(null);
  /** Lo que quedó registrado, para la pantalla final. */
  const [created, setCreated] = useState<{ client: string; minutes: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(ONBOARDED_KEY)) return;
    // Solo mostramos el wizard si el usuario no tiene clientes aún.
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (error) return; // ante cualquier problema, no molestamos
        if ((count ?? 0) === 0) setShow(true);
        else localStorage.setItem(ONBOARDED_KEY, "1");
      });
  }, []);

  // Si la persona llegó desde la calculadora de tarifa, el primer cliente
  // arranca con el número que calculó. Se consume recién cuando el wizard se
  // va a mostrar: si no, lo borraríamos sin usarlo.
  useEffect(() => {
    if (!show) return;
    const calculated = takeCalculatedRate();
    if (!calculated) return;
    setRate(String(calculated.rate));
    setCurrency(calculated.currency);
    setRateFromCalculator(true);
    setShowRate(true);
  }, [show]);

  function finish() {
    // `step` dice hasta dónde llegó: 2 es el wizard completo (la entrada quedó
    // registrada), menos es salida temprana. Es la diferencia entre "el
    // onboarding es largo" y "no engancha".
    capture("onboarding_completed", {
      last_step: step,
      created_client: created !== null,
      // Si la tarifa vino de /cuanto-cobrar-por-hora. Es lo que dice si la
      // calculadora trae gente que se queda o solo visitas.
      rate_from_calculator: rateFromCalculator,
    });
    if (typeof window !== "undefined") localStorage.setItem(ONBOARDED_KEY, "1");
    setShow(false);
    if (!created) return;
    // La entrada ya existe: si el tracker está abajo se refresca solo; si no,
    // lo abrimos para que la vea en su semana.
    if (pathname === "/tracker") emitEntryAdded();
    else router.push("/tracker");
  }

  async function createFirstEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim() || duration == null) return;
    setBusy(true);
    setNote(null);

    let client = createdClient;
    if (!client) {
      const result = await createClientQuick({
        name: clientName,
        source: "onboarding",
        hourlyRate: showRate ? Number(rate) : 0,
        currency: showRate && currency ? currency : undefined,
      });
      if (!result.ok) {
        setBusy(false);
        setNote(
          result.limit
            ? "Llegaste al límite de clientes del plan gratis."
            : result.message
        );
        return;
      }
      client = { id: result.client.id, name: result.client.name };
      setCreatedClient(client);
    }

    const { error } = await supabase.from("time_entries").insert({
      client_id: client.id,
      entry_date: toISODate(new Date()),
      duration_minutes: duration,
      description: description.trim(),
      billable: true,
    });
    setBusy(false);
    if (error) {
      setNote(`El cliente quedó creado, pero no se pudo registrar el tiempo: ${error.message}`);
      return;
    }
    capture("time_entry_created", {
      source: "onboarding",
      duration_minutes: duration,
      billable: true,
    });
    setCreated({ client: client.name, minutes: duration });
    setStep(2);
  }

  if (!show) return null;

  return (
    <div
      data-overlay
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4"
    >
      <div className="sheet-in w-full max-w-md rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl sm:pb-6">
        {/* Progreso */}
        <div className="mb-5 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-indigo-600" : "bg-slate-200"}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Bienvenido/a a Registruti 👋</h2>
            <p className="mt-2 text-sm text-slate-600">
              Registruti te muestra <strong>cuánto tiempo le dedicás a cada cliente</strong> y, si
              querés, convierte esas horas en una factura lista para enviar.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Lo único que hace falta para empezar es cargar tu primera hora. Lleva menos de un
              minuto.
            </p>
            <div className="mt-6 flex justify-between">
              <button onClick={finish} className="text-sm text-slate-500 hover:text-slate-800">
                Saltar
              </button>
              <button
                onClick={() => setStep(1)}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Empezar
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={createFirstEntry}>
            <h2 className="text-xl font-semibold tracking-tight">Tu primera entrada</h2>
            <p className="mt-1 text-sm text-slate-500">
              Algo que hiciste hoy. El cliente se crea en este mismo paso.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Cliente o proyecto
                </label>
                <input
                  autoFocus
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Acme, App de Juan…"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  ¿En qué trabajaste? (opcional)
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Reunión de kickoff"
                  className={INPUT_CLASS}
                />
              </div>
              <div className="w-40">
                <label className="mb-1 block text-xs font-medium text-slate-500">Duración</label>
                <DurationInput value={duration} onChange={setDuration} />
              </div>

              {showRate ? (
                <div>
                  {rateFromCalculator && (
                    <p className="mb-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                      Dejamos cargada la tarifa que calculaste. Podés cambiarla acá o después,
                      cliente por cliente.
                    </p>
                  )}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-slate-500">
                        Tarifa por hora
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        placeholder="0"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div className="w-28">
                      <label className="mb-1 block text-xs font-medium text-slate-500">
                        Moneda
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className={`${INPUT_CLASS} bg-white`}
                      >
                        <option value="">Según país</option>
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowRate(true)}
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  + Agregar tarifa por hora (opcional, para facturar)
                </button>
              )}
            </div>
            {note && <p className="mt-3 text-xs text-red-600">{note}</p>}
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={finish}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                Omitir
              </button>
              <button
                type="submit"
                disabled={busy || !clientName.trim() || duration == null}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {busy ? "Registrando…" : "Registrar"}
              </button>
            </div>
          </form>
        )}

        {step === 2 && created && (
          <div>
            <h2 className="text-xl font-semibold tracking-tight">¡Listo! 🎉</h2>
            <p className="mt-2 text-sm text-slate-600">
              Registraste <strong>{formatDuration(created.minutes)}</strong> a{" "}
              <strong>{created.client}</strong> hoy. Ya está en tu semana.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              <li>· Repetilo cada día: con la tecla T lo cargás desde cualquier pantalla.</li>
              <li>· Cuando quieras cobrar esas horas, armás la factura en Facturas. Tus datos de
                emisor te los pedimos recién ahí.</li>
            </ul>
            <div className="mt-6 flex justify-end">
              <button
                onClick={finish}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Ver mi semana
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
