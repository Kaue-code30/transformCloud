# Módulo: Autenticação + Perfil — Frontend

> Última atualização: 2026-05-21
> Status: Implementado e funcional

---

## Arquivos

| Arquivo | Função |
|---------|--------|
| `lib/api.ts` | Cliente HTTP para o backend. Métodos: `api.auth.*`, `api.users.*` |
| `lib/auth-context.tsx` | `AuthProvider` + `useAuth()`. Estado: `user`, `loading`, `login`, `register`, `logout`, `updateUser` |
| `app/login/page.tsx` | Split 50/50 — ilustração à esquerda, formulário à direita |
| `app/register/page.tsx` | Split 50/50 — checklist de força de senha |
| `app/forgot-password/page.tsx` | Solicita reset; estado de sucesso com link de teste |
| `app/reset-password/page.tsx` | Lê `?token=` da URL; 3 estados: token ausente / formulário / sucesso |
| `app/dashboard/profile/page.tsx` | Perfil com grid de cards: info pessoal (editável) + segurança (troca de senha) |
| `app/components/AuthIllustration.tsx` | Ilustração abstrata animada reutilizada nas 4 telas de auth |
| `app/layout.tsx` | `AuthProvider` envolve toda a aplicação |
| `app/components/Navbar.tsx` | Estado logado: nome + Dashboard + Sair. Deslogado: Entrar + Criar conta |
| `app/dashboard/layout.tsx` | Guard de auth + sidebar com avatar clicável → `/dashboard/profile` |

---

## API — Métodos disponíveis

```typescript
api.auth.register({ email, name, password })   // → { accessToken, refreshToken }
api.auth.login({ email, password })             // → { accessToken, refreshToken }
api.auth.logout(refreshToken)                   // → void
api.auth.forgotPassword(email)                  // → { message }
api.auth.resetPassword(token, newPassword)             // → { message }
api.users.me()                                        // → User (requer token)
api.users.update({ name? })                           // → User (requer token) — só nome
api.users.changePassword(currentPassword, newPassword) // → { message } (requer token)
```

---

## Tipo User (AuthContext)

```typescript
type User = {
  id: string;
  email: string;
  name: string;
  role: string;       // "USER" | "ADMIN"
  createdAt: string;  // ISO date
}
```

---

## useAuth() — como usar

```typescript
const { user, loading, login, register, logout, updateUser } = useAuth();
```

- `user` — `null` se não autenticado
- `loading` — `true` durante a verificação inicial (GET /users/me)
- `updateUser` — atualiza nome ou senha; sincroniza o estado global automaticamente

---

## Fluxo de Autenticação

```
/register ou /login
  → api.auth.register/login() → salva tokens no localStorage
  → api.users.me() → seta user no contexto
  → router.push("/dashboard")

/dashboard (qualquer rota)
  → DashboardLayout verifica: if (!loading && !user) router.replace("/login")
  → Spinner enquanto loading=true

/forgot-password
  → api.auth.forgotPassword(email)
  → Backend gera JWT temporário (15min) e loga no console
  → Tela mostra "Verifique seu e-mail" (resposta sempre neutra)

/reset-password?token=<jwt>
  → Lê token da URL via useSearchParams (dentro de Suspense)
  → api.auth.resetPassword(token, newPassword)
  → Backend valida JWT (purpose: password-reset), atualiza senha, invalida refresh tokens
  → Redirect automático para /login após 3s
```

---

## Tokens

- `accessToken` (15min) e `refreshToken` (7d) em `localStorage`
- `authHeader()` em `lib/api.ts` injeta `Authorization: Bearer` automaticamente
- Ao carregar a app, `AuthProvider` tenta `GET /api/users/me` — se falhar, limpa localStorage
- Refresh automático ainda não implementado — ao expirar, usuário precisa re-logar

---

## Perfil (`/dashboard/profile`)

Layout estilo card de funcionário — cabeçalho + grid 2 colunas:

**Cabeçalho:** avatar com iniciais (2 letras), nome, role, membro desde, e-mail, ID (8 chars)

**Card "Informações pessoais":** nome editável inline com Salvar/Cancelar no header do card

**Card "Segurança":** troca de senha via `PATCH /users/me/password` com validação bcrypt da senha atual no backend (`401` se incorreta). 3 campos: atual, nova, confirmação. No modo leitura mostra `••••••••`.

Ambos os cards respondem ao tema claro/escuro via `var(--ds-*)`.

---

## Variável de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Omitir usa o valor acima como fallback.

---

## Próximos Passos

- [ ] Refresh automático do accessToken (interceptor no `lib/api.ts`)
- [ ] Redirect para `/login` ao receber 401 em qualquer chamada autenticada
- [ ] Envio real de e-mail no `forgot-password` (integração com serviço SMTP/Resend)
- [ ] Upload de foto de perfil (avatar real em vez de iniciais)
