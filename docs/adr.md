# ADRs — EstudaAI

Uma ADR (Architecture Decision Record) registra uma **decisão técnica cara**: o que foi decidido, por que, quais alternativas existiam e o que passa a valer depois dela.

## Critério de reversibilidade

Só entra neste arquivo a decisão que **amarra o projeto**. Teste usado:

- Se desfazer custa uma troca local (biblioteca, pasta, provedor atrás de uma porta já existente), **não** há ADR.
- Se desfazer implica reescrever a stack, o contrato da API, o modelo persistido ou a fronteira de confiança, **há** ADR.

Drivers ([`drivers-arquiteturais.md`](drivers-arquiteturais.md)) explicam *o que a arquitetura precisa satisfazer*. ADRs registram *o que foi escolhido* quando a escolha é difícil de reverter.

| ID | Decisão | Por que é cara |
|---|---|---|
| [ADR-001](#adr-001--frontend-nextjs-react-e-backend-node-via-api) | Next.js (React) + Node (API) | Trocar o framework de UI ou a stack é reescrever o sistema |
| [ADR-002](#adr-002--llm-apenas-no-backend-atrás-de-uma-porta-provedor-intercambiável) | LLM no backend, atrás de porta, OpenAI ou Ollama | Acoplar o domínio ou o cliente Next.js a um SDK vaza chave, mistura latência e impede RNF02 |
| [ADR-003](#adr-003--uma-trilha-dois-modos-catálogo-curado-separado-do-apoio-llm) | Uma entidade `Trilha` com `tipo`; catálogo ≠ conversa | Migrar o modelo e as APIs de acompanhamento depois de haver dados é caro |
| [ADR-004](#adr-004--invariantes-e-autorização-na-api-node-não-só-na-ui) | Regras RB/RNF valem no servidor | Corrigir autorização e progresso “só no cliente” depois de dados inválidos já persistidos é caro |

Status de todas: **aceita** (2026-09-08).

---

## O que deliberadamente não tem ADR

Estas escolhas são reversíveis ou **ainda não foram tomadas**. Inventá-las agora seria ADR falsa.

| Tema | Por que não é ADR agora |
|---|---|
| Framework HTTP do Node (Express, Fastify, Nest etc.) | Cabe atrás da mesma API; a troca não reescreve o domínio |
| Biblioteca de UI/CSS no Next.js | Não altera o contrato com a API Node |
| App Router versus Pages Router no Next.js | Cabe no mesmo framework; a troca não reescreve o domínio nem a API |
| Banco de dados específico | Ainda não decidido pelos ADs |
| Fila assíncrona para o LLM | UC01 trata a geração no fluxo do aluno; pode-se introduzir depois |
| JWT versus sessão/cookie | Detalhe de mecanismo, desde que a autorização continue na API (ADR-004) |
| Microserviços | O monolito modular é a opção *barata* de desfazer; adotar distribuição agora é que seria caro — e os ADs **não** pedem isso |
| Provedor LLM em produção (OpenAI *versus* Ollama) | A ADR-002 existe justamente para deixar essa troca barata |

---

## ADR-001 — Frontend Next.js (React) e backend Node via API

### Decisão

O EstudaAI será uma aplicação web com **frontend em Next.js** (framework React) e **API de domínio em Node**. São dois artefatos: o Next.js entrega a interface (rotas, páginas, SSR/RSC conforme o próprio Next.js); o Node expõe o contrato HTTP de catálogo, progresso, identidade e LLM.

Esta ADR **substitui** a formulação anterior “SPA React (Vite/CRA) + API Node”. O React continua sendo a biblioteca de UI; o **framework** adotado é o Next.js.

Não haverá templates Django no lugar do Next.js. Route Handlers / Server Actions do Next.js **não** substituem a API de domínio nem o adaptador LLM (ADR-002 e ADR-004): no máximo orquestram chamadas autenticadas a essa API.

### Por que foi tomada

- RNF07 exige código modular com frontend React; Next.js é o framework escolhido para esse React (roteamento, empacotamento e execução web).
- RNF01 e RNF08 pedem uma única superfície web para computador, tablet e smartphone; a persona do aluno usa celular e desktop.
- Uma SPA “nua” (Vite/CRA) empurraria roteamento, SSR e convenções para o projeto. Next.js amarra essas escolhas de UI de forma explícita — e desfazer isso depois é reescrever o frontend.
- Separar Next.js (apresentação) e Node (domínio) deixa RB05, RB02 e o SLA de 2 s (RNF03) numa API única, em vez de espalhar regra entre Server Components e o cliente.

### Alternativas consideradas

| Alternativa | Por que foi rejeitada |
|---|---|
| SPA React com Vite ou Create React App | Atendia ao “usar React”, mas não ao framework adotado; roteamento e deploy teriam de ser reinventados e a troca para Next.js depois seria reescrever o front |
| Django (ou similar) full-stack com templates | Contradiz a stack; reintroduziria o acoplamento UI–servidor que se quis evitar |
| Next.js full-stack (domínio e LLM só em Route Handlers) | Misturaria renderização, autorização e adaptador LLM no mesmo runtime da UI; tornaria ADR-002 e ADR-004 mais frágeis e mais caras de isolar depois |
| Aplicativo nativo além da web | Não há driver para isso; duplicaria UC01/UC02 |
| Micro frontends ou BFF extra além do Next.js | Complexidade sem requisito que a justifique |

### Consequências

- Passam a existir **dois artefatos de entrega** (app Next.js e API Node) e um contrato HTTP versionável.
- O frontend herda o modelo de rotas e de servidor do Next.js; reverter para Vite/CRA ou para outro meta-framework é reescrita da apresentação.
- Autenticação, CORS e erros da API continuam na fronteira Node; o Next.js é cliente (incluindo código de servidor que apenas chama a API).
- Equipe e pipeline cobrem Next.js/React e Node.
- O caminho local &lt; 2 s (RNF03) mede a API Node nas operações sem LLM; nem o browser nem o servidor do Next.js são a fonte de verdade das regras.
- Chaves de LLM e invariantes de catálogo/progresso **não** migram para o projeto Next.js só porque ele também roda em Node.

**Drivers:** AD-C01, AD-C03, AD-QA04, AD-QA05, RNF01, RNF07, RNF08.

---

## ADR-002 — LLM apenas no backend, atrás de uma porta; provedor intercambiável

### Decisão

Chamadas a modelo de linguagem (gerar trilha personalizada e conversar) saem **somente do Node**, por um **adaptador/porta** cujo contrato é “texto in → estrutura de trilha ou mensagem out”.

- Provedores previstos: **OpenAI** ou **Ollama** (RNF02).
- A função pode estar **desligada**; nesse caso o UC01 segue pelo catálogo pré-definido.
- Timeout e falha do LLM **não** entram no orçamento de 2 s das ações locais (RNF03).
- Nenhuma chave de provedor vive no cliente Next.js (browser) nem em Server Components usados como atalho para o SDK.

### Por que foi tomada

- RF04 e RF08 tornam o Agente LLM ator secundário; RNF02 exige dois provedores possíveis e habilitação opcional.
- AD-QA01 e AD-CEN01: se a listagem do catálogo esperar o LLM, o SLA local quebra.
- RB10: sugestão de conversa não pode escrever no catálogo curado. Isso só se garante se o adaptador não tiver permissão de publicação administrativa.
- Acoplar `Trilha` / `Progresso` ao SDK da OpenAI tornaria Ollama (e o desligamento) uma reescrita. A porta deixa a **escolha do provedor** barata — por isso *essa* escolha de provedor não tem ADR própria.

### Alternativas consideradas

| Alternativa | Por que foi rejeitada |
|---|---|
| Chamar OpenAI/Ollama no browser ou em Route Handler do Next.js | Expõe chave ou mistura latência da UI com o provedor; fura a porta única da API Node e impede RB01/RNF05 no mesmo ponto |
| Um único SDK no domínio (só OpenAI) | Viola RNF02; desfazer o vendor lock é reescrever o núcleo |
| Microsserviço só de LLM | Os ADs não pedem distribuição; um adaptador interno no Node basta e é mais barato de operar |
| LLM obrigatório no caminho feliz do aluno | A pré-condição do UC01 admite catálogo **ou** LLM; RNF02 é *WHERE* habilitado |

### Consequências

- O domínio conhece `SolicitacaoTrilha` e `Mensagem`, não o SDK do fornecedor.
- Há dois caminhos na API: **local** (catálogo, progresso, CRUD) e **externo** (gerar / conversar), com política de timeout e fallback (UC01-E2, UC01-E3).
- Resposta inválida do LLM não persiste `Trilha` que viole RB03.
- Custo: um contrato a manter e testes de adaptador falso (fake) para o domínio.
- Trocar OpenAI por Ollama (ou desligar o LLM) **não** exige nova ADR, desde que a porta se mantenha.

**Drivers:** AD-C02, AD-QA01, AD-QA03, AD-CEN01, AD-CEN03, RF04, RF08, RNF02, RNF03, RB08, RB10.

---

## ADR-003 — Uma `Trilha`, dois modos; catálogo curado separado do apoio LLM

### Decisão

Existe **um** conceito persistido `Trilha`, discriminado por `tipo ∈ { pré-definida, personalizada }`.

- Pré-definida: criada pelo administrador no catálogo (`Categoria` + etapas ordenadas). RB07, RF09–RF12.
- Personalizada: criada a partir de `SolicitacaoTrilha` (texto do aluno + `respostaLLM`) e associada ao aluno via `Progresso`. RB08, RB09.
- `Mensagem` de conversa **não** vira trilha pré-definida nem altera o catálogo (RB10).
- Progresso, etapas e percentual derivado valem para os dois modos (mesmo UC01 depois da escolha/criação).

### Por que foi tomada

- O modelo conceitual já unifica visualização, sequência e progresso (RF05–RF07). Duplicar “trilha de catálogo” e “trilha gerada” em dois modelos amarraria o UC01 a dois acompanhamentos.
- RB03 (categoria + 1..* etapas ordenadas) aplica-se a qualquer trilha; um invariante, um validador.
- RB10 só é implementável se publicação administrativa e geração/conversa forem origens distintas — `tipo` e o fato de `SolicitacaoTrilha` ser 0..1 tornam isso explícito no persistido.
- Depois que alunos tiverem `Progresso` e `ConclusaoEtapa`, fundir ou partir o modelo é migração cara.

### Alternativas consideradas

| Alternativa | Por que foi rejeitada |
|---|---|
| Duas árvores de persistência (Catálogo × PlanoLLM) sem tipo comum | Duplica RF05–RF07 e o cálculo de percentual; o aluno veria dois “progressos” |
| Trilha personalizada só em memória / sessão | Viola RB09 (persistir e acompanhar) |
| Deixar o LLM atualizar trilhas pré-definidas | Viola RB10 e destrói a confiança da persona administradora |
| `tipo` só na UI, sem persistir | Consultas, RB03 e relatórios de progresso ficariam ambíguos |

### Consequências

- APIs de “obter trilha / marcar etapa / percentual” servem os dois modos.
- Criação personalizada é transação: solicitação + trilha + etapas + progresso do aluno.
- Administração (UC02) opera só sobre `tipo = pré-definida`; remoção de etapa continua sujeita a RB11 também quando a etapa pertence a trilha com progresso.
- Evoluir o discriminador depois (novos tipos) é possível; **partir** o modelo atual depois de haver dados não é.

**Drivers:** AD-RF01, AD-RF03, AD-CEN03, modelo conceitual, RF03–RF07, RB03, RB07–RB10.

---

## ADR-004 — Invariantes e autorização na API Node, não só na UI

### Decisão

Autenticação, perfil (aluno / administrador) e regras de domínio são **impostas no backend Node** em toda operação que lê ou altera dados pessoais, progresso ou catálogo.

Inclui, no servidor:

- recusar anônimo em escolha de trilha, geração personalizada e progresso (RB01, RNF05);
- recusar aluno em CRUD de categoria, trilha pré-definida e etapa (RB02, RNF06);
- gravar `ConclusaoEtapa` só com marcação explícita e calcular `/percentualProgresso` no domínio (RB05, RB06);
- validar RB03 antes de publicar trilha;
- consultar `Progresso` / `ConclusaoEtapa` antes de remover etapa vinculada (RB11).

O Next.js pode esconder botões; isso **não** é a restrição.

### Por que foi tomada

- RNF05 e RNF06 descrevem comportamento indesejado: o pedido chega mesmo se a tela não mostrar o botão.
- Percentual editável no cliente ou “conclusão” só no estado React/Next.js geraria progresso falso, irrecuperável depois de persistido.
- ADR-001 já separou Next.js e API Node: a fronteira de confiança é a API. Não documentar isso deixaria a stack cara sem a garantia que a justificou.
- Corrigir histórico de progresso corrompido ou um catálogo alterado por aluno é caro operacionalmente; impedir na escrita é o lado barato *depois* desta ADR, e o lado caro *se ela não existir*.

### Alternativas consideradas

| Alternativa | Por que foi rejeitada |
|---|---|
| Só `if (perfil)` no Next.js | Qualquer cliente HTTP ignora a UI; viola RNF05/RNF06 |
| API aberta e “confiar no aluno” | Incompatível com RB01, RB02 e RB05 |
| Gateway/IAM externo como única defesa | Ainda não há provedor de identidade escolhido; a API precisa da regra mesmo assim |
| Recalcular percentual só no frontend | O valor deixaria de ser derivado (RB06) e divergiria entre dispositivos |

### Consequências

- Toda rota de escrita do UC01 e do UC02 passa por autenticação + autorização + invariante.
- O Next.js torna-se cliente da API; testes de regra de negócio concentram-se no Node.
- Mecanismo de sessão (cookie, JWT, etc.) pode mudar **sem** nova ADR, desde que esta fronteira se mantenha.
- RB11 exige leitura de dependências na mesma API que executa o delete — não um “confirm” apenas visual.

**Drivers:** AD-RF02, AD-RF03, AD-RF04, AD-QA02, UC01, UC02, RB01–RB06, RB11, RNF05, RNF06.

---

## Relação com os drivers

| ADR | ADs que a justificam | O que continua em aberto |
|---|---|---|
| 001 | AD-C01, AD-C03 | Framework HTTP da API Node; App Router vs Pages Router |
| 002 | AD-C02, AD-QA01, AD-QA03 | Qual provedor está ligado em cada ambiente |
| 003 | AD-RF01, AD-RF03 | Esquema físico / SGBD |
| 004 | AD-RF02, AD-RF04, AD-QA02 | Protocolo de autenticação |

Nova ADR só se uma decisão futura **invalidar** uma destas quatro (por exemplo, abandonar o Next.js, colocar o domínio só em Route Handlers, acoplar o domínio a um SDK de LLM, ou mover a autorização para fora da API sem substituto).
