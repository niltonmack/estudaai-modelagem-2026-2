# Instruções do Copilot (sempre ligadas)

Este arquivo é lido em **todo** chat do GitHub Copilot neste workspace. Mantenha-o curto.

Se você usa Cursor, prefira `.cursor/`. Se usa Claude Code, prefira `.claude/CLAUDE.md`. Este arquivo é o manual da maioria da turma (VS Code).

## Projeto

EstudaAI: web de trilhas de aprendizagem. Frontend Next.js (App Router), API Nest, MySQL.

Documentação de modelagem: `docs/` (visão, RF, RB, RNF, modelo conceitual, UC, drivers, ADRs).
Mapa SDD: `docs/mapa-specs.md`. Decisões humanas: `docs/decisoes-em-aberto.md`.

Não invente requisito, entidade ou tecnologia fora da baseline e de `docs/decisoes-em-aberto.md` (23 OPENs fechadas). LLM desta versão: Gemini, atrás da porta da API Nest. Não implemente uma Spec cujo layout esteja `pendente` em `docs/specs.md`.

Handoffs do pipeline de skills: pasta `context/` na raiz.

## Skills e MCP

Pipeline de papéis (analista → arquiteto → banco → UI → implementação → QA → docs): `.claude/skills/` (o Copilot descobre essa pasta). Como chamar: `.claude/GUIA-DE-USO.md`.

MCP deste workspace: `.vscode/mcp.json` + `.vscode/mcp.env`.

Como montar o seu próprio projeto: `.vscode/COPILOT.md`.
