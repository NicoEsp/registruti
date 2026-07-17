"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Modal from "@/components/Modal";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/appEvents";
import { COUNTRIES, countryFor, localeFor, validateTaxId } from "@/lib/countries";
import { setMoneyLocale } from "@/lib/format";

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
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    // `select *` tolera columnas todavía no migradas (ej. country).
    const { data, error: err } = await supabase.from("profiles").select("*").maybeSingle();
    if (err) {
      // Tabla inexistente (migración sin aplicar) u otro error: dejamos el form vacío.
      setError(err.message);
    } else if (data) {
      setBusinessName(data.business_name ?? "");
      setTaxId(data.tax_id ?? "");
      setEmail(data.email ?? "");
      setAddress(data.address ?? "");
      setCountry(data.country ?? "");
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const countryConfig = countryFor(country);
  const taxIdLabel = countryConfig?.taxIdLabel ?? "CUIT / ID fiscal";
  const taxIdPlaceholder = countryConfig?.taxIdPlaceholder ?? "20-12345678-9";
  const taxIdOk = validateTaxId(countryConfig, taxId);

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
      country: country || null,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    // Los montos de toda la app pasan a formatearse con el locale del país.
    setMoneyLocale(localeFor(country || null));
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
            <label className="mb-1 block text-xs font-medium text-slate-500">País</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Elegir…</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              Define el tipo de ID fiscal y el formato de los montos.
            </p>
          </div>
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
            <label className="mb-1 block text-xs font-medium text-slate-500">{taxIdLabel}</label>
            <input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder={taxIdPlaceholder}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
            {!taxIdOk && (
              <p className="mt-1 text-xs text-amber-600">
                El formato no parece un {taxIdLabel} válido (ej. {taxIdPlaceholder}). Se guarda
                igual.
              </p>
            )}
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
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Cuenta</h2>
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {email && <p className="truncate text-sm text-slate-500">{email}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setChangingPassword(true)}
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
      {changingPassword && <PasswordModal onClose={() => setChangingPassword(false)} />}
    </section>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    showToast("✓ Contraseña actualizada");
    onClose();
  }

  return (
    <Modal title="Cambiar contraseña" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Nueva contraseña
          </label>
          <input
            type="password"
            autoFocus
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Repetir contraseña
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy || !password || !confirmation}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {busy ? "Guardando…" : "Actualizar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
