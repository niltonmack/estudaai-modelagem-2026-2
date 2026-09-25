# Evidências de layout — EstudaAI

Os mockups **não** substituem a Spec. Servem para o humano **aprovar o arranjo das telas** antes do código.

Regra: Spec com layout `pendente` em [`specs.md`](../specs.md) **não** entra em implementação.

## Como aprovar

1. Produzir protótipo (PNG, PDF ou Figma exportado) das telas listadas na Spec.
2. Gravar os arquivos nesta pasta, com os nomes sugeridos (`spec-001-login.png`, etc.).
3. Conferir desktop **e** smartphone (RNF01, RNF04, RNF08).
4. Preencher na Spec: evidência, checkboxes, **aprovado por** e **data**.
5. Mudar o **Layout** da Spec e da tabela-índice para `aprovado`.

Toolkit já decidido (OPEN-03): Next.js App Router, Tailwind CSS, shadcn/ui. Aprovar o desenho, não a stack.

A casca (navegação aluno × admin) é aprovada na SPEC-001 e reutilizada nas demais.
