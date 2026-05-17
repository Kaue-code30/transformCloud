"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, Settings, Bot, Shield, Zap } from "lucide-react";

const nav = [
  { href: "/dashboard", icon: BarChart3, label: "Billing" },
  // { href: "/dashboard/portability", icon: Shield, label: "Portabilidade" },
  // { href: "/dashboard/migrations", icon: Zap, label: "Migrações" },
  // { href: "/dashboard/ai", icon: Bot, label: "IA Insights" },
  // { href: "/dashboard/settings", icon: Settings, label: "Configurações" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex">

      {/* ── SIDEBAR (desktop) ───────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 border-r border-[#2a2a2a] bg-[#1a1a1a] fixed top-0 bottom-0 left-0 z-40">
        {/* Logo */}
        <div className="px-5 h-16 flex items-center border-b border-[#2a2a2a] flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#b3fe71] flex items-center justify-center">
              <span className="text-black font-black text-sm leading-none">TC</span>
            </div>
            <span className="font-black text-white text-sm tracking-tight">
              Transform<span className="text-[#b3fe71]">Cloud</span>
            </span>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  active
                    ? "bg-[#b3fe71]/10 text-[#b3fe71] font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-[#242424]"
                }`}
              >
                <item.icon size={15} className={active ? "text-[#b3fe71]" : ""} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to landing */}
        <div className="p-4 border-t border-[#2a2a2a] flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Home size={12} />
            Voltar ao site
          </Link>
        </div>
      </aside>

      {/* ── TOP BAR (mobile) ────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a] border-b border-[#2a2a2a] h-14 flex items-center px-4 justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#b3fe71] flex items-center justify-center">
            <span className="text-black font-black text-xs">TC</span>
          </div>
          <span className="font-black text-white text-sm">
            Transform<span className="text-[#b3fe71]">Cloud</span>
          </span>
        </Link>

        {/* Mobile nav icons */}
        <div className="flex items-center gap-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2 rounded-lg transition-colors ${
                  active ? "text-[#b3fe71] bg-[#b3fe71]/10" : "text-gray-500 hover:text-white"
                }`}
              >
                <item.icon size={17} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── CONTEÚDO PRINCIPAL ──────────────────────────────── */}
      <div className="flex-1 md:ml-56 lg:ml-60 min-h-screen">
        <div className="pt-14 md:pt-0 min-h-screen">{children}</div>
      </div>
    </div>
  );
}
