# TransformCloud — Documento de Contexto Completo para NotebookLM

Use este documento como fonte primária para entender o produto, a identidade visual, a arquitetura técnica e a voz da marca.

---

## 1. O QUE É O TRANSFORMCLOUD

**TransformCloud** é uma plataforma de inteligência de cloud para empresas. O produto principal chama-se **Orla** — um agente de IA que analisa o billing de cloud da empresa, compara os quatro maiores provedores (AWS, GCP, Azure, OCI) e entrega um plano de migração com ROI calculado em linguagem financeira de nível CFA.

### Problema que resolve
72% das empresas estouraram o budget de cloud. A maioria não sabe exatamente por quê, não compara provedores e toma decisões de infra sem rigor financeiro. O Orla resolve isso em minutos, sem depender de consultoria cara.

### Proposta de valor
- Upload do arquivo de billing → análise completa em segundos
- Comparação real dos 4 provedores com preços estimados por serviço
- Plano de migração com complexidade, motivos e justificativa CFA
- Identificação de free tiers não utilizados
- Score de portabilidade por serviço (o quanto é fácil sair do provedor atual)
- Zero retenção de dados — análise acontece em tempo real, sem armazenar informações sensíveis

### Autoridade e caso de referência
- Mario Perino (CRO Quave): tom direto, resultados mensuráveis
- Parceria Oracle OPN
- Caso NeoTrust/Confi Group: 17TB migrados para OCI, 50% de redução de custo
- Análise com rigor CFA (Chartered Financial Analyst) — payback, TIR, ROI em linguagem de C-level

---

## 2. PÚBLICO-ALVO

- **CFOs** que precisam justificar orçamento de TI para o board
- **CTOs / VPs de Engenharia** que tomam decisões de infraestrutura
- **Empresas brasileiras mid-market** com gasto mensal de cloud acima de R$5k
- Linguagem: **Português do Brasil**, tom executivo mas direto

---

## 3. STACK TECNOLÓGICA

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Estilo | Tailwind CSS 4, PostCSS, CSS custom properties |
| Ícones | Lucide React |
| Gráficos | Recharts 3 |
| Fonte | Poppins (Google Fonts) — pesos 400, 500, 600, 700, 900 |
| Backend | Next.js App Router + API Routes |
| IA | Claude Opus 4.7 com adaptive thinking (Anthropic SDK) |
| AWS | AWS SDK v3 — CostExplorer para conexão direta |
| Deploy | Vercel (inferido pela estrutura) |

---

## 4. IDENTIDADE VISUAL

### Filosofia
Dark, técnica, premium. A paleta remete a terminais de linha de comando e dashboards financeiros de alto nível — não a SaaS genérico. O verde-limão vibrante sobre fundo quase-preto cria contraste máximo e transmite precisão e energia.

### Paleta de cores

| Nome | Hex | Uso |
|------|-----|-----|
| Fundo principal | `#0f0f0f` | Background de toda a aplicação |
| Fundo cards | `#161616` | Cards, painéis, modais |
| Fundo elevado | `#1e1e1e` | Elementos acima dos cards |
| Borda sutil | `rgba(255,255,255,0.07)` | Divisores e bordas padrão |
| Borda ênfase | `rgba(255,255,255,0.12)` | Hover, foco |
| **Lime primário** | `#b3fe71` | Cor da marca, CTAs, destaques, mascote |
| Lime escuro | `#65a30d` | Sombras e gradientes do verde |
| Lime dim bg | `rgba(132,204,22,0.12)` | Backgrounds suaves verdes |
| Lime glow | `rgba(132,204,22,0.25)` | Efeitos de brilho |
| Texto primário | `#ffffff` | Títulos, dados importantes |
| Texto secundário | `#a3a3a3` | Subtítulos, descrições |
| Texto terciário | `#666666` | Labels, metadados |

### Cores dos provedores de cloud

| Provedor | Cor | Hex |
|----------|-----|-----|
| AWS | Laranja | `#f97316` |
| GCP | Azul | `#3b82f6` |
| Azure | Ciano | `#06b6d4` |
| OCI | Lime (brand) | `#b3fe71` |

OCI recebe a cor da marca intencionalmente — reforça o viés de recomendação do produto (parceria Oracle OPN).

### Cores de gráficos (rotação de 8)
`#b3fe71` → `#22d3ee` → `#f59e0b` → `#f472b6` → `#818cf8` → `#34d399` → `#fb923c` → `#a78bfa`

### Tipografia
- **Família**: Poppins
- **Escala de títulos**: `clamp(2.6rem, 7.5vw, 5.5rem)` para hero, `clamp(2rem, 5vw, 3rem)` para seções
- **Escala de corpo**: `clamp(1rem, 2vw, 1.2rem)`
- **Peso de destaque**: 900 (black) para headlines, 700 para subtítulos, 400/500 para corpo
- **Letter-spacing**: `tracking-tight` em títulos grandes

### Efeitos visuais recorrentes
- **Hero glow**: gradiente radial verde no centro do hero
- **Grid bg**: grade repetida com opacidade 0.3, efeito parallax 3D com mouse
- **Drop shadow lime**: `drop-shadow(0 0 18-24px rgba(179,254,113,0.3))` em elementos flutuantes
- **Glassmorphism leve**: bordas semitransparentes + backgrounds escuros
- **Terminal aesthetic**: blocos de código com fundo `#0e1210`, barra de chrome macOS (• • •), font `mono`

---

## 5. SISTEMA DE ANIMAÇÕES

### Keyframes globais (globals.css)

| Nome | Efeito | Duração padrão |
|------|--------|---------------|
| `fadeUp` | opacity 0→1 + translateY(24px→0), easing ultra-rápido (0.16,1,0.3,1) | 0.7s |
| `fadeIn` | opacity 0→1 | variável |
| `pulse-dot` | scale 1→1.5 + opacity pulse | 2s |
| `glow-pulse` | expansão de box-shadow lime | 3s |
| `float` | translateY(-8px) oscilação suave | 4s |

### Classes utilitárias
- `.animate-fade-up`: dispara `fadeUp` ao carregar, com `opacity: 0` inicial
- `.delay-1` a `.delay-6`: atrasos de 0.1s a 0.6s para stagger de elementos
- `.animate-float`, `.animate-pulse-dot`, `.animate-glow`

---

## 6. A MASCOTE: ORLA

### Conceito
Orla é um polvo animado em SVG — verde-limão, pequeno, com personalidade de IA analítica. O nome vem da ideia de "beira", fronteira entre provedores. Ela é a interface humana do produto: aparece em momentos de carregamento, análise, e interação no hero.

### Visual
- **Corpo**: elipse com gradiente radial — `#a3e635` centro → `#b3fe71` → `#65a30d` bordas
- **Brilho**: sobreposição de gradiente radial branco semitransparente no quadrante superior esquerdo
- **Saia/manto**: path ondulado na base, mesmo gradiente do corpo
- **Tentáculos**: 6 no total — 2 traseiros (cor dim), 2 frontais, 2 centrais. Desenhados como strokes arredondados com pequenos círculos de "ventosas"
- **Olhos**: elipses brancas com pupils escuras, reflexo de luz em dois pontos, pálpebras que piscam a cada 4s
- **Bochechas**: elipses verdes com opacidade pulsante
- **Boca**: path dinâmico por mood
- **Tag "AI"**: retângulo arredondado no corpo com texto branco

### Moods

| Mood | Olhos | Boca | Uso |
|------|-------|------|-----|
| `default` | normal | curva suave | estado padrão |
| `happy` | curva sorridente na pupila | arco positivo | análise concluída, resultado bom |
| `thinking` | linha horizontal na pupila | linha reta | processando, calculando |
| `idle` | normal | curva suave | aguardando input |

### Animações da mascote

| Classe | Efeito | Timing |
|--------|--------|--------|
| `orla-float` | corpo sobe e desce | 3s loop |
| `orla-tl1/tl2` | ondulação tentáculo esquerdo | 2.2s / 2.6s, offset 0.3s |
| `orla-tr1/tr2` | ondulação tentáculo direito | 2.2s / 2.6s, offset 0.15s / 0.45s |
| `orla-tc` | pulsação tentáculos centrais (scaleX) | 2.8s |
| `orla-blink` | pálpebras fecham (scaleY 0.08) | 4s, evento em 95% |
| `orla-pupil` | pupila oscila levemente (translateX) | 5s |
| `orla-blush` | bochechas pulsam em opacidade | 3s |
| `orla-dot1/2/3` | pontinhos de "pensando" em cascade | 1.2s, offsets 0/0.4/0.8s |

### Props do componente OrlaMascot

```typescript
size?: number           // largura/altura do SVG (padrão 80)
animated?: boolean      // liga/desliga todas as animações
mood?: "default" | "thinking" | "happy" | "idle"
className?: string
pupilOffset?: { x: number; y: number }  // desloca a pupila manualmente (max ±2.4 unidades SVG)
```

### Uso atual no produto

| Local | Tamanho | Behavior |
|-------|---------|----------|
| Hero (landing) | 140px | Fixa no canto inferior direito, olhos seguem o cursor em tempo real |
| Dashboard loading | médio | Aparece durante análise com steps animados |
| Dashboard resultado | pequeno | Ícone na seção de resumo do Orla |

---

## 7. ESTRUTURA DE PÁGINAS

### Landing Page (`/`)
Funil de conversão com 9 seções em sequência:

1. **Navbar** — header fixo com scroll detection, menu mobile, logo "transformcloud" em lowercase
2. **HeroSection** — headline principal, subtítulo com dado de 72%, dois CTAs, Orla com eye-tracking
3. **StatsSection** — 4 métricas animadas: 72% overspend, 32% recursos ociosos, $44.5B mercado FinOps, 46% cut no OCI
4. **ComparisonSection** — seletor de provedor atual + bloco terminal da Orla com dados dinâmicos
5. **PlatformSection** — 4 feature cards + barra de social proof
6. **ModulesSection** — 5 módulos em tabs com painel de detalhe lateral
7. **HowItWorksSection** — 3 passos com cards expansíveis
8. **CTASection** — CTA grande com efeito glow + sinais de confiança (sem cartão, LGPD, análise CFA)
9. **Footer** — logo + links (Plataforma, Legal)

### Dashboard (`/dashboard`)
Layout com sidebar fixa (desktop) e top bar (mobile).

| Rota | Conteúdo |
|------|----------|
| `/dashboard` | Upload → Análise → Resultados completos |
| `/dashboard/ai` | Cards de insight com recomendações do Orla |
| `/dashboard/portability` | Score de portabilidade por serviço |
| `/dashboard/migrations` | Receitas de migração passo-a-passo |
| `/dashboard/settings` | Conexões com provedores e alertas |

---

## 8. LÓGICA DE ANÁLISE (API)

### Endpoint `/api/analyze`
- **Modelo**: Claude Opus 4.7 com `adaptive` thinking
- **Input**: conteúdo do arquivo de billing (CSV/JSON/TXT, máx 400KB) + nome do arquivo
- **Output**: JSON estruturado com todos os dados de análise

### Persona do sistema
O prompt de sistema define o Orla como:
> Analista CFA certificado desde 2018, especialista FinOps, autoridade Mario Perino (CRO Quave), parceiro Oracle OPN. Tom direto, sem rodeios, foco em ROI mensurável.

### Multiplicadores de preço por provedor
| Provedor | Multiplicador vs AWS |
|----------|---------------------|
| AWS | 1.00x (base) |
| GCP | 0.78x |
| Azure | 0.88x |
| OCI | 0.60x |

(Ajustes por tipo de serviço: OCI melhor em Compute/Storage, GCP em ML/BigQuery, Azure em enterprise/AD)

### Estrutura de output da análise
```
provider, period, totalCost, currency,
services[],           // top serviços com custo e percentual
dailyTotals[],        // evolução diária
crossCloud[],         // comparação dos 4 provedores
serviceComparison[], // custo por serviço em cada provedor
freeTierOpportunities[], // free tiers elegíveis
recommendation {
  provider, estimatedCost, saving, savingPct,
  migrationComplexity, reasons[], topServices[],
  caf_justification   // justificativa financeira CFA
},
insights[],           // 3 insights acionáveis
summary               // resumo executivo tom Mario Perino
```

---

## 9. VOZ E TOM DA MARCA

### Princípios
- **Direto**: sem disclaimers, sem "pode ser que". Afirmações com dados.
- **Financeiro**: falar em ROI, payback, TIR — não em "economia"
- **Confiante**: "Você está pagando mais do que deveria. Vamos provar."
- **Sem lock-in**: sempre deixar claro que o usuário decide, não o contrato

### Exemplos de copy do produto
- *"Pare de pagar mais do que sua cloud vale."*
- *"72% das empresas estouraram o budget de cloud."*
- *"Zero lock-in — você decide, não o contrato."*
- *"Análise com rigor CFA aplicado à infra."*
- *"Free tiers mapeados em todos os provedores."*
- *"Recomendações detalhadas disponíveis no dashboard."*

### Voz da Orla (mascote/agente)
Fala na primeira pessoa quando apresenta resultados. Tom de analista sênior — não de chatbot. Nunca usa emojis em contextos formais. Usa terminal aesthetic para dar autenticidade técnica.

---

## 10. MÓDULOS DO PRODUTO (5 módulos)

| # | Nome | Descrição |
|---|------|-----------|
| 1 | Billing Intelligence | Extração e normalização de dados de billing de qualquer provedor |
| 2 | Cross-Cloud Pricing | Comparação em tempo real de preços equivalentes nos 4 provedores |
| 3 | Portability Score | Score por serviço indicando facilidade de migração (baixo/médio/alto) |
| 4 | Migration Recipes | Planos passo-a-passo por tipo de serviço com nível de esforço |
| 5 | Free Tier Radar | Identificação de serviços elegíveis para free tier não aproveitados |

---

## 11. COMPONENTES DE UI — CLASSES REUTILIZÁVEIS

| Classe | Descrição |
|--------|-----------|
| `.section-container` | max-width 1200px, padding responsivo 1.5→3rem |
| `.section-spacing` | espaçamento vertical 5rem→9rem |
| `.card` | fundo `#161616`, borda sutil, hover borda verde |
| `.card-lime` | card com hover borda lime + glow shadow |
| `.tag` | badge inline lime pill |
| `.btn-primary` | botão sólido lime com hover lift + shadow |
| `.btn-secondary` | botão outline com hover sutil |
| `.hero-glow` | gradiente radial de fundo verde no hero |
| `.grid-bg` | grade de fundo repetida, parallax 3D |

---

## 12. DECISÕES DE DESIGN NOTÁVEIS

1. **OCI recebe a cor da marca** — reforço sutil do produto principal (parceria Oracle OPN sem ser explícito)
2. **Terminal aesthetic no hero e comparison** — credibilidade técnica, diferencia de SaaS visual genérico
3. **Mascote com eye-tracking** — humaniza um produto B2B denso, cria micro-interação memorável
4. **Poppins black (900)** em headlines — impacto máximo sem precisar de imagens de fundo
5. **Análise client-side first** — upload de arquivo sem credenciais de cloud reduz atrito de onboarding
6. **`clamp()` em toda tipografia** — escala fluida sem breakpoints manuais
7. **Sem cores quentes em destaque** — apenas o lime e tons frios (azul, ciano) evitam poluição visual

---

*Documento gerado em 2026-05-17 para uso como fonte no NotebookLM.*
