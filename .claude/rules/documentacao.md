---
paths:
  - "docs/**"
  - "context/**"
---

# Documentação do EstudaAI

Esta é uma **rule** de exemplo do Claude Code (arquivo `.md` em `.claude/rules/`).

Ela só entra no contexto quando o Claude lê arquivos em `docs/` ou `context/` (`paths` no frontmatter). Sem `paths`, a rule carregaria em **toda** sessão — use isso só para restrições curtas e universais.

Quando estiver nestas pastas:

- Trate `docs/` como baseline aprovada da modelagem.
- Não invente RF, RB, entidade ou tecnologia que não esteja na baseline ou em `docs/decisoes-em-aberto.md`.
- Handoffs do pipeline de skills vão em `context/`, não misturados com a baseline.

No Cursor o equivalente seria um `.mdc` em `.cursor/rules/` com `globs` e `alwaysApply: false`.
