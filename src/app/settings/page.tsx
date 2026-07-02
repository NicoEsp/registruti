"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  return (
    <AppShell>
      <Settings />
    </AppShell>
  );
}

function Settings() {
  const [businessName, setBusinessName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("profiles")
      .select("business_name, tax_id, email, address")
      .maybeSingle();
    if (err) {
      // Tabla inexistente (migración sin aplicar) u otro error: dejamos el form vacío.
      setError(err.message);
    } else if (data) {
      setBusinessName(data.business_name ?? "");
      setTaxId(data.tax_id ?? "");
      setEmail(data.email ?? "");
      setAddress(data.address ?? "");
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("No hay sesión activa.");
      setBusy(false);
      return;
    }
    const { error: err } = await supabase.from("profiles").upsert({
      user_id: user.id,
      business_name: businessName.trim() || null,
      tax_id: taxId.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Ajustes</h1>
      <p className="mb-6 text-sm text-slate-500">
        Datos del emisor que aparecen como <span className="font-medium">“De:”</span> en tus
        facturas en PDF.
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Nombre o razón social
            </label>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Tu nombre o el de tu negocio"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">CUIT / ID fiscal</label>
            <input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="20-12345678-9"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Email de contacto</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hola@tunegocio.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Dirección</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Calle 123, Ciudad, País"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {busy ? "Guardando…" : "Guardar"}
            </button>
            {saved && <span className="text-sm text-emerald-600">Guardado ✓</span>}
          </div>
        </form>
      )}

      <AccountSection />
    </div>
  );
}

function AccountSection() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function changePassword() {
    const password = prompt("Nueva contraseña (mínimo 6 caracteres):");
    if (!password) return;
    const { error } = await supabase.auth.updateUser({ password });
    alert(error ? `Error: ${error.message}` : "Contraseña actualizada.");
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Cuenta</h2>
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {email && <p className="truncate text-sm text-slate-500">{email}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={changePassword}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cambiar contraseña
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </section>
  );
}
