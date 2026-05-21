"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const links = [
  { href: "#plataforma", label: "Plataforma" },
  { href: "#modulos", label: "Módulos" },
  { href: "#como-funciona", label: "Como funciona" },
];

export default function Navbar() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0f0f0f]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <span className="font-black text-white text-[17px] tracking-tight">
              Transform<span className="text-[#b3fe71]">Cloud</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-2 py-2 w-[120px] text-center text-sm text-[#a3a3a3] hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-8 bg-white/5 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <span className="text-sm text-[#a3a3a3] max-w-[140px] truncate">
                  {user.name}
                </span>
                <Link href="/dashboard" className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-1.5">
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="p-2 text-[#a3a3a3] hover:text-white rounded-lg hover:bg-white/5 transition-colors" title="Sair">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary !py-2 !px-4 !text-sm">
                  Entrar
                </Link>
                <Link href="/register" className="btn-primary !py-2 !px-5 !text-sm">
                  Começar grátis
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-[#a3a3a3] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0f0f0f] border-t border-white/5 px-4 pb-5 pt-2">
          <nav className="flex flex-col gap-1 mb-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm text-[#a3a3a3] hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
          {user ? (
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" onClick={() => setOpen(false)} className="btn-secondary w-full !justify-center">
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="text-sm text-[#a3a3a3] hover:text-white py-2 transition-colors">
                Sair
              </button>
            </div>
          ) : (
            <Link href="/register" onClick={() => setOpen(false)} className="btn-primary w-full !justify-center">
              Começar grátis
              <ArrowRight size={15} />
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
