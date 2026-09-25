# CLAUDE.md — o que é e o que você deve colocar aqui

Este arquivo é lido pelo **Claude Code** no início de cada sessão. Ele fica em `.claude/CLAUDE.md` (o Claude Code também aceita um `CLAUDE.md` na raiz do repositório; neste modelo usamos só este, para não duplicar contexto).

Não é skill e não é rule. É o **manual curto do projeto**: fatos que o agente precisa lembrar o tempo todo.

Se você usa **Cursor**, ignore este arquivo e configure `.cursor/`. Se usa **VS Code + Copilot**, o equivalente é `.github/copilot-instructions.md` (veja `.vscode/COPILOT.md`). Os três conjuntos existem neste repositório para a turma clonar o mesmo GitHub e escolher a IDE.

---

## O que colocar neste arquivo

Escreva em português, em poucas seções. Meta: **menos de ~150 linhas**. Procedimento longo não entra aqui — vira skill.

Inclua, quando fizer sentido no **seu** projeto:

1. **O que é o sistema** — uma frase (ex.: EstudaAI recomenda trilhas de aprendizagem).
2. **Como rodar** — comandos de install, test, lint, dev. Sem tutorial.
3. **Onde está o quê** — pastas importantes (`docs/`, `context/`, frontend, API).
4. **Decisões já tomadas** — stack, ADRs, o que não reinventar (ex.: Next.js + API Nest, MySQL).
5. **Como o agente deve se comportar** — “não invente RF”; “não commitar segredo”; “Specs em `docs/`”.
6. **Ponteiros** — “detalhe de requisitos está em `docs/`”; “pipeline de papéis está em `.claude/skills/`”.

Não coloque: senha, host real, passo a passo de deploy, checklist de 40 itens, o texto das 7 skills.

---

## Mapa deste modelo (Claude Code × Cursor)

| Papel | Claude Code | Cursor | VS Code + Copilot |
|---|---|---|---|
| Manual sempre ligado | `.claude/CLAUDE.md` (este arquivo) | rules com `alwaysApply: true`, ou `AGENTS.md` | `.github/copilot-instructions.md` |
| Rule (convenção, recorte por pasta) | `.claude/rules/*.md` | `.cursor/rules/*.mdc` | `.github/instructions/*.instructions.md` |
| Skill (roteiro sob demanda) | `.claude/skills/<nome>/SKILL.md` | `.cursor/skills/<nome>/SKILL.md` | `.github/skills/` **ou** `.claude/skills/` (o Copilot lê as duas) |
| MCP (ferramentas externas) | `.mcp.json` na **raiz** | `.cursor/mcp.json` | `.vscode/mcp.json` (`servers`) |
| Segredos MCP (placeholders) | `.claude/mcp.env` | `.cursor/mcp.env` | `.vscode/mcp.env` |

Os 7 papéis do pipeline (analista, arquiteto, banco, UI, implementação, QA, docs/ops) no Cursor estão em `.cursor/rules/` com `alwaysApply: false`. No Claude Code o equivalente é **skill**: o corpo não deve ocupar a sessão inteira. Por isso foram copiados para `.claude/skills/`.

---

## Como usar no laboratório

1. Abra **esta pasta do projeto** (`estudaai-modelagem`) no Claude Code, não só `C:\APLICACOES`.
2. Preencha `.claude/mcp.env` com os seus valores (nunca commite senha real).
3. Exporte as variáveis para o ambiente **antes** de iniciar o Claude, ou use um dotenv. O Claude Code **não** lê `mcp.env` sozinho; o `.mcp.json` interpola `${NOME}` a partir do ambiente. Exemplo no PowerShell:

```powershell
Get-Content .claude/mcp.env | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $k, $v = $_.Split('=', 2)
  Set-Item -Path "Env:$($k.Trim())" -Value $v.Trim()
}
```

4. Confira MCP com `claude mcp list`. Servidores do projeto só conectam depois que você **confiar** na pasta.
5. Skills: descreva a tarefa em linguagem natural, ou chame `/01-requirements-analyst`. Guia: `.claude/GUIA-DE-USO.md`.
6. Caminhos `C:\APLICACOES\mcp-tools\...` no `.mcp.json` são da máquina do laboratório. No seu PC, ajuste.

---

## Bloco do EstudaAI (exemplo do que o aluno preenche)

Substitua ou apague o que não valer no **seu** fork.

```
EstudaAI: web de trilhas de aprendizagem. Frontend Next.js (App Router), API Nest, MySQL.

Documentação de modelagem: docs/ (visão, RF, RB, RNF, modelo conceitual, UC, drivers, ADRs).
Mapa SDD: docs/mapa-specs.md. Decisões humanas: docs/decisoes-em-aberto.md.

Não inventar requisito, entidade ou tecnologia fora da baseline e de docs/decisoes-em-aberto.md (23 OPENs fechadas). LLM desta versão: Gemini, atrás da porta da API Nest. Não implementar Spec com layout pendente em docs/specs.md.

Artefatos de handoff do pipeline de skills: pasta context/ na raiz.
```
