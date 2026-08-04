# Síndico de IA

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-UNLICENSED-lightgrey)

Dashboard de gestão de condomínios com painéis para síndico, moradores e equipe de limpeza.

## Sumário

- [Arquitetura](#arquitetura)
- [Stack](#stack)
- [Módulos](#módulos)
- [Screenshots](#screenshots)
- [Rodar com Docker](#rodar-com-docker-recomendado)
- [Rodar em desenvolvimento](#rodar-em-desenvolvimento-sem-docker)
- [Deploy na AWS (EC2)](#deploy-na-aws-ec2)
- [Estrutura](#estrutura)
- [Documentação adicional](#documentação-adicional)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## Arquitetura

Três camadas rodando em containers isolados, orquestradas pelo `docker-compose.yml`:

```
┌────────────┐      HTTP/REST + SSE       ┌────────────┐      TCP 5432       ┌──────────────┐
│  Browser   │ ─────────────────────────▶ │  Front     │ ─────────────────▶  │              │
│ (usuário)  │                            │ (Next.js)  │                     │              │
└────────────┘                            │  :3000     │                     │              │
      │                                   └──────┬─────┘                     │              │
      │  chamadas /api/*                         │ proxy interno              │  PostgreSQL │
      │  (proxy Next → back)                    ▼ BACKEND_URL                 │    :5432     │
      │                                  ┌────────────┐                       │              │
      └────────────────────────────────▶ │   Back     │ ────────────────────▶ │              │
                                         │ (NestJS)   │        Prisma         │              │
                                         │  :3002     │                       │              │
                                         └────────────┘                       └──────────────┘
                                            │
                                            │ JWT (Bearer) + Guards por Role
                                            │ Helmet + Throttler + CORS whitelist
                                            ▼
                                    Roles: admin | morador | limpeza
```

**Fluxo de request**

1. O navegador chama `http://SEU_HOST/api/...` — o Next.js recebe e faz proxy para o backend usando `BACKEND_URL` (interno na rede Docker).
2. O backend valida o JWT (`JwtStrategy`), aplica `RolesGuard` conforme o `@Roles(...)` do controller e o `ThrottlerGuard` (100 req/60s).
3. Consultas ao banco passam pelo `PrismaService` (`Back/src/prisma.service.ts`) e usam `DATABASE_URL`/`DIRECT_URL`.
4. Notificações em tempo real são entregues via **SSE** (`/notifications/stream`) — conexão HTTP persistente aberta pelo Front após login.

**Autenticação e autorização**

- Login em `POST /auth/login` devolve JWT assinado com `JWT_SECRET` (validade `JWT_EXPIRES_IN`, default `1d`).
- O Front guarda o token e envia como `Authorization: Bearer …` em todas as chamadas subsequentes.
- Cada endpoint declara os papéis permitidos via `@Roles('admin')`, `@Roles('morador')` etc.

**Persistência**

- Migrações versionadas em `Back/prisma/migrations/` — aplicadas automaticamente em produção via `prisma migrate deploy` no startup do container `back`.
- Seed opcional em `Back/prisma/seed.ts` cria as contas de demonstração.
- Volume Docker `postgres_data` preserva os dados entre `docker compose down` / `up`.

**Segurança embutida**

- `helmet()` para headers de segurança.
- CORS com whitelist configurável via `CORS_ORIGIN`.
- `ValidationPipe` global com `whitelist: true` e `forbidNonWhitelisted: true` — DTOs recusam campos não declarados (protege contra *mass assignment*).
- Rate limiting global via `@nestjs/throttler` (100 req/60s por IP).
- Containers rodam como usuário não-root nos `Dockerfile`s.

## Stack

### Frontend (`Front/`)

| Categoria         | Escolha                                       | Por quê |
|-------------------|-----------------------------------------------|---------|
| Framework         | **Next.js 15** (App Router)                   | SSR + rotas por pasta em `Front/app/`, proxy `/api` para o back |
| UI runtime        | **React 19**                                  | Última major, hooks estáveis |
| Estilo            | **Tailwind CSS 4**                            | Utility-first, sem CSS custom fragmentado |
| Componentes       | **Radix UI** (dialog, dropdown, popover…)     | Primitivas acessíveis por padrão (ARIA, foco) |
| Ícones            | **lucide-react**                              | Icon set consistente |
| Formulários       | **react-hook-form** + **Zod**                 | Validação declarativa compartilhável |
| Datas             | **date-fns** + **react-day-picker**           | Manipulação e picker leves |
| Notificações UI   | **sonner**                                    | Toasts |
| Charts            | **recharts**                                  | Gráficos do dashboard |
| Analytics         | **@vercel/analytics**                         | Métricas de uso |
| Fontes            | **Manrope + Inter** via `next/font`           | Carregamento otimizado, sem FOIT |

### Backend (`Back/`)

| Categoria         | Escolha                                       | Por quê |
|-------------------|-----------------------------------------------|---------|
| Framework         | **NestJS 11** (Express)                       | DI + módulos, decoradores, testes fáceis |
| Linguagem         | **TypeScript 5**                              | Tipagem estática ponta a ponta |
| ORM               | **Prisma 6** + `@prisma/client`               | Migrações versionadas, tipos gerados do schema |
| Banco             | **PostgreSQL 16**                             | Relacional, com FKs e constraints usadas ativamente |
| Autenticação      | **@nestjs/jwt** + **@nestjs/passport** (JWT)  | JWT stateless, roles via `@Roles(...)` decorator |
| Hash de senhas    | **bcrypt**                                    | Padrão de indústria |
| Validação         | **class-validator** + **class-transformer**   | DTOs decorados, `ValidationPipe` global |
| Segurança HTTP    | **helmet**                                    | Headers de segurança |
| Rate limiting     | **@nestjs/throttler**                         | 100 req/60s por IP |
| Realtime          | **SSE nativo** (Nest `sse`)                   | Notificações unidirecionais — mais simples que WebSocket |
| Testes            | **Jest** + **Supertest**                      | Unit e e2e |

### Infra

| Categoria         | Escolha                                       | Por quê |
|-------------------|-----------------------------------------------|---------|
| Orquestração      | **Docker Compose**                            | 3 serviços (`postgres`, `back`, `front`) em uma rede |
| Deploy alvo       | **AWS EC2** (Ubuntu 22.04)                    | Instância única roda o stack completo — ver `docs/aws-ec2-deploy.md` |
| Alternativas      | **Vercel** (Front) + **Railway** (Back)       | Config em `Front/vercel.json` e `Back/railway.json` |

## Módulos

Módulos NestJS em `Back/src/` e rotas Next.js em `Front/app/`:

| Módulo (Back)       | Rota (Front)              | Responsabilidade                                         |
|---------------------|---------------------------|----------------------------------------------------------|
| `auth`              | `/login`                  | Login, JWT, guards de role                               |
| `users`             | `/usuarios`, `/conta`     | CRUD de moradores/admins/limpeza                         |
| `common-areas`      | `/areas-comuns`           | Cadastro e regras das áreas comuns                       |
| `reservations`      | `/reservas`               | Reservas com status + workflow de limpeza                |
| `announcements`     | `/avisos`                 | Comunicados (info, warning, urgent, event)               |
| `occurrences`       | `/ocorrencias`            | Chamados dos moradores (prioridade + status)             |
| `operations`        | `/portaria`, `/limpeza`   | Acessos, encomendas, escalas de limpeza                  |
| `payments`          | `/financeiro`             | Cobranças e pagamentos por unidade                       |
| `dashboard`         | `/` (home)                | KPIs e agregações                                        |
| `notifications`     | (global)                  | Push via SSE, notificações persistidas                   |
| `ai`                | `/chatbot`                | Endpoints de IA (chatbot do síndico)                     |
| —                   | `/assembleias`, `/estrutura`, `/manutencao`, `/relatorios`, `/auditoria`, `/configuracoes` | Telas complementares |

Papéis (enum `Role` no Prisma): `admin`, `morador`, `limpeza`.

## Screenshots

Coloque as imagens em `docs/screenshots/` e elas aparecerão aqui.

| Login | Dashboard |
|-------|-----------|
| ![Login](docs/screenshots/login.png) | ![Dashboard](docs/screenshots/dashboard.png) |

| Reservas | Ocorrências |
|----------|-------------|
| ![Reservas](docs/screenshots/reservas.png) | ![Ocorrências](docs/screenshots/ocorrencias.png) |

## Rodar com Docker (recomendado)

```bash
cp .env.docker.example .env
# preencha POSTGRES_PASSWORD e JWT_SECRET:
#   openssl rand -base64 24  -> POSTGRES_PASSWORD
#   openssl rand -base64 32  -> JWT_SECRET

docker compose up --build
```

- Front: http://localhost:3000
- Back:  http://localhost:3002
- Postgres: localhost:5432

## Rodar em desenvolvimento (sem Docker)

Precisa de um Postgres rodando e um `.env` em `Back/` com `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`.

```bash
# Backend
cd Back
npm install
npx prisma migrate deploy
npm run start:dev        # http://localhost:3002

# Frontend (em outro terminal)
cd Front
npm install
npm run dev              # http://localhost:3000
```

Configure `BACKEND_URL=http://localhost:3002` no ambiente do Front.

## Deploy na AWS (EC2)

Passo a passo resumido para publicar tudo em uma única instância EC2 usando o `docker-compose.yml`. O guia completo (com dicas de swap para instâncias free tier, Elastic IP e troubleshooting) está em [`docs/aws-ec2-deploy.md`](docs/aws-ec2-deploy.md).

### 1. Criar a instância EC2

Console AWS → **EC2 → Launch instance**:

- **AMI**: Ubuntu Server 22.04 LTS (x86_64)
- **Instance type**: `t3.small` recomendado (2 GB RAM). Para `t2.micro`/`t3.micro` (free tier), crie 2 GB de swap antes do build.
- **Key pair**: crie/reuse uma `.pem` (necessária para SSH).
- **Security group** — inbound:
  | Tipo | Porta | Origem |
  |------|-------|--------|
  | SSH  | 22    | Seu IP (`My IP`) |
  | HTTP | 80    | `0.0.0.0/0` |
- **Storage**: 16 GB gp3.
- **Elastic IP** (opcional, recomendado): aloque em EC2 → Elastic IPs e associe à instância para ter IP fixo.

### 2. Conectar via SSH

```bash
chmod 400 sua-chave.pem
ssh -i sua-chave.pem ubuntu@SEU_IP_PUBLICO
```

### 3. Instalar Docker + Compose

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
docker compose version
```

*(Swap opcional para free tier)*

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 4. Clonar e configurar

```bash
sudo apt-get install -y git
git clone https://github.com/ppedroandrade/v0-sindico-de-ia-dashboard.git sindico-ia
cd sindico-ia
cp .env.docker.example .env
nano .env
```

Gere segredos:

```bash
openssl rand -base64 32   # JWT_SECRET
openssl rand -hex 24      # POSTGRES_PASSWORD  (use -hex, não -base64: evita '/', '+', '=' que quebram a DATABASE_URL)
```

No `.env`, ajuste também:

```env
CORS_ORIGIN=http://SEU_IP_OU_DOMINIO
FRONT_PORT=80
```

`FRONT_PORT=80` faz a aplicação responder direto em `http://SEU_IP`, sem `:3000`.

### 5. Subir a stack

```bash
docker compose up -d --build
docker compose ps           # esperar back ficar "healthy"
docker compose logs -f back
```

O backend roda `prisma migrate deploy` automaticamente ao iniciar.

### 6. Popular dados de demonstração

```bash
docker compose exec back npx prisma db seed
```

Contas de teste (senha `Senha@123`): `admin@sindico.com`, `morador@sindico.com`, `limpeza@sindico.com`.

### 7. Testar

Abra `http://SEU_IP_PUBLICO` no navegador e faça login.

### Atualizar após novos commits

```bash
cd ~/sindico-ia
git pull
docker compose up -d --build
```

### Parar sem perder dados

```bash
docker compose down          # dados do Postgres ficam no volume
```

Para parar de gerar custo: **EC2 → Instance state → Stop** (mantém dados; IP público muda se não houver Elastic IP) ou **Terminate** (apaga tudo).

## Estrutura

```
Back/     API NestJS + Prisma (schema em Back/prisma/schema.prisma)
Front/    App Next.js (rotas em Front/app/, ex.: reservas, avisos, ocorrencias)
docs/     Deploy AWS EC2, containers, auditoria de segurança
```

## Documentação adicional

- `docs/deploy-containers.md` — deploy com containers
- `docs/aws-ec2-deploy.md` — deploy em AWS EC2
- `docs/security-audit-report.md` — auditoria de segurança

## Contribuindo

1. Faça um fork do repositório e crie uma branch a partir de `main`:
   ```bash
   git checkout -b feat/minha-mudanca
   ```
2. Instale as dependências (`Back/` e `Front/`) e rode `npm run lint` antes de commitar.
3. Escreva commits no formato [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`…).
4. Abra um Pull Request descrevendo:
   - o que muda e por quê,
   - como testar,
   - screenshots quando houver mudança de UI.
5. Reporte bugs e ideias abrindo uma [issue](../../issues).

## Licença

`UNLICENSED` — uso interno. Entre em contato com os mantenedores antes de redistribuir.
