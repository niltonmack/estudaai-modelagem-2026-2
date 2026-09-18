# Drivers Arquiteturais (ADs) — EstudaAI

Drivers arquiteturais são os **requisitos, restrições e cenários que mais impactam as decisões de arquitetura**. Não são o inventário completo de RF, RNF e RB: são o subconjunto que obriga a escolher estrutura de módulos, fronteiras de integração, modelo de persistência, controle de acesso e comportamento sob falha.

Fontes: [visão do produto](visaodoproduto.md), [RF](EstudaAI_RF.md), [RNF](EstudaAI_RNF.md), [RB](EstudaAI_RB.md), [modelo conceitual](modelo-conceitual.md), [UC01 aluno](caso-uso-aluno.md) e [UC02 administrador](caso-uso-admin.md).

## 1. Critério de seleção

Um item entra neste documento quando atende a pelo menos um destes testes:

1. **Obriga uma fronteira** — por exemplo, o Agente LLM é ator secundário e serviço externo.
2. **Define um invariante de domínio** que a persistência e as transações precisam garantir.
3. **Impõe medida de qualidade** que o restante do sistema não pode violar (latência, perfil de acesso, degradabilidade).
4. **Cria tensão** entre dois objetivos (catálogo curado versus geração por LLM; rapidez local versus chamada externa).

Itens como “exibir titulo da etapa” ou “navegação clara” permanecem requisitos de produto, mas não mudam sozinhos o desenho da arquitetura.

## 2. Mapa priorizado

| ID | Tipo | Driver | Impacto na arquitetura | Prioridade |
|---|---|---|---|---|
| AD-C01 | Restrição | Backend Node e frontend React, código modular | Estilo de sistema, API + SPA, recorte em módulos | Alta |
| AD-C02 | Restrição | LLM via OpenAI **ou** Ollama, e somente se a função estiver habilitada | Porta de integração, configuração, degradabilidade | Alta |
| AD-RF01 | Requisito | Dois modos de trilha: pré-definida (catálogo) e personalizada (LLM) | Dois fluxos de criação, `Trilha.tipo`, isolamento do catálogo curado | Alta |
| AD-RF02 | Requisito | Autenticação e dois perfis (aluno / administrador) | Identidade, sessão, autorização por operação | Alta |
| AD-RF03 | Requisito | Progresso individual, conclusão explícita e percentual derivado | Modelo de escrita, cálculo no domínio, histórico | Alta |
| AD-RF04 | Requisito | Administração do catálogo com integridade sobre progresso existente | Transação, política de remoção, consistência | Alta |
| AD-QA01 | Qualidade | Ações principais sem LLM em menos de 2 s | Isolar I/O do LLM do caminho síncrono local | Alta |
| AD-QA02 | Qualidade | Interface responsiva e compatível com navegadores atuais | Entrega web única, SPA React com CSS adaptável | Média |
| AD-CEN01 | Cenário | Criar trilha personalizada com LLM indisponível ou resposta inválida | Timeout, circuit breaker, fallback para catálogo | Alta |
| AD-CEN02 | Cenário | Remover etapa já usada por alunos | Estratégia de impacto em `Progresso` e `ConclusaoEtapa` | Alta |
| AD-CEN03 | Cenário | Conversar com o LLM sem alterar o catálogo curado | Separação de bounded contexts / origens de conteúdo | Alta |

## 3. Requisitos arquiteturalmente significativos

### 3.1 AD-RF01 — Duas origens de trilha

O produto existe para oferecer **catálogo curado** e **geração sob demanda**. Isso não é um detalhe de tela: são dois pipelines que convergem na mesma entidade `Trilha`.

| Origem | Quem cria | Entidades | Regras |
|---|---|---|---|
| Pré-definida | Administrador | `Categoria`, `Trilha` (`tipo = pré-definida`), `Etapa` | RF03, RF09–RF12, RB03, RB07, RB10 |
| Personalizada | Aluno + Agente LLM | `SolicitacaoTrilha`, `Trilha` (`tipo = personalizada`), `Etapa`, `Progresso` | RF04, RB08, RB09, UC01-A3 |

**Decisão que o driver força:** o núcleo do domínio trata `Trilha` de forma uniforme (categoria, etapas ordenadas, progresso). A geração por LLM fica atrás de um adaptador. O catálogo pré-definido **não** é reescrito por sugestões de conversa (RB10).

### 3.2 AD-RF02 — Identidade e autorização por perfil

RF01/RF02 cadastram e autenticam `Usuario`. O modelo conceitual especializa em `Aluno` e `Administrador`. RB01, RB02, RNF05 e RNF06 restringem **o que cada perfil pode executar**, não apenas o que a interface mostra.

| Operação | Aluno autenticado | Administrador autenticado | Anônimo |
|---|---|---|---|
| Escolher trilha, criar personalizada, registrar progresso | Sim | Fora do UC01 | Não (RB01, RNF05) |
| CRUD de categoria, trilha pré-definida, etapa | Não | Sim (RF09–RF12, RB02, RNF06) | Não |
| Conversar com o LLM sobre a trilha | Sim (RF08) | Não especificado como papel de catálogo | Não |

**Decisão que o driver força:** um mecanismo único de autenticação e um ponto de autorização por caso de uso / operação de escrita. Perfil não é só atributo de tela; é invariante de fronteira.

### 3.3 AD-RF03 — Progresso como fato explícito e percentual derivado

O aluno não “está concluído” porque visualizou a etapa. RB05 exige `ConclusaoEtapa`. RB06 define `/percentualProgresso` como derivado. RB04 e RB12 exigem acompanhamento **por aluno** e histórico enquanto `Progresso.ativo`.

**Decisão que o driver força:**

- persistir `Progresso` (aluno + trilha) e `ConclusaoEtapa` (progresso + etapa + data);
- calcular o percentual no domínio, não como campo editável pelo usuário;
- tratar retomada de trilha (UC01-A6) como leitura do mesmo `Progresso`, sem duplicar acompanhamento.

### 3.4 AD-RF04 — Catálogo mutável com alunos em andamento

UC02 inclui gerenciar categorias, trilhas e etapas e **estende** a remoção com avaliação de impacto. RB11 obriga tratar `Progresso` e `ConclusaoEtapa` **antes** de concluir a remoção. RB03 impede publicar trilha sem categoria ou sem etapas ordenadas (RF12).

**Decisão que o driver força:** escritas administrativas passam por regras de invariante (RB03) e por uma política explícita de mutação (bloquear, recascar percentual, ou exigir confirmação). Não basta um CRUD genérico.

## 4. Restrições

Restrições não são negociáveis no mesmo nível que um RNF de usabilidade: elas **delimitam** o espaço de solução.

### AD-C01 — Node, React e modularidade (RNF07)

O sistema **SHALL** ser organizado em módulos, com **backend em Node** e **frontend em React**.

Implicações:

- frontend SPA em React (interface responsiva) e backend em Node expondo a API da aplicação, salvo decisão posterior documentada;
- recorte por responsabilidade no Node (contas, catálogo, progresso, integração LLM) e por áreas de tela no React (aluno, administrador, conversa), em vez de um único módulo sem fronteira;
- manutenibilidade medida pela clareza dessas fronteiras e do contrato da API, não por microserviços — o driver **não** pede distribuição.

### AD-C02 — LLM opcional e substituível (RNF02, RF04, RF08)

**WHERE** a função de modelo de linguagem estiver habilitada, a integração **SHALL** usar OpenAI **ou** Ollama.

Implicações:

- a geração e a conversa **não** podem ficar acopladas a um SDK específico no domínio;
- deve existir um interruptor de configuração (“LLM habilitado / desabilitado”);
- com LLM desabilitado, o UC01 permanece viável pelo catálogo pré-definido (pré-condição do UC01: catálogo **ou** LLM).

### AD-C03 — Canal de entrega web (visão do produto, RNF01, RNF08)

EstudaAI é aplicação web para computador, tablet e smartphone, nos navegadores atuais: **React** no frontend e **Node** no backend. Não há driver para aplicativo nativo separado. A UI precisa ser **uma** superfície responsiva (persona do aluno usa celular no deslocamento e computador no estudo).

### AD-C04 — Invariantes de domínio que a persistência deve honrar

Estes RB funcionam como restrições de dados, não como “regras de tela”:

| Restrição | Enunciado | Efeito estrutural |
|---|---|---|
| RB03 | Toda trilha tem uma categoria e 1..* etapas ordenadas | Validação no agregado `Trilha` antes de persistir / publicar |
| RB04 | Progresso é individual | Chave lógica (aluno, trilha); sem progresso compartilhado |
| RB08 / RB09 | Personalizada nasce de solicitação + resposta e fica do aluno | Persistir `SolicitacaoTrilha` e criar `Progresso` no mesmo caso de sucesso |
| RB10 | LLM não substitui curadoria | Trilhas pré-definidas e mensagens de apoio são origens distintas |

## 5. Atributos de qualidade (cenários)

Formato: estímulo → artefato → resposta mensurável. Só entram atributos que mudam o desenho.

### AD-QA01 — Desempenho do caminho local (RNF03)

| Parte | Conteúdo |
|---|---|
| Fonte | Aluno ou administrador autenticado |
| Estímulo | Ação principal **sem** chamada ao LLM (login, listar catálogo, escolher trilha, ver etapas, marcar conclusão, CRUD de catálogo) |
| Artefato | Aplicação EstudaAI (caminho síncrono local) |
| Ambiente | Operação normal |
| Resposta | A interface apresenta o resultado da ação |
| Medida | Tempo de resposta **inferior a 2 segundos** |

**Impacto:** qualquer geração ou chat com LLM deve ser isolado (timeout, espera explícita, não bloquear listagens). O SLA de 2 s **não** se aplica às operações que dependem diretamente do serviço externo.

### AD-QA02 — Segurança de acesso (RNF05, RNF06, RB01, RB02)

| Parte | Conteúdo |
|---|---|
| Fonte | Usuário autenticado ou não, inclusive aluno tentando operação de catálogo |
| Estímulo | Pedido que lê ou altera dados pessoais, progresso ou catálogo |
| Artefato | Operações de UC01 e UC02 |
| Ambiente | Operação normal ou tentativa indevida |
| Resposta | Executa somente com autenticação; escritas de catálogo somente com perfil administrador |
| Medida | Pedido anônimo ou de perfil insuficiente é recusado; não há atalho de UI que contorne a regra |

### AD-QA03 — Disponibilidade degradada do LLM (RNF02, UC01-E2/E3)

| Parte | Conteúdo |
|---|---|
| Fonte | Aluno no ponto de extensão “criar trilha personalizada” ou “conversar” |
| Estímulo | Timeout, erro do provedor, ou resposta sem etapas suficientes para RB03 |
| Artefato | Adaptador LLM + domínio de trilha |
| Ambiente | LLM habilitado, porém indisponível ou inválido |
| Resposta | Nenhuma `Trilha` personalizada inválida é persistida; o aluno é informado e pode usar o catálogo pré-definido |
| Medida | Catálogo e progresso local continuam operando dentro de AD-QA01 |

### AD-QA04 — Usabilidade e entrega multi-dispositivo (RNF01, RNF04, RNF08)

| Parte | Conteúdo |
|---|---|
| Fonte | Aluno (persona Lucas: celular e computador) |
| Estímulo | Localizar trilha, etapa e progresso |
| Artefato | Interface web |
| Ambiente | Navegadores atuais em desktop, tablet e smartphone |
| Resposta | Layout adaptado, navegação consistente, sem exigir conhecimento técnico |
| Medida | As três informações (trilha, etapa, progresso) são encontráveis na mesma aplicação web |

Este AD influencia a arquitetura de apresentação (SPA React responsiva), não a decomposição em serviços.

### AD-QA05 — Manutenibilidade (RNF07)

| Parte | Conteúdo |
|---|---|
| Fonte | Evolução do sistema (novo provedor LLM, nova regra de remoção, novo perfil) |
| Estímulo | Correção ou extensão |
| Artefato | Código organizado em módulos Node (API) e em componentes/módulos React (UI) |
| Resposta | Mudança localizada no módulo correspondente (domínio, autenticação, adaptador LLM ou tela) |
| Medida | Integração OpenAI/Ollama troca o adaptador sem reescrever `Trilha` / `Progresso` |

## 6. Cenários arquiteturalmente significativos

Estes cenários vêm dos casos de uso. São os que mais “puxam” componentes.

### AD-CEN01 — Gerar trilha personalizada (UC01-A3, RF04, RB08, RB09)

1. Aluno autenticado envia `textoObjetivo`.
2. O sistema encaminha o texto ao Agente LLM (ator secundário).
3. O LLM devolve `respostaLLM`.
4. O sistema persiste `SolicitacaoTrilha`, cria `Trilha` personalizada com categoria e etapas ordenadas, e abre `Progresso` do aluno.
5. Falha: LLM mudo, lento ou incompleto → não cria trilha; oferece catálogo (UC01-E2, UC01-E3).

**O que a arquitetura precisa ter:** orquestração síncrona com limite de tempo, mapeamento da resposta para o modelo conceitual, transação de criação (solicitação + trilha + etapas + progresso) e fallback.

### AD-CEN02 — Acompanhar e concluir etapa (UC01 fluxo principal, RF05–RF07)

1. Aluno escolhe ou retoma trilha.
2. Sistema lê `Trilha` + `Etapa` ordenadas e calcula `/percentualProgresso`.
3. Aluno marca conclusão explícita.
4. Sistema grava `ConclusaoEtapa` e recalcula o percentual.

**O que a arquitetura precisa ter:** leitura consistente do agregado de trilha, escrita de progresso isolada por aluno, regra RB05 no servidor (não só no cliente).

### AD-CEN03 — Conversar sem contaminar o catálogo (UC01-A5, RF08, RB10)

1. Aluno envia `Mensagem` referida à trilha em andamento.
2. Agente LLM responde como apoio ao estudo.
3. O catálogo de trilhas pré-definidas permanece inalterado.

**O que a arquitetura precisa ter:** canal de conversa separado do pipeline de publicação do administrador; persistência de `Mensagem` sem efeito colateral em `Trilha` curada.

### AD-CEN04 — Publicar trilha pré-definida (UC02 fluxo principal, RF09–RF12, RB03, RB07)

1. Administrador autenticado com perfil correto.
2. Garante `Categoria`.
3. Cadastra `Trilha` pré-definida.
4. Cadastra e associa `Etapa` com `ordem`.
5. Sistema só publica se RB03 for verdadeiro.

**O que a arquitetura precisa ter:** módulo de catálogo com autorização na escrita e validação de invariante antes do commit.

### AD-CEN05 — Remover etapa vinculada (UC02-A5, RB11)

1. Administrador solicita remoção de `Etapa` já associada a trilha com `Progresso` ativo.
2. Sistema identifica `Progresso` e `ConclusaoEtapa` afetados.
3. Administrador confirma ou cancela.
4. Confirmação: impacto tratado; cancelamento: estado inalterado (UC02-E3).

**O que a arquitetura precisa ter:** consulta de dependências antes do delete, operação de confirmação e recálculo de percentual derivado.

## 7. Tensões que a arquitetura precisa equilibrar

| Tensão | Polo A | Polo B | Direção sugerida pelos drivers |
|---|---|---|---|
| Latência | RNF03 (&lt; 2 s no caminho local) | RF04/RF08 (chamada externa ao LLM) | Separar o caminho local do caminho LLM; não deixar o catálogo esperar o provedor |
| Origem da verdade | RB07/RB10 (curadoria administrativa) | RF04/RF08 (geração e sugestão) | Duas origens: catálogo publicado versus apoio/personalização; `Trilha.tipo` discrimina |
| Flexibilidade do admin | RF11 (remover etapa) | RB11/RB12 (progresso e histórico) | Nenhuma remoção silenciosa de etapa vinculada |
| Substituir o LLM | RNF02 (OpenAI ou Ollama) | AD-CEN01 (mesmo contrato de domínio) | Porta estável: texto in, estrutura de trilha ou mensagem out |
| Simplicidade de implantação | AD-C01 (Node + React) | Isolamento do LLM | Adaptador interno no backend Node; não é necessário, pelos drivers atuais, um serviço LLM separado |

## 8. Recorte do que os drivers **não** decidem ainda

Os ADs não escolhem sozinhos, por falta de evidência nos documentos de origem:

- banco de dados específico;
- fila assíncrona para o LLM (possível, mas não exigida; o UC01 trata a geração no fluxo do aluno);
- cache de catálogo;
- provedor de identidade externo.

Essas são decisões de projeto posteriores, desde que respeitem AD-C01, AD-QA01 e AD-C02.

## 9. Rastreabilidade

| Driver | RF | RNF | RB | Modelo conceitual | Caso de uso |
|---|---|---|---|---|---|
| AD-RF01 | RF03, RF04, RF10 | RNF02 | RB07, RB08, RB09, RB10 | `Trilha.tipo`, `SolicitacaoTrilha` | UC01-A3, UC02 |
| AD-RF02 | RF01, RF02, RF09–RF12 | RNF05, RNF06 | RB01, RB02 | `Usuario`, `Aluno`, `Administrador` | UC01 include autenticar; UC02 |
| AD-RF03 | RF05, RF06, RF07 | — | RB04, RB05, RB06, RB12 | `Progresso`, `ConclusaoEtapa` | UC01 include progresso |
| AD-RF04 | RF09–RF12 | — | RB03, RB11 | `Categoria`, `Trilha`, `Etapa` + impacto em progresso | UC02, extend impacto |
| AD-C01 | — | RNF07 | — | — | ambos (implementação) |
| AD-C02 | RF04, RF08 | RNF02 | RB08, RB10 | `SolicitacaoTrilha`, `Mensagem` | UC01 atores LLM |
| AD-QA01 | ações principais | RNF03 | — | caminho sem LLM | UC01 passos 3–10; UC02 CRUD |
| AD-CEN01 | RF04 | RNF02, RNF03 | RB03, RB08, RB09 | solicitação → trilha → progresso | UC01-A3, E2, E3 |
| AD-CEN05 | RF11 | — | RB11, RB12 | `Etapa` × `ConclusaoEtapa` | UC02-A5 |

## 10. Síntese para as próximas decisões

A arquitetura do EstudaAI precisa, no mínimo:

1. **Separação frontend/backend** com React na interface e Node na API.
2. **Núcleo de domínio** no backend Node, com `Trilha` / `Etapa` / `Progresso` honrando RB03–RB06 e RB12.
3. **Módulo de identidade** com autenticação obrigatória nas escritas de trilha e progresso, e autorização de catálogo só para administrador.
4. **Módulo de catálogo** (pré-definido) separado do **adaptador LLM** (personalização e conversa), com LLM desligável e provedor intercambiável.
5. **Caminho local rápido** (&lt; 2 s) distinto do **caminho externo** (timeout e fallback para o catálogo).
6. **Política de mutação** do catálogo que consulta progresso existente antes de remover etapa.

Esse conjunto é o contrato que qualquer desenho posterior (módulos Node, componentes React e API entre frontend e backend) deve satisfazer.
