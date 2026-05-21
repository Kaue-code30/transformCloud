# TransformCloud — Contexto Completo do Projeto

> Gerado em: 2026-05-19  
> Objetivo: Documento de referência para agentes de IA e desenvolvedores que precisam entender o projeto antes de fazer qualquer mudança.

---

## O que é o TransformCloud?

TransformCloud é uma plataforma SaaS de inteligência de nuvem com IA, desenhada para ajudar empresas a otimizar gastos e planejar migrações multi-cloud com embasamento financeiro.

**Tagline:** "Custos, portabilidade, eficiência e migração inteligente. Devolva o controle da sua nuvem para a sua empresa."

**Problema que resolve:** 72% das empresas estouram o orçamento de nuvem. O TransformCloud analisa o billing, compara os 4 grandes provedores e entrega um plano de migração com ROI calculado — em minutos.

**Idioma principal:** Português (Brasil). Toda a UI, cópias e respostas de API estão em PT-BR.

**Status:** Early-stage production. Core funcional, páginas de dashboard parcialmente scaffolded para expansão futura.

---

## Stack Técnica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.2.6 |
| UI | React | 19.2.4 |
| Linguagem | TypeScript | 5 |
| Estilização | Tailwind CSS | 4 |
| Ícones | Lucide React | 1.16.0 |
| Gráficos | Recharts | 3.8.1 |
| IA | Anthropic Claude SDK | 0.96.0 |
| AWS | @aws-sdk/client-cost-explorer | 3.x |
| AWS Auth | @aws-sdk/client-sts | 3.x |

**Importante:** Next.js 16 tem breaking changes em relação às versões anteriores. Leia `node_modules/next/dist/docs/` antes de alterar qualquer código relacionado ao framework.

---

## Estrutura de Arquivos

```
transformCloud/
├── app/
│   ├── layout.tsx                  # Root layout (fonte Poppins, metadata global)
│   ├── globals.css                 # Variáveis CSS, keyframes, classes base
│   ├── page.tsx                    # Landing page (marketing)
│   ├── api/
│   │   ├── analyze/route.ts        # POST - Análise IA de billing (endpoint principal)
│   │   └── billing/route.ts        # POST - Integração direta AWS Cost Explorer
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── OrlaMascot.tsx          # Mascote SVG animado (polvo)
│   │   └── landing/
│   │       ├── HeroSection.tsx
│   │       ├── StatsSection.tsx
│   │       ├── ComparisonSection.tsx
│   │       ├── PlatformSection.tsx
│   │       ├── ModulesSection.tsx
│   │       ├── HowItWorksSection.tsx
│   │       ├── CTASection.tsx
│   │       └── Footer.tsx
│   └── dashboard/
│       ├── layout.tsx              # Sidebar de navegação do dashboard
│       ├── page.tsx                # Billing Analysis (funcionalidade principal)
│       ├── ai/page.tsx             # AI Insights (scaffolded)
│       ├── portability/page.tsx    # Portability Score (scaffolded)
│       ├── migrations/page.tsx     # Migration Automation (scaffolded)
│       └── settings/page.tsx       # Settings (scaffolded)
├── AI/                             # ← Esta pasta: contexto e registro de mudanças
│   ├── PROJECT_CONTEXT.md          # Este arquivo
│   └── CHANGES.md                  # Log de mudanças por sessão de IA
├── AGENTS.md                       # Instrução para agentes sobre Next.js 16
├── CLAUDE.md                       # Referencia AGENTS.md
└── README.md                       # Notas básicas do create-next-app
```

---

## Variáveis de Ambiente

```env
ANTHROPIC_API_KEY=      # Obrigatório — chave da API do Claude
                        # Usada em: /api/analyze

# Opcionais (usuário fornece pela UI, não precisam estar no .env):
# AWS_ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY
# AWS_REGION (padrão: us-east-1)
```

Não há banco de dados. A plataforma é **stateless** — dados trafegam pela API e não são persistidos.

---

## Endpoints de API

### `POST /api/analyze`
Endpoint principal. Recebe um arquivo de billing (CSV, JSON, TXT, máx 400KB), processa com Claude Sonnet 4.6 e retorna análise completa.

**Fluxo:**
1. Recebe `fileContent` (string) e `fileName` no body JSON
2. Envia para Claude com system prompt da "Orla" (persona CFA)
3. Claude faz até 4 web searches para buscar preços atuais dos provedores
4. Retorna JSON estruturado com toda a análise

**Timeout:** 120 segundos (por causa do web_search)  
**Max tokens resposta:** 16.000

**Shape da resposta:**
```typescript
interface BillingData {
  provider: string                        // "AWS" | "GCP" | "Azure" | "OCI" | "Desconhecido"
  period: { start: string; end: string }  // YYYY-MM-DD
  totalCost: number
  currency: "USD"
  services: Array<{ name: string; cost: number; percentage: number }>
  dailyTotals: Array<{ date: string; total: number }>
  crossCloud: Array<{
    provider: string
    estimatedCost: number
    saving: number
    savingPct: number
    isCurrentProvider: boolean
  }>
  serviceComparison: Array<{
    name: string; currentCost: number
    aws: number; gcp: number; azure: number; oci: number
  }>
  freeTierOpportunities?: Array<{
    provider: string; service: string
    description: string; monthlySaving: number; eligible: boolean
  }>
  recommendation: {
    provider: string
    estimatedCost: number
    saving: number
    savingPct: number
    migrationComplexity: "Baixa" | "Média" | "Alta"
    reasons: string[]
    topServices: string[]
    caf_justification?: string
  }
  insights: string[]
  summary: string
}
```

### `POST /api/billing`
Integração direta com AWS Cost Explorer. O usuário fornece as credenciais AWS pela UI.

**Input:** `{ accessKeyId, secretAccessKey, region, startDate, endDate }`  
**Output:** Custos diários + por serviço + totais agregados

---

## Funcionalidades Implementadas

### Dashboard - Billing Analysis (`/dashboard`)
**Funcional e completo.**

- Upload de arquivo via drag-and-drop ou clique (CSV/JSON/TXT, máx 400KB)
- Animação de loading "Orla" com 8 etapas de progresso
- Cards KPI: custo total, provedor atual, melhor alternativa, economia potencial
- Gráficos (Recharts): evolução de custo (área), comparação cross-cloud (barras)
- Breakdown por serviço com gráficos de barra individuais
- Tabela de comparação cross-cloud (AWS vs GCP vs Azure vs OCI)
  - Melhor opção destacada em verde (#b3fe71)
  - % de diferença em relação ao provedor atual
- Oportunidades de free tier com economia mensal estimada
- Card de recomendação com: provedor, complexidade de migração, justificativa CFA
- 3 insights acionáveis gerados por IA
- Sumário executivo (2-3 frases)

### Landing Page (`/`)
Página de marketing completa com todas as seções implementadas.

### Páginas Scaffolded (UI estática, sem lógica real ainda)
- `/dashboard/ai` — AI Insights: recomendações de migração categorizadas
- `/dashboard/portability` — Portability Score: score 0-100 por serviço
- `/dashboard/migrations` — Migration Automation: receitas pré-construídas
- `/dashboard/settings` — Settings: conexão de provedores e alertas

---

## Mascote: Orla

Orla é o nome tanto do mascote visual quanto da persona de IA.

**Visual:** Polvo SVG animado (`OrlaMascot.tsx`) com:
- Tentáculos com fases de animação distintas
- 4 moods: `"default"`, `"thinking"`, `"happy"`, `"idle"`
- Olhos piscantes com rastreamento de pupila
- Blush nas bochechas
- Animação de flutuação e pontos de pensamento

**Persona IA:** Analista de inteligência de nuvem certificada CFA. Tom direto, consultivo e focado em ROI. Responde em PT-BR. Faz web searches para buscar preços atuais antes de calcular.

---

## Design System

### Cores
| Token | Valor | Uso |
|-------|-------|-----|
| Lime (accent) | `#b3fe71` | CTAs, highlights, OCI, melhor opção |
| Background main | `#0f0f0f` | Fundo geral |
| Background card | `#161616` | Cards e painéis |
| Background hover | `#1a1a1a` | Estados hover |
| Text primary | `#ffffff` | Títulos |
| Text secondary | `#a3a3a3` | Corpo |
| AWS | `#f97316` | Orange |
| GCP | `#3b82f6` | Blue |
| Azure | `#06b6d4` | Cyan |

### Complexidade de Migração
| Nível | Cor |
|-------|-----|
| Baixa | `#b3fe71` (verde) |
| Média | `#f59e0b` (âmbar) |
| Alta | `#ef4444` (vermelho) |

### Tipografia
- Fonte: **Poppins** (Google Fonts via `next/font`)
- Pesos: 400, 500, 600, 700, 900

### Classes CSS Globais (em `globals.css`)
- `.section-container` — container de seção com padding padrão
- `.card` — card base com borda e background
- `.btn-primary` — botão lime
- `.btn-secondary` — botão outline

### Keyframes Disponíveis
- `fadeUp`, `fadeIn` — entrada de elementos
- `pulse-dot` — pontos de loading
- `glow-pulse` — efeito brilho
- `float` — flutuação do mascote

---

## Os 5 Módulos do Produto

| # | Módulo | Status |
|---|--------|--------|
| 1 | **Billing Extraction** — conexão direta às APIs de billing | Funcional (AWS via `/api/billing`, outros via upload) |
| 2 | **Cross-Cloud Quotation** — mapeamento automático de serviços | Funcional (via `/api/analyze`) |
| 3 | **Portability Score** — análise de lock-in vendor | Scaffolded |
| 4 | **Migration Automation** — receitas de migração passo-a-passo | Scaffolded |
| 5 | **AI Insights "The Brain"** — proposta personalizada com Claude | Scaffolded |

---

## Integrações Externas

| Serviço | Uso | Auth |
|---------|-----|------|
| Anthropic Claude API | Análise de billing + web search de preços | `ANTHROPIC_API_KEY` env |
| AWS Cost Explorer | Dados de custo em tempo real | Access Key + Secret (via UI) |
| AWS STS | Validação de credenciais | Mesmas do Cost Explorer |
| Fontes de preço (via web search) | aws.amazon.com/pricing, cloud.google.com, azure.microsoft.com, oracle.com, infracost.io | Claude faz as buscas |

---

## Decisões de Arquitetura Relevantes

1. **Sem banco de dados** — plataforma stateless por design. Análises não são persistidas no servidor.
2. **Claude como motor principal** — toda inteligência de análise e recomendação passa pelo Claude Sonnet 4.6.
3. **Web search no servidor** — Claude busca preços reais em tempo de análise (não hardcoded), usando até 4 searches por requisição.
4. **Credenciais AWS passadas pela UI** — o usuário fornece as chaves no formulário; elas não ficam no servidor além da duração da requisição.
5. **App Router do Next.js** — toda a estrutura usa o novo paradigma de App Router, não Pages Router.
6. **Timeout longo (120s)** — necessário por causa das web searches do Claude para buscar preços atuais.

---

## Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Criar arquivo .env.local
echo "ANTHROPIC_API_KEY=sua_chave_aqui" > .env.local

# Desenvolvimento
npm run dev

# Build de produção
npm run build && npm start
```
