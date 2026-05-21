"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AuthIllustration } from "@/app/components/AuthIllustration";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LADO ESQUERDO — Ilustração ─────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0a] overflow-hidden">

        {/* Grid de fundo */}
        <div className="absolute inset-0 grid-bg opacity-30" />

        {/* Gradiente de vinheta nas bordas */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, #0a0a0a 100%)' }}
        />

        {/* Ilustração animada */}
        <AuthIllustration />

        {/* Logo no topo */}
        <div className="absolute top-10 left-10 z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#b3fe71] flex items-center justify-center">
              <span className="text-black font-black text-sm">TC</span>
            </div>
            <span className="font-black text-white text-lg tracking-tight">
              Transform<span className="text-[#b3fe71]">Cloud</span>
            </span>
          </Link>
        </div>

        {/* Tagline na base */}
        <div className="absolute bottom-10 left-10 right-10 z-10">
          <p className="text-[#b3fe71] font-black text-2xl leading-tight mb-1">
            Inteligência de nuvem
          </p>
          <p className="text-[#666] text-sm">
            Custos, portabilidade e migração — em minutos.
          </p>
        </div>
      </div>

      {/* ── LADO DIREITO — Formulário ──────────────────────── */}
      <div className="w-full lg:w-1/2 bg-[#0f0f0f] flex items-center justify-center px-6 py-12 relative">

        {/* Glow sutil */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#b3fe71]/4 blur-[100px] pointer-events-none" />

        <div className="relative w-full max-w-[400px]">

          {/* Mobile: logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <span className="font-black text-white text-2xl tracking-tight">
                Transform<span className="text-[#b3fe71]">Cloud</span>
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-white text-2xl font-bold mb-1">Bem-vindo de volta</h2>
            <p className="text-[#a3a3a3] text-sm">Entre para continuar economizando</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#a3a3a3] font-medium">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="voce@empresa.com"
                required
                className="w-full bg-[#161616] border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#b3fe71]/40 focus:ring-1 focus:ring-[#b3fe71]/15 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm text-[#a3a3a3] font-medium">Senha</label>
                <Link href="/forgot-password" className="text-xs text-[#555] hover:text-[#b3fe71] transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#161616] border border-white/8 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#b3fe71]/40 focus:ring-1 focus:ring-[#b3fe71]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#a3a3a3] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : <><Zap size={15} />Entrar</>
              }
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[#444] text-xs">ou</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <p className="text-center text-sm text-[#a3a3a3]">
            Não tem conta?{" "}
            <Link href="/register" className="text-[#b3fe71] hover:underline font-semibold">
              Criar conta grátis →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
