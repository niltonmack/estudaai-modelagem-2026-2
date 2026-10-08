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

O layout da SPEC-001 está `aprovado` em [`specs.md`](../specs.md). A implementação da SPEC-001 está `implementada` (2026-10-08).

## SPEC-002 — layout aprovado (2026-10-01)

Abrir [`spec-002.html`](spec-002.html). Telas: lista, nova/editar, recusa com trilhas, recusa da sentinela **Personalizada**. Viewport desktop e smartphone.

O layout da SPEC-002 está `aprovado` em [`specs.md`](../specs.md). A implementação da SPEC-002 está `implementada` (2026-10-08).

## SPEC-003 — layout aprovado (2026-10-01)

Abrir [`spec-003.html`](spec-003.html). Telas: lista de trilhas pré-definidas, nova/editar com etapas Markdown, reordenar, recusa de trilha incompleta, recusa da última etapa. Viewport desktop e smartphone.

O layout da SPEC-003 está `aprovado` em [`specs.md`](../specs.md). A implementação da SPEC-003 está `implementada` (2026-10-08).

## SPEC-004 — layout aprovado (2026-10-01)

Abrir [`spec-004.html`](spec-004.html). Telas: catálogo anônimo e autenticado, detalhe Markdown, progresso/histórico, marcar conclusão, E4 indisponível, recusa de anônimo. Viewport desktop e smartphone.

O layout da SPEC-004 está `aprovado` em [`specs.md`](../specs.md). A implementação da SPEC-004 está `implementada` (2026-10-08).

## SPEC-005 — layout aprovado (2026-10-01)

Abrir [`spec-005.html`](spec-005.html). Telas: editar trilha (contexto), recusa com impacto (1 aluno), recusa com vários alunos, recusa da última etapa com progresso. Viewport desktop e smartphone.

O layout da SPEC-005 está `aprovado` em [`specs.md`](../specs.md). A implementação da SPEC-005 está `implementada` (2026-10-08).

## SPEC-006 — layout aprovado (2026-10-02)

Abrir [`spec-006.html`](spec-006.html). Telas: pedido de objetivo, espera síncrona (60 s), timeout (E2), JSON insuficiente (E3), LLM desligado, E4, resultado no acompanhamento da SPEC-004, interruptor admin ligado/desligado, recusa anônimo. Viewport desktop e smartphone.

O layout da SPEC-006 está `aprovado` em [`specs.md`](../specs.md). A implementação da SPEC-006 está `implementada` (2026-10-08).

## SPEC-007 — layout aprovado (2026-10-02)

Abrir [`spec-007.html`](spec-007.html). Telas: entrada a partir do progresso, conversa referida à trilha (turnos aluno / agente LLM), espera síncrona (60 s), timeout (E2), LLM desligado, recusa sem progresso ativo (OPEN-14), recusa anônimo, recusa administrador. Viewport desktop e smartphone.

O layout da SPEC-007 está `aprovado` em [`specs.md`](../specs.md). A implementação da SPEC-007 está `implementada` (2026-10-08).

## SPEC-008 — layout aprovado (2026-10-08)

Abrir [`spec-008.html`](spec-008.html). Telas: lista de usuários, nova/editar conta, recusa do último administrador, recusa de aluno com progresso. Viewport desktop e smartphone.

O layout da SPEC-008 está `aprovado` em [`specs.md`](../specs.md). A implementação da SPEC-008 está `implementada` (2026-10-08).

## SPEC-009 — layout aprovado (2026-10-08)

Abrir [`spec-009.html`](spec-009.html). Telas: lista de alunos e andamento, detalhe do aluno, detalhe de uma trilha (somente leitura), aluno sem progresso. Viewport desktop e smartphone.

O layout da SPEC-009 está `aprovado` em [`specs.md`](../specs.md). A implementação da SPEC-009 está `implementada` (2026-10-08).

## Home do aluno — layout aprovado (2026-10-08)

Abrir [`inicio-aluno.html`](inicio-aluno.html). Telas: com trilhas em andamento, sem nenhuma trilha, todas as etapas concluídas, carregando, falha ao carregar. Viewport desktop e smartphone.

Redesenho de `/inicio` (casca da SPEC-001, dados da SPEC-004): avanço geral, avanço por trilha, ritmo semanal a partir do histórico (RB12) e atalho para continuar. Percentuais seguem RB06. Sem API nova nem dado novo.

O layout foi `aprovado` pelo humano em 2026-10-08 e a home está `implementada` em `apps/web/app/inicio/page.tsx`.

## Painel do administrador — layout aprovado (2026-10-08)

Abrir [`painel-admin.html`](painel-admin.html). Telas: com alunos estudando, nenhum aluno com trilha, carregando, falha ao carregar. Viewport desktop e smartphone.

Redesenho de `/painel` no mesmo estilo da home do aluno: números de contas, acompanhamentos, trilhas publicadas e agente LLM; avanço geral dos alunos (RB06); novos acompanhamentos por semana pela data de início; trilhas mais acompanhadas com avanço médio. Somente leitura (RB18). Sem API nova.

O layout foi `aprovado` pelo humano em 2026-10-08 e o painel está `implementado` em `apps/web/app/painel/page.tsx`.

## Vídeo do YouTube — layout aprovado (2026-10-08)

Abrir [`video-youtube.html`](video-youtube.html). O link `youtube.com` ou `youtu.be` no Markdown da etapa abre um lightbox sobre o acompanhamento, com o player e o botão Fechar. Os outros links continuam links.

O layout foi `aprovado` pelo humano em 2026-10-08 e está `implementado` em `apps/web/components/markdown-etapa.tsx`.
