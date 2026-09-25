# ESTUDA-AI — Modelagem de Software 2026-2

O **EstudaAI** é uma aplicação web de recomendação de trilhas de aprendizagem. A interface é implementada em **Next.js** (React) e a API em **Node**.

O aluno pode:

- seguir **trilhas pré-definidas**, curadas por especialistas e organizadas por categoria;
- criar **trilhas personalizadas** com o apoio de um agente baseado em LLM (**Gemini**, desligável pelo administrador).

O administrador mantém o catálogo (categorias, trilhas e etapas) sem que as sugestões do LLM substituam a curadoria.

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
| Drivers arquiteturais | [`docs/drivers-arquiteturais.md`](docs/drivers-arquiteturais.md) |
| ADRs | [`docs/adr.md`](docs/adr.md) |
| Mapa de Specs (SDD) | [`docs/mapa-specs.md`](docs/mapa-specs.md) |
| Specs completas | [`docs/specs.md`](docs/specs.md) |
| Evidências de layout | [`docs/layout/`](docs/layout/) |
| Registro das decisões (OPEN) | [`docs/decisoes-em-aberto.md`](docs/decisoes-em-aberto.md) — 23 fechadas |

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
