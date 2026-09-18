# VS Code + GitHub Copilot — o que configurar

Leia este arquivo. O Copilot **não** o injeta sozinho no chat. O que entra em toda conversa é `.github/copilot-instructions.md`.

---

## Ajuste em relação ao Cursor e ao Claude Code

Não basta copiar `.cursor` para `.vscode`. No Copilot os papéis se espalham assim:

| Papel | Cursor | Claude Code | VS Code + Copilot |
|---|---|---|---|
| Manual sempre ligado | `.cursor/rules` (`alwaysApply: true`) | `.claude/CLAUDE.md` | **`.github/copilot-instructions.md`** |
| Rule (por pasta/arquivo) | `.cursor/rules/*.mdc` | `.claude/rules/*.md` | **`.github/instructions/*.instructions.md`** (`applyTo`) |
| Skill (roteiro sob demanda) | `.cursor/skills/` | `.claude/skills/` | **`.github/skills/`** ou, neste repo, **`.claude/skills/`** (o Copilot também descobre essa pasta) |
| MCP | `.cursor/mcp.json` | `.mcp.json` na raiz | **`.vscode/mcp.json`** (`servers`, não `mcpServers`) |
| Segredos MCP | `.cursor/mcp.env` | `.claude/mcp.env` | **`.vscode/mcp.env`** |

Os 7 papéis do pipeline **não foram copiados de novo**. O Copilot carrega skills de `.claude/skills/` (padrão Agent Skills). Guia: `.claude/GUIA-DE-USO.md`. Se você apagar `.claude/`, copie essas pastas para `.github/skills/`.

---

## O que o vc deve fazer neste laboratório

1. Instale as extensões **GitHub Copilot** e **GitHub Copilot Chat** (veja `extensions.json`).
2. Abra a pasta **`estudaai-modelagem`**, não só `C:\APLICACOES`.
3. Use o chat em **Agent** (não só inline complete). MCP e skills exigem o agente.
4. Preencha `.vscode/mcp.env` com placeholders reais **só na sua máquina**. Não commite senha.
5. Confie nos servidores MCP quando o VS Code perguntar (`MCP: List Servers`).
6. Edite `.github/copilot-instructions.md` com o manual **curto** do **seu** projeto (stack, pastas, o que não inventar).

---

## O que colocar em `.github/copilot-instructions.md`

É o equivalente Copilot do `CLAUDE.md`: fatos de toda sessão, **menos de ~150 linhas**.

Inclua: o que é o sistema; como rodar; onde está o quê; decisões já tomadas; como o agente deve se comportar.

Não inclua: senha, host real, o texto das 7 skills, runbook longo.

Rule por pasta: crie `.github/instructions/nome.instructions.md` com:

```yaml
---
applyTo: "docs/**"
---
```

Skill nova: pasta `.github/skills/minha-skill/SKILL.md` com `name` + `description` (o `name` tem de ser igual ao nome da pasta).

---

## Caminhos do laboratório

Os executáveis em `mcp.json` apontam para `C:\APLICACOES\mcp-tools\...`. No seu PC, ajuste.
