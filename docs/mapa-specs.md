# Mapa de Specs — EstudaAI

**Status:** aguardando aprovação humana  
**Origem:** Prompt SDD (`docs/Prompt_SDD_Specs.pdf`) aplicado à baseline de modelagem  
**Data:** 2026-09-16

Este documento é **somente o índice ordenado**. Não contém o texto completo das Specs, não implementa código e não escolhe tecnologias ainda em aberto.

Para gerar o conteúdo de uma Spec após a aprovação deste mapa, solicitar: `Gerar SPEC-XXX`.

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
| RNF02 | LLM opcional e substituível (OpenAI ou Ollama) |
| RNF03 | Ações principais sem LLM &lt; 2 s |
| RNF05, RNF06 | Autenticação e autorização na operação, não só na UI |
| RNF07 | Módulos Node (API) + React/Next.js (UI) |

### 1.5 Restrições e decisões já tomadas

| ID | Decisão |
|---|---|
| ADR-001 | Frontend Next.js (React) e API de domínio em Node — dois artefatos |
| ADR-002 | LLM só no backend, atrás de porta; provedor intercambiável; função desligável |
| ADR-003 | Uma entidade `Trilha` com `tipo`; catálogo curado ≠ conversa |
| ADR-004 | Autenticação, perfil e invariantes impostos na API Node |
| AD-C01 / AD-C03 | Entrega web; sem app nativo; sem microserviços exigidos |
| AD-QA01 | Isolar I/O do LLM do caminho síncrono local |

### 1.6 Decisões em aberto

Registradas como `OPEN-XX` em §3. **Não foram resolvidas neste mapa.** Incluem SGBD, framework HTTP do Node, mecanismo de sessão, provedor LLM por ambiente, política concreta de RB11 após confirmação, origem da `Categoria` em trilha personalizada, e criação do primeiro administrador.

### 1.7 Inconsistências, lacunas e ambiguidades

Não resolvidas silenciosamente.

| ID | Tipo | Descrição |
|---|---|---|
| INC-01 | Inconsistência | A [visão do produto](visaodoproduto.md) fala em “algoritmo inteligente de recomendação” e “adaptação ao perfil e ritmo”. Não há RF, RB, UC nem entidade para ranking, perfil de ritmo ou motor de recomendação. **Não vira Spec.** |
| INC-02 | Inconsistência menor | A visão cita interface em React; [README](../README.md) e ADR-001 adotam Next.js como framework React. A ADR prevalece; a visão está desatualizada. |
| INC-03 | Lacuna | Não há RF para criação/promoção do primeiro `Administrador`. UC02 pressupõe que a conta já existe. |
| INC-04 | Lacuna | `Usuario.senha` aparece no modelo conceitual; não há política de senha, unicidade de e-mail, recuperação nem requisito de armazenamento. |
| INC-05 | Ambiguidades | Cardinalidade permite `Aluno` e `Administrador` como especializações 0..1; o texto diz “todo usuário é aluno ou administrador”. XOR versus perfis simultâneos não está fechado. |
| INC-06 | Ambiguidades | RB01 exige autenticação para *selecionar* trilha, criar personalizada e registrar progresso. Não afirma o mesmo para *listar* o catálogo. UC01 e a persona começam autenticados. |
| INC-07 | Lacuna | RB11 manda “tratar o impacto”, e UC02-A5 pede confirmação, recálculo e preservação de histórico válido. Não define se a etapa é excluída, se `ConclusaoEtapa` é apagada ou desvinculada, nem o que ocorre com `ordem` das etapas restantes. |
| INC-08 | Lacuna | Trilha personalizada deve ter `Categoria` (RB03, UC01-A3). Não está definido se o LLM escolhe uma categoria existente, se existe categoria sentinela ou se o aluno informa. |
| INC-09 | Lacuna | Formato de `respostaLLM` para materializar `Etapa` ordenadas não está especificado (ADR-002 só diz “texto in → estrutura de trilha out”). |
| INC-10 | Ambiguidades | `Mensagem` pode existir sem `Trilha` (0..1). RF08 e a persona falam de apoio *à trilha em andamento*. |
| INC-11 | Lacuna | `Progresso.ativo` existe; não há RF para pausar, abandonar ou reiniciar trilha. |
| INC-12 | Lacuna | Formato de `Etapa.conteudo` (texto, markdown, URL, mídia) não está definido. |
| INC-13 | Lacuna | Logout / encerramento de sessão não possui RF. |
| INC-14 | Lacuna | Comportamento se o catálogo estiver vazio e o LLM desabilitado (pré-condição do UC01 falsa). |
| INC-15 | Ambiguidades | AD-RF02 marca operações do UC01 como “fora” para o administrador. Não há RF que permita ou proíba o admin acompanhar trilhas como aluno. |

---

## 2. Mapa ordenado de Specs

Decomposição **vertical por capacidade**. RF09–RF12 não viraram “implementar admin”; RF03–RF07 não viraram “implementar aluno”. RNFs transversais foram associados, não transformados em Specs. A porta LLM entra na primeira capacidade que a exige (SPEC-006), não como Spec isolada de infraestrutura.

### SPEC-001 — Cadastrar, autenticar e autorizar por perfil

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-001 |
| **Nome** | Cadastrar, autenticar e autorizar por perfil |
| **Objetivo** | Permitir registro de conta, login e liberação de funções conforme `Aluno` ou `Administrador`, com regras impostas na API Node. |
| **Valor** | Lucas e Mariana entram no sistema com identidade confiável; o restante das capacidades passa a ter fronteira de acesso. Esta Spec também estabelece os dois artefatos de entrega (Next.js + API Node) exigidos por ADR-001, porque sem essa fronteira a autorização da ADR-004 não tem onde viver. |
| **RF** | RF01, RF02 |
| **RB** | RB01, RB02 |
| **RNF** | RNF05, RNF06, RNF07, RNF01, RNF04, RNF08, RNF03 |
| **UC / fluxo** | UC01 «include» autenticar; UC02 «include» autenticar; A1 cadastro; A2 credenciais inválidas |
| **Entidades** | `Usuario`, `Aluno`, `Administrador` |
| **Drivers** | AD-RF02, AD-C01, AD-C03, AD-QA02, AD-QA04, AD-QA05 |
| **ADRs** | ADR-001, ADR-004 |
| **Dependências** | Nenhuma |
| **Justificativa da ordem** | Nenhuma outra Spec de trilha, catálogo ou progresso pode ser validada sem identidade. É a primeira capacidade observável do sistema. |
| **OPEN associados** | OPEN-01, OPEN-02, OPEN-03, OPEN-04, OPEN-05, OPEN-10, OPEN-11, OPEN-12, OPEN-18, OPEN-21 |

### SPEC-002 — Gerenciar categorias de aprendizagem

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-002 |
| **Nome** | Gerenciar categorias de aprendizagem |
| **Objetivo** | Permitir que o administrador cadastre, consulte, altere e remova categorias. |
| **Valor** | Mariana organiza o catálogo por área; RB03 passa a ter onde classificar trilhas. |
| **RF** | RF09 |
| **RB** | RB02, RB03 (categoria como pré-requisito de trilha) |
| **RNF** | RNF05, RNF06, RNF03, RNF04, RNF07 |
| **UC / fluxo** | UC02 fluxo principal passo 3; A2 consultar; A3 alterar; A4 remover sem vínculo |
| **Entidades** | `Categoria` |
| **Drivers** | AD-RF04, AD-CEN04, AD-QA02 |
| **ADRs** | ADR-004 |
| **Dependências** | SPEC-001 |
| **Justificativa da ordem** | Toda `Trilha` exige exatamente uma `Categoria` (RB03). Sem esta Spec, SPEC-003 não publica trilha válida. |
| **OPEN associados** | — (remoção de categoria com trilhas vinculadas não tem RB próprio; não inventar política) |

Observação: não há RB equivalente a RB11 para remoção de categoria. Se a baseline não define o que ocorre com trilhas classificadas, isso permanece em aberto na Spec detalhada (`OPEN-23`).

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
| **UC / fluxo** | UC02 fluxo principal passos 4–8; A2; A3; A4 (remoção **sem** progresso); A6 reordenar; E1; E2 trilha incompleta |
| **Entidades** | `Categoria`, `Trilha` (`tipo = pré-definida`), `Etapa` |
| **Drivers** | AD-RF01, AD-RF04, AD-CEN04, AD-C04, AD-QA01 |
| **ADRs** | ADR-003, ADR-004 |
| **Dependências** | SPEC-002 |
| **Justificativa da ordem** | RF10+RF11+RF12 formam um único comportamento publicável (trilha curada completa). Separar “CRUD de trilha” de “CRUD de etapa” deixaria a Spec sem valor observável para o aluno. Remoção **com** alunos em andamento fica na SPEC-005, porque depende de progresso ainda inexistente e tem critério de validação distinto (RB11). |
| **OPEN associados** | OPEN-16, OPEN-23 (impacto em categoria), parte de OPEN-07 restrita a “ainda não há progresso” |

### SPEC-004 — Acompanhar trilha pré-definida

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-004 |
| **Nome** | Acompanhar trilha pré-definida |
| **Objetivo** | Permitir que o aluno autenticado consulte o catálogo por categoria, escolha uma trilha pré-definida, visualize etapas/conteúdos/sequência, inicie ou retome `Progresso` individual, marque conclusão explícita e veja percentual derivado e histórico. |
| **Valor** | Lucas inicia um percurso em poucos minutos, sabe a próxima etapa e percebe evolução sem ambiguidade. |
| **RF** | RF03, RF05, RF06, RF07 |
| **RB** | RB01, RB03, RB04, RB05, RB06, RB07, RB12 |
| **RNF** | RNF01, RNF03, RNF04, RNF05, RNF08, RNF07 |
| **UC / fluxo** | UC01 fluxo principal; A4 só consultar progresso; A6 retomar; E1 sem autenticação |
| **Entidades** | `Aluno`, `Categoria`, `Trilha`, `Etapa`, `Progresso`, `ConclusaoEtapa` |
| **Drivers** | AD-RF01, AD-RF03, AD-CEN02, AD-QA01, AD-QA04 |
| **ADRs** | ADR-003, ADR-004 |
| **Dependências** | SPEC-001, SPEC-003 |
| **Justificativa da ordem** | É o caminho feliz do produto sem LLM. Agrupa catálogo + visualização + progresso porque UC01 trata acompanhamento como um objetivo único e RF05–RF07 não se validam isolados (percentual precisa de etapas e de conclusões). RF04 e RF08 ficam de fora: origens, falhas e RNF diferentes. |
| **OPEN associados** | OPEN-13, OPEN-14, OPEN-15, OPEN-21 |

### SPEC-005 — Tratar impacto da remoção de etapa em uso

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-005 |
| **Nome** | Tratar impacto da remoção de etapa em uso |
| **Objetivo** | Quando o administrador solicitar remoção de `Etapa` vinculada a trilha com `Progresso` ativo, o sistema identifica afetados, exige confirmação ou cancelamento e só então conclui a operação, preservando consistência do percentual e do histórico válido. |
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
| **OPEN associados** | OPEN-07 |

### SPEC-006 — Criar trilha personalizada com agente LLM

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-006 |
| **Nome** | Criar trilha personalizada com agente LLM |
| **Objetivo** | Permitir que o aluno autenticado envie objetivos em linguagem natural, obtenha uma `Trilha` do tipo `personalizada` a partir de `SolicitacaoTrilha` (texto + `respostaLLM`), com categoria e etapas ordenadas, associada via `Progresso`, reutilizando visualização e acompanhamento da SPEC-004. Introduz a porta LLM no backend (OpenAI ou Ollama, desligável). |
| **Valor** | Lucas descreve uma meta específica e recebe um percurso persistido para acompanhar, sem montar o plano à mão. |
| **RF** | RF04; reutiliza RF05–RF07 já estabelecidos |
| **RB** | RB01, RB03, RB08, RB09, RB10 |
| **RNF** | RNF02, RNF03 (caminho local continua &lt; 2 s; esta operação **não** entra no orçamento), RNF05, RNF07 |
| **UC / fluxo** | UC01-A3; E2 LLM indisponível; E3 resposta insuficiente |
| **Entidades** | `SolicitacaoTrilha`, `Trilha` (`tipo = personalizada`), `Etapa`, `Progresso`, `Categoria` |
| **Drivers** | AD-RF01, AD-C02, AD-CEN01, AD-QA01, AD-QA03 |
| **ADRs** | ADR-002, ADR-003, ADR-004 |
| **Dependências** | SPEC-002 (categoria), SPEC-004 (acompanhamento uniforme) |
| **Justificativa da ordem** | Segunda origem de trilha (ADR-003), depois que o núcleo de acompanhamento já existe. A porta LLM nasce aqui porque é a primeira capacidade que a exige; não há Spec isolada “implementar LLM”. Catálogo permanece utilizável se a função estiver desligada. |
| **OPEN associados** | OPEN-06, OPEN-08, OPEN-09, OPEN-14, OPEN-19, OPEN-20 |

### SPEC-007 — Conversar com o agente LLM sobre a trilha

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-007 |
| **Nome** | Conversar com o agente LLM sobre a trilha |
| **Objetivo** | Permitir que o aluno envie `Mensagem` na interface de conversa e receba apoio ao estudo referido à trilha em andamento, sem criar, alterar ou substituir trilhas pré-definidas. |
| **Valor** | Lucas tira dúvidas e recebe sugestões de apoio sem perder a confiança no catálogo curado. |
| **RF** | RF08 |
| **RB** | RB10, RB01 |
| **RNF** | RNF02, RNF03 (conversa fora do SLA local), RNF01, RNF04, RNF05, RNF07 |
| **UC / fluxo** | UC01-A5; degradação análoga a E2 se o LLM falhar (não persistir efeito em catálogo) |
| **Entidades** | `Mensagem`, `Aluno`, `Trilha` (referência opcional no modelo) |
| **Drivers** | AD-CEN03, AD-C02, AD-QA03 |
| **ADRs** | ADR-002, ADR-003 |
| **Dependências** | SPEC-004 (trilha em acompanhamento), SPEC-006 (porta LLM) |
| **Justificativa da ordem** | Apoio opcional (relação «extend»). Depende do acompanhamento e da porta já introduzida. Separada da SPEC-006 porque o resultado é `Mensagem`, não `Trilha`, e RB10 é o invariante central distinto da criação personalizada. |
| **OPEN associados** | OPEN-10 (se conversa exigir trilha — na verdade OPEN-14), OPEN-06, OPEN-20 |

---

## 3. Questões em aberto (OPEN)

Estas decisões **não foram inventadas**. Precisam de resolução humana antes ou durante a Spec detalhada correspondente. A implementação não deve preenchê-las em silêncio.

| ID | Decisão necessária | Onde aparece |
|---|---|---|
| OPEN-01 | Qual SGBD e esquema físico persistirão o modelo conceitual | Drivers §8; ADR “o que não tem ADR”; SPEC-001 |
| OPEN-02 | Framework HTTP da API Node (Express, Fastify, Nest ou outro) | ADR-001 consequências; SPEC-001 |
| OPEN-03 | Biblioteca de UI/CSS no Next.js | ADR sem decisão; SPEC-001 |
| OPEN-04 | App Router versus Pages Router no Next.js | ADR-001 o que continua em aberto; SPEC-001 |
| OPEN-05 | Mecanismo de autenticação na API (JWT, sessão/cookie ou outro), desde que ADR-004 se mantenha | ADR-004; SPEC-001 |
| OPEN-06 | Qual provedor LLM está ligado em cada ambiente e como se habilita/desabilita a função | RNF02; ADR-002; SPEC-006, SPEC-007 |
| OPEN-07 | Política concreta pós-confirmação de RB11: destino de `ConclusaoEtapa`, recálculo, exclusão física versus desativação, reordenação das etapas restantes, recusa se a trilha ficaria sem etapas (RB03) | UC02-A5; AD-RF04; SPEC-005 |
| OPEN-08 | Como a trilha personalizada obtém `Categoria` existente (escolha do LLM, categoria sentinela, informação do aluno) | RB03 + UC01-A3; SPEC-006 |
| OPEN-09 | Contrato da `respostaLLM` suficiente para materializar etapas ordenadas | ADR-002; UC01-E3; SPEC-006 |
| OPEN-10 | Como nasce o primeiro administrador (seed, promoção, cadastro distinto) | UC02 pré-condição; SPEC-001 |
| OPEN-11 | Unicidade de e-mail, política de senha, recuperação e forma de armazenamento de `senha` | Modelo conceitual; SPEC-001 |
| OPEN-12 | Um `Usuario` pode ser só aluno, só administrador, ou ambos | Modelo §3; INC-05; SPEC-001 |
| OPEN-13 | Listagem do catálogo (RF03) exige autenticação ou pode ser anônima | RB01 versus UC01; SPEC-004 |
| OPEN-14 | Conversa (RF08) exige trilha em andamento ou `Mensagem.trilha` pode ser nula | Modelo versus RF08/persona; SPEC-007 |
| OPEN-15 | Há operação para pausar, abandonar ou reiniciar `Progresso` (`ativo`) | Modelo versus ausência de RF; SPEC-004 |
| OPEN-16 | Formato e restrições de `Etapa.conteudo` | Modelo; SPEC-003 |
| OPEN-17 | A “recomendação inteligente” da visão entra no escopo desta versão ou é descartada até haver RF | INC-01; **nenhuma Spec** |
| OPEN-18 | Logout / encerramento de sessão | Ausência de RF; SPEC-001 |
| OPEN-19 | Geração personalizada permanece síncrona no fluxo do aluno ou haverá fila | Drivers §8; SPEC-006 |
| OPEN-20 | Timeout e limites numéricos da chamada ao LLM | AD-CEN01 pede limite de tempo sem valor; SPEC-006, SPEC-007 |
| OPEN-21 | Administrador pode executar o UC01 (acompanhar trilhas) | AD-RF02; SPEC-001, SPEC-004 |
| OPEN-22 | Comportamento se não houver trilha pré-definida e o LLM estiver desabilitado | UC01 pré-condição; SPEC-004, SPEC-006 |
| OPEN-23 | O que ocorre ao remover `Categoria` que ainda classifica trilhas | RF09 sem RB de integridade; SPEC-002 |

---

## 4. O que deliberadamente não virou Spec

- RNFs transversais (responsividade, usabilidade, browsers, modularidade, SLA local).
- “Implementar frontend / backend / banco”.
- Motor de recomendação da visão (INC-01 / OPEN-17).
- Microserviços, BFF extra, app nativo (rejeitados ou não pedidos pelos ADs).
- Escolha de SGBD, JWT versus cookie, OpenAI versus Ollama em produção (reversíveis ou em aberto).

---

## 5. Parada obrigatória

Este mapa **não** inclui:

- texto completo das Specs (comportamento, invariantes INV-xxx, contratos, critérios Dado/Quando/Então, testes);
- código, endpoints, esquema físico ou escolha de tecnologias em aberto.

**Próximo passo humano:** aprovar, reordenar ou fundir Specs neste índice.

**Próximo passo de geração (só após aprovação, uma de cada vez):** `Gerar SPEC-001`.
