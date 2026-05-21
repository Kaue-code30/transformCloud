"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Check, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { AuthIllustration } from "@/app/components/AuthIllustration";

const passwordRules = [
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Uma letra maiúscula",  test: (p: string) => /[A-Z]/.test(p) },
  { label: "Um número",            test: (p: string) => /[0-9]/.test(p) },
];

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword]           = useState("");
  const [confirm, setConfirm]             = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [error, setError]                 = useState("");

  const passwordOk  = passwordRules.every((r) => r.test(password));
  const confirmOk   = password === confirm && confirm.length > 0;
  const canSubmit   = passwordOk && confirmOk && !!token;

  // Token ausente na URL
  useEffect(() => {
    if (!token) setError("Link inválido. Solicite uma nova recuperação de senha.");
  }, [token]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token inválido ou expirado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[400px]">

      {/* Mobile: logo */}
      <div className="lg:hidden text-center mb-8">
        <Link href="/">
          <span className="font-black text-white text-2xl tracking-tight">
            Transform<span className="text-[#b3fe71]">Cloud</span>
          </span>
        </Link>
      </div>

      {success ? (
        /* ── Sucesso ── */
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#b3fe71]/10 border border-[#b3fe71]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} className="text-[#b3fe71]" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Senha redefinida!</h2>
          <p className="text-[#a3a3a3] text-sm leading-relaxed mb-2">
            Sua senha foi atualizada com sucesso.
          </p>
          <p className="text-[#555] text-xs mb-8">Redirecionando para o login...</p>
          <Link href="/login" className="btn-primary w-full !justify-center">
            Ir para o login
          </Link>
        </div>
      ) : !token ? (
        /* ── Token ausente ── */
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Link inválido</h2>
          <p className="text-[#a3a3a3] text-sm leading-relaxed mb-8">
            Este link de recuperação é inválido ou já expirou.
          </p>
          <Link href="/forgot-password" className="btn-primary w-full !justify-center">
            Solicitar novo link
          </Link>
        </div>
      ) : (
        /* ── Formulário ── */
        <>
          <div className="mb-8">
            <h2 className="text-white text-2xl font-bold mb-1">Redefinir senha</h2>
            <p className="text-[#a3a3a3] text-sm">Escolha uma senha nova e forte.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Nova senha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#a3a3a3] font-medium">Nova senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {password.length > 0 && (
                <ul className="flex flex-col gap-1.5 mt-1">
                  {passwordRules.map((rule) => {
                    const ok = rule.test(password);
                    return (
                      <li key={rule.label} className="flex items-center gap-2 text-xs">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${ok ? "bg-[#b3fe71]/20 text-[#b3fe71]" : "bg-white/5 text-[#333]"}`}>
                          <Check size={9} strokeWidth={3} />
                        </span>
                        <span className={`transition-colors ${ok ? "text-[#b3fe71]" : "text-[#555]"}`}>
                          {rule.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Confirmar senha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#a3a3a3] font-medium">Confirmar senha</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full bg-[#161616] border rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-[#444] focus:outline-none transition-all focus:ring-1 ${
                    confirm.length > 0
                      ? confirmOk
                        ? "border-[#b3fe71]/40 focus:border-[#b3fe71]/40 focus:ring-[#b3fe71]/15"
                        : "border-red-500/40 focus:border-red-500/40 focus:ring-red-500/10"
                      : "border-white/8 focus:border-[#b3fe71]/40 focus:ring-[#b3fe71]/15"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#a3a3a3] transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm.length > 0 && !confirmOk && (
                <p className="text-red-400 text-xs mt-0.5">As senhas não coincidem</p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="btn-primary w-full !justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : "Redefinir senha"
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-[#555] hover:text-[#a3a3a3] transition-colors">
              Voltar para o login
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── LADO ESQUERDO — Ilustração ─────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, transparent 30%, #0a0a0a 100%)" }}
        />
        <AuthIllustration />

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

        <div className="absolute bottom-10 left-10 right-10 z-10">
          <p className="text-[#b3fe71] font-black text-2xl leading-tight mb-1">
            Quase lá
          </p>
          <p className="text-[#666] text-sm">
            Defina uma nova senha para recuperar o acesso.
          </p>
        </div>
      </div>

      {/* ── LADO DIREITO — Formulário ──────────────────────── */}
      <div className="w-full lg:w-1/2 bg-[#0f0f0f] flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#b3fe71]/4 blur-[100px] pointer-events-none" />
        {/* useSearchParams precisa de Suspense no Next.js App Router */}
        <Suspense fallback={<Loader2 size={24} className="text-[#b3fe71] animate-spin" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
