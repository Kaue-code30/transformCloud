"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { AuthIllustration } from "@/app/components/AuthIllustration";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar e-mail");
    } finally {
      setLoading(false);
    }
  };

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
            Acontece com todo mundo
          </p>
          <p className="text-[#666] text-sm">
            Vamos te ajudar a recuperar o acesso em segundos.
          </p>
        </div>
      </div>

      {/* ── LADO DIREITO — Formulário ──────────────────────── */}
      <div className="w-full lg:w-1/2 bg-[#0f0f0f] flex items-center justify-center px-6 py-12 relative">
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

          {sent ? (
            /* ── Estado de sucesso ── */
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#b3fe71]/10 border border-[#b3fe71]/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={28} className="text-[#b3fe71]" />
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">Verifique seu e-mail</h2>
              <p className="text-[#a3a3a3] text-sm leading-relaxed mb-8">
                Se o endereço <span className="text-white font-medium">{email}</span> estiver
                cadastrado, você receberá as instruções para redefinir sua senha.
              </p>
              <p className="text-[#555] text-xs mb-8">
                Não recebeu? Verifique a pasta de spam ou aguarde alguns minutos.
              </p>
              <Link href="/login" className="btn-primary w-full !justify-center mb-4">
                <ArrowLeft size={15} />
                Voltar para o login
              </Link>
              <Link
                href="/reset-password"
                className="block text-center text-xs text-[#444] hover:text-[#666] transition-colors"
              >
                Já tenho um token de redefinição →
              </Link>
            </div>
          ) : (
            /* ── Formulário ── */
            <>
              <div className="mb-8">
                <h2 className="text-white text-2xl font-bold mb-1">Esqueceu a senha?</h2>
                <p className="text-[#a3a3a3] text-sm">
                  Informe seu e-mail e enviaremos as instruções de recuperação.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-[#a3a3a3] font-medium">E-mail</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voce@empresa.com"
                      required
                      className="w-full bg-[#161616] border border-white/8 rounded-xl px-4 py-3 pl-11 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#b3fe71]/40 focus:ring-1 focus:ring-[#b3fe71]/15 transition-all"
                    />
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
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
                    : "Enviar instruções"
                  }
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/8" />
              </div>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-[#555] hover:text-[#a3a3a3] transition-colors"
              >
                <ArrowLeft size={14} />
                Voltar para o login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
