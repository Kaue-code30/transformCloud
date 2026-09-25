# Arquitetura de Billing V2 — Catálogo determinístico

> Atualizado em: 2026-09-25

## Decisão arquitetural

Serviços, SKUs, medidores, regiões, preços e equivalências são dados da aplicação. Eles não são gerados por IA.

O frontend preserva os identificadores presentes no arquivo. O backend cruza esses identificadores com um catálogo versionado, calcula o comparativo e escolhe o provedor por regras auditáveis. A IA do backend é opcional e pode apenas redigir a explicação.

## Componentes

```text
┌─────────────────────────────────────────────────────────────┐
│ Frontend Next.js                                            │
│ arquivo -> parser -> ParsedBilling -> proxy SSE -> UI       │
└─────────────────────────────┬───────────────────────────────┘
                              │ POST + text/event-stream
┌─────────────────────────────▼───────────────────────────────┐
│ Backend NestJS                                              │
│ normalização -> matcher -> pricing -> ranking -> payback    │
└─────────────────────────────┬───────────────────────────────┘
                              │ consultas Prisma
┌─────────────────────────────▼───────────────────────────────┐
│ PostgreSQL                                                  │
│ serviços -> ofertas -> medidores -> tiers -> overrides      │
└─────────────────────────────────────────────────────────────┘
```

## Fronteiras de responsabilidade

| Camada | Pode fazer | Não pode fazer |
|---|---|---|
| Parser frontend | reconhecer colunas, normalizar datas/números, agregar linhas | inventar SKU, região, quantidade ou atributo |
| BFF Next.js | validar tamanho, chamar backend, repassar stream | recalcular preço ou recomendação |
| Matcher backend | aplicar override e regras de capacidade/região | usar IA como fallback |
| Pricing backend | calcular componentes e tiers vigentes | consultar preço ad hoc para preencher ausência |
| Ranking backend | comparar apenas valores verificados e mesma moeda | eleger provedor com dado inexistente |
| IA opcional | explicar decisão e limitações | alterar provedor, valores, cobertura ou evidências |
| UI | derivar visualizações dos dados recebidos | exibir estimativa falsa para lacunas |

## Contratos

O request preferencial contém `lineItems`. Cada linha deve carregar identidade nativa, região, consumo, unidade, custo e moeda. O backend retorna eventos `PipelineProgressEvent`; o evento `done` contém o `PipelineResult` consolidado.

Os tipos espelhados pelo frontend ficam em `lib/billing-contract.ts`. A fonte canônica do backend fica em `src/modules/billing/types/pipeline.types.ts`.

## Projeção de custo na UI

Para cada provedor destino:

```text
custo_coberto_atual = soma do custo atual dos itens verified
custo_coberto_destino = soma de estimatedMonthly dos mesmos itens
economia = custo_coberto_atual - custo_coberto_destino
custo_projetado = total atual - economia
```

Itens não cobertos são mantidos sem alteração no custo projetado. A interface exibe a porcentagem coberta para que essa hipótese fique explícita.

## Segurança contra alucinação

1. O parser falha quando campos mínimos não existem.
2. O matcher retorna `unmapped` sem SKU/capacidade suficiente.
3. O pricing retorna `not_found` sem oferta vigente.
4. O ranking ignora preços não verificados ou em outra moeda.
5. A UI mostra ausência em vez de multiplicadores.
6. A IA não tem autoridade para alterar a decisão calculada.

## Extensão do sistema

Para adicionar um novo tipo de recurso:

1. importar serviços, ofertas, medidores e preços oficiais;
2. criar a normalização dos campos técnicos necessários;
3. implementar critérios e score específicos do recurso;
4. criar fixtures de origem e destino;
5. testar mapped, partial e unmapped;
6. só então habilitar a categoria no frontend.

Detalhes operacionais estão em `AI/MODULES/BILLING_FRONTEND.md` e, no backend, em `AI/MODULES/BILLING.md` e `AI/MODULES/CATALOG.md`.
