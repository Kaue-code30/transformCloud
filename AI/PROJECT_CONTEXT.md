# TransformCloud — Contexto do frontend

> Atualizado em: 2026-09-25

## Produto

Frontend Next.js do TransformCloud, uma plataforma de análise e portabilidade multi-cloud. A aplicação é em PT-BR e usa o backend NestJS do repositório irmão `transformCloud-backend`.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16, App Router |
| UI | React 19 + TypeScript strict |
| CSS | Tailwind CSS 4 |
| Ícones | Lucide React |
| Gráficos | Recharts |
| Auth/API | fetch nativo para o backend NestJS |

## Estrutura

```text
app/
├── api/
│   ├── analyze/route.ts       # parser + proxy do SSE de billing
│   └── billing/route.ts       # integração AWS Cost Explorer existente
├── dashboard/
│   ├── page.tsx               # upload e resultado de billing
│   ├── ai/page.tsx
│   ├── migrations/page.tsx
│   ├── portability/page.tsx
│   ├── profile/page.tsx
│   └── settings/page.tsx
└── components/
lib/
├── api.ts                     # cliente REST de auth/users
├── auth-context.tsx
├── theme-context.tsx
├── billing-parser.ts          # parser determinístico
└── billing-contract.ts        # tipos SSE e view model
```

## Billing

O fluxo antigo, no qual `/api/analyze` enviava o arquivo inteiro ao Claude para gerar preços e recomendação, foi removido.

Fluxo atual:

1. usuário envia JSON, CSV, TSV ou TXT delimitado;
2. `billing-parser.ts` reconhece campos conhecidos e produz `ParsedBilling`;
3. o Route Handler chama `POST /api/billing/analyze/stream` no backend;
4. o SSE é encaminhado ao navegador sem buffering;
5. a página consome os eventos com `fetch` + `ReadableStream`;
6. a UI mostra apenas preços e cobertura recebidos do catálogo.

Não são usados web search, multiplicadores fixos ou IA para preencher lacunas. Consulte `AI/ARCHITECTURE_BILLING_V2.md` e `AI/MODULES/BILLING_FRONTEND.md`.

## Autenticação

- `accessToken` e `refreshToken` ficam no `localStorage`.
- `AuthProvider` concentra login, cadastro e logout.
- `dashboard/layout.tsx` protege as páginas do dashboard no cliente.
- Perfil e troca de senha usam o backend NestJS por `lib/api.ts`.

## Tema

- Dashboard suporta dark/light e persiste a escolha no `localStorage`.
- Tokens `--ds-*` ficam em `app/globals.css`.
- Landing e páginas de autenticação permanecem escuras.
- Cores passadas ao SVG do Recharts permanecem em hexadecimal.

## Variáveis de ambiente

```env
# URL privada usada pelo Route Handler de billing
BACKEND_API_URL=http://localhost:3001/api

# URL pública já usada por auth/users; também serve como fallback do BFF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

O frontend não precisa mais de `ANTHROPIC_API_KEY` para analisar billing.

## Execução

```bash
npm install
npm run dev
```

Frontend: `http://localhost:3000`. Backend: `http://localhost:3001/api`.

## Estado dos módulos

| Módulo | Status |
|---|---|
| Auth e recuperação de senha | funcional |
| Perfil e troca de senha | funcional |
| Tema do dashboard | funcional |
| Upload e análise SSE de billing | adaptado ao catálogo determinístico |
| AI Insights | scaffold |
| Portability Score | scaffold |
| Migration Automation | scaffold |
| Settings | scaffold |

## Limites conhecidos

- O parser aceita aliases comuns, mas exports personalizados podem exigir novos cabeçalhos.
- A UI não mostra evolução diária porque o contrato novo não devolve essa série.
- Free tier só deverá voltar quando existir como dado versionado no backend.
- O backend atualmente faz matching automático apenas de VMs.
