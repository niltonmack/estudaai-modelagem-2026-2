---
applyTo: "docs/**,context/**"
---

# Documentação do EstudaAI

Esta é uma **instruction** de exemplo do Copilot (arquivo `.instructions.md` em `.github/instructions/`).

Ela entra quando o agente trabalha em arquivos de `docs/` ou `context/` (`applyTo`). Sem `applyTo`, você ainda pode anexá-la manualmente no chat, mas ela não aplica sozinha.

Quando estiver nestas pastas:

- Trate `docs/` como baseline aprovada da modelagem.
- Não invente RF, RB, entidade ou tecnologia que não esteja na baseline ou em `docs/decisoes-em-aberto.md`.
- Handoffs do pipeline de skills vão em `context/`, não misturados com a baseline.

Equivalentes: Cursor `.cursor/rules/*.mdc` (`globs`); Claude Code `.claude/rules/*.md` (`paths`).
