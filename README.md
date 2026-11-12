# STATUS - NÃO FINALIZADO
# 🎧 NOIZ — seu som, seu corre

Plataforma full stack de streaming de música, feita para quem vive o corre da música: ouça, monte playlists e — se for artista — suba suas próprias faixas.

<img width="1322" height="605" alt="image" src="https://github.com/user-attachments/assets/2f0f53aa-d3d0-4a2c-a16f-91093e9b01e8" />

<img width="1317" height="599" alt="image" src="https://github.com/user-attachments/assets/55848b6f-0544-4cb2-8843-575059bdbfde" />


## Índice

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Começando](#começando)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Arquitetura](#arquitetura)
- [Banco de dados](#banco-de-dados)
- [API](#api)
- [Segurança](#segurança)
- [Testes e CI](#testes-e-ci)
- [Deploy](#deploy)
- [Problemas comuns](#problemas-comuns)
- [Roadmap](#roadmap)

## Funcionalidades

**Para ouvintes**
- Cadastro, login e recuperação de senha por e-mail
- Player de verdade: play/pause, próxima/anterior, barra de progresso com seek, volume/mudo, aleatório, repetir (tudo / uma), atalho de espaço e teclas de mídia do sistema
- Busca unificada por música, artista e álbum (com debounce)
- Playlists: criar, renomear, descrição, capa, pública/privada, adicionar/remover músicas, excluir
- Curtidas (com atualização otimista), histórico sem repetição, fila ("adicionar à fila")
- Páginas de artista, álbum e playlist; "Em alta" e "Lançamentos" na Home
- Tema escuro/claro, layout responsivo (navegação inferior no celular), skeleton loading, notificações (toasts) e tratamento de erro em todas as telas

**Para artistas**
- Virar artista pelo perfil (a role é promovida e a sessão renovada)
- Estúdio: enviar músicas (duração detectada automaticamente, barra de progresso do upload), criar álbuns, gerenciar e excluir catálogo
- Foto e capa da página do artista

## Tecnologias

| Camada | Stack |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Zustand, React Hook Form + Zod |
| Backend | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT + bcrypt, Multer, Zod, Swagger/OpenAPI |
| Infra | Docker / docker-compose, GitHub Actions, Supabase Storage (arquivos), Neon (Postgres), Vercel (front), Railway/Render (API) |

## Começando

Pré-requisitos: **Node 22+** e **Docker** (para o Postgres ou para rodar tudo).

### Opção 1 — tudo com Docker

```bash
cp .env.example .env        # opcional: só para ativar uploads (Supabase) e e-mail
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:3333/api/v1 · Swagger: http://localhost:3333/docs

Na primeira subida o container cria as tabelas sozinho. Para popular com dados de exemplo:

```bash
docker compose exec backend npx prisma db seed
```

### Opção 2 — desenvolvimento local (hot reload)

```bash
# 1) Só o banco no Docker
docker compose up -d postgres

# 2) Backend
cd backend
cp .env.example .env
npm install                  # já roda `prisma generate` sozinho
npm run prisma:migrate -- --name init   # cria as tabelas (e a pasta prisma/migrations)
npm run prisma:seed          # dados de exemplo (opcional)
npm run dev

# 3) Frontend (outro terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Atalho na raiz: `npm run setup` instala as duas pastas; `npm run dev:backend` e `npm run dev:frontend` sobem cada uma.

**Contas do seed** (senha `Senha123`): `ouvinte@noiz.app` (ouvinte) e `artista@noiz.app` (artista, já com 2 álbuns e 5 músicas de demonstração que tocam de verdade).

### Uploads (Supabase) — opcional em dev

Sem Supabase tudo funciona (login, busca, playlists, player com as músicas do seed). Só o **upload de arquivos** responde "armazenamento não configurado". Para ativar:

1. Crie um projeto em [supabase.com](https://supabase.com) → *Project Settings → API*.
2. Preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` em `backend/.env` (use a chave **service_role**, e nunca no frontend).
3. Pronto: os buckets `tracks` e `images` são criados automaticamente (públicos) na inicialização.

### E-mail de recuperação de senha — opcional em dev

Sem `EMAIL_API_KEY`, o link de redefinição aparece no **terminal do backend** (copie e cole no navegador). Para enviar de verdade, crie uma chave em [resend.com](https://resend.com).

## Variáveis de ambiente

**`backend/.env`** (veja `backend/.env.example`, com comentários)

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Connection string do PostgreSQL (Neon: terminar com `?sslmode=require`) |
| `CLIENT_URL` | ✅ | URL do frontend (libera o CORS e monta o link do e-mail) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | ✅ | Segredos longos e diferentes entre si |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | | Padrão `15m` / `7d` |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | | Ativa uploads |
| `EMAIL_API_KEY` / `EMAIL_FROM` | | Ativa envio real de e-mail (Resend) |

**`frontend/.env`**: `VITE_API_URL` (endereço da API visto pelo navegador).

## Scripts

Na raiz: `setup`, `dev:backend`, `dev:frontend`, `lint`, `typecheck`, `test`, `build`, `format`, `db:migrate`, `db:seed`.
Cada pasta também tem os seus (`npm run <script>` dentro de `backend/` ou `frontend/`).

## Arquitetura

```
noiz/
├── backend/            API REST
│   ├── prisma/         schema.prisma, seed.ts (e migrations/ depois do `migrate`)
│   ├── src/
│   │   ├── config/         env (validado com Zod), prisma, supabase, swagger
│   │   ├── dtos/           schemas Zod = contrato de entrada de cada rota
│   │   ├── models/         representações públicas (ex.: usuário sem hash de senha)
│   │   ├── repositories/   ÚNICA camada que fala com o Prisma
│   │   ├── services/       regras de negócio
│   │   ├── controllers/    traduz HTTP ⇄ service (sem regra de negócio)
│   │   ├── routes/         endpoints
│   │   ├── middlewares/    auth/roles, validação, upload, rate limit, erros
│   │   └── utils/          jwt, hash, storage, mailer, AppError
│   └── test/           testes unitários dos services (Vitest)
├── frontend/
│   └── src/
│       ├── pages/ layouts/ components/   telas, esqueleto e peças reutilizáveis
│       ├── hooks/        useAuth, useFavorites, usePlaylists, useDebounce, useTheme
│       ├── store/        Zustand: auth (persistido) e player
│       ├── contexts/     Context API só para o tema
│       ├── services/     chamadas HTTP (api.ts + um service por domínio)
│       └── types/ utils/ lib/ assets/
└── docker-compose.yml
```

Fluxo de uma requisição: `route → middleware → controller → service → repository → Prisma`.

**Como o player funciona:** o estado (fila, faixa atual, progresso, volume…) vive no store Zustand; o componente `AudioEngine` mantém um único `<audio>` escondido sincronizado com o store (faixa, play/pause, volume, seek) e devolve progresso/duração/fim da faixa. A `PlayerBar` só desenha botões. Depois de 15s de reprodução a faixa conta como ouvida (histórico + contador de plays).

## Banco de dados

```
User 1─1 Artist 1─N Album 1─N Track
User 1─N Playlist 1─N PlaylistTrack N─1 Track   (PlaylistTrack guarda a posição)
User 1─N Favorite N─1 Track
User 1─N PlayHistory N─1 Track
User 1─N RefreshToken
```

Schema comentado em [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma).

## API

Documentação interativa (38 operações) em **`/docs`**. Para testar rotas protegidas, faça login em `/auth/login`, copie o `accessToken` e use **Authorize**.

| Grupo | Rotas principais |
| --- | --- |
| Auth | `POST /auth/register · login · refresh · logout · forgot-password · reset-password` |
| Usuário | `GET/PATCH /users/me` · `POST /users/me/avatar` |
| Artistas | `POST /artists` · `GET /artists/me` · `GET /artists/:id` · `POST /artists/me/avatar · cover` |
| Álbuns | `GET /albums/recent · /albums/:id` · `POST /albums` · `DELETE /albums/:id` |
| Músicas | `GET /tracks/trending · search · :id` · `POST /tracks` (upload) · `PATCH/DELETE /tracks/:id` |
| Playlists | `GET/POST /playlists` · `GET/PATCH/DELETE /playlists/:id` · `POST /playlists/:id/cover · tracks` |
| Curtidas / Histórico / Busca | `GET /favorites` · `POST /favorites/:trackId/toggle` · `GET/POST /history` · `GET /search?q=` |

## Segurança

- Senhas com **bcrypt** (12 rounds); mensagens de login/recuperação idênticas para e-mail existente e inexistente (evita enumeração de contas)
- **JWT** de acesso (15 min) + **refresh token com rotação**, guardado só como hash (SHA-256) no banco; a role é relida do banco a cada refresh
- Troca de senha **revoga todas as sessões**; token de reset guardado como hash, expira em 30 min
- Validação de todas as entradas com **Zod**; Prisma parametriza as queries (sem SQL injection)
- Upload com validação de tipo (MIME) e tamanho; arquivos órfãos são removidos do storage
- `helmet`, CORS restrito ao frontend, rate limit geral + limite mais rígido em login/cadastro/recuperação
- Autorização por posse: só a dona edita a playlist; só o artista dono edita/exclui suas músicas e álbuns; playlist privada devolve 404 para os demais
- Variáveis de ambiente validadas na inicialização (falha rápida)

## Testes e CI

```bash
npm test            # na raiz: backend (15 testes) + frontend (17 testes)
npm run typecheck   # tipos nas duas pastas
npm run lint
```

O workflow `.github/workflows/ci.yml` roda lint, tipos, testes e build do backend e do frontend a cada push/PR na `main`.

## Deploy

1. **Banco — Neon:** crie o projeto e copie a connection string (`?sslmode=require`).
2. **Migration:** rode uma vez localmente `npm run prisma:migrate -- --name init` e **faça commit da pasta `backend/prisma/migrations`**. Em produção as tabelas são aplicadas com `prisma migrate deploy`.
3. **API — Railway/Render:** pasta raiz `backend`. Build: `npm ci && npm run build`. Start: `npx prisma migrate deploy && node dist/server.js`. Configure as variáveis do `.env.example` (`CLIENT_URL` = URL da Vercel). Com o `Dockerfile` também funciona direto.
4. **Frontend — Vercel:** pasta raiz `frontend`, variável `VITE_API_URL=https://sua-api/api/v1`. O `vercel.json` já cuida do roteamento de SPA.

## Problemas comuns

- **VS Code mostra centenas de erros "Cannot find module"** → falta instalar: `npm run setup` na raiz e depois *TypeScript: Restart TS Server* (Ctrl+Shift+P). Abra a **pasta raiz** do projeto e aceite as extensões recomendadas.
- **Erro sobre `@prisma/client` / `PrismaClient` sem modelos** → `cd backend && npx prisma generate`.
- **"Armazenamento de arquivos não configurado" (503)** → configure o Supabase (acima).
- **A API não sobe com "Variáveis de ambiente inválidas"** → confira `backend/.env` (a mensagem diz qual variável).
- **Música não toca** → o `fileUrl` precisa ser um áudio público acessível pelo navegador (as do seed vêm do domínio soundhelix.com).

## Roadmap

- [x] Arquitetura em camadas, modelagem, autenticação com refresh token
- [x] Upload de músicas, capas e avatares
- [x] Player real conectado ao `<audio>`
- [x] Playlists, curtidas, histórico, busca, perfil e Estúdio do artista
- [x] Testes unitários, CI, Docker e documentação OpenAPI
- [ ] Testes de integração da API (banco de teste) e E2E (Playwright)
- [ ] Reordenar músicas da playlist (drag & drop) e fila visível
- [ ] Seguir artistas e notificações de lançamentos
- [ ] Painel de métricas para artistas
- [ ] Letras sincronizadas e i18n

## Autor

<!-- PERSONALIZE: seu nome, LinkedIn e GitHub -->
