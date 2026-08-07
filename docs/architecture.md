# Documento Técnico de Arquitetura — Síndico IA

**Entrega:** Validação de infraestrutura (Entrega 1)
**Aplicação publicada:** http://34.193.8.15:3000
**Diagrama visual:** ver `docs/architecture-diagram.md` (link do artifact) ou anexo em PDF

## 1. Visão geral

Síndico IA é uma aplicação web de gestão condominial com três perfis de acesso (síndico/admin,
morador, equipe de limpeza), cobrindo financeiro, reservas de áreas comuns, ocorrências, portaria,
avisos e assembleias. A solução é composta por três serviços containerizados — frontend, backend e
banco de dados — publicados em uma única instância AWS EC2, com deploy automatizado via GitHub
Actions.

## 2. Serviços cloud utilizados

| Serviço | Função |
|---|---|
| **Amazon EC2** | Hospeda os três containers da aplicação via Docker Compose |
| **Amazon ECR** | Registro privado das imagens Docker (backend e frontend) |
| **IAM** | Controle de acesso: usuário dedicado para o CI/CD publicar no ECR, role própria da instância para puxar imagens |
| **Security Groups** | Firewall da instância — só portas 22 (SSH) e 3000 (HTTP) ficam abertas para a internet |
| **GitHub Actions** | Orquestra o pipeline de build e deploy (não é um serviço AWS, mas é parte central da arquitetura de entrega) |

Não são utilizados serviços gerenciados de banco de dados (RDS), balanceador de carga (ELB/ALB) ou
CDN nesta etapa — ver seção de limitações.

## 3. Componentes da aplicação

- **Frontend** — Next.js 15 (App Router), Tailwind, TypeScript. Serve a interface e atua como proxy
  para a API (`/api/*` é encaminhado internamente para o backend), então o navegador do usuário só
  precisa falar com uma porta.
- **Backend** — NestJS + Prisma ORM, autenticação via JWT, autorização por papel (admin/morador/
  limpeza) em nível de rota. Exposto apenas dentro da rede Docker interna.
- **Banco de dados** — PostgreSQL 16, um container com volume Docker nomeado para persistência.

## 4. Banco de dados

PostgreSQL roda em container próprio, na mesma instância EC2, acessível apenas pela rede Docker
interna (porta 5432 não é exposta publicamente). Migrations são gerenciadas pelo Prisma e aplicadas
automaticamente na inicialização do container do backend (`prisma migrate deploy`). Os dados
persistem em um volume Docker nomeado, sobrevivendo a reinicializações e atualizações de imagem.

## 5. Balanceador de carga

**Não há balanceador de carga nesta etapa.** A aplicação roda em uma única instância EC2, atendida
diretamente pelo IP público. Essa é uma decisão deliberada para o estágio atual do projeto (ver
justificativa na seção 7) — não uma omissão.

## 6. Containers

Três containers Docker, orquestrados por Docker Compose, compartilhando uma rede bridge isolada
(`sindico`):

| Container | Imagem base | Porta interna | Exposta publicamente? |
|---|---|---|---|
| `front` | node:22-alpine (build Next.js) | 3000 | Sim |
| `back` | node:22-alpine (build NestJS) | 3002 | Não — só via rede Docker |
| `postgres` | postgres:16-alpine | 5432 | Não — só via rede Docker |

## 7. Fluxo de comunicação entre componentes

**Requisição de um usuário (tempo real):**
```
Navegador → EC2:3000 (front)
          → front encaminha /api/* internamente para http://back:3002
          → back consulta o Postgres via Prisma em postgres:5432
          → resposta volta pelo mesmo caminho
```
O navegador nunca fala diretamente com o backend ou com o banco — só com a porta 3000. Isso
significa que as portas 3002 e 5432 podem ficar completamente fechadas no Security Group sem
prejudicar o funcionamento da aplicação, reduzindo a superfície de ataque.

**Pipeline de build e deploy:**
```
git push (sindico-ia-back ou sindico-ia-front, branch main)
  → GitHub Actions builda a imagem Docker
  → publica no Amazon ECR
  → conecta via SSH na EC2
  → docker compose pull && docker compose up -d
```
Os dois repositórios (frontend e backend, separados) têm workflows independentes — um push no
front não rebuilda o back, e vice-versa.

## 8. Justificativa técnica das escolhas

**AWS EC2 + Docker Compose, em vez de ECS/Fargate/Kubernetes:** a mesma configuração de containers
usada em desenvolvimento local roda em produção sem adaptação — não foi necessário reescrever nada
para um formato de orquestração diferente. Para o volume de uma demonstração acadêmica, uma
instância única é suficiente e evita a complexidade operacional (e o custo) de um orquestrador de
containers completo.

**Repositórios separados (frontend/backend):** permite pipelines de deploy independentes — uma
mudança só de UI não precisa rebuildar o backend, e vice-versa — e reflete melhor a separação real
de responsabilidades entre os dois serviços.

**IAM com papéis distintos:** o usuário do GitHub Actions só tem permissão de publicar imagens no
ECR; a instância EC2 usa uma role própria (`ec2-ecr-read`) apenas para baixar imagens. Nenhum dos
dois tem permissões amplas sobre a conta AWS, e nenhuma chave de acesso de longo prazo fica
armazenada na instância.

**GitHub Actions para CI/CD:** integrado nativamente aos repositórios já usados pelo grupo, sem
necessidade de uma ferramenta de CI externa. *(Observação: a avaliação da pipeline de CI/CD fica
para a entrega final — está descrita aqui porque já faz parte da arquitetura de deploy atual.)*

## 9. Benefícios da arquitetura adotada

- Deploy automatizado — nenhuma etapa manual na instância depois do `git push`.
- Ambiente de produção idêntico ao de desenvolvimento local (mesmo `docker-compose.yml`), reduzindo
  divergência entre "funciona no meu computador" e "funciona em produção".
- Superfície de ataque reduzida: só as portas realmente necessárias (22 e 3000) ficam acessíveis
  pela internet.
- Baixa curva de aprendizado para o grupo: qualquer integrante consegue inspecionar o estado da
  aplicação via SSH + comandos Docker padrão.

## 10. Limitações da solução

- **Ponto único de falha** — uma única instância EC2, sem réplica; se ela cair, a aplicação inteira
  fica indisponível até reinicialização manual ou automática.
- **Banco de dados no mesmo host** — PostgreSQL roda em container na própria EC2, não em um serviço
  gerenciado (RDS). Não há backup automático, snapshot gerenciado ou failover.
- **Sem HTTPS** — o acesso hoje é via `http://` direto no IP público, sem domínio nem certificado
  TLS. Credenciais e tokens trafegam sem criptografia entre navegador e servidor.
- **Sem auto-scaling** — a capacidade é fixa, definida pelo tipo da instância escolhida.
- **Sem CDN/cache de borda** — todo o tráfego estático também passa pela mesma instância.

## 11. Aspectos de segurança

- **Rede:** Security Group restringe entrada a apenas SSH (22) e HTTP (3000); backend e banco não
  são alcançáveis diretamente da internet.
- **Autenticação:** JWT com segredo forte e obrigatório (a aplicação recusa subir sem um
  `JWT_SECRET` configurado — não há valor padrão inseguro).
- **Autorização:** verificação de papel (admin/morador/limpeza) em cada rota da API, testada nos
  três perfis.
- **Rate limiting:** limite de tentativas de login para mitigar força bruta.
- **Containers:** processos rodando como usuário não-root dentro dos containers.
- **IAM:** acesso por papel, sem chaves de longo prazo na instância (ver seção 8).
- Auditoria de segurança completa, com achados corrigidos e testados, documentada em
  `docs/security-audit-report.md`.

## 12. Possíveis melhorias futuras

- Domínio próprio + certificado TLS (AWS Certificate Manager) para servir a aplicação via HTTPS.
- Migrar o PostgreSQL para RDS, com backup automático e snapshots gerenciados.
- Mover segredos (senha do banco, JWT secret) de variáveis de ambiente em texto puro para AWS
  Secrets Manager.
- Adicionar um Application Load Balancer, mesmo que inicialmente na frente de uma única instância,
  como base para escalar horizontalmente depois.
- Monitoramento com CloudWatch (métricas de CPU/memória/disco, alarmes).
- Backup automatizado do volume do Postgres via cron job ou snapshot agendado.

## 13. Referências

- Diagrama visual da arquitetura: artifact publicado (ver link na entrega)
- Guia de deploy: `docs/aws-ec2-deploy.md`
- Auditoria de segurança completa: `docs/security-audit-report.md`
- Guia de containers (uso local): `docs/deploy-containers.md`
