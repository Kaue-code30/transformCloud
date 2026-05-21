# TransformCloud — Contexto Completo do Projeto

> Atualizado em: 2026-05-21
> Objetivo: Referência para agentes de IA e desenvolvedores antes de qualquer mudança no projeto.

---

## O que é o TransformCloud?

Plataforma SaaS de inteligência de nuvem com IA para otimização de gastos e migração multi-cloud.

**Tagline:** "Custos, portabilidade, eficiência e migração inteligente. Devolva o controle da sua nuvem para a sua empresa."

**Idioma:** Português (Brasil). Toda UI e respostas de API em PT-BR.

**Status:** Early-stage. Core de billing funcional, auth completo, dashboard com tema claro/escuro.

---

## Stack Técnica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.x |
| UI | React | 19.x |
| Linguagem | TypeScript | 5 |
| Estilização | Tailwind CSS | 4 |
| Ícones | Lucide React | - |
| Gráficos | Recharts | 3.x |
| IA | Anthropic Claude SDK | 0.96.0 |
| AWS | @aws-sdk/client-cost-explorer | 3.x |
| HTTP Client | Fetch nativo (`lib/api.ts`) | - |

**Backend separado:** NestJS na porta 3001 — ver `backend/AI/PROJECT_CONTEXT.md`.

---

## Estrutura de Arquivos

```
transformCloud/
├── app/
│   ├── layout.tsx                  # Root layout — AuthProvider, fonte Poppins
│   ├── globals.css                 # Design tokens CSS, keyframes, classes base, tema dashboard
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Tela de login (split 50/50 + ilustração animada)
│   ├── register/page.tsx           # Tela de cadastro (split 50/50 + ilustração animada)
│   ├── forgot-password/page.tsx    # Recuperação de senha (step 1: solicitar)
│   ├── reset-password/page.tsx     # Recuperação de senha (step 2: nova senha com ?token=)
│   ├── api/
│   │   ├── analyze/route.ts        # POST - Análise IA billing (Claude + web search)
│   │   └── billing/route.ts        # POST - AWS Cost Explorer direto
│   ├── components/
│   │   ├── Navbar.tsx              # Navbar responsiva com estado de auth
│   │   ├── OrlaMascot.tsx          # Mascote SVG animado (polvo)
│   │   ├── AuthIllustration.tsx    # Ilustração abstrata animada (login/register/forgot/reset)
│   │   └── landing/               # Seções da landing page
│   └── dashboard/
│       ├── layout.tsx              # Sidebar + guard de auth + ThemeProvider + toggle Sol/Lua
│       ├── page.tsx                # Billing Analysis (funcional)
│       ├── profile/page.tsx        # Perfil do usuário (nome editável, troca de senha)
│       ├── ai/page.tsx             # AI Insights (scaffolded)
│       ├── portability/page.tsx    # Portability Score (scaffolded)
│       ├── migrations/page.tsx     # Migration Automation (scaffolded)
│       └── settings/page.tsx       # Settings (scaffolded)
├── lib/
│   ├── api.ts                      # Cliente HTTP para o backend NestJS
│   ├── auth-context.tsx            # AuthProvider + useAuth()
│   └── theme-context.tsx           # ThemeProvider + useTheme() (dark/light dashboard)
├── AI/                             # Documentação para agentes de IA
│   ├── PROJECT_CONTEXT.md          # Este arquivo
│   ├── CHANGES.md                  # Log de mudanças por sessão
│   ├── ARCHITECTURE_BILLING_V2.md  # Pipeline V2 de análise de billing
│   └── MODULES/
│       ├── AUTH_FRONTEND.md        # Auth, perfil, recuperação de senha
│       └── DASHBOARD_THEME.md      # Sistema de tema claro/escuro
└── backend/                        # API NestJS (porta 3001)
    └── AI/                         # Documentação do backend
```

---

## Variáveis de Ambiente

```env
# .env.local (frontend)
ANTHROPIC_API_KEY=          # Obrigatório para /api/analyze
NEXT_PUBLIC_API_URL=http://localhost:3001/api   # Backend NestJS (opcional, tem fallback)
```

---

## Sistema de Autenticação

Fluxo completo implementado. Ver `AI/MODULES/AUTH_FRONTEND.md` para detalhes.

| Rota | Descrição |
|------|-----------|
| `/login` | Login com e-mail + senha |
| `/register` | Cadastro + redirect automático ao dashboard |
| `/forgot-password` | Solicita reset de senha (resposta neutra) |
| `/reset-password?token=` | Nova senha via JWT temporário (15min) |

**Tokens:** `accessToken` (15min) + `refreshToken` (7d) em `localStorage`.  
**Guard:** `dashboard/layout.tsx` redireciona para `/login` se não autenticado.

---

## Dashboard

### Tema Claro/Escuro
Sistema completo. Ver `AI/MODULES/DASHBOARD_THEME.md`.

- Toggle Sol/Lua na sidebar (desktop) e topbar (mobile)
- Persiste em `localStorage` via `lib/theme-context.tsx`
- Classe `.ds-light` aplicada no `<html>` para cobrir elementos `fixed`
- Variáveis `--ds-accent`: `#b3fe71` (dark) / `#3a7d00` (light)
- **Landing page e telas de auth permanecem sempre dark**

### Billing Analysis (`/dashboard`)
Funcional e completo. Upload de arquivo → Claude analisa → gráficos + recomendação.

### Perfil (`/dashboard/profile`)
- Cabeçalho com avatar (iniciais), nome, role, data de entrada, e-mail, ID
- Card "Informações pessoais": nome editável inline
- Card "Segurança": troca de senha com confirmação da senha atual
- Responsivo ao tema claro/escuro

### Páginas Scaffolded
- `/dashboard/ai` — AI Insights
- `/dashboard/portability` — Portability Score
- `/dashboard/migrations` — Migration Automation
- `/dashboard/settings` — Settings

---

## Design System

### Cores (Landing/Auth — sempre dark)
| Token CSS | Valor | Uso |
|-----------|-------|-----|
| `--lime` / accent | `#b3fe71` | CTAs, highlights |
| `--bg` | `#0f0f0f` | Fundo geral |
| `--bg2` | `#161616` | Cards |

### Cores Dashboard — tokens semânticos
| Token | Dark | Light |
|-------|------|-------|
| `--ds-accent` | `#b3fe71` | `#3a7d00` |
| `--ds-bg` | `#1a1a1a` | `#f0f2f5` |
| `--ds-surface` | `#1a1a1a` | `#e8eaed` |
| `--ds-card` | `#161616` | `#ffffff` |
| `--ds-border` | `#2a2a2a` | `rgba(0,0,0,0.08)` |
| `--ds-text` | `#ffffff` | `#111111` |
| `--ds-text-2` | `#a3a3a3` | `#555555` |

**Regra:** `PROVIDER_COLORS` e `SERVICE_COLORS` usam hex literal (não var) — são passados a Recharts SVG e precisam de valores resolvidos.

### Ilustração de Auth
`AuthIllustration.tsx` — sistema orbital com 3 anéis girantes, núcleo pulsante, linha de scan e partículas. Reutilizado em `/login`, `/register`, `/forgot-password`, `/reset-password`.

---

## Endpoints de API (Next.js)

### `POST /api/analyze`
Upload de billing → Claude Sonnet → análise completa. Timeout 120s. Requer `ANTHROPIC_API_KEY`.

### `POST /api/billing`
Integração direta com AWS Cost Explorer. Credenciais fornecidas pelo usuário na UI.

---

## Mascote: Orla
Polvo SVG animado (`OrlaMascot.tsx`). 4 moods: `default`, `thinking`, `happy`, `idle`.  
Persona IA: analista CFA, tom consultivo, PT-BR.

---

## Como Rodar

```bash
# Frontend
npm install
echo "ANTHROPIC_API_KEY=sua_chave" > .env.local
npm run dev   # porta 3000

# Backend (separado)
cd backend && npm run start:dev   # porta 3001
```
