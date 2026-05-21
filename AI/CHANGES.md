# Log de Mudanças — Sessões de IA

> Este arquivo registra todas as mudanças feitas por agentes de IA no projeto TransformCloud.  
> Formato: cada sessão tem data, objetivo, arquivos alterados e descrição das mudanças.

---

## Como usar este arquivo

Sempre que uma sessão de IA fizer mudanças no projeto, adicione uma entrada no topo deste arquivo seguindo o formato abaixo:

```markdown
## [YYYY-MM-DD] — Título da Sessão

**Objetivo:** O que foi pedido pelo usuário.

**Arquivos alterados:**
- `caminho/do/arquivo.ts` — descrição da mudança

**Descrição:**
Explicação detalhada do que foi feito, por que, e qualquer decisão importante tomada.

**Observações:**
Pontos de atenção, débitos técnicos introduzidos, ou próximos passos sugeridos.
```

---

## [2026-05-21] — Erros de API em PT-BR para o usuário

**Objetivo:** Todas as mensagens de erro retornadas pela API devem ser claras e em português para o usuário final.

**Arquivos alterados:**
- `lib/api.ts` — adicionada função `humanizeError(status, rawMessage)` que traduz/normaliza erros antes de lançar. Cobre: senha incorreta (401), sessão expirada (401 genérico), e-mail duplicado (409), not found (404), erros de validação do class-validator (array → string), erros 400 genéricos, erros 500, e falha de rede (fetch throw)
- `app/dashboard/profile/page.tsx` — fallbacks de catch atualizados para mensagens descritivas

**Descrição:**
O backend NestJS pode retornar mensagens em inglês ("Unauthorized"), arrays do class-validator, ou mensagens PT-BR. A função `humanizeError` normaliza tudo num único ponto antes de chegar ao usuário. Erros de rede (sem internet) também são tratados.

**Observações:**
- A função vive em `lib/api.ts` — qualquer novo endpoint herda o tratamento automaticamente
- Para adicionar novos casos, editar `humanizeError` no mesmo arquivo

---

## [2026-05-21] — Perfil: Troca de Senha com Validação da Senha Atual

**Objetivo:** Integrar a troca de senha do perfil com o endpoint correto do backend, que valida a senha atual via bcrypt antes de atualizar.

**Arquivos alterados:**
- `lib/api.ts` — adicionado `api.users.changePassword(currentPassword, newPassword)` → `PATCH /users/me/password`. Removido `password?` de `api.users.update` (que agora só aceita `name?`)
- `lib/auth-context.tsx` — tipo `updateUser` restrito a `{ name? }` — senha não passa mais por ele
- `app/dashboard/profile/page.tsx` — `handlePwSave` usa `api.users.changePassword()` diretamente em vez de `updateUser({ password })`

**Descrição:**
Antes, a troca de senha chamava `PATCH /users/me` com `{ password }`, que não pedia a senha atual. Agora chama `PATCH /users/me/password` com `{ currentPassword, newPassword }`. O backend faz `bcrypt.compare` e lança `401 Unauthorized` se a senha atual estiver errada — o frontend captura e exibe a mensagem inline no card.

**Observações:**
- O campo "Senha atual" no formulário é obrigatório para habilitar o botão Salvar (`canSavePw` requer `pw.current.length > 0`)
- Erro `"Senha atual incorreta"` vem diretamente do backend e é exibido inline

---

## [2026-05-21] — Tema Claro/Escuro no Dashboard

**Objetivo:** Adicionar modo claro e dark ao dashboard inteiro, com toggle persistido.

**Arquivos criados:**
- `lib/theme-context.tsx` — `ThemeProvider` + `useTheme()`. Aplica `.ds-light` em `document.documentElement` (não num div, para cobrir elementos `fixed`)
- `AI/MODULES/DASHBOARD_THEME.md` — documentação completa do sistema de tema

**Arquivos alterados:**
- `app/globals.css` — adicionados tokens `--ds-accent`, `--ds-bg`, `--ds-card`, `--ds-border`, etc. em `:root` (dark) e `.ds-light` (light). Token `--ds-accent`: `#b3fe71` no dark, `#3a7d00` no light
- `app/dashboard/layout.tsx` — `ThemeProvider` envolve o dashboard; botão Sol/Lua na sidebar e topbar
- `app/dashboard/page.tsx` — todas as cores hardcoded substituídas por `var(--ds-*)`. Exceções mantidas como hex literal: `PROVIDER_COLORS`, `SERVICE_COLORS`, `COMPLEXITY_COLOR` (Recharts precisa de valores literais)
- `app/dashboard/ai/page.tsx` — cores substituídas
- `app/dashboard/settings/page.tsx` — cores substituídas
- `app/dashboard/profile/page.tsx` — cores substituídas

**Descrição:**
O tema é aplicado via classe `.ds-light` no `<html>` para que a sidebar `fixed` também herde as variáveis. O toggle persiste em `localStorage`. Landing page e telas de auth não são afetadas.

**Observações:**
- `PROVIDER_COLORS.OCI` e `COMPLEXITY_COLOR.Baixa` mantêm `#b3fe71` literal — necessário para concatenações de alpha (`${cor}40`) e para o SVG do Recharts
- `stopColor` e `stroke` do Recharts aceitam `var()` nativamente (SVG suporta CSS custom properties)

---

## [2026-05-21] — Perfil do Usuário

**Objetivo:** Criar página de perfil no dashboard com edição de nome e troca de senha.

**Arquivos criados:**
- `app/dashboard/profile/page.tsx` — layout estilo card de funcionário: cabeçalho + grid 2 colunas (info pessoal + segurança)

**Arquivos alterados:**
- `lib/api.ts` — adicionado `api.users.update()` e campo `createdAt` no tipo de retorno
- `lib/auth-context.tsx` — adicionado `updateUser()` e `createdAt` no tipo `User`
- `app/dashboard/layout.tsx` — avatar no footer da sidebar virou link para `/dashboard/profile`

**Descrição:**
Card "Informações pessoais": nome editável inline (Enter salva, Escape cancela), e-mail somente leitura. Card "Segurança": senha atual (confirmação) + nova + confirmação. No modo leitura mostra `••••••••`. Feedback inline de erro/sucesso sem modais.

---

## [2026-05-21] — Recuperação de Senha (Frontend)

**Objetivo:** Integrar o fluxo completo de recuperação de senha com o backend.

**Arquivos criados:**
- `app/forgot-password/page.tsx` — solicita e-mail; estado de sucesso com link "Já tenho um token"
- `app/reset-password/page.tsx` — lê `?token=` da URL (Suspense); 3 estados: ausente, formulário, sucesso + redirect 3s

**Arquivos alterados:**
- `lib/api.ts` — adicionados `api.auth.forgotPassword()` e `api.auth.resetPassword()`
- `app/login/page.tsx` — link "Esqueceu a senha?" ao lado do label da senha

---

## [2026-05-21] — Layout Split 50/50 nas Telas de Auth

**Objetivo:** Redesenhar login/cadastro com layout dividido: ilustração animada à esquerda, formulário à direita.

**Arquivos criados:**
- `app/components/AuthIllustration.tsx` — sistema orbital animado (3 anéis, núcleo pulsante, linha de scan, partículas). Reutilizado nas 4 telas de auth.

**Arquivos alterados:**
- `app/login/page.tsx` — layout split, ilustração + tagline no banner
- `app/register/page.tsx` — layout split, mesma ilustração com tagline diferente

---

## [2026-05-21] — Telas de Login e Cadastro + Integração com Backend

**Objetivo:** Criar telas de login e cadastro no Next.js integradas ao backend NestJS (porta 3001).

**Arquivos criados:**
- `lib/api.ts` — cliente HTTP tipado para o backend
- `lib/auth-context.tsx` — React Context com `useAuth()` (user, loading, login, register, logout)
- `app/login/page.tsx` — tela de login com feedback de erro
- `app/register/page.tsx` — tela de cadastro com checklist de força de senha
- `AI/MODULES/AUTH_FRONTEND.md` — documentação do módulo de auth no frontend

**Arquivos alterados:**
- `app/layout.tsx` — adicionado `AuthProvider` envolvendo toda a aplicação
- `app/components/Navbar.tsx` — mostra nome do usuário + Dashboard + Sair quando logado; Entrar + Criar conta quando deslogado
- `app/dashboard/layout.tsx` — guard de auth (redireciona para `/login` se não autenticado), sidebar com avatar e logout

**Descrição:**
Tokens JWT ficam no `localStorage`. O `AuthProvider` tenta recuperar o usuário ao carregar via `GET /api/users/me`. O guard no layout do dashboard usa `useEffect` + `router.replace` para proteção client-side.

**Observações:**
- Definir `NEXT_PUBLIC_API_URL=http://localhost:3001/api` no `.env.local` do frontend (tem fallback automático para esse valor).
- Refresh automático do accessToken não implementado ainda — token expira em 15m e o usuário precisará logar novamente.

---

## [2026-05-19] — Análise e Documentação Inicial do Projeto

**Objetivo:** Fazer análise completa do projeto e criar documentação de contexto para futuras sessões de IA.

**Arquivos criados:**
- `AI/PROJECT_CONTEXT.md` — Documento completo de contexto do projeto
- `AI/CHANGES.md` — Este arquivo de log de mudanças

**Descrição:**
Exploração de toda a estrutura do projeto: arquivos de configuração, páginas, componentes, rotas de API, dependências, design system, e arquitetura. O resultado foi consolidado em `PROJECT_CONTEXT.md` como referência permanente.

**Observações:**
- Nenhum código foi alterado nesta sessão — apenas documentação criada.
- Páginas `/dashboard/ai`, `/dashboard/portability`, `/dashboard/migrations` e `/dashboard/settings` estão scaffolded mas sem lógica real implementada.
- O endpoint `/api/analyze` depende de `ANTHROPIC_API_KEY` no `.env.local` para funcionar.
