"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setPostLoginNext } from "@/lib/postLogin";
import { formatHours, formatMoney } from "@/lib/format";
import {
  cancelPendingGrant,
  fetchAdminUsers,
  fetchIsAdmin,
  fetchLifetimeGrants,
  grantLifetime,
  revokeLifetime,
  type AdminUser,
  type LifetimeGrant,
} from "@/lib/admin";
import Logo from "@/components/Logo";
import Wordmark from "@/components/Wordmark";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";

// Back office: solo para el admin (is_admin() en la base). Usuarios con su plan
// y uso, ventas de LemonSqueezy y accesos lifetime dados a mano.

type Gate = "loading" | "denied" | "ok";
type Tab = "users" | "sales";
type PlanFilter = "all" | "free" | "lifetime";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "1 venta", "3 ventas". */
function count(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

function withinDays(iso: string | null, days: number): boolean {
  return !!iso && Date.now() - new Date(iso).getTime() <= days * DAY_MS;
}

export default function AdminPage() {
  const router = useRouter();
  const [gate, setGate] = useState<Gate>("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        // Al volver del login, retomamos acá en vez de ir al tracker.
        setPostLoginNext("/admin");
        router.replace("/login");
        return;
      }
      setEmail(data.session.user.email ?? null);
      setGate((await fetchIsAdmin()) ? "ok" : "denied");
    });
  }, [router]);

  if (gate === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">Cargando…</div>
    );
  }

  if (gate === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold">Sin acceso</h1>
          <p className="mt-2 text-sm text-slate-500">Esta sección es solo para administración.</p>
          <Link
            href="/tracker"
            className="mt-5 inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-white"
          >
            Volver a la app
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <div className="flex items-center gap-2">
            <Logo size={26} />
            <Wordmark className="text-base text-slate-800" />
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-white">
              Back office
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden truncate text-slate-500 sm:inline">{email}</span>
            <Link href="/tracker" className="font-medium text-indigo-600 hover:underline">
              Volver a la app
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <BackOffice />
      </main>
    </div>
  );
}

function BackOffice() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [grants, setGrants] = useState<LifetimeGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("users");
  const [grantTarget, setGrantTarget] = useState<{ email: string; locked: boolean } | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<AdminUser | null>(null);
  const [cancelTarget, setCancelTarget] = useState<LifetimeGrant | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [usersRes, grantsRes] = await Promise.all([fetchAdminUsers(), fetchLifetimeGrants()]);
    if (usersRes.error || grantsRes.error) {
      setError((usersRes.error ?? grantsRes.error)!.message);
    } else {
      setUsers(usersRes.data);
      setGrants(grantsRes.data);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const lifetime = users.filter((u) => u.plan === "lifetime");
    const sales = grants.filter((g) => g.source === "lemonsqueezy" && !g.test_mode);
    const activeSales = sales.filter((g) => g.status === "active");
    return {
      users: users.length,
      newUsers: users.filter((u) => withinDays(u.created_at, 30)).length,
      active: users.filter((u) => withinDays(u.last_entry_at, 30)).length,
      lifetime: lifetime.length,
      paid: lifetime.filter((u) => u.grant_source === "lemonsqueezy").length,
      manual: lifetime.filter((u) => u.grant_source !== "lemonsqueezy").length,
      sales: activeSales.length,
      refunded: sales.filter((g) => g.status === "refunded").length,
      revenueUsd: activeSales.reduce((sum, g) => sum + (g.amount_usd_cents ?? 0), 0) / 100,
      pending: grants.filter((g) => g.status === "active" && !g.user_id).length,
    };
  }, [users, grants]);

  async function handleRevoke() {
    if (!revokeTarget) return;
    setBusy(true);
    const err = await revokeLifetime(revokeTarget.user_id);
    setBusy(false);
    if (err) {
      setError(err);
    } else {
      setNotice(`${revokeTarget.email} volvió al plan gratis.`);
      load();
    }
    setRevokeTarget(null);
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    setBusy(true);
    const err = await cancelPendingGrant(cancelTarget.id);
    setBusy(false);
    if (err) {
      setError(err);
    } else {
      setNotice(`Se canceló el acceso pendiente de ${cancelTarget.email}.`);
      load();
    }
    setCancelTarget(null);
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Back office</h1>
          <p className="mt-1 text-sm text-slate-500">Usuarios, ventas y accesos lifetime.</p>
        </div>
        <button
          onClick={() => setGrantTarget({ email: "", locked: false })}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Dar lifetime access
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      {notice && (
        <p className="mb-4 flex items-start justify-between gap-3 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} aria-label="Cerrar aviso" className="text-emerald-600">
            ✕
          </button>
        </p>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Usuarios"
          value={loading ? "—" : String(stats.users)}
          note={`+${stats.newUsers} en los últimos 30 días`}
        />
        <StatTile
          label="Activos"
          value={loading ? "—" : String(stats.active)}
          note="Cargaron horas en 30 días"
        />
        <StatTile
          label="Lifetime"
          value={loading ? "—" : String(stats.lifetime)}
          note={`${count(stats.paid, "pago", "pagos")} · ${count(stats.manual, "dado", "dados")} a mano`}
        />
        <StatTile
          label="Ventas"
          value={loading ? "—" : formatMoney(stats.revenueUsd, "USD")}
          note={`${count(stats.sales, "venta", "ventas")}${
            stats.refunded ? ` · ${count(stats.refunded, "reembolsada", "reembolsadas")}` : ""
          }`}
        />
      </div>

      <div className="mb-4 flex gap-1 border-b border-slate-200" role="tablist">
        <TabButton active={tab === "users"} onClick={() => setTab("users")}>
          Usuarios <span className="text-slate-400">{users.length}</span>
        </TabButton>
        <TabButton active={tab === "sales"} onClick={() => setTab("sales")}>
          Ventas y accesos <span className="text-slate-400">{grants.length}</span>
          {stats.pending > 0 && (
            <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
              {stats.pending} pendiente{stats.pending === 1 ? "" : "s"}
            </span>
          )}
        </TabButton>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : tab === "users" ? (
        <UsersTable
          users={users}
          onGrant={(u) => setGrantTarget({ email: u.email ?? "", locked: true })}
          onRevoke={setRevokeTarget}
        />
      ) : (
        <SalesTable grants={grants} onCancel={setCancelTarget} />
      )}

      {grantTarget && (
        <GrantModal
          initialEmail={grantTarget.email}
          locked={grantTarget.locked}
          onClose={() => setGrantTarget(null)}
          onDone={(message) => {
            setGrantTarget(null);
            setError(null);
            setNotice(message);
            load();
          }}
        />
      )}

      {revokeTarget && (
        <ConfirmDialog
          title="¿Quitar el lifetime access?"
          message={`${revokeTarget.email} vuelve al plan gratis (3 clientes activos y 4 invoices). No borra nada de lo que ya cargó.${
            revokeTarget.grant_source === "lemonsqueezy"
              ? " Pagó por LemonSqueezy: si corresponde, el reembolso se hace allá."
              : ""
          }`}
          confirmLabel="Quitar acceso"
          danger
          busy={busy}
          onConfirm={handleRevoke}
          onCancel={() => setRevokeTarget(null)}
        />
      )}

      {cancelTarget && (
        <ConfirmDialog
          title="¿Cancelar el acceso pendiente?"
          message={`Si ${cancelTarget.email} crea su cuenta, entra con el plan gratis.`}
          confirmLabel="Cancelar acceso"
          danger
          busy={busy}
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </>
  );
}

function StatTile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-indigo-600 text-indigo-700"
          : "border-transparent text-slate-500 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function Badge({ tone, children }: { tone: "slate" | "indigo" | "green" | "amber" | "red"; children: React.ReactNode }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-50 text-red-700",
  };
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function PlanBadge({ user }: { user: AdminUser }) {
  if (user.plan === "owner") return <Badge tone="slate">Owner</Badge>;
  if (user.plan === "free") return <Badge tone="slate">Gratis</Badge>;
  return (
    <Badge tone="indigo">
      Lifetime{user.grant_source === "lemonsqueezy" ? " · pago" : user.grant_source === "manual" ? " · a mano" : ""}
    </Badge>
  );
}

const TH = "px-4 py-3 font-medium";
const TD = "px-4 py-3";

function UsersTable({
  users,
  onGrant,
  onRevoke,
}: {
  users: AdminUser[];
  onGrant: (user: AdminUser) => void;
  onRevoke: (user: AdminUser) => void;
}) {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<PlanFilter>("all");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(
      (u) =>
        (!q || (u.email ?? "").toLowerCase().includes(q)) &&
        (plan === "all" || (plan === "free" ? u.plan === "free" : u.plan !== "free"))
    );
  }, [users, search, plan]);

  return (
    <>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por email"
          aria-label="Buscar usuarios por email"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as PlanFilter)}
          aria-label="Filtrar por plan"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Todos los planes</option>
          <option value="free">Gratis</option>
          <option value="lifetime">Lifetime</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className={TH}>Usuario</th>
              <th className={TH}>Alta</th>
              <th className={TH}>Último ingreso</th>
              <th className={TH}>Uso</th>
              <th className={TH}>Plan</th>
              <th className={`${TH} text-right`}>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No hay usuarios con estos filtros.
                </td>
              </tr>
            ) : (
              visible.map((u) => (
                <tr key={u.user_id}>
                  <td className={`${TD} max-w-[260px] truncate font-medium`} title={u.email ?? ""}>
                    {u.email ?? "Sin email"}
                  </td>
                  <td className={`${TD} whitespace-nowrap text-slate-600`}>{formatDate(u.created_at)}</td>
                  <td className={`${TD} whitespace-nowrap text-slate-600`}>
                    {formatDate(u.last_sign_in_at)}
                  </td>
                  <td className={`${TD} whitespace-nowrap text-slate-600`}>
                    {u.entries === 0 && u.clients === 0 ? (
                      <span className="text-slate-400">Sin uso</span>
                    ) : (
                      <>
                        {count(u.clients, "cliente", "clientes")} · {formatHours(u.minutes)} ·{" "}
                        {count(u.invoices, "invoice", "invoices")}
                      </>
                    )}
                  </td>
                  <td className={TD}>
                    <PlanBadge user={u} />
                  </td>
                  <td className={`${TD} text-right`}>
                    {u.plan === "free" && u.email && (
                      <button
                        onClick={() => onGrant(u)}
                        className="text-sm font-medium text-indigo-600 hover:underline"
                      >
                        Dar lifetime
                      </button>
                    )}
                    {u.plan === "lifetime" && (
                      <button
                        onClick={() => onRevoke(u)}
                        className="text-sm font-medium text-slate-500 hover:text-red-600"
                      >
                        Quitar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function GrantStatus({ grant }: { grant: LifetimeGrant }) {
  return (
    <div className="flex flex-wrap gap-1">
      {grant.status === "active" &&
        (grant.user_id ? (
          <Badge tone="green">Activo</Badge>
        ) : (
          <Badge tone="amber">Pendiente de cuenta</Badge>
        ))}
      {grant.status === "refunded" && <Badge tone="red">Reembolsada</Badge>}
      {grant.status === "revoked" && <Badge tone="slate">Revocado</Badge>}
      {grant.test_mode && <Badge tone="slate">Prueba</Badge>}
    </div>
  );
}

function SalesTable({
  grants,
  onCancel,
}: {
  grants: LifetimeGrant[];
  onCancel: (grant: LifetimeGrant) => void;
}) {
  if (grants.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400 shadow-sm">
        Todavía no hay ventas ni accesos dados a mano.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className={TH}>Fecha</th>
            <th className={TH}>Email</th>
            <th className={TH}>Origen</th>
            <th className={`${TH} text-right`}>Monto</th>
            <th className={TH}>Estado</th>
            <th className={`${TH} text-right`}>Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {grants.map((g) => (
            <tr key={g.id} className={g.status === "active" ? "" : "text-slate-400"}>
              <td className={`${TD} whitespace-nowrap`}>{formatDate(g.created_at)}</td>
              <td className={`${TD} max-w-[240px]`}>
                <p className="truncate font-medium" title={g.email ?? ""}>
                  {g.email ?? "Sin email"}
                </p>
                {g.customer_name && <p className="truncate text-xs text-slate-500">{g.customer_name}</p>}
              </td>
              <td className={TD}>
                {g.source === "lemonsqueezy" ? (
                  <span className="whitespace-nowrap">
                    LemonSqueezy{g.ls_order_number ? ` #${g.ls_order_number}` : ""}
                  </span>
                ) : (
                  <div className="max-w-[220px]">
                    <span>A mano</span>
                    {g.note && (
                      <p className="truncate text-xs text-slate-500" title={g.note}>
                        {g.note}
                      </p>
                    )}
                  </div>
                )}
              </td>
              <td className={`${TD} whitespace-nowrap text-right tabular-nums`}>
                {g.amount_cents != null && g.currency ? (
                  <>
                    {formatMoney(g.amount_cents / 100, g.currency)}
                    {g.currency !== "USD" && g.amount_usd_cents != null && (
                      <p className="text-xs text-slate-500">
                        {formatMoney(g.amount_usd_cents / 100, "USD")}
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className={TD}>
                <GrantStatus grant={g} />
              </td>
              <td className={`${TD} text-right`}>
                {g.status === "active" && !g.user_id && (
                  <button
                    onClick={() => onCancel(g)}
                    className="text-sm font-medium text-slate-500 hover:text-red-600"
                  >
                    Cancelar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GrantModal({
  initialEmail,
  locked,
  onClose,
  onDone,
}: {
  initialEmail: string;
  locked: boolean;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const target = email.trim().toLowerCase();
    const res = await grantLifetime(target, note);
    setBusy(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    onDone(
      res.pending
        ? `${target} todavía no tiene cuenta: el lifetime access se activa solo cuando entre con ese email.`
        : `Listo: ${target} ya tiene lifetime access.`
    );
  }

  return (
    <Modal title="Dar lifetime access" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="grant-email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="grant-email"
            type="email"
            required
            autoFocus={!locked}
            readOnly={locked}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="persona@mail.com"
            className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ${
              locked ? "bg-slate-50 text-slate-600" : ""
            }`}
          />
          {!locked && (
            <p className="mt-1 text-xs text-slate-500">
              Si todavía no tiene cuenta, el acceso queda pendiente y se activa cuando entre con este email.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="grant-note" className="mb-1 block text-sm font-medium text-slate-700">
            Nota interna <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="grant-note"
            type="text"
            autoFocus={locked}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder="Ej.: beta tester, sorteo, pago por transferencia"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {busy ? "…" : "Dar acceso"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
