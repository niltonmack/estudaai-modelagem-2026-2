# Decisões em aberto — EstudaAI

**Status do registro:** entrevista concluída (23 / 23) e **absorvida na baseline**  
**Origem:** [`mapa-specs.md`](mapa-specs.md) §3  
**Regra:** a implementação **não** reabre o que está `decidido` ou `fora de escopo`. Este arquivo permanece como rastreio da entrevista; RF, RB, RNF, UC, modelo, drivers e ADRs já refletem as respostas.

Legenda de status:

| Status | Significado |
|---|---|
| `em aberto` | Ainda não decidido; Spec e código devem registrar OPEN, não inventar |
| `decidido` | Resposta humana registrada **e** incorporada à baseline |
| `fora de escopo` | Explicitamente excluído desta versão |

---

## OPEN-01 — SGBD e esquema físico

| Campo | Conteúdo |
|---|---|
| **Pergunta** | Qual SGBD persistirá o modelo conceitual? O esquema físico permanece derivado do modelo, sem antecipar tabelas neste registro. |
| **Specs** | SPEC-001 |
| **Baseline** | Drivers §8 e ADRs: banco específico ainda não tinha sido escolhido; agora MySQL/MariaDB consta como complemento reversível em [`adr.md`](adr.md). |
| **Status** | `decidido` |
| **Decisão** | MySQL / MariaDB |
| **Notas** | Esquema físico permanece derivado do modelo conceitual; esta decisão escolhe o SGBD, não o desenho das tabelas. |

## OPEN-02 — Framework HTTP da API Node

| Campo | Conteúdo |
|---|---|
| **Pergunta** | Qual framework HTTP a API Node usará (Express, Fastify, Nest ou outro)? |
| **Specs** | SPEC-001 |
| **Baseline** | ADR-001: a troca cabe atrás da mesma API e não reescreve o domínio. |
| **Status** | `decidido` |
| **Decisão** | NestJS |
| **Notas** | Cabe atrás da API de domínio (ADR-001). A troca de framework HTTP não reescreve `Trilha` / `Progresso`. |

## OPEN-03 — Biblioteca de UI/CSS no Next.js

| Campo | Conteúdo |
|---|---|
| **Pergunta** | Qual biblioteca de UI/CSS o frontend Next.js usará? |
| **Specs** | SPEC-001 |
| **Baseline** | ADR: escolha reversível; não altera o contrato com a API Node. |
| **Status** | `decidido` |
| **Decisão** | Tailwind CSS + shadcn/ui |
| **Notas** | Não altera o contrato HTTP com a API Node. |

## OPEN-04 — App Router versus Pages Router

| Campo | Conteúdo |
|---|---|
| **Pergunta** | O Next.js usará App Router ou Pages Router? |
| **Specs** | SPEC-001 |
| **Baseline** | ADR-001 deixa a escolha em aberto; ambos cabem no mesmo framework. |
| **Status** | `decidido` |
| **Decisão** | App Router |
| **Notas** | Route Handlers e Server Actions do Next.js não substituem a API Nest nem o adaptador LLM (ADR-001, ADR-002, ADR-004). |

## OPEN-05 — Mecanismo de autenticação na API

| Campo | Conteúdo |
|---|---|
| **Pergunta** | A API autenticará com JWT, sessão/cookie ou outro mecanismo? A fronteira ADR-004 (regras no servidor) permanece. |
| **Specs** | SPEC-001 |
| **Baseline** | ADR-004: o mecanismo pode mudar desde que autorização e invariantes continuem na API. |
| **Status** | `decidido` |
| **Decisão** | JWT (token Bearer) |
| **Notas** | Autorização e invariantes continuam na API Nest (ADR-004). O Next.js é cliente; esconder botões na UI não é a restrição. |

## OPEN-06 — Provedor LLM e interruptor da função

| Campo | Conteúdo |
|---|---|
| **Pergunta** | Qual provedor LLM fica ligado em cada ambiente (OpenAI, Ollama, ambos) e como a função é habilitada ou desabilitada? |
| **Specs** | SPEC-006, SPEC-007 |
| **Baseline** | RNF02/ADR-002 restringiam OpenAI ou Ollama. A entrevista escolheu Gemini; a baseline foi atualizada. |
| **Status** | `decidido` (baseline atualizada) |
| **Decisão** | Provedor: Gemini. Interruptor: interface do administrador. |
| **Notas** | RNF02, ADR-002, AD-C02 e RF13 passam a registrar Gemini e o interruptor administrativo. A porta (texto in → estrutura out) permanece; o domínio não acopla o SDK. |

## OPEN-07 — Política concreta de RB11 após confirmação

| Campo | Conteúdo |
|---|---|
| **Pergunta** | Depois que o administrador confirmar a remoção de uma etapa em uso: a etapa é excluída ou desativada? O que acontece com `ConclusaoEtapa`? Como o percentual é recalculado? E se a trilha ficaria sem etapas (RB03)? |
| **Specs** | SPEC-005 |
| **Baseline** | UC02-A5 pede confirmação, recálculo e preservação de histórico válido, sem detalhar o tratamento. |
| **Status** | `decidido` |
| **Decisão** | Não permitir remoção da etapa se houver progresso de alunos na trilha; só remover ou desassociar quando ninguém a utiliza. `ConclusaoEtapa` já registradas são preservadas no histórico. Recusar a remoção se a trilha ficaria sem etapas (RB03). |
| **Notas** | Com essa política, o percentual dos acompanhamentos vigentes não muda por remoção (a etapa em uso não sai). O recálculo só se aplica se a etapa for removida de trilha **sem** progresso vigente, restando 1..* etapas. |

## OPEN-08 — Categoria da trilha personalizada

| Campo | Conteúdo |
|---|---|
| **Pergunta** | Como a trilha personalizada obtém a `Categoria` exigida por RB03: o LLM escolhe uma existente, existe categoria sentinela, ou o aluno informa? |
| **Specs** | SPEC-006 |
| **Baseline** | UC01-A3 cria trilha personalizada com categoria; não diz a origem. |
| **Status** | `decidido` |
| **Decisão** | Categoria sentinela fixa, de nome **Personalizada**. |
| **Notas** | Essa categoria precisa existir no catálogo (SPEC-002) para a SPEC-006 persistir trilha personalizada em conformidade com RB03. Não é escolhida pelo LLM nem pelo aluno. |

## OPEN-09 — Contrato de `respostaLLM`

| Campo | Conteúdo |
|---|---|
| **Pergunta** | Qual estrutura a `respostaLLM` precisa ter para materializar etapas ordenadas (e categoria, se couber)? |
| **Specs** | SPEC-006 |
| **Baseline** | ADR-002: “texto in → estrutura de trilha out”. UC01-E3 recusa resposta insuficiente. |
| **Status** | `decidido` |
| **Decisão** | `respostaLLM` é JSON com `titulo` e `descricao` da trilha e lista de etapas `{titulo, conteudo, ordem}`. |
| **Notas** | Categoria não vem do LLM (OPEN-08: sentinela **Personalizada**). Se faltar titulo/descrição ou não houver 1..* etapas ordenadas, aplica-se UC01-E3: não persiste a trilha. |

## OPEN-10 — Primeiro administrador

| Campo | Conteúdo |
|---|---|
| **Pergunta** | Como nasce o primeiro `Administrador` (seed, promoção de usuário, cadastro distinto)? |
| **Specs** | SPEC-001 |
| **Baseline** | UC02 pressupõe que a conta administrativa já existe. Não há RF de promoção. |
| **Status** | `decidido` |
| **Decisão** | O primeiro administrador nasce por seed/script na implantação. |
| **Notas** | Não há RF de promoção nem cadastro administrativo distinto nesta versão. |

## OPEN-11 — E-mail, senha e recuperação

| Campo | Conteúdo |
|---|---|
| **Pergunta** | E-mail é único? Há política de senha, recuperação e requisito de armazenamento (o modelo só tem `senha`)? |
| **Specs** | SPEC-001 |
| **Baseline** | Modelo conceitual registra `Usuario.email` e `Usuario.senha` sem restrições extras. |
| **Status** | `decidido` |
| **Decisão** | E-mail único; senha armazenada com hash; recuperação de senha por e-mail nesta versão. |
| **Notas** | O modelo conceitual continua com o atributo `senha`; o armazenamento concreto é hash, não texto aberto. Comprimento mínimo e demais regras de política de senha não foram detalhados aqui. |

## OPEN-12 — Perfis Aluno e Administrador

| Campo | Conteúdo |
|---|---|
| **Pergunta** | Um `Usuario` é só aluno, só administrador, ou pode acumular os dois perfis? |
| **Specs** | SPEC-001 |
| **Baseline** | Texto: “todo usuário é aluno ou administrador”. Cardinalidade 0..1 em cada subtipo não fecha XOR. |
| **Status** | `decidido` |
| **Decisão** | XOR: um `Usuario` é **só** aluno **ou** **só** administrador. Não acumula os dois perfis. |
| **Notas** | Fecha a ambiguidade INC-05 / cardinalidade 0..1. O administrador não é também aluno (ver OPEN-21). |

## OPEN-13 — Catálogo anônimo

| Campo | Conteúdo |
|---|---|
| **Pergunta** | A listagem do catálogo (RF03) exige autenticação ou pode ser vista por anônimo? Escolher trilha e registrar progresso continuam exigindo login (RB01). |
| **Specs** | SPEC-004 |
| **Baseline** | RB01 cobre selecionar/criar/progresso. UC01 e a persona começam autenticados. |
| **Status** | `decidido` |
| **Decisão** | Anônimo pode listar o catálogo. Escolher trilha, criar personalizada e registrar progresso exigem autenticação (RB01). |
| **Notas** | RF03 na listagem não exige sessão; a persona autenticada no início do UC01 permanece válida para o acompanhamento. |

## OPEN-14 — Conversa sem trilha

| Campo | Conteúdo |
|---|---|
| **Pergunta** | A conversa (RF08) exige trilha em andamento, ou `Mensagem` pode existir sem `Trilha`? |
| **Specs** | SPEC-007 |
| **Baseline** | Modelo: `Mensagem` refere-se a `Trilha` 0..1. RF08 e persona falam de apoio à trilha em andamento. |
| **Status** | `decidido` |
| **Decisão** | A conversa (RF08) exige trilha em andamento. `Mensagem` sempre se refere a uma `Trilha`. |
| **Notas** | Restringe a cardinalidade 0..1 do modelo: nesta versão a associação é obrigatória. Sem progresso ativo, o sistema recusa a conversa. |

## OPEN-15 — Pausar, abandonar ou reiniciar progresso

| Campo | Conteúdo |
|---|---|
| **Pergunta** | Existe operação para pausar, abandonar ou reiniciar `Progresso` (`ativo`), ou o atributo só distingue acompanhamento vigente? |
| **Specs** | SPEC-004 |
| **Baseline** | `Progresso.ativo` existe; não há RF correspondente. |
| **Status** | `decidido` |
| **Decisão** | Sem operação de pausar, abandonar ou reiniciar nesta versão. `Progresso.ativo` só distingue acompanhamento vigente. |
| **Notas** | UC01-A6 (retomar progresso existente) permanece; não há fluxo novo de inativação ou restart. |

## OPEN-16 — Formato de `Etapa.conteudo`

| Campo | Conteúdo |
|---|---|
| **Pergunta** | Qual o formato e as restrições de `Etapa.conteudo` (texto simples, markdown, URL, mídia)? |
| **Specs** | SPEC-003 |
| **Baseline** | Modelo conceitual: atributo `conteudo`, sem tipo. |
| **Status** | `decidido` |
| **Decisão** | `Etapa.conteudo` é Markdown. |
| **Notas** | Não inclui mídia embutida obrigatória nem tipo URL exclusivo; links podem aparecer no próprio Markdown. |

## OPEN-17 — Recomendação inteligente da visão

| Campo | Conteúdo |
|---|---|
| **Pergunta** | A “recomendação inteligente” e a “adaptação ao perfil e ritmo” da visão entram nesta versão ou ficam fora até haver RF? |
| **Specs** | Nenhuma |
| **Baseline** | Visão do produto cita o algoritmo; RF/RB/UC não cobrem. INC-01. |
| **Status** | `fora de escopo` |
| **Decisão** | A “recomendação inteligente” e a “adaptação ao perfil e ritmo” da visão **não** entram nesta versão. |
| **Notas** | INC-01 permanece documentado. Nenhuma Spec até existir RF. Não implementar motor de ranking. |

## OPEN-18 — Logout

| Campo | Conteúdo |
|---|---|
| **Pergunta** | Há encerramento explícito de sessão (logout), embora não exista RF? |
| **Specs** | SPEC-001 |
| **Baseline** | RF02 cobre login; não há RF de logout. |
| **Status** | `decidido` |
| **Decisão** | Há encerramento explícito de sessão (logout) nesta versão. |
| **Notas** | Complementa RF02 na SPEC-001. Não havia RF de logout na baseline; esta decisão humana o inclui. |

## OPEN-19 — Geração LLM síncrona versus fila

| Campo | Conteúdo |
|---|---|
| **Pergunta** | A criação da trilha personalizada permanece no fluxo síncrono do aluno (UC01-A3) ou haverá fila assíncrona? |
| **Specs** | SPEC-006 |
| **Baseline** | Drivers §8: fila é possível, não exigida; UC01 trata a geração no fluxo do aluno. |
| **Status** | `decidido` |
| **Decisão** | Geração da trilha personalizada permanece **síncrona** no fluxo do aluno (UC01-A3). Sem fila. |
| **Notas** | Timeout em OPEN-20. Falha ou estouro de tempo: UC01-E2/E3, sem persistir trilha. |

## OPEN-20 — Timeout da chamada ao LLM

| Campo | Conteúdo |
|---|---|
| **Pergunta** | Qual o timeout e os limites numéricos da chamada ao LLM (geração e conversa)? |
| **Specs** | SPEC-006, SPEC-007 |
| **Baseline** | AD-CEN01 pede limite de tempo; RNF03 exclui LLM do SLA de 2 s; valor não definido. |
| **Status** | `decidido` |
| **Decisão** | Timeout de **60 segundos** para geração (SPEC-006) e conversa (SPEC-007). |
| **Notas** | Essa chamada **não** entra no SLA de 2 s (RNF03). Ao estourar: informar falha e não persistir trilha inválida (geração) nem alterar o catálogo (conversa). |

## OPEN-21 — Administrador no UC01

| Campo | Conteúdo |
|---|---|
| **Pergunta** | O administrador pode acompanhar trilhas como no UC01, ou esse fluxo é exclusivo do aluno? |
| **Specs** | SPEC-001, SPEC-004 |
| **Baseline** | AD-RF02 marca UC01 como “fora” para o administrador. Não há RF que permita nem proíba. |
| **Status** | `decidido` |
| **Decisão** | UC01 é exclusivo do aluno. Administrador não acompanha trilhas. |
| **Notas** | Coerente com OPEN-12 (XOR). Confirma AD-RF02 (“fora do UC01” para o administrador). |

## OPEN-22 — Catálogo vazio e LLM desligado

| Campo | Conteúdo |
|---|---|
| **Pergunta** | O que o aluno vê se não houver trilha pré-definida e o LLM estiver desabilitado? |
| **Specs** | SPEC-004, SPEC-006 |
| **Baseline** | Pré-condição do UC01: catálogo **ou** LLM. O caso “nenhum dos dois” não está especificado. |
| **Status** | `decidido` |
| **Decisão** | Exibir mensagem de catálogo indisponível; o aluno não cria trilha nesse estado. |
| **Notas** | Pré-condição do UC01 falsa (sem catálogo e sem LLM). Nenhuma `Trilha` personalizada é persistida. |

## OPEN-23 — Remoção de categoria com trilhas

| Campo | Conteúdo |
|---|---|
| **Pergunta** | O que ocorre ao remover uma `Categoria` que ainda classifica trilhas (bloquear, cascata, exigir recategorização)? |
| **Specs** | SPEC-002 |
| **Baseline** | RF09 permite remover categoria; não há RB de integridade equivalente a RB11. |
| **Status** | `decidido` |
| **Decisão** | Bloquear a remoção da `Categoria` enquanto houver trilhas classificadas nela. |
| **Notas** | Sem cascata e sem recategorização automática. Alinha-se a OPEN-07 (não destruir catálogo em uso). A sentinela **Personalizada** (OPEN-08) também não pode ser removida se houver trilhas personalizadas. |
---

## Resumo

| ID | Tema | Status |
|---|---|---|
| OPEN-01 | SGBD | `decidido` — MySQL / MariaDB |
| OPEN-02 | Framework HTTP Node | `decidido` — NestJS |
| OPEN-03 | UI/CSS Next.js | `decidido` — Tailwind CSS + shadcn/ui |
| OPEN-04 | App Router vs Pages | `decidido` — App Router |
| OPEN-05 | JWT vs sessão | `decidido` — JWT (Bearer) |
| OPEN-06 | Provedor LLM | `decidido` — Gemini + interruptor admin (RNF02 / ADR-002 atualizados) |
| OPEN-07 | Política RB11 | `decidido` — bloquear remoção se houver progresso; preservar conclusões; recusar trilha vazia |
| OPEN-08 | Categoria da personalizada | `decidido` — sentinela **Personalizada** |
| OPEN-09 | Contrato respostaLLM | `decidido` — JSON titulo, descricao, etapas `{titulo, conteudo, ordem}` |
| OPEN-10 | Primeiro admin | `decidido` — seed/script na implantação |
| OPEN-11 | E-mail e senha | `decidido` — e-mail único, senha com hash, recuperação por e-mail |
| OPEN-12 | Perfis XOR ou ambos | `decidido` — XOR (só aluno ou só administrador) |
| OPEN-13 | Catálogo anônimo | `decidido` — anônimo lista; ações de trilha exigem login |
| OPEN-14 | Conversa sem trilha | `decidido` — exige trilha em andamento |
| OPEN-15 | Pausar/reiniciar progresso | `decidido` — sem operação; `ativo` só distingue vigente |
| OPEN-16 | Formato de conteúdo | `decidido` — Markdown |
| OPEN-17 | Recomendação da visão | `fora de escopo` nesta versão |
| OPEN-18 | Logout | `decidido` — encerramento explícito de sessão |
| OPEN-19 | LLM síncrono vs fila | `decidido` — síncrono no fluxo do aluno |
| OPEN-20 | Timeout LLM | `decidido` — 60 segundos |
| OPEN-21 | Admin no UC01 | `decidido` — exclusivo do aluno |
| OPEN-22 | Catálogo vazio + LLM off | `decidido` — mensagem de indisponível; não cria trilha |
| OPEN-23 | Remover categoria em uso | `decidido` — bloquear enquanto houver trilhas |

Progresso da entrevista: **23 / 23** fechadas (22 decididas, 1 fora de escopo).

Nenhuma OPEN permanece `em aberto`. A implementação deve obedecer a este registro **e** à baseline atualizada. A divergência OPEN-06 (Gemini) foi incorporada em RNF02, ADR-002, AD-C02 e RF13.
