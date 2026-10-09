# ESTUDA-AI — Modelagem de Software 2026-2

O **EstudaAI** é uma aplicação web de recomendação de trilhas de aprendizagem. A interface é implementada em **Next.js** (React) e a API em **Node**.

O aluno pode:

- seguir **trilhas pré-definidas**, curadas por especialistas e organizadas por categoria;
- criar **trilhas personalizadas** com o apoio de um agente baseado em LLM (**Gemini**, desligável pelo administrador).

O administrador mantém o catálogo (categorias, trilhas e etapas), gerencia contas e consulta o andamento dos alunos, sem que as sugestões do LLM substituam a curadoria.

A visão completa está em [`docs/visaodoproduto.md`](docs/visaodoproduto.md).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js App Router (React) + Tailwind CSS + shadcn/ui |
| Backend | Node / NestJS |
| Persistência | MySQL / MariaDB |
| Autenticação | JWT Bearer |
| LLM (opcional) | Gemini (interruptor na UI do administrador) |

O código **SHALL** ser organizado em módulos compatíveis com essa arquitetura (RNF07).

## Como executar localmente

A interface sobe em http://localhost:3000 e a API em http://localhost:3001. Os comandos abaixo são executados na raiz do repositório, onde está o `package.json` dos workspaces.

### Pré-requisitos

- Node.js 20 ou superior (o `npm` acompanha a instalação)
- MySQL 8 ou MariaDB na porta `3306`, ou Docker para subir o banco deste projeto

### 1. Instalar dependências

```bash
npm install
```

### 2. Preparar o banco `estudaai`

Use somente o schema `estudaai`. Se a máquina já tiver outro banco na mesma instância, deixe-o como está.

**MySQL já instalado.** No cliente `mysql`, como administrador:

```sql
CREATE DATABASE IF NOT EXISTS estudaai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'estudaai'@'localhost' IDENTIFIED BY 'estudaai';
CREATE USER IF NOT EXISTS 'estudaai'@'127.0.0.1' IDENTIFIED BY 'estudaai';
GRANT ALL PRIVILEGES ON estudaai.* TO 'estudaai'@'localhost';
GRANT ALL PRIVILEGES ON estudaai.* TO 'estudaai'@'127.0.0.1';
FLUSH PRIVILEGES;
```

**Docker.** Se a porta `3306` estiver livre:

```bash
docker compose up -d
```

O Compose cria o banco `estudaai`, o usuário `estudaai` e a senha `estudaai`. As tabelas são criadas pela API na primeira conexão (`synchronize` fora de produção).

### 3. Configurar o ambiente

Copie o exemplo para o arquivo que a API lê. Esse arquivo fica de fora do Git.

```bash
cp .env.example apps/api/.env
```

No PowerShell:

```powershell
Copy-Item .env.example apps\api\.env
```

Os valores de laboratório já apontam para `127.0.0.1:3306`, banco `estudaai` e o administrador inicial. Para o agente LLM, preencha `GEMINI_API_KEY` nesse arquivo. O modelo padrão é `gemini-3.5-flash-lite`. Para a busca semântica, preencha `PINECONE_API_KEY`; o índice esperado é `estudaai-trilhas`. As duas chaves ficam só na API.

A interface usa `http://localhost:3001` quando `apps/web/.env.local` não existe. Crie esse arquivo apenas se a API estiver em outro endereço:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Subir API e interface

Em um terminal:

```bash
npm run api
```

Em outro terminal:

```bash
npm run web
```

`npm run api` aplica o seed se ele ainda não existir: a conta da administradora, a categoria sentinela **Personalizada** e o interruptor do LLM desligado. `npm run seed` repete esse passo sem deixar a API no ar. Trilhas e etapas do catálogo são criadas depois, pela área administrativa.

### 5. Entrar no sistema

| Onde | Endereço |
|---|---|
| Interface | http://localhost:3000 |
| Cadastro de aluno | http://localhost:3000/cadastro |
| Login | http://localhost:3000/login |
| API | http://localhost:3001 |

Administradora inicial: `mariana@estudaai.local` / `AdminTemp1`.

Com a chave do Gemini preenchida, ligue o agente em http://localhost:3000/agente. Sem a chave, o catálogo e o acompanhamento funcionam com o agente desligado.

### Testes

```bash
npm test
```

Os testes da API usam `sql.js` em memória e não gravam no MySQL.

## Documentação

| Artefato | Arquivo |
|---|---|
| Visão do produto | [`docs/visaodoproduto.md`](docs/visaodoproduto.md) |
| Personas | [`docs/persona1.md`](docs/persona1.md) (aluno), [`docs/persona2.md`](docs/persona2.md) (administrador) |
| Requisitos funcionais | [`docs/EstudaAI_RF.md`](docs/EstudaAI_RF.md) |
| Requisitos não funcionais | [`docs/EstudaAI_RNF.md`](docs/EstudaAI_RNF.md) |
| Regras de negócio | [`docs/EstudaAI_RB.md`](docs/EstudaAI_RB.md) |
| Modelo conceitual | [`docs/modelo-conceitual.md`](docs/modelo-conceitual.md) · [`docs/modelo-conceitual.png`](docs/modelo-conceitual.png) |
| Caso de uso do aluno (UC01) | [`docs/caso-uso-aluno.md`](docs/caso-uso-aluno.md) · [`docs/caso-uso-aluno.png`](docs/caso-uso-aluno.png) |
| Caso de uso do administrador (UC02) | [`docs/caso-uso-admin.md`](docs/caso-uso-admin.md) · [`docs/caso-uso-admin.png`](docs/caso-uso-admin.png) |
| Caso de uso gerenciar usuários (UC03) | [`docs/caso-uso-usuarios.md`](docs/caso-uso-usuarios.md) |
| Caso de uso consultar progresso (UC04) | [`docs/caso-uso-acompanhamento-admin.md`](docs/caso-uso-acompanhamento-admin.md) |
| Drivers arquiteturais | [`docs/drivers-arquiteturais.md`](docs/drivers-arquiteturais.md) |
| ADRs | [`docs/adr.md`](docs/adr.md) |
| Mapa de Specs (SDD) | [`docs/mapa-specs.md`](docs/mapa-specs.md) |
| Specs completas | [`docs/specs.md`](docs/specs.md) — SPEC-001 … SPEC-009 `implementadas` (2026-10-08); layouts em [`docs/layout/`](docs/layout/) |
| Handoff de implementação | [`context/05-implementation.md`](context/05-implementation.md) — paths HTTP, MySQL local, Gemini de laboratório |
| Log da aplicação | [`docs/logging.md`](docs/logging.md) (RNF09) |
| Identidade visual | [`docs/identidade-visual.md`](docs/identidade-visual.md) (RNF10) — **aprovada** (2026-09-30) · amostra [`docs/layout/identidade.html`](docs/layout/identidade.html) |
| Evidências de layout | [`docs/layout/`](docs/layout/) |
| Registro das decisões (OPEN) | [`docs/decisoes-em-aberto.md`](docs/decisoes-em-aberto.md) — 27 fechadas |

## Modelo de IDE (Cursor, Claude Code e VS Code + Copilot)

Este repositório traz **três configurações** para a turma clonar e adaptar. A maioria usa VS Code + Copilot.

| IDE | Onde configurar | Comece por |
|---|---|---|
| VS Code + Copilot | [`.vscode/`](.vscode/) + [`.github/`](.github/) | [`.vscode/COPILOT.md`](.vscode/COPILOT.md) |
| Cursor | [`.cursor/`](.cursor/) | [`.cursor/mcp.json`](.cursor/mcp.json) e [`.cursor/rules/`](.cursor/rules/) |
| Claude Code | [`.claude/`](.claude/) + [`.mcp.json`](.mcp.json) na raiz | [`.claude/CLAUDE.md`](.claude/CLAUDE.md) |

No Copilot, MCP fica em `.vscode/mcp.json`; o manual sempre ligado fica em `.github/copilot-instructions.md`. Skills do pipeline estão em `.claude/skills/` e o Copilot também as descobre.

Segredos MCP usam placeholders em `.vscode/mcp.env`, `.cursor/mcp.env` e `.claude/mcp.env`. Não commite senha real.

## Público-alvo

- Estudantes que desejam otimizar o tempo de estudo
- Pessoas que buscam aprimoramento contínuo e organizado
- Aprendizes que preferem estrutura guiada ou flexibilidade personalizada
