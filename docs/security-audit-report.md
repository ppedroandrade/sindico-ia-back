# Relatório de Segurança — Síndico IA

**Branch:** `security/audit-hardening`
**Escopo:** auditoria de segurança de ponta a ponta (backend NestJS, frontend Next.js, infraestrutura Docker) e correção dos riscos encontrados.

## Resumo

Foram identificados **8 riscos de segurança reais** no sistema, sendo **1 crítico**, **3 altos** e **4 médios/baixos**. Todos os riscos com correção viável dentro do prazo da entrega foram corrigidos nesta branch e validados com testes ponta a ponta (containers reconstruídos, login, permissões e fluxos principais reexecutados). Dois riscos foram documentados como limitação conhecida por exigirem mudanças maiores (upgrade de framework major, troca do modelo de autenticação) — descritos na seção "Limitações e melhorias futuras", que é justamente o tipo de conteúdo que a banca pede na entrega.

## Vulnerabilidades encontradas e corrigidas

### 1. [CRÍTICO] Segredos fracos padrão em ambiente público (JWT_SECRET e senha do banco)
**CWE-798 — Use of Hard-coded Credentials**

O `docker-compose.yml` e o `.env.docker.example` (ambos versionados publicamente no GitHub) definiam valores de fallback caso o operador esquecesse de configurar o `.env`:
```
JWT_SECRET: ${JWT_SECRET:-troque-este-segredo-em-producao}
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-admin}
```
Como o `JWT_SECRET` é a chave usada para **assinar e validar** os tokens de login, qualquer pessoa que lesse o repositório público saberia esse valor. Se a aplicação fosse publicada sem configurar um `.env` próprio — cenário plausível sob pressão de prazo — **qualquer pessoa poderia forjar um token JWT válido como administrador**, sem precisar de senha nenhuma. Confirmamos que esse era exatamente o estado do ambiente local no início desta auditoria (nenhum `.env` existia, os containers rodavam com os valores fracos).

**Correção:** os dois valores agora são obrigatórios (`${VAR:?mensagem de erro}`) — o `docker compose up` falha imediatamente com uma mensagem clara se não forem definidos, em vez de subir silenciosamente inseguro. O `.env.docker.example` foi atualizado para não sugerir valores prontos para uso.

### 2. [ALTO] Mass assignment (over-posting) em portaria e manutenção
**CWE-915 — Improperly Controlled Modification of Dynamically-Determined Object Attributes**

Os endpoints genéricos `POST/PATCH /operations/visitors` e `POST /operations/maintenance` aceitavam qualquer campo do corpo da requisição sem validação de schema (usavam `Record<string, unknown>` em vez de um DTO tipado). Isso permitia que:
- um **morador** criasse (ou editasse) um registro de visitante já com `status: "checked_in"`, se autoaprovando na portaria sem passar pela guarita;
- um **morador ou limpeza** criasse uma ordem de manutenção já como `status: "completed"`, com `estimatedCost` e `vendor` fabricados, contornando o controle administrativo sobre custo e fornecedor.

Confirmado com teste real: um morador conseguiu criar um visitante com `status: "checked_in"` diretamente pela API antes da correção.

**Correção:** adicionada uma lista de campos permitidos por perfil (`restrictToAllowedFields`) — usuários não-administradores só podem enviar os campos de negócio (nome do visitante, documento, telefone etc.); campos administrativos (`status`, `checkedInAt`, `checkedOutAt`, `estimatedCost`, `vendor`, `completedAt`) são descartados silenciosamente quando quem envia não é admin. Validado após a correção: o mesmo payload agora resulta em `status: "scheduled"` (visitante) e `status: "open"` (manutenção), como esperado.

### 3. [ALTO] Ausência de rate limiting (força bruta em login)
**CWE-307 — Improper Restriction of Excessive Authentication Attempts**

Não havia nenhum limite de tentativas na API — um atacante podia tentar senhas indefinidamente contra `/auth/login` (ou sobrecarregar qualquer outro endpoint).

**Correção:** adicionado `@nestjs/throttler` globalmente (100 requisições/minuto por IP) com um limite mais restrito especificamente no login (poucas tentativas por minuto). Testado: a partir de poucas tentativas seguidas com senha errada, a API passa a responder `429 Too Many Requests` em vez de continuar aceitando tentativas.

### 4. [MÉDIO] Enumeração de usuários pela mensagem de erro do login
**CWE-203 — Observable Discrepancy**

O login retornava mensagens diferentes para "usuário não existe" e "senha incorreta", permitindo descobrir quais e-mails/usernames estão cadastrados no sistema por tentativa e erro.

**Correção:** unificada a mensagem para "Credenciais inválidas" nos dois casos, e o `bcrypt.compare` agora roda mesmo quando o usuário não existe (contra um hash fixo), para também não vazar a diferença pelo tempo de resposta.

### 5. [MÉDIO] Ausência de cabeçalhos de segurança HTTP
**CWE-693 — Protection Mechanism Failure**

A API não enviava cabeçalhos como `X-Content-Type-Options`, `X-Frame-Options` ou `Strict-Transport-Security`.

**Correção:** adicionado `helmet()` no bootstrap do NestJS. Validado via `curl -I` que os cabeçalhos agora estão presentes.

### 6. [MÉDIO] Containers rodando como root
**CWE-250 — Execution with Unnecessary Privileges**

Tanto o Dockerfile do backend quanto o do frontend rodavam o processo Node como `root` dentro do container — se a aplicação fosse comprometida por qualquer outra falha, o atacante teria privilégios de root dentro do container.

**Correção:** os dois Dockerfiles agora trocam para o usuário `node` (não-root, já embutido na imagem oficial) antes do `CMD`. Validado com `docker exec ... id` → `uid=1000(node)`.

### 7. [MÉDIO] Dependências com vulnerabilidades conhecidas (CVEs)
**CWE-1104 — Use of Unmaintained Third Party Components**

`npm audit` no backend apontou 17 vulnerabilidades (11 altas) em dependências de produção.

**Correção:** `npm audit fix` (sem mudanças de versão major, sem quebrar nada) eliminou **100% das vulnerabilidades em dependências de produção** do backend — confirmado com `npm audit --omit=dev` retornando zero. As vulnerabilidades restantes ficaram só em ferramentas de teste (Jest/Babel), que nunca entram na imagem Docker final (o `Dockerfile` roda `npm ci --omit=dev`).

### 8. [BAIXO] Código morto com risco de escalonamento de privilégio
**CWE-489 — Active Debug Code / risco de reintrodução**

Existia um método `AuthService.register()` não utilizado por nenhuma rota, que criava usuários com **qualquer role informado no corpo da requisição**, incluindo `admin`. Não era explorável hoje (nenhum controller o expõe), mas era uma armadilha para o futuro: bastaria alguém adicionar `@Post('register')` sem pensar em restringir o `role` para reabrir uma falha crítica de auto-cadastro como administrador.

**Correção:** método removido.

## Limitações conhecidas e melhorias futuras

Dois riscos foram identificados mas **não corrigidos nesta fase**, por exigirem mudanças maiores demais para aplicar com segurança perto do prazo de entrega — exatamente o tipo de ponto que a apresentação espera que o grupo saiba discutir:

- **Next.js 15.5.22 tem 8 CVEs altos** (DoS em Server Actions, SSRF em rewrites, cache confusion) que só têm correção no Next.js 16 (major). Fizemos o upgrade de patch disponível (já estava na versão mais recente da série 15.5.x) e confirmamos que não há correção sem subir de major version. Recomendação: planejar o upgrade para Next 16 com um ciclo de testes de regressão completo, fora da janela da apresentação.
- **Token JWT armazenado em `localStorage`** no frontend (em vez de cookie `httpOnly`) — arquitetura comum em SPAs com API separada, mas tecnicamente exposta a roubo de token via XSS caso exista uma falha de XSS em algum componente. Não encontramos XSS explorável no código atual, mas é uma limitação estrutural válida de citar. Melhoria futura: migrar para cookie `httpOnly` + proteção CSRF, o que exigiria mudanças de arquitetura em como o frontend se autentica (SSR, middleware) — fora do escopo desta correção pontual.

## Como foi validado

Todas as correções foram testadas em containers reconstruídos do zero (`docker compose up --build`), não apenas lidas no código:
- Login com credenciais válidas continua funcionando nos 3 perfis.
- Mensagens de erro de login unificadas (testado com usuário inexistente e senha errada).
- Rate limiting confirmado: 429 após tentativas repetidas.
- Mass assignment confirmado fechado: payload malicioso de morador não altera mais `status`/custo em visitante e manutenção; admin continua com acesso total (não ficou restritivo demais).
- Cabeçalhos do helmet confirmados via `curl -I`.
- Container rodando como usuário não-root confirmado via `docker exec ... id`.
- Fluxos principais (dashboard, avisos, reservas, notificações, usuários) recontroferidos sem regressão após todas as mudanças.

## Conclusão

O sistema tinha uma falha crítica real (segredos fracos publicados no repositório) que, sem correção, poderia comprometer toda a autenticação em um ambiente publicado. Essa e outras 6 falhas foram corrigidas e validadas nesta branch. As duas limitações remanescentes são conhecidas, documentadas e não bloqueiam a demonstração acadêmica — são material legítimo para as perguntas de "limitações da solução" e "melhorias futuras" da apresentação.
