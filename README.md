# Myflow

App pessoal para organizar **tarefas, estudos, saúde, despesas, lazer e
aniversários** dentro de um único calendário e dashboard. Construído com
**Next.js 14 (App Router) + TypeScript + Supabase**.

## O que já vem pronto

- **Landing page** (`/`) explicando o propósito do app, com botão de convite
  via WhatsApp e CTA para login.
- **Autenticação com Google** via Supabase Auth (OAuth), com callback e
  proteção de rotas por middleware.
- **CRUD completo** (criar, listar, editar, apagar) para 6 áreas: Tarefas,
  Estudos, Saúde, Despesas, Lazer e Aniversários — cada usuário só vê os
  próprios dados (Row Level Security no Postgres).
- **Dashboard "Hoje"** com resumo de todas as áreas.
- **Calendário** que agrega tarefas com prazo, estudos, despesas, lazer e
  aniversários no mesmo mês.

## Estrutura de páginas

```
/                          → landing page (propósito do app + convite WhatsApp)
/login                     → login com Google
/auth/callback             → troca o code do OAuth pela sessão
/dashboard                 → visão geral ("Hoje")
/dashboard/calendario      → calendário agregado
/dashboard/tarefas         → CRUD de tarefas
/dashboard/estudos         → CRUD de estudos
/dashboard/saude           → CRUD de saúde
/dashboard/despesas        → CRUD de despesas
/dashboard/lazer           → CRUD de lazer
/dashboard/aniversarios    → CRUD de aniversários
```

## 1. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode o conteúdo de `supabase/schema.sql` — isso
   cria as 6 tabelas e as políticas de Row Level Security (cada usuário só
   acessa os próprios registros).
3. Vá em **Authentication → Providers → Google** e ative o provedor:
   - No [Google Cloud Console](https://console.cloud.google.com/), crie um
     OAuth Client ID do tipo "Web application".
   - Em **Authorized redirect URIs**, adicione a URL de callback que o
     Supabase mostra na tela do provedor Google (algo como
     `https://SEU-PROJETO.supabase.co/auth/v1/callback`).
   - Cole o Client ID e o Client Secret de volta no Supabase.
4. Em **Authentication → URL Configuration**, defina:
   - Site URL: `http://localhost:3000` (em produção, seu domínio real)
   - Redirect URLs: `http://localhost:3000/auth/callback` (e a URL de
     produção equivalente)

## 2. Configurar variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_INVITE_NUMBER=5511999999999
```

- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão em
  **Project Settings → API** no Supabase.
- `NEXT_PUBLIC_WHATSAPP_INVITE_NUMBER` é opcional: se vazio, o botão de
  convite abre o seletor de contatos do WhatsApp em vez de um número fixo.

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## 4. Publicar (ex: Vercel)

1. Suba o projeto para o GitHub.
2. Importe o repositório na [Vercel](https://vercel.com).
3. Adicione as mesmas variáveis de ambiente do `.env.local` nas
   configurações do projeto na Vercel.
4. Atualize `NEXT_PUBLIC_SITE_URL`, e as Redirect URLs no Supabase e no
   Google Cloud Console, para o domínio de produção.

## Sobre os componentes de UI

Os componentes em `src/components/ui` seguem a convenção do **shadcn/ui**
(Button, Card, Input, Badge, Checkbox), mas foram implementados de forma
simples e independente, sem dependências do Radix UI, para o projeto
funcionar direto após `npm install`. Se quiser trocar por componentes
shadcn "oficiais", rode `npx shadcn@latest init` e depois
`npx shadcn@latest add button card input badge checkbox` — os componentes
atuais podem ser substituídos progressivamente, pois compartilham a mesma
API de props.

## Extensões sugeridas

- Adicionar paginação e filtros por data em cada CRUD.
- Adicionar gráficos de despesas por categoria (ex: `recharts`).
- Adicionar notificações por e-mail para tarefas com prazo próximo
  (Supabase Edge Functions + cron).
