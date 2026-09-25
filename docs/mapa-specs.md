# Mapa de Specs — EstudaAI

**Status:** mapa aprovado para detalhamento; texto completo em [`specs.md`](specs.md)  
**Origem:** Prompt SDD (`docs/Prompt_SDD_Specs.pdf`) aplicado à baseline de modelagem  
**Data:** 2026-09-16

Este documento é **somente o índice ordenado**. Não contém o texto completo das Specs e não implementa código.

As 23 questões humanas (`OPEN-01` … `OPEN-23`) foram resolvidas em [`decisoes-em-aberto.md`](decisoes-em-aberto.md) e absorvidas na baseline (RF, RB, RNF, UC, modelo, drivers, ADRs). A implementação **não** reabre essas decisões.

Para o texto completo (comportamento, invariantes, contratos, Dado/Quando/Então, testes e status): [`specs.md`](specs.md).

---

## 1. Análise da baseline

Artefatos lidos: visão do produto, personas (Lucas / Mariana), RF, RB, RNF, modelo conceitual, UC01, UC02, drivers arquiteturais e ADRs.

### 1.1 Comportamentos principais

1. Pessoa se cadastra e autentica; o sistema libera funções conforme o perfil (`Aluno` ou `Administrador`).
2. Administrador mantém o catálogo curado: categorias, trilhas pré-definidas e etapas ordenadas.
3. Aluno consulta o catálogo, escolhe uma trilha pré-definida e visualiza etapas, conteúdos e sequência.
4. Aluno registra conclusão explícita de etapas e acompanha percentual e histórico individuais.
5. Aluno descreve um objetivo em linguagem natural e obtém uma trilha personalizada via agente LLM, depois a acompanha como qualquer outra trilha.
6. Aluno conversa com o agente LLM para apoio ao estudo, sem alterar o catálogo curado.
7. Administrador, ao remover etapa já usada por alunos, avalia e trata o impacto sobre progresso e conclusões.

### 1.2 Dependências entre comportamentos

```
Identidade
  → Categorias
    → Publicar trilha pré-definida (trilha + etapas + sequência)
      → Acompanhar trilha pré-definida (catálogo + visualização + progresso)
        → Integridade na remoção de etapa em uso
        → Trilha personalizada (LLM)  →  Conversa com o agente
```

- RB01 e RB02 tornam autenticação pré-requisito de trilhas, progresso e administração.
- RB03 torna categoria e etapas ordenadas pré-requisito de qualquer trilha publicável.
- RF03 depende de trilhas pré-definidas já publicadas (RB07).
- Progresso (RF06/RF07) depende de uma `Trilha` com `Etapa`.
- RB11 só é observável depois que existem `Progresso` e `ConclusaoEtapa`.
- RF04 e RF08 dependem da porta LLM (ADR-002); o UC01 permanece viável só com catálogo se o LLM estiver desligado (RNF02).
- Visualização e progresso (RF05–RF07) valem para os dois `Trilha.tipo` (ADR-003); a origem personalizada não deve duplicar esse acompanhamento.

### 1.3 Regras de negócio e invariantes

| ID | Invariante |
|---|---|
| RB01 | Selecionar trilha, criar personalizada ou registrar progresso exige autenticação |
| RB02 | Criar, alterar ou remover catálogo só com perfil administrador |
| RB03 | Toda trilha tem exatamente uma categoria e uma ou mais etapas ordenadas |
| RB04 | Progresso é individual por aluno |
| RB05 | Etapa só conta como concluída se houver marcação explícita |
| RB06 | Percentual é derivado (conclusões ÷ total de etapas), não editável |
| RB07 | Trilha pré-definida nasce da curadoria administrativa |
| RB08 | Trilha personalizada nasce de solicitação textual + resposta do LLM |
| RB09 | Trilha personalizada fica associada ao aluno que a solicitou |
| RB10 | Sugestão do LLM não substitui nem altera o catálogo curado |
| RB11 | Remoção de etapa vinculada trata impacto em progresso antes de concluir |
| RB12 | Histórico de conclusões permanece enquanto o progresso estiver ativo |

### 1.4 Requisitos não funcionais aplicáveis

RNFs não originam Specs próprias. Associação por Spec está no índice (§2).

| ID | Efeito |
|---|---|
| RNF01, RNF04, RNF08 | Superfície web única, responsiva, navegadores atuais |
| RNF02 | LLM opcional (Gemini), interruptor na UI do administrador, timeout 60 s |
| RNF03 | Ações principais sem LLM &lt; 2 s |
| RNF05, RNF06 | Autenticação e autorização na operação, não só na UI |
| RNF07 | Módulos Node (API) + React/Next.js (UI) |

### 1.5 Restrições e decisões já tomadas

| ID | Decisão |
|---|---|
| ADR-001 | Frontend Next.js App Router (React) e API de domínio NestJS — dois artefatos |
| ADR-002 | LLM só no backend, atrás de porta; provedor Gemini; função desligável pelo admin |
| ADR-003 | Uma entidade `Trilha` com `tipo`; catálogo curado ≠ conversa |
| ADR-004 | Autenticação JWT, perfil XOR e invariantes impostos na API Nest |
| AD-C01 / AD-C03 | Entrega web; sem app nativo; sem microserviços exigidos |
| AD-QA01 | Isolar I/O do LLM do caminho síncrono local |
| Complementos | MySQL/MariaDB; Tailwind + shadcn/ui; seed do primeiro admin; senha com hash |

### 1.6 Decisões humanas (OPEN)

As 23 OPENs estão **fechadas** (22 decididas, 1 fora de escopo). Índice e texto completo: [`decisoes-em-aberto.md`](decisoes-em-aberto.md). A baseline já incorpora Gemini, NestJS, App Router, MySQL, JWT, sentinela **Personalizada**, XOR de perfil, política de remoção por bloqueio, timeout 60 s e demais respostas.

### 1.7 Inconsistências, lacunas e ambiguidades

Tratadas pela entrevista; não devem ser reabertas na implementação.

| ID | Tipo | Resolução |
|---|---|---|
| INC-01 | Inconsistência | OPEN-17: recomendação inteligente **fora de escopo** nesta versão. A visão foi ajustada. |
| INC-02 | Inconsistência menor | Visão atualizada para Next.js; ADR-001 prevalece. |
| INC-03 | Lacuna | OPEN-10: primeiro administrador por seed/script. |
| INC-04 | Lacuna | OPEN-11: e-mail único, senha com hash, recuperação por e-mail. |
| INC-05 | Ambiguidades | OPEN-12 / RB14: XOR (só aluno ou só administrador). |
| INC-06 | Ambiguidades | OPEN-13: anônimo lista o catálogo; RB01 cobre escolher/criar/progresso. |
| INC-07 | Lacuna | OPEN-07 / RB11: bloquear remoção se houver progresso; preservar conclusões; recusar trilha vazia. |
| INC-08 | Lacuna | OPEN-08: categoria sentinela **Personalizada**. |
| INC-09 | Lacuna | OPEN-09: JSON `titulo`, `descricao`, etapas `{titulo, conteudo, ordem}`. |
| INC-10 | Ambiguidades | OPEN-14: `Mensagem` exige `Trilha` em andamento. |
| INC-11 | Lacuna | OPEN-15: sem pausar/abandonar/reiniciar; `ativo` só distingue vigente. |
| INC-12 | Lacuna | OPEN-16: `Etapa.conteudo` é Markdown. |
| INC-13 | Lacuna | OPEN-18: logout explícito (RF02). |
| INC-14 | Lacuna | OPEN-22: mensagem de catálogo indisponível; não cria trilha (UC01-E4). |
| INC-15 | Ambiguidades | OPEN-21: UC01 exclusivo do aluno. |

---

## 2. Mapa ordenado de Specs

Decomposição **vertical por capacidade**. RF09–RF13 não viraram “implementar admin”; RF03–RF07 não viraram “implementar aluno”. RNFs transversais foram associados, não transformados em Specs. A porta LLM entra na primeira capacidade que a exige (SPEC-006), não como Spec isolada de infraestrutura.

### SPEC-001 — Cadastrar, autenticar e autorizar por perfil

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-001 |
| **Nome** | Cadastrar, autenticar e autorizar por perfil |
| **Objetivo** | Permitir registro de conta, login JWT, logout, recuperação de senha por e-mail e liberação de funções conforme `Aluno` **ou** `Administrador` (XOR), com regras impostas na API Nest. O primeiro administrador nasce por seed. |
| **Valor** | Lucas e Mariana entram no sistema com identidade confiável; o restante das capacidades passa a ter fronteira de acesso. Esta Spec também estabelece os dois artefatos de entrega (Next.js App Router + API Nest + MySQL) exigidos por ADR-001, porque sem essa fronteira a autorização da ADR-004 não tem onde viver. |
| **RF** | RF01, RF02 |
| **RB** | RB01, RB02, RB14 |
| **RNF** | RNF05, RNF06, RNF07, RNF01, RNF04, RNF08, RNF03 |
| **UC / fluxo** | UC01 «include» autenticar; UC02 «include» autenticar; A1 cadastro; A2 credenciais inválidas |
| **Entidades** | `Usuario`, `Aluno`, `Administrador` |
| **Drivers** | AD-RF02, AD-C01, AD-C03, AD-QA02, AD-QA04, AD-QA05 |
| **ADRs** | ADR-001, ADR-004 |
| **Dependências** | Nenhuma |
| **Justificativa da ordem** | Nenhuma outra Spec de trilha, catálogo ou progresso pode ser validada sem identidade. É a primeira capacidade observável do sistema. |
| **OPEN associados** | Resolvidos: OPEN-01 … OPEN-05, OPEN-10 … OPEN-12, OPEN-18, OPEN-21 |

### SPEC-002 — Gerenciar categorias de aprendizagem

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-002 |
| **Nome** | Gerenciar categorias de aprendizagem |
| **Objetivo** | Permitir que o administrador cadastre, consulte, altere e remova categorias. |
| **Valor** | Mariana organiza o catálogo por área; RB03 passa a ter onde classificar trilhas. |
| **RF** | RF09 |
| **RB** | RB02, RB03 (categoria como pré-requisito de trilha), RB13 |
| **RNF** | RNF05, RNF06, RNF03, RNF04, RNF07 |
| **UC / fluxo** | UC02 fluxo principal passo 3; A2 consultar; A3 alterar; A4 remover sem vínculo; E3 recusa se houver trilhas |
| **Entidades** | `Categoria` (inclui sentinela **Personalizada**) |
| **Drivers** | AD-RF04, AD-CEN04, AD-QA02 |
| **ADRs** | ADR-004 |
| **Dependências** | SPEC-001 |
| **Justificativa da ordem** | Toda `Trilha` exige exatamente uma `Categoria` (RB03). Sem esta Spec, SPEC-003 não publica trilha válida. |
| **OPEN associados** | Resolvidos: OPEN-08 (seed da sentinela), OPEN-23 |

Observação: RB13 cobre remoção de categoria com trilhas. A sentinela **Personalizada** precisa existir para a SPEC-006.

### SPEC-003 — Publicar trilha pré-definida com etapas ordenadas

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-003 |
| **Nome** | Publicar trilha pré-definida com etapas ordenadas |
| **Objetivo** | Permitir cadastro, consulta, alteração e remoção de trilhas pré-definidas e de suas etapas, com associação e `ordem` explícitas, publicando somente se RB03 for verdadeiro. |
| **Valor** | Mariana disponibiliza percursos curados prontos para o aluno começar. |
| **RF** | RF10, RF11, RF12 |
| **RB** | RB02, RB03, RB07; RB10 (catálogo distinto de sugestão LLM, ainda sem LLM nesta Spec) |
| **RNF** | RNF05, RNF06, RNF03, RNF04, RNF07 |
| **UC / fluxo** | UC02 fluxo principal passos 4–8; A2; A3; A4 (remoção **sem** progresso e sem deixar trilha vazia); A6 reordenar; E1; E2 trilha incompleta; E3 |
| **Entidades** | `Categoria`, `Trilha` (`tipo = pré-definida`), `Etapa` (`conteudo` Markdown) |
| **Drivers** | AD-RF01, AD-RF04, AD-CEN04, AD-C04, AD-QA01 |
| **ADRs** | ADR-003, ADR-004 |
| **Dependências** | SPEC-002 |
| **Justificativa da ordem** | RF10+RF11+RF12 formam um único comportamento publicável (trilha curada completa). Separar “CRUD de trilha” de “CRUD de etapa” deixaria a Spec sem valor observável para o aluno. Remoção **com** alunos em andamento fica na SPEC-005, porque depende de progresso ainda inexistente e tem critério de validação distinto (RB11). |
| **OPEN associados** | Resolvidos: OPEN-16; OPEN-07 na parte “ainda não há progresso” |

### SPEC-004 — Acompanhar trilha pré-definida

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-004 |
| **Nome** | Acompanhar trilha pré-definida |
| **Objetivo** | Permitir que o aluno autenticado consulte o catálogo por categoria (a listagem também é anônima), escolha uma trilha pré-definida, visualize etapas/conteúdos Markdown/sequência, inicie ou retome `Progresso` individual, marque conclusão explícita e veja percentual derivado e histórico. Se o catálogo estiver vazio e o LLM desligado, exibir indisponibilidade (UC01-E4). |
| **Valor** | Lucas inicia um percurso em poucos minutos, sabe a próxima etapa e percebe evolução sem ambiguidade. |
| **RF** | RF03, RF05, RF06, RF07 |
| **RB** | RB01, RB03, RB04, RB05, RB06, RB07, RB12 |
| **RNF** | RNF01, RNF03, RNF04, RNF05, RNF08, RNF07 |
| **UC / fluxo** | UC01 fluxo principal; A4 só consultar progresso; A6 retomar; E1 sem autenticação na escolha; E4 catálogo vazio + LLM off |
| **Entidades** | `Aluno`, `Categoria`, `Trilha`, `Etapa`, `Progresso`, `ConclusaoEtapa` |
| **Drivers** | AD-RF01, AD-RF03, AD-CEN02, AD-QA01, AD-QA04 |
| **ADRs** | ADR-003, ADR-004 |
| **Dependências** | SPEC-001, SPEC-003 |
| **Justificativa da ordem** | É o caminho feliz do produto sem LLM. Agrupa catálogo + visualização + progresso porque UC01 trata acompanhamento como um objetivo único e RF05–RF07 não se validam isolados (percentual precisa de etapas e de conclusões). RF04 e RF08 ficam de fora: origens, falhas e RNF diferentes. |
| **OPEN associados** | Resolvidos: OPEN-13, OPEN-15, OPEN-21, OPEN-22 |

### SPEC-005 — Tratar impacto da remoção de etapa em uso

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-005 |
| **Nome** | Tratar impacto da remoção de etapa em uso |
| **Objetivo** | Quando o administrador solicitar remoção de `Etapa` vinculada a trilha com `Progresso` vigente, o sistema identifica afetados e **recusa** a operação, preservando `ConclusaoEtapa` e o percentual. Também recusa se a trilha ficaria sem etapas (RB03). |
| **Valor** | Mariana atualiza o catálogo sem corromper silenciosamente a evolução dos alunos. |
| **RF** | RF11 (remoção no contexto de etapa já vinculada) |
| **RB** | RB11, RB06, RB12, RB02, RB03 (trilha restante ainda precisa de 1..* etapas) |
| **RNF** | RNF05, RNF06, RNF03, RNF07 |
| **UC / fluxo** | UC02-A5; UC02-E3 |
| **Entidades** | `Etapa`, `Trilha`, `Progresso`, `ConclusaoEtapa` |
| **Drivers** | AD-RF04, AD-CEN05, AD-CEN02 |
| **ADRs** | ADR-004, ADR-003 |
| **Dependências** | SPEC-003, SPEC-004 |
| **Justificativa da ordem** | O critério de validação é distinto do CRUD de catálogo (não é delete genérico). Só é testável depois que alunos já possuem progresso. Completa o UC02 antes de introduzir o LLM. |
| **OPEN associados** | Resolvido: OPEN-07 |

### SPEC-006 — Criar trilha personalizada com agente LLM

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-006 |
| **Nome** | Criar trilha personalizada com agente LLM |
| **Objetivo** | Permitir que o aluno autenticado envie objetivos em linguagem natural, obtenha uma `Trilha` do tipo `personalizada` a partir de `SolicitacaoTrilha` (texto + `respostaLLM` JSON), na categoria sentinela **Personalizada**, com etapas ordenadas em Markdown, associada via `Progresso`, reutilizando o acompanhamento da SPEC-004. Introduz a porta LLM no backend (**Gemini**, desligável pelo administrador, síncrona, timeout 60 s). |
| **Valor** | Lucas descreve uma meta específica e recebe um percurso persistido para acompanhar, sem montar o plano à mão. |
| **RF** | RF04, RF13; reutiliza RF05–RF07 já estabelecidos |
| **RB** | RB01, RB03, RB08, RB09, RB10 |
| **RNF** | RNF02, RNF03 (caminho local continua &lt; 2 s; esta operação **não** entra no orçamento), RNF05, RNF07 |
| **UC / fluxo** | UC01-A3; E2 LLM indisponível; E3 resposta insuficiente |
| **Entidades** | `SolicitacaoTrilha`, `Trilha` (`tipo = personalizada`), `Etapa`, `Progresso`, `Categoria` |
| **Drivers** | AD-RF01, AD-C02, AD-CEN01, AD-QA01, AD-QA03 |
| **ADRs** | ADR-002, ADR-003, ADR-004 |
| **Dependências** | SPEC-002 (categoria), SPEC-004 (acompanhamento uniforme) |
| **Justificativa da ordem** | Segunda origem de trilha (ADR-003), depois que o núcleo de acompanhamento já existe. A porta LLM nasce aqui porque é a primeira capacidade que a exige; não há Spec isolada “implementar LLM”. Catálogo permanece utilizável se a função estiver desligada. |
| **OPEN associados** | Resolvidos: OPEN-06, OPEN-08, OPEN-09, OPEN-19, OPEN-20, OPEN-22 |

### SPEC-007 — Conversar com o agente LLM sobre a trilha

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-007 |
| **Nome** | Conversar com o agente LLM sobre a trilha |
| **Objetivo** | Permitir que o aluno envie `Mensagem` na interface de conversa referida **obrigatoriamente** à trilha em andamento e receba apoio ao estudo, sem criar, alterar ou substituir trilhas pré-definidas. Sem progresso ativo, a conversa é recusada. Timeout 60 s. |
| **Valor** | Lucas tira dúvidas e recebe sugestões de apoio sem perder a confiança no catálogo curado. |
| **RF** | RF08 |
| **RB** | RB10, RB01 |
| **RNF** | RNF02, RNF03 (conversa fora do SLA local), RNF01, RNF04, RNF05, RNF07 |
| **UC / fluxo** | UC01-A5; degradação análoga a E2 se o LLM falhar (não persistir efeito em catálogo) |
| **Entidades** | `Mensagem`, `Aluno`, `Trilha` (referência obrigatória) |
| **Drivers** | AD-CEN03, AD-C02, AD-QA03 |
| **ADRs** | ADR-002, ADR-003 |
| **Dependências** | SPEC-004 (trilha em acompanhamento), SPEC-006 (porta LLM) |
| **Justificativa da ordem** | Apoio opcional (relação «extend»). Depende do acompanhamento e da porta já introduzida. Separada da SPEC-006 porque o resultado é `Mensagem`, não `Trilha`, e RB10 é o invariante central distinto da criação personalizada. |
| **OPEN associados** | Resolvidos: OPEN-06, OPEN-14, OPEN-20 |

---

## 3. Questões humanas (OPEN) — resolvidas

Texto completo e status em [`decisoes-em-aberto.md`](decisoes-em-aberto.md). Nenhuma permanece `em aberto`.

| ID | Decisão | Spec |
|---|---|---|
| OPEN-01 | MySQL / MariaDB | SPEC-001 |
| OPEN-02 | NestJS | SPEC-001 |
| OPEN-03 | Tailwind CSS + shadcn/ui | SPEC-001 |
| OPEN-04 | App Router | SPEC-001 |
| OPEN-05 | JWT Bearer | SPEC-001 |
| OPEN-06 | Gemini; interruptor na UI do administrador | SPEC-006, SPEC-007 |
| OPEN-07 | Bloquear remoção de etapa com progresso; preservar conclusões; recusar trilha vazia | SPEC-005 |
| OPEN-08 | Categoria sentinela **Personalizada** | SPEC-006, SPEC-002 |
| OPEN-09 | JSON `titulo`, `descricao`, etapas `{titulo, conteudo, ordem}` | SPEC-006 |
| OPEN-10 | Primeiro admin por seed | SPEC-001 |
| OPEN-11 | E-mail único, senha com hash, recuperação por e-mail | SPEC-001 |
| OPEN-12 | XOR de perfil | SPEC-001 |
| OPEN-13 | Anônimo lista o catálogo | SPEC-004 |
| OPEN-14 | Conversa exige trilha em andamento | SPEC-007 |
| OPEN-15 | Sem pausar/reiniciar; `ativo` só distingue vigente | SPEC-004 |
| OPEN-16 | `Etapa.conteudo` é Markdown | SPEC-003 |
| OPEN-17 | Recomendação da visão **fora de escopo** | nenhuma Spec |
| OPEN-18 | Logout explícito | SPEC-001 |
| OPEN-19 | Geração síncrona | SPEC-006 |
| OPEN-20 | Timeout 60 s | SPEC-006, SPEC-007 |
| OPEN-21 | UC01 exclusivo do aluno | SPEC-001, SPEC-004 |
| OPEN-22 | Catálogo vazio + LLM off: mensagem; não cria trilha | SPEC-004, SPEC-006 |
| OPEN-23 | Bloquear remoção de categoria com trilhas | SPEC-002 |

---

## 4. O que deliberadamente não virou Spec

- RNFs transversais (responsividade, usabilidade, browsers, modularidade, SLA local).
- “Implementar frontend / backend / banco”.
- Motor de recomendação da visão (INC-01 / OPEN-17).
- Microserviços, BFF extra, app nativo (rejeitados ou não pedidos pelos ADs).
- Cache de catálogo e provedor de identidade externo (ainda não decididos; não inventar).

---

## 5. Texto completo das Specs

O índice deste mapa permanece a ordem de implementação. O conteúdo completo (seções 1–14 do prompt SDD, status da Spec e **status de layout**) está em [`specs.md`](specs.md). Status inicial: Spec `especificada`, layout `pendente`.

**Portão:** o código de uma Spec só começa depois do layout `aprovado` (evidências em [`layout/`](layout/)).

**Próximo passo humano:** aprovar o layout da SPEC-001.

**Próximo passo de implementação (só após o layout da SPEC-001 estar `aprovado`):** implementar SPEC-001.
