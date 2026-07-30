# Deploy com Containers

Este projeto possui uma stack com tres containers:

- `front`: Next.js na porta `3000`
- `back`: NestJS na porta `3002`
- `postgres`: PostgreSQL na porta `5432`

## Rodar localmente

Na raiz do projeto:

```bash
cp .env.docker.example .env
docker compose up --build
```

Acesse:

- Frontend: `http://localhost:3000`
- Backend healthcheck: `http://localhost:3002`
- PostgreSQL: `localhost:5432`

Se alguma porta estiver ocupada, altere no `.env`:

```env
FRONT_PORT=3100
BACK_PORT=3002
POSTGRES_PORT=55432
CORS_ORIGIN=http://localhost:3100
```

O backend executa `prisma migrate deploy` ao iniciar o container.

## Criar usuario inicial

Depois que os containers estiverem rodando:

```bash
docker compose exec back npx prisma db seed
```

O seed atual limpa a base e recria dados completos de demonstracao, incluindo usuarios, unidades, areas comuns, reservas, pagamentos, avisos, ocorrencias, portaria, documentos, manutencoes e assembleia.

Usuarios principais:

- Admin: `admin@sindico.com`
- Morador: `morador@sindico.com`
- Limpeza: `limpeza@sindico.com`
- Senha de todos: `Senha@123`

Troque essas senhas antes de apresentar a aplicacao em ambiente publico.

## Variaveis importantes

Para ambiente cloud, ajuste:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `NEXT_PUBLIC_API_URL`
- `BACKEND_URL`

Quando front e back estiverem na mesma rede Docker, use:

```env
NEXT_PUBLIC_API_URL=/api
BACKEND_URL=http://back:3002
```

Nesse modo, o navegador chama `/api` no frontend, e o Next.js encaminha as requisicoes para o backend.

Quando o front e o back forem publicados separadamente, use:

```env
NEXT_PUBLIC_API_URL=https://url-publica-do-backend
CORS_ORIGIN=https://url-publica-do-frontend
```

## Base para AWS

Opcoes simples para a entrega:

- EC2 com Docker Compose: sobe os tres servicos em uma maquina.
- ECS/Fargate: criar uma task para `front` e outra para `back`; usar RDS PostgreSQL em vez do container `postgres`.
- App Runner: publicar `front` e `back` como servicos separados; usar RDS ou Supabase para PostgreSQL.

Para uma apresentacao de faculdade, a opcao mais simples costuma ser EC2 com Docker Compose. Para uma arquitetura mais correta em producao, prefira PostgreSQL gerenciado, como AWS RDS.

## Problemas comuns

### Porta 3000 ocupada

Se aparecer `bind: address already in use`, existe outro processo usando a porta.

Verifique:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Se for um `next dev` antigo do projeto, encerre o processo ou rode em outra porta:

```bash
FRONT_PORT=3100 CORS_ORIGIN=http://localhost:3100 docker compose up --build
```

### Docker tentando usar docker-credential-desktop

Se aparecer `docker-credential-desktop: executable file not found`, o problema esta na configuracao local do Docker CLI.

Solucao temporaria sem alterar a configuracao global:

```bash
mkdir -p /tmp/sindicoia-docker-config/cli-plugins
ln -sf /Applications/Docker.app/Contents/Resources/cli-plugins/docker-compose /tmp/sindicoia-docker-config/cli-plugins/docker-compose
ln -sf /Applications/Docker.app/Contents/Resources/cli-plugins/docker-buildx /tmp/sindicoia-docker-config/cli-plugins/docker-buildx
printf '{"auths":{}}\n' > /tmp/sindicoia-docker-config/config.json
DOCKER_CONFIG=/tmp/sindicoia-docker-config docker compose up --build
```

## Build manual das imagens

Backend:

```bash
docker build -t sindico-ia-back ./Back
```

Frontend:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=/api \
  --build-arg BACKEND_URL=http://back:3002 \
  -t sindico-ia-front ./Front
```
