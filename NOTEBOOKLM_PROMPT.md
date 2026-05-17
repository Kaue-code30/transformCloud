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

### Paleta de cores (valores exatos do globals.css)

| Variável CSS | Hex exato | Uso |
|---|---|---|
| `--bg` | `#0f0f0f` | Background de toda a aplicação |
| `--bg2` | `#161616` | Cards, painéis, modais |
| `--bg3` | `#1e1e1e` | Elementos elevados acima dos cards |
| `--border` | `rgba(255,255,255,0.07)` | Bordas e divisores padrão |
| `--border2` | `rgba(255,255,255,0.12)` | Hover, foco, ênfase |
| `--lime` | `#b3fe71` | Cor primária da marca — CTAs, destaques, mascote |
| `--lime-dim` | `rgba(132,204,22,0.12)` | Background suave em badges e tags |
| `--lime-glow` | `rgba(132,204,22,0.25)` | Efeitos de brilho e glow-pulse |
| `--text` | `#ffffff` | Texto primário — títulos e dados |
| `--text2` | `#a3a3a3` | Texto secundário — subtítulos, descrições |
| `--text3` | `#666` | Texto terciário — labels, metadados |

**Cores adicionais usadas diretamente no código (sem variável):**

| Cor | Hex | Onde aparece |
|---|---|---|
| Lime hover (btn-primary) | `#65a30d` | Hover do botão primário e bordas de tags |
| Lime glow intenso | `rgba(132,204,22,0.3)` | Box-shadow em hover de cards |
| Lime glow mascote | `rgba(132,204,22,0.35)` | Drop-shadow da Orla |
| Terminal fundo | `#0e1210` | Background dos blocos de terminal |
| Terminal header | `#141714` | Barra de chrome dos terminais |
| Texto desabilitado | `#444` | Labels colapsados no free tier |
| Texto muted | `#555` | Metadados secundários no dashboard |

### Cores dos provedores de cloud

| Provedor | Nome | Hex exato |
|---|---|---|
| AWS | Laranja | `#f97316` |
| GCP | Azul | `#3b82f6` |
| Azure | Ciano | `#06b6d4` |
| OCI | Lime (brand) | `#b3fe71` |

OCI recebe a cor da marca intencionalmente — reforço sutil da parceria Oracle OPN sem ser explícito.

### Cores de gráficos (rotação de 8, ordem exata)
`#b3fe71` → `#22d3ee` → `#f59e0b` → `#f472b6` → `#818cf8` → `#34d399` → `#fb923c` → `#a78bfa`

### Semáforo de portabilidade
- Alta portabilidade: `#b3fe71` (lime)
- Média portabilidade: `#f59e0b` (âmbar)
- Baixa portabilidade: `#f97316` (laranja AWS)

### Tipografia
- **Família**: Poppins (Google Fonts) — pesos 400, 500, 600, 700, 900
- **Escala de títulos**: `clamp(2.6rem, 7.5vw, 5.5rem)` para hero; `clamp(2rem, 5vw, 3rem)` para seções
- **Escala de corpo**: `clamp(1rem, 2vw, 1.2rem)`
- **Peso headline**: 900 (font-black) — impacto máximo sem imagem de fundo
- **Letter-spacing**: `tracking-tight` em títulos grandes

### Efeitos visuais recorrentes
- **hero-glow**: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(132,204,22,0.08), transparent 60%)` — efeito de luz verde vindo de cima
- **grid-bg**: grade de linhas `rgba(255,255,255,0.07)`, espaçamento 60×60px, parallax 3D com movimento do mouse
- **glow-pulse**: box-shadow expandindo de `rgba(132,204,22,0.25)` a `rgba(132,204,22,0.1)`, 3s loop
- **drop-shadow mascote**: `drop-shadow(0 0 18–24px rgba(179,254,113,0.3))`
- **Terminal aesthetic**: fundo `#0e1210`, header `#141714`, fonte `mono`, dots macOS (vermelho `#ff5f57`, amarelo `#febc2e`, verde `#28c840`)
- **card-lime hover**: `border-color: rgba(132,204,22,0.3)` + `box-shadow: 0 0 0 1px rgba(132,204,22,0.1)`

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
Orla é um polvo animado em SVG puro — verde-limão, com personalidade de IA analítica. O nome remete à ideia de "beira", a fronteira entre provedores. Ela é a interface humana do produto: aparece em loading, análise e interação no hero. Não é uma imagem estática — é um componente React (`OrlaMascot.tsx`) com gradientes, filtros e animações CSS em `<defs>`.

### Estrutura SVG (viewBox 0 0 120 120)

O SVG tem `overflow: visible` para os tentáculos extrapolarem os limites. Todo o conteúdo é envolvido em um `<g className="orla-float">` que aplica o filtro de sombra.

**Camadas, de baixo para cima:**

1. **Tentáculos traseiros** (atrás do corpo) — desenhados primeiro para ficarem sob o corpo
   - Esquerdo traseiro (`orla-tl2`): path curvo `M38 78 C28 85...`, stroke `#65a30d`, largura 7, sem fill
   - Direito traseiro (`orla-tr2`): path espelhado, mesmo estilo
   - Cada um tem 2 círculos de ventosa: `r=2.5` e `r=2`, fill `#0f0f0f`, opacidade 0.4–0.5

2. **Corpo** — elipse `cx=60 cy=55 rx=34 ry=30`
   - Gradiente radial `cx=42% cy=38% r=58%`: `#a3e635` (0%) → `#b3fe71` (60%) → `#65a30d` (100%)
   - Sobreposta por segunda elipse idêntica com gradiente de brilho: `rgba(255,255,255,0.35)` centro → transparente

3. **Saia/manto** — path ondulado na base do corpo (`M26 68 Q30 72 Q34 70...`), fill com mesmo gradiente do corpo. Cria a transição visual entre corpo e tentáculos.

4. **Tentáculos frontais** (na frente do corpo)
   - Esquerdo frontal (`orla-tl1`): path `M40 78 C32 86...`, stroke `#b3fe71`, largura 8, 3 ventosas (r=2.5, 2, 1.5)
   - Direito frontal (`orla-tr1`): path espelhado, mesmo estilo
   - Central esquerdo (`orla-tc`): path `M52 80 C46 90...`, stroke `#b3fe71`, largura 7.5, 2 ventosas
   - Central direito (`orla-tc`): path espelhado ao central esquerdo, mesmo estilo

5. **Olhos** — dois conjuntos idênticos, espelhados em cx=47 e cx=73
   - Sombra: elipse `rx=9.5 ry=10`, fill `rgba(0,0,0,0.15)`
   - Esclerótica (branco): elipse `rx=9 ry=9.5`, fill `#ffffff`
   - Grupo de blink (`orla-blink`, `transformOrigin` no centro do olho) contém:
     - Grupo de pupila (`orla-pupil` ou `translate(pupilOffset)` se prop presente)
       - Pupila: círculo `r=5.5`, fill `#0f0f0f`
       - Reflexo principal: círculo `r=2`, fill `#ffffff`, opacidade 0.9 (canto superior esquerdo)
       - Reflexo secundário: círculo `r=1`, fill `#ffffff`, opacidade 0.5 (canto inferior direito)
       - **mood happy**: path quadrático curvo sob a pupila (sorriso)
       - **mood thinking**: linha horizontal branca atravessando a pupila

6. **Bochechas** — elipses `rx=6 ry=4` em cx=34 e cx=86, fill `rgba(132,204,22,0.25)`, animação de opacidade

7. **Boca** — path dinâmico por mood:
   - `happy`: `M54 63 Q60 69 66 63` — arco positivo (sorriso)
   - `thinking`: `M56 64 Q60 63 64 64` — linha quase reta (neutro tenso)
   - `default/idle`: `M55 63 Q60 67 65 63` — curva suave neutra
   - Stroke `#65a30d`, largura 2, sem fill

8. **Thinking dots** (só no mood `thinking`) — 3 círculos brancos no canto superior direito: `r=3` (cx=74,cy=38), `r=3.5` (cx=82,cy=32), `r=4` (cx=91,cy=25). Cada um com animação `orla-thinking-dot` em cascade.

9. **Tag "AI"** — `<rect x=52 y=62 w=16 h=8 rx=4>` fill `#65a30d` opacidade 0.6, com `<text>` centralizado em branco, fontSize=5, fontWeight=bold

### Filtros

| ID | Tipo | Parâmetros |
|---|---|---|
| `{id}-glow` | feGaussianBlur + feMerge | stdDeviation=4, blur + source sobrepostos |
| `{id}-shadow` | feDropShadow | dx=0 dy=3 stdDeviation=4 floodColor=`rgba(132,204,22,0.35)` |

### Moods

| Mood | Olhos | Boca | Thinking dots | Uso |
|---|---|---|---|---|
| `default` | pupila normal | curva suave neutra | não | estado padrão |
| `happy` | curva sorridente sob a pupila | arco positivo | não | análise concluída, resultado positivo |
| `thinking` | linha horizontal branca na pupila | linha quase reta | sim (3 círculos em cascade) | processando, calculando |
| `idle` | pupila normal | curva suave neutra | não | aguardando input do usuário |

### Animações (valores exatos do código)

| Classe CSS | Keyframe | Duração | Delay | Efeito |
|---|---|---|---|---|
| `orla-float` | `orla-float` | 3s | 0 | corpo: translateY(0 → -5px → 0) |
| `orla-tl1` | `orla-tentacle-l1` | 2.2s | 0 | tentáculo esquerdo frontal: rotate(-8deg → 4deg) |
| `orla-tl2` | `orla-tentacle-l2` | 2.6s | 0.3s | tentáculo esquerdo traseiro: rotate(-5deg → 6deg) |
| `orla-tr1` | `orla-tentacle-r1` | 2.2s | 0.15s | tentáculo direito frontal: rotate(8deg → -4deg) |
| `orla-tr2` | `orla-tentacle-r2` | 2.6s | 0.45s | tentáculo direito traseiro: rotate(5deg → -6deg) |
| `orla-tc` | `orla-tentacle-c` | 2.8s | 0 | tentáculos centrais: scaleX(1 → 0.92) |
| `orla-blink` | `orla-blink` | 4s | 0 | pálpebra: scaleY(1) — em 95% scaleY(0.08) — rápido |
| `orla-pupil` | `orla-pupil` | 5s | 0 | pupila: translateX(0 → 1.5px → -1px) — olhar errante |
| `orla-blush` | `orla-blush` | 3s | 0 | bochechas: opacity(0.4 → 0.7) |
| `orla-dot1` | `orla-thinking-dot` | 1.2s | 0s | ponto 1: scale(0.7,op=0.2 → scale(1,op=1) |
| `orla-dot2` | `orla-thinking-dot` | 1.2s | 0.4s | ponto 2: idem, atrasado |
| `orla-dot3` | `orla-thinking-dot` | 1.2s | 0.8s | ponto 3: idem, mais atrasado |

Quando `animated=false`, todas as classes recebem `animation: none`.

### Props do componente

```typescript
size?: number           // largura e altura do SVG (padrão: 80)
animated?: boolean      // liga/desliga todas as animações (padrão: true)
mood?: "default" | "thinking" | "happy" | "idle"  // (padrão: "default")
className?: string      // classes extras passadas ao <svg>
pupilOffset?: { x: number; y: number }
// Quando presente: move as pupilas via translate(x,y) em unidades SVG.
// Desativa orla-pupil. Máximo recomendado: ±2.4 unidades para não sair do branco.
// Usado no hero para eye-tracking em tempo real.
```

### Uso atual no produto

| Local | Tamanho | Mood | Behavior |
|---|---|---|---|
| Hero (landing) | 140px | `default` | Fixa no canto inferior direito; `pupilOffset` calculado em tempo real pelo cursor |
| Dashboard — loading | ~80px | `thinking` | Aparece durante os 8 steps de análise com rings de radar animados |
| Dashboard — estado vazio | ~96px | `default` | Tela inicial antes do upload, com texto convidativo |
| Dashboard — resultado | ~32px | — | Ícone no card de resumo da análise |

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

### Módulo 5 — Free Tier Radar (detalhamento completo)

**Conceito:** "Dinheiro deixado na mesa." Identifica quais serviços do billing do cliente têm equivalente gratuito nos 4 provedores que ele ainda não está aproveitando. A Orla calcula, por serviço, quanto o cliente *poderia* estar economizando todo mês com camadas gratuitas permanentes (always free) ou de 12 meses.

**Como funciona:**

O Claude analisa cada item do billing contra uma base de free tiers hardcoded no system prompt. Para cada serviço encontrado, verifica:
1. Existe free tier equivalente em algum dos 4 provedores?
2. O workload parece adequado ao limite do free tier? (baixo tráfego, dev/test, tamanho dentro do limite)
3. Quanto o cliente economizaria por mês se usasse esse free tier?

Retorna uma lista de objetos `FreeTierOpportunity`:
```typescript
{
  provider: string        // qual provedor oferece o free tier
  service: string         // nome do serviço (ex: "Lambda", "Cloud Run")
  description: string     // o que é gratuito e quanto economizaria (texto direto)
  monthlySaving: number   // economia estimada em USD/mês
  eligible: boolean       // true = workload adequado ao free tier
}
```

**Base de free tiers conhecidos pelo modelo:**

| Provedor | Serviços always free mapeados |
|---|---|
| AWS | Lambda (1M req/mês), DynamoDB (25GB), S3 (5GB), EC2 t2.micro (750h), CloudFront (1TB), SES (3k emails), SNS (1M notificações), SQS (1M req), Cognito (50k MAU), CodeBuild (100min), RDS db.t2.micro (750h), ElastiCache cache.t3.micro (750h) |
| GCP | Cloud Run (2M req), BigQuery (1TB queries/mês), Cloud Storage (5GB), Compute e2-micro (regiões US), Pub/Sub (10GB), Cloud Functions (2M invocações), Firestore (1GB), Vision API (1k req/mês), Translation (500k chars) |
| Azure | VM B1S (750h/12 meses), Blob Storage (5GB/12 meses), SQL Database (250GB/12 meses), App Service F1, Logic Apps (60min/12 meses) |
| OCI | 2× VM AMD Standard E2.1.Micro, 4 OCPUs ARM Ampere (always free), 200GB Block Storage, 10GB Object Storage, 1 Load Balancer 10Mbps, 2× Autonomous DB (20GB cada), Monitoring e Logging, Bastion sempre gratuitos |

**UI no dashboard (`FreeTierSection`):**

O componente divide os itens em duas listas visuais:

- **Elegíveis** (`eligible: true`): cards com fundo `rgba(179,254,113,0.05)`, borda `rgba(179,254,113,0.15)`, ícone `CheckCircle` em `#b3fe71`. Exibe provedor, serviço, descrição e economia em `#b3fe71`. No topo do bloco: total de economia elegível em destaque grande.

- **Não elegíveis** (`eligible: false`): cards com opacidade 0.6, fundo `rgba(255,255,255,0.02)`, borda `rgba(255,255,255,0.05)`, ícone `Gift` em `#555`. Label acima: *"Outros free tiers — fora do perfil atual"*. Exibe provedor e serviço mas sem valor monetário destacado.

**Header do bloco:**
- Ícone: `Gift` (Lucide) em `#b3fe71`
- Título: "Free Tiers Disponíveis"
- Badge ao lado: *"Dinheiro deixado na mesa"* — fundo `rgba(255,255,255,0.05)`, texto `#555`
- Total elegível alinhado à direita: valor em `#b3fe71` grande + label "economia potencial elegível" em `#555`

**Quando aparece:** só é renderizado se `data.freeTierOpportunities` existe e tem itens. É o penúltimo bloco de resultados, logo antes da recomendação final.

**Passo no loading:** "Mapeando free tiers disponíveis…" (5º dos 8 steps da animação de análise da Orla)

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
