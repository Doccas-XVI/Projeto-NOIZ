# 🎧 NOIZ — Plataforma de Streaming de Música

> Seu som, seu corre. Plataforma full stack de streaming de música construída como projeto de portfólio, com arquitetura escalável, boas práticas de Clean Code e identidade visual própria.

## 📋 Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Modelagem do banco de dados](#modelagem-do-banco-de-dados)
- [Como rodar localmente](#como-rodar-localmente)
- [Documentação da API](#documentação-da-api)
- [Deploy](#deploy)
- [Roadmap](#roadmap)

## Sobre o projeto

NOIZ é uma plataforma de streaming de música full stack construída do zero, cobrindo o ciclo completo: cadastro/login com JWT, upload de músicas e capas, player funcional (play/pause, próxima/anterior, volume, aleatório, repetir), playlists, favoritos, histórico de reprodução e busca unificada por música/artista/álbum.

## Tecnologias

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router
- TanStack Query (estado de servidor)
- Zustand (estado global de auth e player)
- React Hook Form + Zod (formulários e validação)

**Backend**
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT (access + refresh token) + bcrypt
- Multer + Supabase Storage (upload de arquivos)
- Zod (validação de payloads)
- Swagger/OpenAPI (documentação)

**Infra**
- Docker + docker-compose (ambiente local)
- GitHub Actions (CI)
- Deploy: Vercel (frontend) · Railway/Render (backend) · Neon (PostgreSQL)

## Arquitetura

O projeto é um monorepo simples com duas aplicações independentes:

```
noiz/
├── backend/    → API REST (Express + Prisma)
├── frontend/   → SPA (React + Vite)
└── docker-compose.yml
```

### Backend — arquitetura em camadas

```
src/
├── config/        # env, database (Prisma), Supabase, Swagger
├── dtos/          # schemas Zod (contrato de entrada de cada rota)
├── repositories/   # única camada que fala com o Prisma
├── services/       # regra de negócio (dono de cada decisão do domínio)
├── controllers/    # tradução HTTP <-> service, sem lógica de negócio
├── routes/         # definição dos endpoints
├── middlewares/     # auth, validação, upload, tratamento de erro
└── utils/          # jwt, hash, storage, AppError, asyncHandler
```

O fluxo de uma requisição sempre segue a mesma direção:
`route → middleware → controller → service → repository → Prisma`

Isso significa que, por exemplo, o `trackService` nunca sabe que existe um `Request`/`Response` do Express — ele só recebe dados já validados e devolve dados. Isso torna cada camada testável isoladamente e faz qualquer novo desenvolvedor (ou você, em 6 meses) entender rapidamente onde uma regra específica mora.

### Frontend — arquitetura por responsabilidade

```
src/
├── pages/         # uma página por rota
├── layouts/       # esqueleto visual compartilhado (MainLayout)
├── components/     # peças reutilizáveis (cards, player, layout)
├── hooks/         # lógica reutilizável (useAuth)
├── contexts/       # Context API — só onde justificado (tema)
├── store/         # Zustand — estado global (auth, player)
├── services/       # chamadas HTTP (api.ts + serviços por domínio)
├── types/         # tipos do domínio (refletem os models do Prisma)
└── styles/        # CSS global + variáveis de tema
```

## Modelagem do banco de dados

```
User 1───N Playlist 1───N PlaylistTrack N───1 Track
User 1───N Favorite N───1 Track
User 1───N PlayHistory N───1 Track
User 1───1 Artist 1───N Album 1───N Track
```

- **User**: conta de acesso (ouvinte, artista ou admin)
- **Artist**: perfil público de artista, opcionalmente vinculado a um `User`
- **Album**: pertence a um artista, tem tipo (álbum/single/EP)
- **Track**: música — pertence a um artista e opcionalmente a um álbum
- **Playlist / PlaylistTrack**: a tabela de junção guarda a **posição** da música na playlist (permite reordenar)
- **Favorite**: músicas curtidas por um usuário (única por par usuário+música)
- **PlayHistory**: um registro por reprodução — permite montar "ouvidas recentemente" sem duplicar a mesma música em sequência



Veja o schema completo comentado em [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma).
