# Módulo: Tema Claro/Escuro — Dashboard

> Última atualização: 2026-05-21
> Status: Implementado e funcional

---

## Arquivos

| Arquivo | Função |
|---------|--------|
| `app/globals.css` | Define tokens `--ds-*` em `:root` (dark) e `.ds-light` (light) |
| `lib/theme-context.tsx` | `ThemeProvider` + `useTheme()` com persistência em `localStorage` |
| `app/dashboard/layout.tsx` | Importa `ThemeProvider`, renderiza botão toggle Sol/Lua |

---

## Como funciona

O tema é controlado por uma classe CSS no `<html>`:

```
dark  → sem classe   → variáveis do :root  → fundo escuro
light → classe .ds-light → sobrescreve tokens → fundo claro
```

A classe é aplicada em `document.documentElement` (não num div interno) para que elementos `position: fixed` como a sidebar também herdem corretamente.

`ThemeProvider` (em `lib/theme-context.tsx`):
1. Ao montar, lê `localStorage.getItem("ds-theme")`
2. Se `"light"`, adiciona `.ds-light` no `<html>`
3. `toggle()` alterna e persiste em `localStorage`

---

## Tokens CSS

Definidos em `app/globals.css`:

```css
:root {
  --ds-accent:     #b3fe71;   /* verde lime */
  --ds-bg:         #1a1a1a;
  --ds-surface:    #1a1a1a;   /* sidebar */
  --ds-card:       #161616;
  --ds-card-alt:   #242424;
  --ds-border:     #2a2a2a;   /* borda sólida — sidebar, cards */
  --ds-border-md:  #333333;
  --ds-border-sub: #222222;
  --ds-text:       #ffffff;
  --ds-text-2:     #a3a3a3;
  --ds-text-3:     #666666;
  --ds-text-4:     #444444;
  --ds-text-5:     #555555;
  --ds-muted:      #cccccc;
  --ds-hover:      rgba(255,255,255,0.03);
  --ds-grid:       #1e1e1e;   /* grade dos gráficos */
  --ds-bar-bg:     #0f0f0f;
  --ds-tooltip-bg: #161616;
  --ds-empty-bg:   #0a0a0a;
}

.ds-light {
  --ds-accent:     #3a7d00;   /* verde floresta — legível no claro */
  --ds-bg:         #f0f2f5;
  --ds-surface:    #e8eaed;
  --ds-card:       #ffffff;
  --ds-card-alt:   #f5f6f8;
  --ds-border:     rgba(0,0,0,0.08);
  --ds-border-md:  rgba(0,0,0,0.12);
  --ds-border-sub: rgba(0,0,0,0.05);
  --ds-text:       #111111;
  --ds-text-2:     #555555;
  --ds-text-3:     #888888;
  --ds-text-4:     #aaaaaa;
  --ds-text-5:     #999999;
  --ds-muted:      #333333;
  --ds-hover:      rgba(0,0,0,0.03);
  --ds-grid:       #e4e6e9;
  --ds-bar-bg:     #e8eaed;
  --ds-tooltip-bg: #ffffff;
  --ds-empty-bg:   #f5f6f8;
}
```

---

## Escopo do Tema

| Área | Tema |
|------|------|
| Dashboard (`/dashboard/*`) | Dark/Light via toggle |
| Landing page (`/`) | Sempre dark |
| Auth (`/login`, `/register`, `/forgot-password`, `/reset-password`) | Sempre dark |

---

## Como usar nos componentes

Sempre usar `style={{ ... }}` ou `className` com `var(--ds-*)`:

```tsx
// ✅ Correto — responde ao tema
<div style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}>
  <p style={{ color: "var(--ds-text)" }}>Título</p>
  <p style={{ color: "var(--ds-text-2)" }}>Subtítulo</p>
</div>

// ❌ Errado — hardcoded, não muda com o tema
<div className="bg-[#161616] border-[#2a2a2a]">
```

---

## Exceções — manter hardcoded

Alguns valores **não devem** usar `var(--ds-accent)` pois são passados a APIs que precisam de valores literais:

```typescript
// Recharts e SVG — precisam de hex literal
const PROVIDER_COLORS = { AWS: "#f97316", GCP: "#3b82f6", Azure: "#06b6d4", OCI: "#b3fe71" };
const SERVICE_COLORS  = ["#b3fe71", "#22d3ee", ...];
const COMPLEXITY_COLOR = { "Baixa": "#b3fe71", ... };

// Concatenações de alpha — `${cor}40` não funciona com var()
style={{ borderColor: `${provColor}40` }}  // provColor deve ser hex
```

---

## Toggle — onde fica

**Desktop:** ícone Sol/Lua no rodapé da sidebar, entre "Voltar ao site" e "Sair"

**Mobile:** ícone Sol/Lua na topbar, entre os links de navegação e o botão de logout

---

## Próximos Passos

- [ ] Adicionar transição suave (`transition: background 0.2s, color 0.2s`) nos elementos principais ao trocar de tema
- [ ] Portability, Migrations e AI Insights (quando implementados) já herdam o tema automaticamente por usarem `var(--ds-*)`
