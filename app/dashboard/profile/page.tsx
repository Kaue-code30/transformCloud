"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Pencil, Check, X, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

// ─── Campo label + valor ────────────────────────────────────────
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-0.5" style={{ color: "var(--ds-text-5)" }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>{value}</p>
    </div>
  );
}

// ─── Cabeçalho de card com botão editar ─────────────────────────
function CardHeader({
  title, editing, onEdit, onCancel, onSave, saving, canSave,
}: {
  title: string;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
  canSave?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <p className="text-sm font-semibold" style={{ color: "var(--ds-text)" }}>{title}</p>
      {editing ? (
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={saving || canSave === false}
            className="flex items-center gap-1 text-xs text-[var(--ds-accent)] hover:text-white transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Salvar
          </button>
          <span style={{ color: "var(--ds-border-md)" }}>·</span>
          <button onClick={onCancel} className="text-xs transition-colors" style={{ color: "var(--ds-text-5)" }}>
            Cancelar
          </button>
        </div>
      ) : (
        <button onClick={onEdit} className="hover:text-[var(--ds-accent)] transition-colors" style={{ color: "var(--ds-text-4)" }}>
          <Pencil size={13} />
        </button>
      )}
    </div>
  );
}

// ─── Input inline ───────────────────────────────────────────────
function InlineInput({
  value, onChange, placeholder, type = "text",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg px-3 py-1.5 text-sm focus:outline-none transition-all"
      style={{
        background: "var(--ds-bar-bg)",
        border: "1px solid var(--ds-border-md)",
        color: "var(--ds-text)",
      }}
    />
  );
}

function PwInput({
  label, value, onChange, show, onToggle, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; error?: boolean;
}) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: "var(--ds-text-5)" }}>{label}</p>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg px-3 py-1.5 pr-9 text-sm focus:outline-none transition-all"
          style={{
            background: "var(--ds-bar-bg)",
            border: error ? "1px solid rgba(248,113,113,0.4)" : "1px solid var(--ds-border-md)",
            color: "var(--ds-text)",
          }}
        />
        <button type="button" onClick={onToggle}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: "var(--ds-text-4)" }}>
          {show ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // ── Seção: dados pessoais ────────────────────────────────────
  const [infoEdit, setInfoEdit]       = useState(false);
  const [infoName, setInfoName]       = useState(user?.name ?? "");
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg]         = useState("");

  const handleInfoSave = async () => {
    if (!infoName.trim() || infoName === user?.name) { setInfoEdit(false); return; }
    setInfoLoading(true); setInfoMsg("");
    try {
      await updateUser({ name: infoName.trim() });
      setInfoEdit(false);
      setInfoMsg("ok");
      setTimeout(() => setInfoMsg(""), 2500);
    } catch (err) {
      setInfoMsg(err instanceof Error ? err.message : "Não foi possível salvar o nome. Tente novamente.");
    } finally {
      setInfoLoading(false);
    }
  };

  // ── Seção: senha ─────────────────────────────────────────────
  const [pwEdit, setPwEdit]           = useState(false);
  const [pw, setPw]                   = useState({ current: "", next: "", confirm: "" });
  const [show, setShow]               = useState({ current: false, next: false, confirm: false });
  const [pwLoading, setPwLoading]     = useState(false);
  const [pwMsg, setPwMsg]             = useState("");

  const pwRulesOk = pw.next.length >= 8 && /[A-Z]/.test(pw.next) && /[0-9]/.test(pw.next);
  const matchOk   = pw.next === pw.confirm && pw.confirm.length > 0;
  const canSavePw = pwRulesOk && matchOk && pw.current.length > 0;

  const handlePwSave = async () => {
    if (!canSavePw) return;
    setPwLoading(true); setPwMsg("");
    try {
      await api.users.changePassword(pw.current, pw.next);
      setPwEdit(false);
      setPw({ current: "", next: "", confirm: "" });
      setPwMsg("ok");
      setTimeout(() => setPwMsg(""), 3000);
    } catch (err) {
      setPwMsg(err instanceof Error ? err.message : "Não foi possível atualizar a senha. Tente novamente.");
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const isError  = (msg: string) => msg !== "" && msg !== "ok";

  return (
    <div className="p-6 lg:p-8 w-full">

      {/* ── Cabeçalho do perfil ─────────────────────────────── */}
      <div
        className="border rounded-2xl p-6 mb-5 flex flex-col sm:flex-row sm:items-center gap-5"
        style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}
      >
        <div className="w-16 h-16 rounded-full bg-[#b3fe71]/15 border-2 border-[#b3fe71]/25 flex items-center justify-center font-black text-[var(--ds-accent)] text-xl flex-shrink-0">
          {initials}
        </div>

        <div
          className="w-auto min-w-0 sm:pr-6"
          style={{ borderRight: "1px solid var(--ds-border-sub)" }}
        >
          <p className="text-lg font-semibold truncate" style={{ color: "var(--ds-text)" }}>{user.name}</p>
          <p className="text-sm mt-0.5" style={{ color: "var(--ds-text-5)" }}>
            {user.role === "ADMIN" ? "Administrador" : "Usuário"} · TransformCloud
          </p>
        </div>

        <div className="grid grid-cols-3 gap-x-10 gap-y-3 sm:pl-6 flex-shrink-0">
          <div>
            <p className="text-xs" style={{ color: "var(--ds-text-5)" }}>Membro desde</p>
            <p className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>{formatDate(user.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--ds-text-5)" }}>E-mail</p>
            <p className="text-sm font-medium truncate max-w-auto" style={{ color: "var(--ds-text)" }}>{user.email}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--ds-text-5)" }}>ID</p>
            <p className="text-sm font-mono" style={{ color: "var(--ds-text-2)" }}>{user.id.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* ── Grid de cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Card: Informações pessoais */}
        <div
          className="border rounded-2xl p-6"
          style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}
        >
          <CardHeader
            title="Informações pessoais"
            editing={infoEdit}
            onEdit={() => { setInfoEdit(true); setInfoName(user.name); setInfoMsg(""); }}
            onCancel={() => { setInfoEdit(false); setInfoName(user.name); setInfoMsg(""); }}
            onSave={handleInfoSave}
            saving={infoLoading}
            canSave={infoName.trim().length > 0}
          />

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="col-span-2">
              <p className="text-xs mb-0.5" style={{ color: "var(--ds-text-5)" }}>Nome completo</p>
              {infoEdit
                ? <InlineInput value={infoName} onChange={setInfoName} placeholder="Seu nome" />
                : <p className="text-sm font-medium" style={{ color: "var(--ds-text)" }}>{user.name}</p>
              }
            </div>
            <Field label="E-mail" value={user.email} />
            <Field label="Função" value={user.role === "ADMIN" ? "Administrador" : "Usuário"} />
          </div>

          {isError(infoMsg) && (
            <p className="mt-3 text-red-400 text-xs flex items-center gap-1.5">
              <AlertCircle size={11} />{infoMsg}
            </p>
          )}
          {infoMsg === "ok" && (
            <p className="mt-3 text-[var(--ds-accent)] text-xs flex items-center gap-1.5">
              <Check size={11} />Informações atualizadas
            </p>
          )}
        </div>

        {/* Card: Segurança */}
        <div
          className="border rounded-2xl p-6"
          style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}
        >
          <CardHeader
            title="Segurança"
            editing={pwEdit}
            onEdit={() => { setPwEdit(true); setPwMsg(""); }}
            onCancel={() => { setPwEdit(false); setPw({ current: "", next: "", confirm: "" }); setPwMsg(""); }}
            onSave={handlePwSave}
            saving={pwLoading}
            canSave={canSavePw}
          />

          {pwEdit ? (
            <div className="flex flex-col gap-4">
              <PwInput
                label="Senha atual"
                value={pw.current}
                onChange={(v) => setPw({ ...pw, current: v })}
                show={show.current}
                onToggle={() => setShow({ ...show, current: !show.current })}
              />
              <PwInput
                label="Nova senha"
                value={pw.next}
                onChange={(v) => setPw({ ...pw, next: v })}
                show={show.next}
                onToggle={() => setShow({ ...show, next: !show.next })}
              />
              {pw.next.length > 0 && !pwRulesOk && (
                <p className="text-xs -mt-2" style={{ color: "var(--ds-text-5)" }}>
                  {pw.next.length < 8 && "Mínimo 8 caracteres · "}
                  {!/[A-Z]/.test(pw.next) && "Uma maiúscula · "}
                  {!/[0-9]/.test(pw.next) && "Um número"}
                </p>
              )}
              <PwInput
                label="Confirmar nova senha"
                value={pw.confirm}
                onChange={(v) => setPw({ ...pw, confirm: v })}
                show={show.confirm}
                onToggle={() => setShow({ ...show, confirm: !show.confirm })}
                error={pw.confirm.length > 0 && !matchOk}
              />
              {pw.confirm.length > 0 && !matchOk && (
                <p className="text-red-400 text-xs -mt-2">As senhas não coincidem</p>
              )}
              {isError(pwMsg) && (
                <p className="text-red-400 text-xs flex items-center gap-1.5">
                  <AlertCircle size={11} />{pwMsg}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <Field label="Senha" value="••••••••" />
              <Field label="Último acesso" value="Esta sessão" />
              {pwMsg === "ok" && (
                <p className="text-[var(--ds-accent)] text-xs flex items-center gap-1.5">
                  <Check size={11} />Senha atualizada com sucesso
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
