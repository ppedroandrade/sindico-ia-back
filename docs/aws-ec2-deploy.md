# Deploy em produção — AWS EC2 + Docker Compose

> **Documento histórico:** este guia descreve a antiga estrutura monorepo.
> O frontend agora está em
> [`sindico-ia-front`](https://github.com/ppedroandrade/sindico-ia-front) e deve
> ser implantado separadamente.

Guia passo a passo para publicar a aplicação (front + back + Postgres) em uma única instância EC2,
reaproveitando o `docker-compose.yml` já existente no repositório.

## 1. Criar a instância EC2

No Console AWS → **EC2 → Launch instance**:

- **Name**: `sindico-ia-prod`
- **AMI**: Ubuntu Server 22.04 LTS (64-bit x86)
- **Instance type**:
  - `t3.small` (2 GB RAM) — recomendado. Builda as duas imagens (Next.js + NestJS) sem sufoco. Custo aproximado: US$ 0,02/h (~US$ 15/mês se ficar ligada o mês todo; para uma demonstração de poucas horas, custa centavos).
  - Se preferir ficar dentro do **free tier** (`t2.micro`/`t3.micro`, 1 GB RAM), é necessário criar um swap file antes do build (passo 3b), senão o build do Next.js pode falhar por falta de memória.
- **Key pair**: crie uma nova (`.pem`) ou reuse uma existente — necessária para SSH.
- **Network settings → Security group**: crie um novo com estas regras de entrada (*inbound*):
  | Tipo | Porta | Origem |
  |---|---|---|
  | SSH | 22 | Seu IP (`My IP`) — não deixe `0.0.0.0/0` aqui |
  | HTTP | 80 | `0.0.0.0/0` (avaliadores precisam acessar de qualquer lugar) |
- **Storage**: 16 GB gp3 é suficiente (o padrão de 8 GB também funciona, mas 16 GB dá folga para as imagens Docker).

Clique em **Launch instance**.

### Elastic IP (recomendado)

Por padrão, o IP público da EC2 muda se a instância for reiniciada. Para ter uma URL estável para
entregar (e para o diagrama de arquitetura):

**EC2 → Elastic IPs → Allocate Elastic IP address** → depois **Associate** com a instância criada.

## 2. Conectar via SSH

```bash
chmod 400 caminho/para/sua-chave.pem
ssh -i caminho/para/sua-chave.pem ubuntu@SEU_IP_PUBLICO
```

## 3. Instalar Docker e Docker Compose

```bash
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# rodar docker sem sudo
sudo usermod -aG docker $USER
newgrp docker
```

Confirme:
```bash
docker --version
docker compose version
```

### 3b. (Só se usar t2.micro/t3.micro) Criar swap de 2 GB

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 4. Clonar o repositório

```bash
sudo apt-get install -y git
git clone https://github.com/ppedroandrade/v0-sindico-de-ia-dashboard.git sindico-ia
cd sindico-ia
```

## 5. Configurar variáveis de ambiente de produção

```bash
cp .env.docker.example .env
nano .env
```

Gere segredos fortes na sua própria máquina (não use os valores de exemplo em produção):

```bash
openssl rand -base64 32   # use a saída como JWT_SECRET
openssl rand -hex 24      # use a saída como POSTGRES_PASSWORD
```

> Use `-hex` (não `-base64`) para o `POSTGRES_PASSWORD`: o base64 pode gerar caracteres como `/`, `+`
> ou `=`, que quebram a `DATABASE_URL` (ela é montada como
> `postgresql://usuario:senha@host:porta/banco`, e esses caracteres têm significado especial numa
> URL). Isso já aconteceu durante os testes deste guia — o backend falhava com
> `P1013: invalid port number in database URL` até a senha ser trocada para uma gerada com `-hex`.

Ajuste o `.env` assim (troque `SEU_IP_OU_DOMINIO` pelo IP público/Elastic IP da instância):

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<cole aqui o valor gerado>
POSTGRES_DB=sindico
POSTGRES_PORT=5432

JWT_SECRET=<cole aqui o valor gerado>
JWT_EXPIRES_IN=1d

CORS_ORIGIN=http://SEU_IP_OU_DOMINIO
BACK_PORT=3002
FRONT_PORT=80
NEXT_PUBLIC_API_URL=/api
BACKEND_URL=http://back:3002
```

> `FRONT_PORT=80` faz a aplicação responder em `http://SEU_IP` direto, sem precisar digitar `:3000` na
> URL — mais limpo para os avaliadores acessarem e para o print/vídeo de evidência.
>
> As contas de demonstração (`admin@sindico.com`, `morador@sindico.com`, `limpeza@sindico.com`, todas
> com senha `Senha@123`) continuam as mesmas — são o que os avaliadores vão usar para testar os 3
> perfis. O que precisa ser único e forte em produção é `JWT_SECRET` e `POSTGRES_PASSWORD` (segredos de
> infraestrutura), não as senhas de demonstração da aplicação.

## 6. Subir a stack

```bash
docker compose up -d --build
```

A primeira vez demora alguns minutos (build das duas imagens). Acompanhe com:

```bash
docker compose logs -f
```

Espere `back` ficar `healthy` (ele roda `prisma migrate deploy` automaticamente ao iniciar):

```bash
docker compose ps
```

## 7. Popular o banco com os dados de demonstração

```bash
docker compose exec back npx prisma db seed
```

## 8. Testar

```bash
curl -I http://localhost           # deve responder 200 (frontend)
curl -s http://localhost:3002      # deve responder "Server On" (dentro da própria instância)
```

Do seu navegador, acesse `http://SEU_IP_PUBLICO` (ou o Elastic IP) e faça login com as contas de teste.

## 9. Depois da apresentação

Para não gerar custo contínuo:
- **Parar a instância** (Console EC2 → Instance state → Stop) se quiser manter os dados e religar depois — note que o IP público muda ao parar/iniciar, a menos que você tenha associado um Elastic IP.
- **Terminar a instância** se não precisar mais dela (a entrega final do curso pode exigir o ambiente rodando de novo — confirme antes de encerrar definitivamente).

## Comandos úteis de manutenção

```bash
docker compose ps                 # status dos containers
docker compose logs -f back       # logs do backend
docker compose logs -f front      # logs do frontend
docker compose down               # parar tudo (mantém os dados do Postgres, que ficam em volume)
docker compose up -d --build      # atualizar após um git pull
```

Para atualizar a aplicação depois de um novo commit:

```bash
cd ~/sindico-ia
git pull
docker compose up -d --build
```
