# Síndico IA — Backend

API do Síndico IA para gestão de condomínios, construída com NestJS 11,
Prisma 6 e PostgreSQL 16.

O frontend é mantido no repositório separado
[`sindico-ia-front`](https://github.com/ppedroandrade/sindico-ia-front).

## Stack

- NestJS 11 e TypeScript
- Prisma ORM e PostgreSQL
- autenticação JWT com autorização por papéis
- validação de DTOs, Helmet, CORS e rate limiting
- notificações em tempo real via SSE
- Jest e Supertest

## Estrutura

```text
Back/
├── prisma/       # schema, migrações e seed
├── src/          # módulos e código da API
├── test/         # testes end-to-end
├── Dockerfile
└── package.json
```

## Desenvolvimento local

Requisitos: Node.js 22, npm e uma instância PostgreSQL.

```bash
cd Back
cp .env.example .env
npm ci
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

A API fica disponível em `http://localhost:3002`.

Configure no arquivo `Back/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_SECRET="gere-um-segredo-forte"
JWT_EXPIRES_IN="1d"
PORT=3002
CORS_ORIGIN="http://localhost:3000"
```

## Docker Compose

O Compose deste repositório inicia somente o backend e o PostgreSQL:

```bash
cp .env.docker.example .env
# preencha POSTGRES_PASSWORD e JWT_SECRET
docker compose up --build
```

Para criar os dados de demonstração:

```bash
docker compose exec back npx prisma db seed
```

O frontend deve ser iniciado ou implantado a partir do repositório próprio.

## Comandos úteis

Execute dentro de `Back/`:

```bash
npm run build
npm run lint
npm test
npm run test:e2e
```

## Módulos principais

- `auth`: login, JWT e autorização por papel
- `users`: usuários e perfis
- `common-areas`: áreas comuns
- `reservations`: reservas e fluxo de limpeza
- `announcements`: comunicados
- `occurrences`: ocorrências
- `operations`: portaria, encomendas e manutenção
- `payments`: cobranças e pagamentos
- `dashboard`: indicadores
- `notifications`: notificações e SSE
- `ai`: endpoints de IA

Documentação complementar está em [`docs/`](docs/).
