# Evidências de layout — EstudaAI

Os mockups **não** substituem a Spec. Servem para o humano **aprovar o arranjo das telas** antes do código.

Regra: Spec com layout `pendente` em [`specs.md`](../specs.md) **não** entra em implementação, mesmo com a Spec `aprovada`.

## Como aprovar

1. Produzir protótipo (PNG, PDF ou Figma exportado) das telas listadas na Spec.
2. Gravar os arquivos nesta pasta, com os nomes sugeridos (`spec-001-login.png`, etc.).
3. Conferir desktop **e** smartphone (RNF01, RNF04, RNF08).
4. Preencher na Spec: evidência, checkboxes, **aprovado por** e **data**.
5. Mudar o **Layout** da Spec e da tabela-índice para `aprovado`.

Toolkit já decidido (OPEN-03): Next.js App Router, Tailwind CSS, shadcn/ui. Aprovar o desenho, não a stack.

Marca e cores (RNF10): **aprovadas** em 2026-09-30 — [`identidade-visual.md`](../identidade-visual.md) e amostra [`identidade.html`](identidade.html). A casca da SPEC-001 deve usar essa paleta.

A casca (navegação aluno × admin) é aprovada na SPEC-001 e reutilizada nas demais.

## SPEC-001 — layout aprovado (2026-09-30)

Abrir [`spec-001.html`](spec-001.html) no navegador. Use o seletor **Tela** e o viewport **Desktop / Smartphone**.

O layout da SPEC-001 está `aprovado` em [`specs.md`](../specs.md). Implementação desta Spec liberada; SPEC-002 … SPEC-007 continuam com layout `pendente`.
