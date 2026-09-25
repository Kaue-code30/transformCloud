# Módulo: Billing no frontend

> Atualizado em: 2026-09-25

## Responsabilidade

O frontend não calcula equivalências nem preços. Ele possui quatro responsabilidades:

1. ler o arquivo enviado pelo usuário;
2. converter campos conhecidos em `ParsedBilling.lineItems` sem IA;
3. encaminhar o contrato para o endpoint SSE do backend;
4. mostrar valores, cobertura e ausências exatamente como recebidos.

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `lib/billing-parser.ts` | parser determinístico de JSON, CSV, TSV e TXT delimitado |
| `lib/billing-contract.ts` | contrato do backend e adaptação para o modelo visual |
| `app/api/analyze/route.ts` | BFF: faz parse, chama o NestJS e repassa o SSE |
| `app/dashboard/page.tsx` | consome o stream e renderiza progresso/resultados |

## Fluxo

```text
Browser
  -> POST /api/analyze { content, filename, targetRegion? }
  -> parseBillingFile()
  -> POST http://localhost:3001/api/billing/analyze/stream
  -> SSE repassado pelo Route Handler
  -> fetch + ReadableStream no Client Component
  -> toBillingViewModel() no evento done
```

`EventSource` não é usado porque a análise exige um `POST` com body.

## Formatos aceitos

### JSON estruturado

É o formato mais confiável. Deve seguir `ParsedBilling` e conter `lineItems` ou `topServices`. A fixture do backend é um exemplo válido:

```text
../transformCloud-backend/test/fixtures/billing/aws-compute-demo-request.json
```

### CSV/TSV/TXT delimitado

O parser reconhece aliases comuns de exports AWS CUR, GCP Billing Export, Azure Cost Analysis e OCI. Para produzir uma linha útil ao catálogo, o arquivo deve fornecer:

- serviço ou código do serviço;
- região;
- custo e moeda;
- quantidade e unidade;
- SKU, medidor ou nome nativo da oferta;
- data/período de uso.

Linhas equivalentes são agregadas por provedor, serviço, SKU/medidor, região, modalidade e atributos técnicos. Arquivos com múltiplas moedas são rejeitados, pois o sistema não realiza conversão cambial.

Se as colunas não forem reconhecidas, o endpoint retorna `422` com uma mensagem explícita. O parser não pede à IA para completar campos ausentes.

## SSE

A tela mantém um buffer porque um JSON pode chegar dividido em vários chunks. Cada frame `data: {...}` é interpretado como `PipelineProgressEvent`.

- mensagens de `mapping`, `pricing`, `classification` e `recommendation` atualizam o progresso real;
- `error` interrompe o fluxo e apresenta a mensagem;
- somente `done` é convertido no modelo visual completo.

## Transparência da UI

- preços ausentes aparecem como `— / não verificado`;
- a tabela não preenche provedores sem dados com multiplicadores;
- o card superior mostra `coveredCostPct` e quantidade de serviços verificados;
- a projeção de cada provedor usa apenas itens com status `verified` e mesma moeda;
- o provedor atual usa o custo real recebido no billing;
- a recomendação é identificada como calculada e baseada no catálogo local.

## Configuração

```env
# .env.local
BACKEND_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

`BACKEND_API_URL` é usada pelo Route Handler. `NEXT_PUBLIC_API_URL` permanece usada pelo cliente de autenticação e funciona como fallback do BFF.

O frontend não precisa mais de `ANTHROPIC_API_KEY` para billing.

## Teste manual

Com backend, banco e fixtures de catálogo já ativos:

```bash
npm run dev
```

Abra `http://localhost:3000/dashboard` e envie:

```text
../transformCloud-backend/test/fixtures/billing/aws-compute-demo-request.json
test/fixtures/aws-compute-demo.csv
```

O primeiro arquivo valida o contrato JSON já estruturado. O segundo valida detecção do provedor, aliases de colunas, normalização e agregação do CSV.

Resultado esperado:

- progresso real recebido via SSE;
- cobertura de 100%;
- GCP a USD 547,50;
- Azure a USD 620,50;
- recomendação GCP;
- economia mensal de USD 452,50;
- payback de 7 meses;
- AWS e OCI marcados como não verificados nesse comparativo de destino.

## Limites

- Um export oficial pode variar conforme configuração e versão; novos cabeçalhos devem ser adicionados às listas de aliases do parser.
- O gráfico diário fica oculto no fluxo novo porque o contrato atual do backend não devolve agregação por dia.
- Free tier não é inferido enquanto não existir dado versionado correspondente no backend.
- O matcher atual do backend cobre somente `COMPUTE_VM`.
