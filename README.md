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

## Como executar

Dois artefatos: API Nest (`apps/api`, porta 3001) e UI Next.js (`apps/web`, porta 3000).

Laboratório local (2026-10-02): o MySQL da máquina é o serviço **MySQL80** em `127.0.0.1:3306` (não há listener em `3336`). O schema do EstudaAI é o banco **`estudaai`**, separado do `dentalapp` (`avaliacoes`, `imagens`, `respostas`), que permanece intocado.

```bash
npm install
npm run seed
npm run api
npm run web
```

- UI: http://localhost:3000
- Admin seed: `mariana@estudaai.local` / `AdminTemp1`
- Testes da Spec: `npm test` (usam `sql.js` em memória; não gravam no MySQL)
- Gemini: chave só em `apps/api/.env` (`GEMINI_API_KEY`). Acesso `generateContent` validado em 2026-10-02 no modelo `gemini-3.5-flash-lite`. Ligue o interruptor em `/agente`.

`docker compose` continua opcional se você quiser um MySQL só do EstudaAI; neste laboratório o banco local compartilhado já está em uso.

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
| Registro das decisões (OPEN) | [`docs/decisoes-em-aberto.md`](docs/decisoes-em-aberto.md) — 25 fechadas |

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
