"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { setPostLoginNext } from "@/lib/postLogin";
import Logo from "@/components/Logo";
import Wordmark from "@/components/Wordmark";

/**
 * Pantalla de consentimiento OAuth del servidor MCP.
 *
 * La abre el cliente MCP (Claude, Cursor, Claude Code…) con los parámetros
 * del authorization request. La sesión de Registruti vive en el browser, así
 * que el flujo es: validar el pedido contra /api/oauth/authorize (qué app pide
 * qué permisos), mandar al login si no hay sesión (y volver acá después), y al
 * aprobar pedir el code con el JWT del usuario y volver a la app que lo pidió.
 *
 * Si el pedido es inválido por client_id o redirect_uri, se muestra el error
 * y NO se redirige a ningún lado (RFC 6749 §4.1.2.1).
 */

interface Inspection {
  client: { name: string; uri: string | null; logo: string | null; kind: string };
  scopes: { id: string; label: string }[];
  return_to: string;
}

interface ApiError {
  error: string;
  error_description?: string;
  redirect?: string | null;
}

type ApiResponse = Inspection | { redirect: string } | ApiError;

type Phase = "loading" | "login" | "ready" | "working" | "redirecting" | "error";

function isApiError(r: ApiResponse): r is ApiError {
  return typeof (r as ApiError).error === "string";
}

function hasRedirect(r: ApiResponse): r is { redirect: string } {
  return typeof (r as { redirect?: unknown }).redirect === "string";
}

async function callAuthorizeApi(
  decision: "inspect" | "approve" | "deny",
  params: Record<string, string>,
  jwt?: string
): Promise<ApiResponse> {
  let res: Response;
  try {
    res = await fetch("/api/oauth/authorize", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(jwt ? { authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify({ decision, params }),
    });
  } catch {
    return { error: "network_error", error_description: "No pude hablar con el servidor. Revisá tu conexión." };
  }
  try {
    return (await res.json()) as ApiResponse;
  } catch {
    return { error: "server_error", error_description: `Respuesta inválida del servidor (${res.status}).` };
  }
}

export default function OAuthAuthorizePage() {
  return (
    <Suspense
      fallback={
        <Frame>
          <p className="text-sm text-slate-500">Cargando…</p>
        </Frame>
      }
    >
      <Consent />
    </Suspense>
  );
}

function Consent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const [phase, setPhase] = useState<Phase>("loading");
  const [info, setInfo] = useState<Inspection | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  const params = Object.fromEntries(new URLSearchParams(search).entries());

  function goToLogin() {
    setPostLoginNext(`${window.location.pathname}${window.location.search}`);
    setPhase("login");
    router.replace("/login");
  }

  useEffect(() => {
    let cancelled = false;
    const currentParams = Object.fromEntries(new URLSearchParams(search).entries());

    (async () => {
      const [inspection, sessionRes] = await Promise.all([
        callAuthorizeApi("inspect", currentParams),
        supabase.auth.getSession(),
      ]);
      if (cancelled) return;

      if (isApiError(inspection)) {
        if (inspection.redirect) {
          setPhase("redirecting");
          window.location.replace(inspection.redirect);
          return;
        }
        setError(inspection.error_description ?? inspection.error);
        setPhase("error");
        return;
      }
      setInfo(inspection as Inspection);

      if (!sessionRes.data.session) {
        setPostLoginNext(`${window.location.pathname}${window.location.search}`);
        setPhase("login");
        router.replace("/login");
        return;
      }
      setSession(sessionRes.data.session);
      setPhase("ready");
    })();

    return () => {
      cancelled = true;
    };
  }, [search, router]);

  async function decide(decision: "approve" | "deny") {
    setPhase("working");
    let jwt: string | undefined;
    if (decision === "approve") {
      // El JWT pudo vencer mientras la pantalla estaba abierta: pedimos el actual.
      const { data } = await supabase.auth.getSession();
      jwt = data.session?.access_token;
      if (!jwt) {
        goToLogin();
        return;
      }
    }
    const res = await callAuthorizeApi(decision, params, jwt);
    if (hasRedirect(res)) {
      setPhase("redirecting");
      window.location.replace(res.redirect);
      return;
    }
    if (isApiError(res) && res.error === "login_required") {
      goToLogin();
      return;
    }
    setError(isApiError(res) ? (res.error_description ?? res.error) : "Error inesperado.");
    setPhase("error");
  }

  async function switchAccount() {
    setPostLoginNext(`${window.location.pathname}${window.location.search}`);
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (phase === "loading" || phase === "login") {
    return (
      <Frame>
        <p className="text-sm text-slate-500">
          {phase === "login" ? "Te llevamos a iniciar sesión…" : "Verificando el pedido…"}
        </p>
      </Frame>
    );
  }

  if (phase === "error" || !info) {
    return (
      <Frame>
        <h1 className="text-lg font-semibold">No se pudo autorizar</h1>
        <p className="mt-2 text-sm text-red-600">{error ?? "Pedido inválido."}</p>
        <p className="mt-4 text-sm text-slate-500">
          Volvé a tu cliente MCP y probá conectar Registruti de nuevo. Si sigue fallando,
          escribinos a{" "}
          <a href="mailto:hola@registruti.app" className="text-indigo-600 hover:underline">
            hola@registruti.app
          </a>
          .
        </p>
        <Link href="/" className="mt-5 inline-block text-sm font-medium text-indigo-600 hover:underline">
          Ir a Registruti
        </Link>
      </Frame>
    );
  }

  if (phase === "redirecting") {
    return (
      <Frame>
        <p className="text-sm text-slate-500">Volviendo a {info.client.name}…</p>
      </Frame>
    );
  }

  const busy = phase === "working";
  const email = session?.user.email ?? null;

  return (
    <Frame>
      <div className="flex items-center gap-3">
        {info.client.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={info.client.logo}
            alt=""
            className="h-10 w-10 rounded-lg border border-slate-200 object-contain"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-xl" aria-hidden>
            🔌
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-lg font-semibold leading-tight">
            {info.client.name} quiere conectarse a tu cuenta
          </h1>
          {info.client.uri && (
            <p className="truncate text-xs text-slate-500">{info.client.uri}</p>
          )}
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-600">
        Si autorizás, <strong>{info.client.name}</strong> va a poder:
      </p>
      <ul className="mt-2 space-y-1.5">
        {info.scopes.map((s) => (
          <li key={s.id} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-0.5 text-emerald-600" aria-hidden>
              ✓
            </span>
            {s.label}
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Cuenta: <span className="font-medium text-slate-800">{email ?? "tu cuenta de Registruti"}</span>
        {" · "}
        <button
          type="button"
          onClick={switchAccount}
          disabled={busy}
          className="text-indigo-600 hover:underline disabled:opacity-50"
        >
          Cambiar de cuenta
        </button>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => decide("deny")}
          disabled={busy}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => decide("approve")}
          disabled={busy}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? "Autorizando…" : "Autorizar"}
        </button>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Después de autorizar volvés a {info.return_to}. Podés revocar el acceso cuando quieras desde
        Ajustes → Conexión con Claude y otros asistentes.
      </p>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Logo size={32} />
          <Wordmark className="text-xl text-slate-800" />
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
