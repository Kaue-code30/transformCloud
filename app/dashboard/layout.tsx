"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart3, Home, LogOut, Loader2, UserCircle, Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ThemeProvider, useTheme } from "@/lib/theme-context";

const nav = [
  { href: "/dashboard", icon: BarChart3, label: "Billing" },
  // { href: "/dashboard/portability", icon: Shield, label: "Portabilidade" },
  // { href: "/dashboard/migrations", icon: Zap, label: "Migrações" },
  // { href: "/dashboard/ai", icon: Bot, label: "IA Insights" },
  // { href: "/dashboard/settings", icon: Settings, label: "Configurações" },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Modo claro" : "Modo escuro"}
      className="p-1.5 rounded-lg transition-colors"
      style={{
        color: "var(--ds-text-3)",
        background: "transparent",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ds-text)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ds-text-3)")}
    >
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, loading, logout } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--ds-bg)" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--ds-accent)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--ds-bg)" }}>

      {/* ── SIDEBAR (desktop) ───────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-56 lg:w-60 fixed top-0 bottom-0 left-0 z-40"
        style={{
          background: "var(--ds-surface)",
          borderRight: "1px solid var(--ds-border)",
        }}
      >
        {/* Logo */}
        <div
          className="px-5 h-16 flex items-center flex-shrink-0"
          style={{ borderBottom: "1px solid var(--ds-border)" }}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#b3fe71] flex items-center justify-center">
              <span className="text-black font-black text-sm leading-none">TC</span>
            </div>
            <span className="font-black text-sm tracking-tight" style={{ color: "var(--ds-text)" }}>
              Transform<span className="text-[var(--ds-accent)]">Cloud</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                style={{
                  background: active ? "rgba(179,254,113,0.10)" : "transparent",
                  color: active ? "var(--ds-accent)" : "var(--ds-text-2)",
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "var(--ds-hover)"; e.currentTarget.style.color = "var(--ds-text)"; }}}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ds-text-2)"; }}}
              >
                <item.icon size={15} style={{ color: active ? "var(--ds-accent)" : "var(--ds-text-2)" }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="p-4 flex-shrink-0 flex flex-col gap-2"
          style={{ borderTop: "1px solid var(--ds-border)" }}
        >
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 px-1 py-1 rounded-xl transition-colors group"
            style={{ color: "var(--ds-text)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ds-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div className="w-7 h-7 rounded-full bg-[#b3fe71]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[var(--ds-accent)] text-xs font-bold">{user.name[0].toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "var(--ds-text)" }}>{user.name}</p>
              <p className="text-[11px] truncate" style={{ color: "var(--ds-text-5)" }}>{user.email}</p>
            </div>
            <UserCircle size={13} style={{ color: "var(--ds-text-4)" }} className="flex-shrink-0 group-hover:text-[var(--ds-accent)] transition-colors" />
          </Link>

          <div className="flex gap-1 items-center">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg flex-1 transition-colors"
              style={{ color: "var(--ds-text-3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ds-text-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ds-text-3)")}
            >
              <Home size={12} /> Voltar ao site
            </Link>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg transition-colors"
              style={{ color: "var(--ds-text-3)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ds-text-3)"; e.currentTarget.style.background = "transparent"; }}
              title="Sair"
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── TOP BAR (mobile) ────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 justify-between"
        style={{ background: "var(--ds-surface)", borderBottom: "1px solid var(--ds-border)" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#b3fe71] flex items-center justify-center">
            <span className="text-black font-black text-xs">TC</span>
          </div>
          <span className="font-black text-sm" style={{ color: "var(--ds-text)" }}>
            Transform<span className="text-[var(--ds-accent)]">Cloud</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className="p-2 rounded-lg transition-colors"
                style={{ color: active ? "var(--ds-accent)" : "var(--ds-text-3)", background: active ? "rgba(179,254,113,0.10)" : "transparent" }}
              >
                <item.icon size={17} />
              </Link>
            );
          })}
          <ThemeToggle />
          <button onClick={handleLogout}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--ds-text-3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ds-text-3)"; }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>

      {/* ── CONTEÚDO ──────────────────────────────────────── */}
      <div className="flex-1 md:ml-56 lg:ml-60 min-h-screen">
        <div className="pt-14 md:pt-0 min-h-screen">{children}</div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardShell>{children}</DashboardShell>
    </ThemeProvider>
  );
}
