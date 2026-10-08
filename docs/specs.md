# Specs — EstudaAI

**Origem:** [`mapa-specs.md`](mapa-specs.md) + baseline de modelagem + [`decisoes-em-aberto.md`](decisoes-em-aberto.md)  
**Data:** 2026-09-22 (texto); aprovação humana da lista e da ordem: **2026-09-30**  
**Regra:** a implementação obedece a esta Spec. Conflito entre código, Spec e baseline **não** se resolve em silêncio.

**Portão de layout:** o código de uma Spec **só** começa quando o **layout** dessa Spec estiver `aprovado`. Spec `aprovada` com layout `pendente` **não** é autorização para desenvolver.

Este arquivo contém o **texto completo** das Specs, na ordem de implementação. Não contém código nem mockup. Evidências visuais ficam em [`layout/`](layout/).

Legenda de status da Spec:

| Status | Significado |
|---|---|
| `especificada` | Texto completo gerado; ainda sem aprovação humana da lista |
| `aprovada` | Humano aprovou o texto e a posição na ordem; código só após layout `aprovado` |
| `em implementação` | Código em andamento contra esta Spec **e** layout já `aprovado` |
| `implementada` | Critérios, invariantes, testes e layout aprovado atendidos |
| `fora de escopo` | Explicitamente excluído desta versão |

Legenda de status do layout:

| Layout | Significado |
|---|---|
| `pendente` | Telas listadas ainda sem evidência aprovada (desktop **e** smartphone) |
| `aprovado` | Humano registrou aprovação nas evidências da Spec; desenvolvimento liberado |
| `não se aplica` | Sem superfície de UI própria |

Como aprovar o layout: anexar protótipo (PNG, PDF ou Figma) em `docs/layout/` para cada tela da Spec; conferir RNF01/RNF04/RNF08; preencher aprovador e data na seção **Telas e evidência de layout**. Sem isso, o status de layout permanece `pendente`.

---

## Registro de aprovação humana

| Item | Decisão | Data |
|---|---|---|
| Lista SPEC-001 … SPEC-007 | `aprovada` | 2026-09-30 |
| Ordem de execução | 001 → 002 → 003 → 004 → 005 → 006 → 007 | 2026-09-30 |
| Primeira Spec a implementar | SPEC-001 | 2026-09-30 |
| Layout (todas as Specs) | SPEC-001 … SPEC-007 `aprovado` | 2026-10-02 |
| Layout SPEC-001 | `aprovado` — [`layout/spec-001.html`](layout/spec-001.html) | 2026-09-30 |
| Implementação SPEC-001 | `implementada` | 2026-10-08 |
| Layout SPEC-002 | `aprovado` — [`layout/spec-002.html`](layout/spec-002.html) | 2026-10-01 |
| Implementação SPEC-002 | `implementada` | 2026-10-08 |
| Layout SPEC-003 | `aprovado` — [`layout/spec-003.html`](layout/spec-003.html) | 2026-10-01 |
| Implementação SPEC-003 | `implementada` | 2026-10-08 |
| Layout SPEC-004 | `aprovado` — [`layout/spec-004.html`](layout/spec-004.html) | 2026-10-01 |
| Implementação SPEC-004 | `implementada` | 2026-10-08 |
| Layout SPEC-005 | `aprovado` — [`layout/spec-005.html`](layout/spec-005.html) | 2026-10-01 |
| Implementação SPEC-005 | `implementada` | 2026-10-08 |
| Layout SPEC-006 | `aprovado` — [`layout/spec-006.html`](layout/spec-006.html) | 2026-10-02 |
| Implementação SPEC-006 | `implementada` | 2026-10-08 |
| Layout SPEC-007 | `aprovado` — [`layout/spec-007.html`](layout/spec-007.html) | 2026-10-02 |
| Implementação SPEC-007 | `implementada` | 2026-10-08 |
| Implementação SPEC-001 … SPEC-007 | conjunto `implementado` | 2026-10-08 |
| Lista SPEC-008 e SPEC-009 | `aprovada` | 2026-10-08 |
| Ordem estendida | 001 → … → 007 → 008 → 009 | 2026-10-08 |
| Layout SPEC-008 | `aprovado` — [`layout/spec-008.html`](layout/spec-008.html) | 2026-10-08 |
| Implementação SPEC-008 | `implementada` | 2026-10-08 |
| Layout SPEC-009 | `aprovado` — [`layout/spec-009.html`](layout/spec-009.html) | 2026-10-08 |
| Implementação SPEC-009 | `implementada` | 2026-10-08 |
| Aprovação humana SPEC-008 e SPEC-009 | texto, layout e implementação `aprovados` | 2026-10-08 |
| Apresentação da etapa e da conversa (OPEN-26) | sanfona, lightbox da resposta e lightbox da conversa | 2026-10-08 |
| Layout da home do aluno (`/inicio`) | `aprovado` — [`layout/inicio-aluno.html`](layout/inicio-aluno.html); gráficos derivados de RB06 e RB12, sem API nova | 2026-10-08 |
| Implementação da home do aluno | `implementada` | 2026-10-08 |
| Layout do painel do administrador (`/painel`) | `aprovado` — [`layout/painel-admin.html`](layout/painel-admin.html); números e gráficos derivados de RB06, RF14 e RF15, somente leitura, sem API nova | 2026-10-08 |
| Implementação do painel do administrador | `implementada` | 2026-10-08 |
| Layout do vídeo do YouTube (OPEN-27) | `aprovado` — [`layout/video-youtube.html`](layout/video-youtube.html); link abre lightbox na página | 2026-10-08 |
| Implementação do vídeo do YouTube | `implementada` | 2026-10-08 |
| Aprovação humana OPEN-27 | texto, layout e implementação `aprovados` após o vídeo de teste na etapa 1 de Python Júnior | 2026-10-08 |
| Acesso Gemini (laboratório) | chave só em `apps/api/.env`; `generateContent` HTTP 200 no modelo `gemini-3.5-flash-lite` | 2026-10-02 |
| Banco MySQL local | schema `estudaai` em `127.0.0.1:3306` (serviço MySQL80); `dentalapp` intocado | 2026-10-02 |
| Identidade visual (logo + paleta) | `aprovada` — [`identidade-visual.md`](identidade-visual.md) | 2026-09-30 |

A implementação do conjunto SPEC-001 … SPEC-007 foi **aprovada** em 2026-10-08. Em 2026-10-08 o humano **aprovou** SPEC-008 (gerenciar usuários, RF14) e SPEC-009 (consultar progresso dos alunos, RF15): texto, layout e implementação. No mesmo dia **aprovou** OPEN-27 depois de ver o lightbox com o vídeo de teste na etapa 1 de Python Júnior. Esse endereço está no Markdown da etapa, no banco local, e não entra no repositório.

---

## Lista ordenada

| Ordem | ID | Nome | Dependências | Status | Layout |
|---|---|---|---|---|---|
| 1 | SPEC-001 | Cadastrar, autenticar e autorizar por perfil | — | `implementada` | `aprovado` |
| 2 | SPEC-002 | Gerenciar categorias de aprendizagem | SPEC-001 | `implementada` | `aprovado` |
| 3 | SPEC-003 | Publicar trilha pré-definida com etapas ordenadas | SPEC-002 | `implementada` | `aprovado` |
| 4 | SPEC-004 | Acompanhar trilha pré-definida | SPEC-001, SPEC-003 | `implementada` | `aprovado` |
| 5 | SPEC-005 | Tratar impacto da remoção de etapa em uso | SPEC-003, SPEC-004 | `implementada` | `aprovado` |
| 6 | SPEC-006 | Criar trilha personalizada com agente LLM | SPEC-002, SPEC-004 | `implementada` | `aprovado` |
| 7 | SPEC-007 | Conversar com o agente LLM sobre a trilha | SPEC-004, SPEC-006 | `implementada` | `aprovado` |
| 8 | SPEC-008 | Gerenciar usuários | SPEC-001 | `implementada` | `aprovado` |
| 9 | SPEC-009 | Consultar progresso dos alunos | SPEC-004, SPEC-008 | `implementada` | `aprovado` |
| — | — | Motor de recomendação da visão (OPEN-17) | — | `fora de escopo` | `não se aplica` |

```
SPEC-001 Identidade
  → SPEC-002 Categorias
    → SPEC-003 Publicar trilha pré-definida
      → SPEC-004 Acompanhar trilha pré-definida
        → SPEC-005 Integridade na remoção de etapa em uso
        → SPEC-006 Trilha personalizada (LLM)  →  SPEC-007 Conversa
        → SPEC-008 Gerenciar usuários  →  SPEC-009 Consultar progresso dos alunos
```

---

# SPEC-001 — Cadastrar, autenticar e autorizar por perfil

**Status:** `implementada`  
**Layout:** `aprovado`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-001 |
| **Nome** | Cadastrar, autenticar e autorizar por perfil |
| **Objetivo** | Permitir registro de conta de aluno, login JWT, logout, recuperação de senha por e-mail e liberação de funções conforme `Aluno` **ou** `Administrador` (XOR), com regras impostas na API Nest. O primeiro administrador nasce por seed. |
| **Valor** | Lucas e Mariana entram com identidade confiável. Sem esta Spec as demais capacidades não têm fronteira de acesso. Estabelece os dois artefatos de entrega (Next.js App Router + API Nest + MySQL). |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF01, RF02 |
| **RB** | RB01, RB02, RB14 |
| **RNF** | RNF05, RNF06, RNF07, RNF01, RNF04, RNF08, RNF03, RNF09, RNF10 |
| **UC / fluxo** | UC01 «include» autenticar; UC02 «include» autenticar; A1 cadastro; A2 credenciais inválidas; A7 logout |
| **Entidades** | `Usuario`, `Aluno`, `Administrador` |
| **Drivers** | AD-RF02, AD-C01, AD-C03, AD-QA02, AD-QA04, AD-QA05 |
| **ADRs** | ADR-001, ADR-004 |
| **OPEN fechados** | OPEN-01 … OPEN-05, OPEN-10, OPEN-11, OPEN-12, OPEN-18, OPEN-21 |

## 3. Escopo

**Incluído**

- Cadastro público cria somente `Aluno` (e-mail único, senha com hash).
- Login com JWT Bearer; logout; recuperação de senha por e-mail.
- Seed/script do primeiro `Administrador` na implantação.
- Autorização na API Nest: aluno não executa CRUD de catálogo nem o interruptor LLM; administrador não executa o UC01.
- Superfície web Next.js App Router + Tailwind/shadcn; persistência MySQL/MariaDB.

**Fora do escopo**

- Catálogo, progresso, LLM (SPECs seguintes).
- Conta que acumula os dois perfis (RB14). Gestão administrativa de contas: SPEC-008.
- Provedor de identidade externo; política numérica de comprimento de senha (não foi decidida).
- Motor de recomendação (OPEN-17).
- Tela para consultar logs (RNF09 grava na API; não é RF nem entidade).

## Telas e evidência de layout

**Gate:** Layout `aprovado` em 2026-09-30. Implementação `implementada` em 2026-10-08.

Toolkit (já decidido, não é o desenho): Next.js App Router, Tailwind CSS, shadcn/ui. Marca e cores: [`identidade-visual.md`](identidade-visual.md) (RNF10), identidade **aprovada**.

| Tela | Evidência (anexar) | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Casca do app (navegação aluno × admin após login) | [`spec-001.html#casca-aluno`](layout/spec-001.html#casca-aluno) · [`#casca-admin`](layout/spec-001.html#casca-admin) | [x] | [x] | humano | 2026-09-30 |
| Cadastro de aluno | [`spec-001.html#cadastro`](layout/spec-001.html#cadastro) | [x] | [x] | humano | 2026-09-30 |
| Login | [`spec-001.html#login`](layout/spec-001.html#login) | [x] | [x] | humano | 2026-09-30 |
| Credencial inválida / e-mail duplicado | [`#login-erro`](layout/spec-001.html#login-erro) · [`#cadastro-erro`](layout/spec-001.html#cadastro-erro) | [x] | [x] | humano | 2026-09-30 |
| Recuperação de senha | [`#recuperacao`](layout/spec-001.html#recuperacao) · [`#recuperacao-ok`](layout/spec-001.html#recuperacao-ok) | [x] | [x] | humano | 2026-09-30 |
| Logout (ação visível na casca) | botão **Sair** nas cascas aluno e admin | [x] | [x] | humano | 2026-09-30 |

Protótipo único (seletor de tela + viewport desktop/smartphone): [`docs/layout/spec-001.html`](layout/spec-001.html). Marca e paleta: [`layout/identidade.html`](layout/identidade.html). Layout desta Spec: `aprovado`.

Checklist RNF: navegação compreensível sem conhecimento técnico (RNF04); layout usável em computador, tablet e smartphone (RNF01); navegadores atuais (RNF08); logotipo e paleta da identidade (RNF10).

## 4. Dependências

Complementos de arquitetura já decididos: NestJS, App Router, MySQL/MariaDB, JWT, Tailwind + shadcn/ui, **log da API (RNF09)**, **identidade visual (RNF10)**.

## 5. Comportamento esperado

**Pré-condições:** aplicação implantada; seed do primeiro administrador executável; e-mail de cadastro ainda não usado.

**Fluxo principal (login aluno)**

1. A pessoa informa e-mail e senha.
2. A API Nest autentica, confirma perfil `Aluno` e devolve JWT Bearer.
3. O Next.js passa a enviar o token nas operações autenticadas.
4. Funções de aluno são liberadas; funções de administrador permanecem recusadas na API.

**Alternativos**

- **A1 Cadastro:** e-mail livre → persiste `Usuario` + `Aluno` com senha hashed → retorna ao login.
- **A2 Credenciais inválidas:** informa falha; não emite token; catálogo autenticado e progresso inacessíveis.
- **A3 Recuperação:** solicita redefinição; sistema envia procedimento ao e-mail cadastrado.
- **A4 Logout:** invalida o uso da sessão/token no cliente e recusa operações autenticadas seguintes com o token encerrado.
- **A5 Login administrador:** mesmo mecanismo JWT; perfil XOR `Administrador`; UC01 recusado.

**Exceções**

- **E1 E-mail duplicado:** recusa cadastro; nenhuma conta nova.
- **E2 Pedido administrativo por aluno ou anônimo:** recusa (RB02, RNF06).
- **E3 Pedido de acompanhamento de trilha por administrador:** recusa (RB14).

**Pós-condições de sucesso:** há `Usuario` com exatamente um subtipo; senha não está em texto aberto; JWT só é emitido após credencial válida; operação correspondente foi gravada no log da API (RNF09).

**Pós-condição de falha:** estado anterior preservado; anônimo não altera dados pessoais nem catálogo.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-001-01 | `Usuario.email` é único. Cadastro com e-mail existente é recusado. |
| INV-001-02 | `Usuario.senha` é persistida somente como hash, nunca em texto aberto. |
| INV-001-03 | Todo `Usuario` é **somente** `Aluno` **ou** **somente** `Administrador` (RB14). |
| INV-001-04 | Cadastro público cria `Aluno`. `Administrador` não nasce por auto-cadastro. |
| INV-001-05 | Autenticação, perfil e recusas valem na API Nest, não só na UI (ADR-004). |
| INV-001-06 | Administrador **não** executa UC01 (escolher trilha, progresso, personalizada, conversa). |
| INV-001-07 | Operações de catálogo e interruptor LLM exigem perfil administrador. |
| INV-001-08 | Cadastro, login (ok/falha), logout, recuperação e recusa de autorização geram log na API Nest **sem** senha, hash ou JWT completo (RNF09). |

## 7. Modelo de domínio envolvido

- `Usuario`: `nome`, `email` (único), `senha` (hash).
- Especialização XOR: `Aluno` | `Administrador`.
- Sem associação estrutural do administrador com o catálogo (permissão, não persistência).

## 8. Impacto arquitetural

- Dois artefatos: app Next.js (App Router, Tailwind, shadcn/ui) e API Nest.
- Módulo de identidade na API: cadastro, login JWT, logout, recuperação, seed admin.
- Log da API Nest (Logger nativo): eventos de identidade e autorização em `stdout` (e `logs/estudaai.log` em desenvolvimento). Ver [`logging.md`](logging.md).
- MySQL/MariaDB persiste `Usuario` e o subtipo; esquema físico deriva do conceitual, sem antecipar nomes de tabela nesta Spec.
- Chaves e invariantes **não** migram para Route Handlers do Next.js.

## 9. Contratos necessários

Operações conceituais (não são paths HTTP inventados):

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Cadastrar aluno | nome, e-mail, senha | conta `Aluno` criada | e-mail duplicado |
| Autenticar | e-mail, senha | JWT Bearer + perfil | credencial inválida |
| Encerrar sessão | token válido | sessão encerrada | token ausente/inválido |
| Recuperar senha | e-mail cadastrado | procedimento enviado ao e-mail | e-mail inexistente (sem vazar se a conta existe, se possível) |
| Seed administrador | execução de implantação | um `Administrador` | já existe (idempotente) |

Autorização: toda escrita posterior de catálogo/progresso/LLM consulta o perfil no servidor.

Canal concreto de SMTP **não** foi escolhido: usar adaptador de envio; não acoplar o domínio a um fornecedor.

## 10. RNFs aplicáveis

| RNF | Como verificar nesta Spec |
|---|---|
| RNF05 / RNF06 | Pedido HTTP sem token ou com perfil errado é recusado, mesmo se a UI esconder o botão |
| RNF07 | Identidade vive no módulo Nest; UI só consome o contrato |
| RNF03 | Login, cadastro e logout (sem LLM) &lt; 2 s |
| RNF01, RNF04, RNF08 | Telas de cadastro/login usáveis em desktop, tablet e smartphone nos navegadores atuais |
| RNF09 | Eventos da tabela em [`logging.md`](logging.md) aparecem no log; senha e JWT não aparecem |
| RNF10 | Login, cadastro, recuperação e cascas usam o logotipo e a paleta de [`identidade-visual.md`](identidade-visual.md) |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-001-01 | E-mail ainda não cadastrado | A pessoa solicita cadastro com nome, e-mail e senha | Surge `Usuario`+`Aluno`; senha persistida com hash |
| AC-001-02 | E-mail já cadastrado | A pessoa solicita cadastro com o mesmo e-mail | Operação recusada; nenhuma conta nova |
| AC-001-03 | Aluno cadastrado | Envia credenciais válidas | Recebe JWT Bearer; perfil aluno |
| AC-001-04 | Credenciais inválidas | Tenta login | Não há token; mensagem de falha |
| AC-001-05 | Aluno autenticado | Solicita logout | Operações autenticadas seguintes com aquele token são recusadas |
| AC-001-06 | Aluno autenticado | Chama operação de CRUD de categoria | API recusa |
| AC-001-07 | Administrador autenticado | Tenta escolher trilha / registrar progresso | API recusa |
| AC-001-08 | Implantação nova | Executa-se o seed | Existe pelo menos um `Administrador`; não há auto-cadastro admin |
| AC-001-09 | Aluno cadastrado | Solicita recuperação de senha | Procedimento é enviado ao e-mail cadastrado |
| AC-001-10 | Login com senha válida ou inválida | A API conclui a operação | Há linha de log `auth.login.ok` ou `auth.login.falha` **sem** o valor da senha |

## 12. Casos de teste derivados

1. Cadastro feliz + unicidade de e-mail.
2. Senha no banco não é igual ao texto informado (hash).
3. Login aluno e login admin emitem JWT com perfil XOR.
4. Recusa de cadastro duplicado e de credencial inválida.
5. Logout impede uso posterior do token.
6. Aluno não altera catálogo; admin não acompanha trilha (chamada direta à API).
7. Seed idempotente do primeiro admin.
8. Recuperação dispara envio (adaptador falso nos testes).
9. Tempo de login/cadastro sem LLM &lt; 2 s (amostra).
10. Log de login ok/falha e cadastro não contém senha nem JWT.

## 13. Questões em aberto

Nenhuma OPEN da entrevista permanece. Canal de transporte do e-mail (SMTP/serviço) não foi escolhido: não inventar fornecedor.

## 14. Definition of Done

Critérios AC-001-* implementados; INV-001-* preservados; testes da §12 aprovados; RNFs da §10 verificados; **layout `aprovado` antes do código** e conferido na entrega; sem divergência conhecida em relação a esta Spec; divergência de baseline registrada e decidida por humano.

---

# SPEC-002 — Gerenciar categorias de aprendizagem

**Status:** `implementada`  
**Layout:** `aprovado`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-002 |
| **Nome** | Gerenciar categorias de aprendizagem |
| **Objetivo** | Permitir que o administrador cadastre, consulte, altere e remova categorias, inclusive garantindo a sentinela **Personalizada** e recusando remoção enquanto houver trilhas classificadas. |
| **Valor** | Mariana organiza o catálogo por área; RB03 passa a ter onde classificar trilhas. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF09 |
| **RB** | RB02, RB03, RB13 |
| **RNF** | RNF05, RNF06, RNF03, RNF04, RNF07 |
| **UC / fluxo** | UC02 passo 3; A2 consultar; A3 alterar; A4 remover sem vínculo; E3 recusa se houver trilhas |
| **Entidades** | `Categoria` (inclui sentinela **Personalizada**) |
| **Drivers** | AD-RF04, AD-CEN04, AD-QA02 |
| **ADRs** | ADR-004 |
| **OPEN fechados** | OPEN-08, OPEN-23 |

## 3. Escopo

**Incluído:** CRUD de `Categoria` na API Nest; seed da sentinela **Personalizada**; bloqueio de remoção com trilhas (RB13); consulta autenticada pelo administrador.

**Fora do escopo:** CRUD de trilha/etapa (SPEC-003); interruptor LLM (SPEC-006 / RF13); listagem pública do catálogo de trilhas (SPEC-004).

## Telas e evidência de layout

**Gate:** Layout `aprovado` em 2026-10-01. Implementação `implementada` em 2026-10-08.

| Tela | Evidência (anexar) | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Lista de categorias (admin) | [`spec-002.html#lista`](layout/spec-002.html#lista) | [x] | [x] | humano | 2026-10-01 |
| Formulário criar/editar categoria | [`#criar`](layout/spec-002.html#criar) · [`#editar`](layout/spec-002.html#editar) | [x] | [x] | humano | 2026-10-01 |
| Recusa de remoção (categoria em uso / sentinela) | [`#recusa-uso`](layout/spec-002.html#recusa-uso) · [`#recusa-sentinela`](layout/spec-002.html#recusa-sentinela) | [x] | [x] | humano | 2026-10-01 |

Protótipo: [`docs/layout/spec-002.html`](layout/spec-002.html). Reutiliza a casca admin da SPEC-001 e a paleta RNF10. Layout desta Spec: `aprovado`.

## 4. Dependências

SPEC-001 (administrador autenticado JWT, autorização na API).

## 5. Comportamento esperado

**Pré-condições:** administrador autenticado; sentinela **Personalizada** criada no seed (junto ao primeiro admin ou no mesmo script de implantação).

**Fluxo principal:** administrador cadastra `Categoria` com `nome` e `descricao`; sistema persiste.

**Alternativos:** consultar lista; alterar nome/descrição; remover categoria **sem** trilhas.

**Exceções:** aluno/anônimo recusado; remoção com trilhas classificadas recusada (sem cascata e sem recategorização); remoção da sentinela recusada se houver trilhas personalizadas.

**Pós-condição de sucesso:** categorias persistidas; sentinela disponível para SPEC-006.  
**Falha:** catálogo de categorias inalterado.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-002-01 | Só `Administrador` cria, altera ou remove `Categoria`. |
| INV-002-02 | Remoção é recusada enquanto existir `Trilha` classificada na categoria (RB13). |
| INV-002-03 | Não há cascata nem recategorização automática. |
| INV-002-04 | Existe categoria de nome **Personalizada**; o aluno e o LLM não a escolhem. |

## 7. Modelo de domínio envolvido

- `Categoria`: `nome`, `descricao`.
- `Categoria` 1 : 1..* `Trilha` (a cardinalidade 1..* vale para categorias **em uso**; categoria recém-criada pode estar vazia até a primeira trilha).
- Sentinela **Personalizada** é uma `Categoria` persistida, não um enumerado solto.

## 8. Impacto arquitetural

Módulo de catálogo na API Nest, autorização ADR-004. UI administrativa no Next.js apenas consome o contrato.

## 9. Contratos necessários

| Operação | Entrada | Sucesso | Erros |
|---|---|---|---|
| Criar categoria | nome, descricao | categoria persistida | não autenticado / não admin |
| Listar / obter | id opcional | dados da(s) categoria(s) | não autenticado / não admin (consulta admin) |
| Alterar | id, nome, descricao | persistido | não encontrado; não admin |
| Remover | id | removida se 0 trilhas | há trilhas (RB13); não admin |

## 10. RNFs aplicáveis

RNF05/RNF06 recusa na API; RNF03 CRUD sem LLM &lt; 2 s; RNF04/RNF07 telas e módulo de catálogo.

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-002-01 | Admin autenticado | Cadastra categoria | Categoria persistida com nome e descrição |
| AC-002-02 | Aluno autenticado | Tenta cadastrar categoria | API recusa |
| AC-002-03 | Categoria sem trilhas | Admin remove | Categoria deixa de existir |
| AC-002-04 | Categoria com ao menos uma trilha | Admin tenta remover | Recusa; categoria e trilhas intactas |
| AC-002-05 | Implantação | Seed executado | Existe categoria **Personalizada** |

## 12. Casos de teste derivados

1. CRUD feliz de categoria pelo admin.
2. Recusa por aluno e anônimo.
3. Recusa de delete com trilha vinculada (pré-definida ou personalizada).
4. Seed da sentinela **Personalizada**.
5. Tempo de listagem/criação &lt; 2 s.

## 13. Questões em aberto

Nenhuma.

## 14. Definition of Done

AC-002-* e INV-002-* atendidos; testes da §12 aprovados; RNFs verificados; layout `aprovado` antes do código.

---

# SPEC-003 — Publicar trilha pré-definida com etapas ordenadas

**Status:** `implementada`  
**Layout:** `aprovado`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-003 |
| **Nome** | Publicar trilha pré-definida com etapas ordenadas |
| **Objetivo** | Permitir cadastro, consulta, alteração e remoção de trilhas pré-definidas e de suas etapas, com `ordem` explícita, publicando somente se RB03 for verdadeiro. `Etapa.conteudo` é Markdown. |
| **Valor** | Mariana disponibiliza percursos curados prontos para o aluno começar. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF10, RF11, RF12 |
| **RB** | RB02, RB03, RB07, RB10 (catálogo ≠ sugestão LLM; LLM ainda não entra) |
| **RNF** | RNF05, RNF06, RNF03, RNF04, RNF07 |
| **UC / fluxo** | UC02 passos 4–8; A2; A3; A4 sem progresso; A6 reordenar; E1; E2; E3 |
| **Entidades** | `Categoria`, `Trilha` (`tipo = pré-definida`), `Etapa` |
| **Drivers** | AD-RF01, AD-RF04, AD-CEN04, AD-C04, AD-QA01 |
| **ADRs** | ADR-003, ADR-004 |
| **OPEN fechados** | OPEN-16; OPEN-07 (parte sem progresso). OPEN-27 não acrescenta coluna: o vídeo é um link Markdown |

## 3. Escopo

**Incluído:** CRUD de trilha pré-definida e etapas; associação e reordenação; validação RB03 antes de publicar; remoção **somente** se não houver `Progresso` vigente e se restar 1..* etapas; conteúdo Markdown. Um vídeo do YouTube entra como link nesse Markdown (OPEN-27); a abertura em lightbox é da SPEC-004.

**Fora do escopo:** remoção com alunos em andamento (SPEC-005); trilha personalizada (SPEC-006); acompanhamento do aluno (SPEC-004).

## Telas e evidência de layout

**Gate:** Layout `aprovado` em 2026-10-01. Implementação `implementada` em 2026-10-08.

| Tela | Evidência (anexar) | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Lista de trilhas pré-definidas (admin) | [`spec-003.html#lista`](layout/spec-003.html#lista) | [x] | [x] | humano | 2026-10-01 |
| Formulário de trilha + etapas ordenadas | [`#criar`](layout/spec-003.html#criar) · [`#editar`](layout/spec-003.html#editar) | [x] | [x] | humano | 2026-10-01 |
| Reordenar etapas | [`spec-003.html#ordem`](layout/spec-003.html#ordem) | [x] | [x] | humano | 2026-10-01 |
| Recusa: trilha incompleta ou última etapa | [`#recusa-incompleta`](layout/spec-003.html#recusa-incompleta) · [`#recusa-ultima`](layout/spec-003.html#recusa-ultima) | [x] | [x] | humano | 2026-10-01 |

Protótipo: [`docs/layout/spec-003.html`](layout/spec-003.html). Reutiliza a casca admin da SPEC-001 e a paleta RNF10. Layout desta Spec: `aprovado`.

## 4. Dependências

SPEC-002 (categoria existente, inclusive para pré-definidas).

## 5. Comportamento esperado

**Pré-condições:** admin autenticado; ao menos uma categoria (não sentinela, em geral) disponível.

**Fluxo principal:** cadastra `Trilha` `pré-definida` em uma categoria → cadastra etapas (`titulo`, `conteudo` Markdown, `ordem`) → associa → sistema só disponibiliza se houver categoria e 1..* etapas ordenadas.

**Alternativos:** consultar; alterar titulo/descrição/conteúdo/ordem; remover trilha ou etapa **sem** progresso, desde que a trilha não fique vazia.

**Exceções:** E1 não admin; E2 trilha incompleta não publica; E3 remoção recusada se progresso (SPEC-005) ou se ficaria 0 etapas.

**Pós-condição de sucesso:** trilha publicável no catálogo com RB03 verdadeiro.  
**Falha:** nada publicado de forma incompleta.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-003-01 | Só administrador escreve trilha pré-definida e etapa (RB02, RB07). |
| INV-003-02 | Trilha só é publicável com exatamente uma categoria e 1..* etapas com `ordem` (RB03). |
| INV-003-03 | `Trilha.tipo` destas operações é `pré-definida`. |
| INV-003-04 | `Etapa.conteudo` é Markdown. |
| INV-003-05 | Recusa remover a última etapa de uma trilha. |
| INV-003-06 | Recusa remover etapa/trilha com `Progresso` vigente (detalhe de impacto na SPEC-005). |
| INV-003-07 | Esta Spec **não** grava `Trilha` a partir de LLM (RB10). |

## 7. Modelo de domínio envolvido

- `Trilha`: `titulo`, `descricao`, `tipo = pré-definida`.
- `Etapa`: `titulo`, `conteudo` (Markdown), `ordem`.
- `Categoria` 1 — classifica — `Trilha`; `Trilha` 1 — composta por — `Etapa` 1..*.

## 8. Impacto arquitetural

Mesmo módulo de catálogo da SPEC-002. Validação de invariante **antes** do commit (AD-CEN04). UI admin no Next.js; verdade na API Nest.

## 9. Contratos necessários

| Operação | Entrada | Sucesso | Erros |
|---|---|---|---|
| Criar/alterar trilha pré-definida | categoria, titulo, descricao | persistida | não admin; categoria inexistente |
| Criar/alterar/reordenar etapa | trilha, titulo, conteudo, ordem | persistida | não admin; trilha inexistente |
| Publicar / disponibilizar | trilha | visível no catálogo | RB03 falso |
| Remover etapa ou trilha sem progresso | id | removida | progresso vigente; restaria 0 etapas; não admin |

## 10. RNFs aplicáveis

RNF05/RNF06 na API; RNF03 CRUD &lt; 2 s; RNF04 sequência visível na UI admin; RNF07 módulo de catálogo.

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-003-01 | Admin e categoria existentes | Publica trilha com ≥1 etapa ordenada | Trilha `pré-definida` disponível no catálogo |
| AC-003-02 | Trilha sem etapas | Tenta disponibilizar | Recusa (RB03) |
| AC-003-03 | Trilha com 3 etapas, sem progresso | Remove uma etapa (restam 2) | Remove; ordem das restantes permanece consistente |
| AC-003-04 | Trilha com 1 etapa, sem progresso | Tenta remover a etapa | Recusa |
| AC-003-05 | Aluno autenticado | Tenta criar trilha pré-definida | API recusa |
| AC-003-06 | Etapa com conteúdo Markdown | Aluno (SPEC-004) visualizará o conteúdo | Persistido como Markdown, não como URL exclusiva |

## 12. Casos de teste derivados

1. Publicação feliz RB03.
2. Recusa de trilha incompleta.
3. Reordenação preserva identidade das etapas.
4. Recusa da última etapa.
5. Recusa de escrita por aluno.
6. Conteúdo Markdown aceito.

## 13. Questões em aberto

Nenhuma.

## 14. Definition of Done

AC-003-* e INV-003-* atendidos; testes da §12 aprovados; RNFs verificados; layout `aprovado` antes do código.

---

# SPEC-004 — Acompanhar trilha pré-definida

**Status:** `implementada`  
**Layout:** `aprovado`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-004 |
| **Nome** | Acompanhar trilha pré-definida |
| **Objetivo** | Permitir listar o catálogo (também anônimo), escolher trilha pré-definida autenticado como aluno, visualizar etapas Markdown e sequência, iniciar/retomar `Progresso` individual, marcar conclusão explícita e ver percentual derivado e histórico. Se catálogo vazio e LLM desligado, informar indisponibilidade. |
| **Valor** | Lucas inicia um percurso em poucos minutos, sabe a próxima etapa e percebe evolução sem ambiguidade. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF03, RF05, RF06, RF07 |
| **RB** | RB01, RB03, RB04, RB05, RB06, RB07, RB12, RB14 |
| **RNF** | RNF01, RNF03, RNF04, RNF05, RNF08, RNF07 |
| **UC / fluxo** | UC01 principal; A4 consultar; A6 retomar; E1; E4 |
| **Entidades** | `Aluno`, `Categoria`, `Trilha`, `Etapa`, `Progresso`, `ConclusaoEtapa` |
| **Drivers** | AD-RF01, AD-RF03, AD-CEN02, AD-QA01, AD-QA04 |
| **ADRs** | ADR-003, ADR-004 |
| **OPEN fechados** | OPEN-13, OPEN-15, OPEN-21, OPEN-22, OPEN-26, OPEN-27 |

## 3. Escopo

**Incluído:** listagem anônima; escolha e progresso só aluno autenticado; percentual derivado; histórico; retomada do mesmo `Progresso`; mensagem de catálogo indisponível (E4, em conjunto com estado do LLM da SPEC-006).

**Apresentação (OPEN-26, 2026-10-08):** no acompanhamento, a etapa é uma sanfona — título e estado visíveis, Markdown oculto até o clique. O trecho `## Exercício` permanece no painel aberto. O trecho `## Resposta`, quando existir, não aparece no fluxo da etapa: o botão **Ver resposta** abre um lightbox sobre a página. Sem `## Resposta`, o botão não aparece. Marcar conclusão continua explícita (RF07).

**Vídeo (OPEN-27, 2026-10-08):** um link de vídeo do YouTube (`youtube.com` ou `youtu.be`) no Markdown da etapa — corpo, `## Exercício` ou `## Resposta` — abre um lightbox sobre a página com o vídeo. O aluno permanece no acompanhamento. Os outros links continuam links. Não há entidade de mídia nem upload. Layout `aprovado` e implementação `implementada` em 2026-10-08.

**Fora do escopo:** criar personalizada (SPEC-006); conversa (SPEC-007); pausar/abandonar/reiniciar; admin como aluno.

## Telas e evidência de layout

**Gate:** Layout `aprovado` em 2026-10-01. Implementação `implementada` em 2026-10-08.

| Tela | Evidência (anexar) | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Catálogo por categoria (anônimo e autenticado) | [`spec-004.html#catalogo-anonimo`](layout/spec-004.html#catalogo-anonimo) · [`#catalogo`](layout/spec-004.html#catalogo) | [x] | [x] | humano | 2026-10-01 |
| Detalhe da trilha (etapas Markdown, sequência) | [`spec-004.html#trilha`](layout/spec-004.html#trilha) | [x] | [x] | humano | 2026-10-01 |
| Progresso, percentual e histórico | [`spec-004.html#progresso`](layout/spec-004.html#progresso) | [x] | [x] | humano | 2026-10-01 |
| Marcar etapa concluída | [`spec-004.html#conclusao`](layout/spec-004.html#conclusao) | [x] | [x] | humano | 2026-10-01 |
| Catálogo indisponível (E4) | [`spec-004.html#indisponivel`](layout/spec-004.html#indisponivel) | [x] | [x] | humano | 2026-10-01 |
| Recusa anônimo ao escolher trilha (conduz ao login) | [`spec-004.html#recusa`](layout/spec-004.html#recusa) | [x] | [x] | humano | 2026-10-01 |

Protótipo: [`docs/layout/spec-004.html`](layout/spec-004.html). Casca do aluno da SPEC-001 e paleta RNF10. Layout desta Spec: `aprovado`.

## 4. Dependências

SPEC-001 (aluno JWT); SPEC-003 (trilhas pré-definidas publicadas).

## 5. Comportamento esperado

**Pré-condições:** para escolha/progresso, aluno autenticado. Para listagem, nenhuma.

**Fluxo principal:** lista catálogo por categoria → escolhe trilha pré-definida → cria ou retoma `Progresso` → vê etapas/conteúdos/sequência e percentual → marca conclusão explícita → percentual e histórico atualizam.

**Alternativos:** A4 só consulta; A6 retoma `Progresso.ativo` existente (não duplica).

**Exceções:** E1 anônimo tenta escolher/marcar → recusa e conduz ao login (listagem permanece); E4 sem pré-definidas e LLM off → mensagem, nenhuma trilha nova.

**Pós-sucesso:** `Progresso` individual; `/percentualProgresso` = conclusões ÷ total de etapas; só etapas com `ConclusaoEtapa` contam.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-004-01 | Listar catálogo pré-definido **não** exige autenticação. |
| INV-004-02 | Escolher trilha e registrar progresso exigem aluno autenticado (RB01, RB14). |
| INV-004-03 | `Progresso` é individual (aluno + trilha); não se compartilha. |
| INV-004-04 | Etapa só entra no percentual com `ConclusaoEtapa` explícita (RB05). |
| INV-004-05 | Percentual é derivado e **não** editável pelo usuário (RB06). |
| INV-004-06 | Retomar usa o mesmo `Progresso.ativo`; não cria segundo acompanhamento da mesma trilha. |
| INV-004-07 | Não há operação de pausar, abandonar ou reiniciar nesta versão. |
| INV-004-08 | Administrador não inicia progresso. |

## 7. Modelo de domínio envolvido

- `Progresso`: `dataInicio`, `ativo`, `/percentualProgresso`.
- `ConclusaoEtapa`: `dataConclusao`; liga progresso à etapa.
- Visualização uniforme para `Trilha` (ADR-003); nesta Spec a origem é `pré-definida`.

## 8. Impacto arquitetural

Módulo de progresso na API Nest; cálculo do percentual no domínio. UI aluno no Next.js. Listagem pública não abre escrita. Caminho local isolado do LLM (RNF03).

## 9. Contratos necessários

| Operação | Quem | Sucesso | Erros |
|---|---|---|---|
| Listar catálogo por categoria | anônimo ou autenticado | trilhas pré-definidas publicadas | — (vazio é E4 se LLM off) |
| Escolher / iniciar progresso | aluno | `Progresso` criado ou retomado | anônimo; admin; trilha inexistente |
| Visualizar trilha e etapas | aluno com progresso ou após escolha | titulo, descrição, Markdown, ordem, percentual | sem autenticação na escolha |
| Marcar conclusão | aluno dono do progresso | `ConclusaoEtapa`; percentual recalculado | já concluída (idempotente); não dono; anônimo |

## 10. RNFs aplicáveis

RNF01/RNF04/RNF08: catálogo e progresso encontráveis no celular e no desktop. RNF03: listar, escolher, marcar &lt; 2 s. RNF05: escrita só autenticada. RNF07: módulo de progresso separado do adaptador LLM.

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-004-01 | Há trilhas publicadas | Anônimo abre o catálogo | Vê trilhas por categoria; não inicia progresso |
| AC-004-02 | Anônimo | Tenta escolher trilha | Recusa; conduz à autenticação |
| AC-004-03 | Aluno autenticado | Escolhe trilha pré-definida | `Progresso` individual criado; etapas visíveis em ordem |
| AC-004-04 | Aluno com progresso, etapa não concluída | Marca conclusão | `ConclusaoEtapa` gravada; percentual = n/total |
| AC-004-05 | Etapa sem marcação | Consulta percentual | Essa etapa **não** conta |
| AC-004-06 | Já existe `Progresso.ativo` na trilha | Aluno escolhe de novo | Retoma o mesmo progresso |
| AC-004-07 | Admin autenticado | Tenta iniciar progresso | Recusa |
| AC-004-08 | Catálogo sem pré-definidas e LLM desligado | Aluno acessa | Mensagem de catálogo indisponível; nenhuma trilha persistida |

## 12. Casos de teste derivados

1. Listagem anônima vs escolha autenticada.
2. Percentual 0/N, 1/N, N/N.
3. Idempotência de remarcação da mesma etapa.
4. Retomada sem duplicar `Progresso`.
5. Recusa admin e anônimo na escrita.
6. E4 com LLM off (flag da SPEC-006 pode ser stub).
7. Tempo das ações locais &lt; 2 s.

## 13. Questões em aberto

Nenhuma.

## 14. Definition of Done

AC-004-* e INV-004-* atendidos; testes da §12 aprovados; RNFs verificados; layout `aprovado` antes do código.

---

# SPEC-005 — Tratar impacto da remoção de etapa em uso

**Status:** `implementada`  
**Layout:** `aprovado`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-005 |
| **Nome** | Tratar impacto da remoção de etapa em uso |
| **Objetivo** | Quando o administrador solicitar remoção de `Etapa` com `Progresso` vigente, o sistema identifica afetados e **recusa** a operação, preservando `ConclusaoEtapa` e o percentual. Também recusa se a trilha ficaria sem etapas. |
| **Valor** | Mariana atualiza o catálogo sem corromper a evolução dos alunos. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF11 (remoção com vínculo) |
| **RB** | RB11, RB06, RB12, RB02, RB03 |
| **RNF** | RNF05, RNF06, RNF03, RNF07 |
| **UC / fluxo** | UC02-A5; UC02-E3 |
| **Entidades** | `Etapa`, `Trilha`, `Progresso`, `ConclusaoEtapa` |
| **Drivers** | AD-RF04, AD-CEN05, AD-CEN02 |
| **ADRs** | ADR-004, ADR-003 |
| **OPEN fechados** | OPEN-07 |

## 3. Escopo

**Incluído:** consulta de dependências; recusa de remoção com progresso vigente; preservação de histórico; recusa se restaria 0 etapas (já esboçada na SPEC-003, validada aqui com progresso real).

**Fora do escopo:** confirmação que apaga etapa em uso; recálculo por exclusão (não ocorre, porque a etapa em uso não sai); remoção de categoria (SPEC-002 / RB13).

## Telas e evidência de layout

**Gate:** Layout `aprovado` em 2026-10-01. Implementação `implementada` em 2026-10-08.

| Tela | Evidência (anexar) | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Recusa de remoção de etapa em uso (impacto visível ao admin) | [`spec-005.html#recusa`](layout/spec-005.html#recusa) · [`spec-005-recusa.html`](layout/spec-005-recusa.html) | [x] | [x] | humano | 2026-10-01 |

Protótipo: [`docs/layout/spec-005.html`](layout/spec-005.html). Telas extras: vários alunos (`#recusa-varios`) e última etapa com progresso (`#recusa-ultima`). Estado da UI da SPEC-003. **Não** há confirmação que apague etapa em uso. Layout desta Spec: `aprovado`.

## 4. Dependências

SPEC-003 (catálogo); SPEC-004 (existem `Progresso` e `ConclusaoEtapa`).

## 5. Comportamento esperado

**Pré-condições:** admin autenticado; etapa associada a trilha com ao menos um `Progresso` vigente.

**Fluxo (A5):** admin solicita remoção → sistema identifica progressos e conclusões afetados → **recusa** e informa o impacto → estado inalterado.

**Exceção E3:** equivalente à recusa; nada é removido.

**Pós-sucesso da política:** catálogo e progressos iguais aos de antes do pedido. Percentual vigente não muda.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-005-01 | Há `Progresso` vigente na trilha ⇒ remoção da etapa é recusada (RB11). |
| INV-005-02 | `ConclusaoEtapa` já gravadas são preservadas. |
| INV-005-03 | Recusa se a remoção deixaria 0 etapas (RB03). |
| INV-005-04 | Pedido recusado **não** altera `/percentualProgresso`. |
| INV-005-05 | Só administrador dispara a operação; a recusa também é da API, não só da UI. |

## 7. Modelo de domínio envolvido

Relação `Etapa` × `Progresso` × `ConclusaoEtapa`. Não se inventa exclusão lógica nesta Spec: a etapa em uso permanece.

## 8. Impacto arquitetural

A mesma API que executaria o delete **consulta dependências antes** e aborta. Sem “confirm” apenas visual (ADR-004).

## 9. Contratos necessários

| Operação | Entrada | Sucesso (remoção) | Erro esperado (caso em uso) |
|---|---|---|---|
| Remover etapa | id da etapa | só se 0 progressos vigentes na trilha e restar ≥1 etapa | `remoção recusada` + resumo de afetados |

## 10. RNFs aplicáveis

RNF05/RNF06; RNF03 recusa rápida (&lt; 2 s, sem LLM); RNF07 regra no módulo de catálogo/progresso.

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-005-01 | Etapa em trilha com progresso ativo | Admin solicita remoção | Recusa; etapa, progressos e conclusões intactos |
| AC-005-02 | Aluno já concluiu a etapa | Admin tenta remover | `ConclusaoEtapa` permanece |
| AC-005-03 | Trilha com 1 etapa e progresso | Admin tenta remover | Recusa também por RB03 |
| AC-005-04 | Etapa em trilha **sem** progresso e com irmãs | Admin remove (SPEC-003) | Remove; fora desta Spec, mas não contradiz INV-005-01 |

## 12. Casos de teste derivados

1. Recusa com 1 e com N alunos em progresso.
2. Histórico de conclusão preservado após recusa.
3. Percentual idêntico antes/depois do pedido recusado.
4. Recusa da última etapa mesmo misturando com SPEC-003.
5. Recusa por aluno que tente o endpoint.

## 13. Questões em aberto

Nenhuma.

## 14. Definition of Done

AC-005-* e INV-005-* atendidos; testes da §12 aprovados; RNFs verificados; layout `aprovado` antes do código.

---

# SPEC-006 — Criar trilha personalizada com agente LLM

**Status:** `implementada`  
**Layout:** `aprovado`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-006 |
| **Nome** | Criar trilha personalizada com agente LLM |
| **Objetivo** | Aluno autenticado descreve um objetivo; a API Nest chama Gemini (porta, síncrono, 60 s), materializa `Trilha` `personalizada` na sentinela **Personalizada** a partir de JSON `respostaLLM`, abre `Progresso` e reutiliza o acompanhamento da SPEC-004. O administrador liga/desliga a função. |
| **Valor** | Lucas descreve uma meta e recebe um percurso persistido, sem montar o plano à mão. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF04, RF13; reutiliza RF05–RF07 |
| **RB** | RB01, RB03, RB08, RB09, RB10 |
| **RNF** | RNF02, RNF03 (esta operação **fora** dos 2 s), RNF05, RNF07 |
| **UC / fluxo** | UC01-A3; E2; E3; E4 |
| **Entidades** | `SolicitacaoTrilha`, `Trilha` (`personalizada`), `Etapa`, `Progresso`, `Categoria` sentinela |
| **Drivers** | AD-RF01, AD-C02, AD-CEN01, AD-QA01, AD-QA03 |
| **ADRs** | ADR-002, ADR-003, ADR-004 |
| **OPEN fechados** | OPEN-06, OPEN-08, OPEN-09, OPEN-19, OPEN-20, OPEN-22 |

## 3. Escopo

**Incluído:** interruptor admin (RF13); porta LLM só no Nest; geração síncrona; timeout 60 s; contrato JSON; sentinela; transação solicitação+trilha+etapas+progresso; fallback para catálogo; E4 se catálogo vazio e LLM off.

**Fora do escopo:** fila; conversa (SPEC-007); o LLM escolher categoria; alterar trilhas pré-definidas; ranking da visão.

## Telas e evidência de layout

**Gate:** Layout `aprovado` em 2026-10-02. Implementação `implementada` em 2026-10-08.

| Tela | Evidência (anexar) | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Pedido de trilha personalizada (objetivo em linguagem natural) | [`spec-006.html#pedido`](layout/spec-006.html#pedido) · [`spec-006-pedido.html`](layout/spec-006-pedido.html) | [x] | [x] | humano | 2026-10-02 |
| Espera / timeout / falha da geração | [`spec-006.html#espera`](layout/spec-006.html#espera) · [`#timeout`](layout/spec-006.html#timeout) · [`#json`](layout/spec-006.html#json) | [x] | [x] | humano | 2026-10-02 |
| Interruptor LLM (admin) | [`spec-006.html#interruptor`](layout/spec-006.html#interruptor) · [`spec-006-interruptor.html`](layout/spec-006-interruptor.html) | [x] | [x] | humano | 2026-10-02 |
| Resultado: trilha personalizada (reusa SPEC-004 se o detalhe for o mesmo) | [`spec-006.html#resultado`](layout/spec-006.html#resultado) · [`spec-006-resultado.html`](layout/spec-006-resultado.html) | [x] | [x] | humano | 2026-10-02 |

Protótipo (seletor de tela + viewport): [`docs/layout/spec-006.html`](layout/spec-006.html). Telas extras: LLM desligado (`#off`), E4 (`#e4`), recusa anônimo (`#recusa-anonimo`). **Não** há chave Gemini na UI. Layout desta Spec: `aprovado`.

## 4. Dependências

SPEC-002 (sentinela **Personalizada**); SPEC-004 (visualizar e marcar progresso da trilha gerada). SPEC-001 (aluno JWT; admin para o interruptor).

## 5. Comportamento esperado

**Pré-condições:** aluno autenticado; LLM habilitado pelo admin; sentinela existente.

**Fluxo A3 (síncrono):** aluno envia `textoObjetivo` → API registra `SolicitacaoTrilha` e chama a porta Gemini → JSON `{titulo, descricao, etapas[{titulo, conteudo, ordem}]}` → persiste `Trilha` personalizada na sentinela, etapas Markdown, `Progresso` do aluno → segue visualização da SPEC-004.

**Exceções**

- **E2** timeout 60 s, provedor mudo ou interruptor off no meio: não cria trilha; informa falha; oferece catálogo.
- **E3** JSON sem titulo/descrição ou sem 1..* etapas: não persiste trilha.
- **E4** catálogo vazio e LLM desligado: mensagem; nada persistido.

**Pós-sucesso:** RB08/RB09 verdadeiros; catálogo pré-definido intacto (RB10).  
**Falha:** nenhuma `Trilha` inválida persistida.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-006-01 | Só aluno autenticado solicita geração (RB01, RB14). |
| INV-006-02 | Chamada ao LLM sai **somente** da API Nest, pela porta (ADR-002). Nenhuma chave no Next.js. |
| INV-006-03 | Provedor desta versão: Gemini. Timeout 60 s. Sem fila. |
| INV-006-04 | Admin habilita/desabilita a função (RF13). Desligada ⇒ A3 recusado com E2/E4. |
| INV-006-05 | Categoria é sempre a sentinela **Personalizada**; não vem do LLM nem do aluno. |
| INV-006-06 | `respostaLLM` inválida ⇒ não persiste `Trilha` (RB03, UC01-E3). |
| INV-006-07 | Trilha gerada **não** altera pré-definidas (RB10). |
| INV-006-08 | Latência desta operação **não** entra no SLA de 2 s (RNF03). |
| INV-006-09 | Sucesso cria `SolicitacaoTrilha` + `Trilha` + etapas + `Progresso` na mesma transação conceitual. |

## 7. Modelo de domínio envolvido

- `SolicitacaoTrilha`: `textoObjetivo`, `respostaLLM`, `dataSolicitacao`.
- `SolicitacaoTrilha` 0..1 origina `Trilha` 1 (`tipo = personalizada`).
- Etapas com `conteudo` Markdown e `ordem`.

## 8. Impacto arquitetural

Adaptador Gemini atrás de porta estável “texto in → estrutura de trilha out”. Dois caminhos na API: local (SPEC-004) vs externo (esta Spec). Testes usam adaptador falso. Interruptor é configuração persistida consultada na API.

## 9. Contratos necessários

| Operação | Entrada | Sucesso | Erros |
|---|---|---|---|
| Habilitar/desabilitar LLM | admin, flag | flag persistida | não admin |
| Gerar trilha personalizada | aluno, textoObjetivo | trilha + progresso | não aluno; LLM off; timeout; JSON inválido |
| Consultar estado LLM | (admin ou aluno, conforme UI) | habilitado/desabilitado | — |

JSON de `respostaLLM`:

```json
{
  "titulo": "string",
  "descricao": "string",
  "etapas": [
    { "titulo": "string", "conteudo": "string (Markdown)", "ordem": 1 }
  ]
}
```

## 10. RNFs aplicáveis

RNF02: Gemini + interruptor + 60 s. RNF03: listagem/progresso continuam &lt; 2 s **sem** esperar o Gemini. RNF05: geração autenticada. RNF07: trocar adaptador não reescreve `Trilha`/`Progresso`.

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-006-01 | LLM on, aluno autenticado, JSON válido com ≥1 etapa | Envia objetivo | `Trilha` personalizada na sentinela; `Progresso` do aluno; SPEC-004 aplica |
| AC-006-02 | LLM off | Aluno solicita geração | Recusa; nenhuma trilha nova; se catálogo vazio, E4 |
| AC-006-03 | Adaptador não responde em 60 s | Aluno solicita geração | Informa falha; não persiste trilha |
| AC-006-04 | JSON sem etapas | Porta devolve payload | Não persiste trilha; pede nova descrição |
| AC-006-05 | Há pré-definidas no catálogo | Geração bem-sucedida | Pré-definidas inalteradas |
| AC-006-06 | Admin | Desliga o LLM | Novas gerações recusadas |
| AC-006-07 | Chave Gemini | Inspeciona o bundle Next.js / cliente | Chave **não** está no frontend |
| AC-006-08 | Anônimo ou admin | Tenta gerar | Recusa |

## 12. Casos de teste derivados

1. Geração feliz com adaptador falso (JSON válido).
2. Interruptor off / on.
3. Timeout 60 s (relógio de teste).
4. JSON incompleto (sem titulo; etapas vazias).
5. Transação: falha após JSON válido não deixa trilha órfã.
6. RB10: count de pré-definidas inalterado.
7. Recusa de admin e anônimo.
8. Caminho local da SPEC-004 continua &lt; 2 s enquanto uma geração está em curso (não bloqueia listagem).

## 13. Questões em aberto

Nenhuma OPEN da entrevista. Modelo Gemini concreto (nome da versão da API) pode ser configuração do adaptador, sem nova entidade de domínio. Laboratório 2026-10-02: `GEMINI_MODEL=gemini-3.5-flash-lite` (a chave fica só em `apps/api/.env`).

## 14. Definition of Done

AC-006-* e INV-006-* atendidos; testes da §12 aprovados; RNFs verificados; chave fora do cliente; layout `aprovado` antes do código.

---

# SPEC-007 — Conversar com o agente LLM sobre a trilha

**Status:** `implementada`  
**Layout:** `aprovado`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-007 |
| **Nome** | Conversar com o agente LLM sobre a trilha |
| **Objetivo** | Aluno com trilha em andamento envia `Mensagem`; recebe apoio via Gemini (porta Nest, 60 s) referido **obrigatoriamente** a essa `Trilha`, sem criar nem alterar catálogo curado. Sem progresso ativo, a conversa é recusada. |
| **Valor** | Lucas tira dúvidas sem perder a confiança no catálogo curado. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF08 |
| **RB** | RB10, RB01, RB14 |
| **RNF** | RNF02, RNF03 (fora do SLA local), RNF01, RNF04, RNF05, RNF07 |
| **UC / fluxo** | UC01-A5; degradação análoga a E2 |
| **Entidades** | `Mensagem`, `Aluno`, `Trilha` (cardinalidade 1) |
| **Drivers** | AD-CEN03, AD-C02, AD-QA03 |
| **ADRs** | ADR-002, ADR-003 |
| **OPEN fechados** | OPEN-06, OPEN-14, OPEN-20 |

## 3. Escopo

**Incluído:** persistir turnos `origem ∈ {aluno, agente LLM}`; exigir `Progresso.ativo` e `Trilha`; recusar sem trilha; timeout 60 s; não escrever em trilha pré-definida.

**Apresentação (OPEN-26, 2026-10-08):** **Conversar sobre esta trilha** abre a conversa em lightbox sobre o acompanhamento. A rota direta `/progresso/:id/conversa` continua válida. O contrato da API não muda.

**Fora do escopo:** gerar nova trilha (SPEC-006); conversa anônima; admin no chat de estudo.

## Telas e evidência de layout

**Gate:** Layout `aprovado` em 2026-10-02. Implementação `implementada` em 2026-10-08.

| Tela | Evidência (anexar) | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Conversa referida à trilha em andamento | [`spec-007.html#chat`](layout/spec-007.html#chat) · [`spec-007-chat.html`](layout/spec-007-chat.html) · entrada [`#entrada`](layout/spec-007.html#entrada) · espera [`#espera`](layout/spec-007.html#espera) | [x] | [x] | humano | 2026-10-02 |
| Recusa sem progresso ativo | [`spec-007.html#recusa`](layout/spec-007.html#recusa) · [`spec-007-recusa.html`](layout/spec-007-recusa.html) | [x] | [x] | humano | 2026-10-02 |
| Falha: timeout ou LLM desligado | [`spec-007.html#timeout`](layout/spec-007.html#timeout) · [`#off`](layout/spec-007.html#off) · [`spec-007-falha.html`](layout/spec-007-falha.html) | [x] | [x] | humano | 2026-10-02 |

Protótipo (seletor de tela + viewport): [`docs/layout/spec-007.html`](layout/spec-007.html). Telas extras: recusa anônimo (`#recusa-anonimo`), recusa administrador (`#recusa-admin`). **Não** há chave Gemini na UI. Layout desta Spec: `aprovado`.

## 4. Dependências

SPEC-004 (`Progresso` vigente); SPEC-006 (porta LLM + interruptor).

## 5. Comportamento esperado

**Pré-condições:** aluno autenticado; `Progresso.ativo` em uma `Trilha`; LLM habilitado.

**Fluxo A5:** aluno envia texto → persiste `Mensagem` origem aluno referida à trilha → porta Gemini responde → persiste `Mensagem` origem agente → UI exibe o turno. Catálogo curado intocado.

**Exceções:** sem progresso ativo → recusa; LLM off/timeout/erro → informa falha, **não** altera catálogo nem etapas; anônimo/admin → recusa.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-007-01 | Toda `Mensagem` refere-se a exatamente uma `Trilha`. |
| INV-007-02 | Sem `Progresso.ativo` do aluno nessa trilha, a conversa é recusada. |
| INV-007-03 | Sugestões **não** criam, alteram ou substituem trilhas pré-definidas (RB10). |
| INV-007-04 | Timeout 60 s; falha não persiste efeito em catálogo. |
| INV-007-05 | Só aluno autenticado conversa; admin não usa este fluxo. |
| INV-007-06 | Chamada pela mesma porta Nest da SPEC-006; chave fora do cliente. |

## 7. Modelo de domínio envolvido

- `Mensagem`: `texto`, `dataEnvio`, `origem`.
- `Aluno` 1 envia `Mensagem` 0..*; `Mensagem` * — refere-se a — `Trilha` 1.

## 8. Impacto arquitetural

Canal de conversa separado do pipeline de publicação (AD-CEN03). Reusa o adaptador da SPEC-006 com contrato “texto in → mensagem out”.

## 9. Contratos necessários

| Operação | Entrada | Sucesso | Erros |
|---|---|---|---|
| Enviar mensagem | aluno, id da trilha em andamento, texto | mensagens aluno + agente persistidas | sem progresso; LLM off; timeout; não aluno |

## 10. RNFs aplicáveis

RNF02 (Gemini, 60 s, interruptor); RNF03 conversa fora dos 2 s; RNF01/RNF04 UI de chat no mesmo app web; RNF05 autenticação; RNF07 adaptador isolado.

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-007-01 | Aluno com progresso ativo, LLM on | Envia mensagem | Há turno do aluno e resposta do agente ligados à mesma trilha |
| AC-007-02 | Aluno sem progresso ativo | Envia mensagem | Recusa; nenhuma `Mensagem` de catálogo/trilha nova |
| AC-007-03 | Conversa bem-sucedida | Inspeciona trilhas pré-definidas | Inalteradas |
| AC-007-04 | Timeout 60 s | Envia mensagem | Falha informada; catálogo intacto |
| AC-007-05 | LLM desligado | Envia mensagem | Recusa; catálogo intacto |
| AC-007-06 | Admin ou anônimo | Tenta conversar | Recusa |

## 12. Casos de teste derivados

1. Round-trip feliz com adaptador falso.
2. Recusa sem progresso.
3. RB10: snapshot de pré-definidas antes/depois.
4. Timeout e interruptor off.
5. Cardinalidade: não persiste mensagem com trilha nula.
6. Recusa de admin/anônimo.

## 13. Questões em aberto

Nenhuma.

## 14. Definition of Done

AC-007-* e INV-007-* atendidos; testes da §12 aprovados; RNFs verificados; layout `aprovado` antes do código.

---

# SPEC-008 — Gerenciar usuários

**Status:** `implementada`  
**Layout:** `aprovado`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-008 |
| **Nome** | Gerenciar usuários |
| **Objetivo** | Permitir que o administrador cadastre, consulte, altere e remova contas de aluno e de administrador, com e-mail único, senha em hash, XOR de perfil, preservação do último administrador e recusa de remoção ou promoção de aluno com `Progresso`. |
| **Valor** | Mariana mantém quem acessa a plataforma sem depender só do seed e do cadastro público. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF14 |
| **RB** | RB14, RB15, RB16, RB17 |
| **RNF** | RNF05, RNF06, RNF03, RNF04, RNF07, RNF09 |
| **UC / fluxo** | UC03 |
| **Entidades** | `Usuario`, `Aluno`, `Administrador` |
| **Drivers** | AD-RF02, AD-QA02 |
| **ADRs** | ADR-004 |
| **OPEN fechados** | OPEN-24; reusa OPEN-10, OPEN-11, OPEN-12 |

## 3. Escopo

**Incluído:** CRUD administrativo de contas (aluno e administrador) na API Nest; alteração de nome, e-mail, senha e perfil; recusas de e-mail duplicado, último administrador, auto-remoção e aluno com progresso; UI `/usuarios`.

**Fora do escopo:** cadastro público (SPEC-001 / RF01); provedor de identidade externo; impersonação; consulta de progresso (SPEC-009); tela de logs.

## Telas e evidência de layout

**Gate:** Layout `aprovado` em 2026-10-08. Implementação `implementada` em 2026-10-08.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Lista de usuários | [`spec-008.html#lista`](layout/spec-008.html#lista) | [x] | [x] | humano | 2026-10-08 |
| Formulário criar/editar | [`#criar`](layout/spec-008.html#criar) · [`#editar`](layout/spec-008.html#editar) | [x] | [x] | humano | 2026-10-08 |
| Recusa (último admin / aluno com progresso) | [`#recusa-ultimo`](layout/spec-008.html#recusa-ultimo) · [`#recusa-progresso`](layout/spec-008.html#recusa-progresso) | [x] | [x] | humano | 2026-10-08 |

Protótipo: [`docs/layout/spec-008.html`](layout/spec-008.html). Reutiliza a casca admin da SPEC-001 e a paleta RNF10.

## 4. Dependências

SPEC-001 (administrador autenticado JWT, seed do primeiro admin, XOR).

## 5. Comportamento esperado

**Pré-condições:** administrador autenticado; existe ao menos um administrador.

**Fluxo principal:** administrador cadastra conta com nome, e-mail, senha e perfil (`aluno` ou `administrador`); sistema persiste com hash.

**Alternativos:** listar; alterar nome/e-mail/senha/perfil; remover aluno sem progresso ou administrador que não seja o último nem a própria sessão.

**Exceções:** aluno/anônimo recusado; e-mail duplicado; último administrador; auto-remoção; aluno com `Progresso` (remoção ou promoção).

**Pós-condição de sucesso:** conta persistida XOR; permanece ≥1 administrador.  
**Falha:** contas inalteradas.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-008-01 | Só `Administrador` cria, altera ou remove contas. |
| INV-008-02 | Toda conta é somente aluno ou somente administrador. |
| INV-008-03 | Não se remove o último administrador nem a própria conta. |
| INV-008-04 | Não se remove aluno com `Progresso`; não se altera o perfil desse aluno para administrador. |
| INV-008-05 | Senha nunca retorna na API; armazenamento é hash. |

## 7. Modelo de domínio envolvido

- `Usuario`: `nome`, `email`, `senha` (hash), especialização XOR.
- `Aluno` 1 : 0..* `Progresso` (bloqueia remoção e promoção).

## 8. Impacto arquitetural

Módulo de usuários na API Nest, autorização ADR-004. UI administrativa consome o contrato. Sem entidade nova no modelo conceitual.

## 9. Contratos necessários

| Operação | Entrada | Sucesso | Erros |
|---|---|---|---|
| Listar contas | — | lista sem senha | não autenticado / não admin |
| Criar conta | nome, e-mail, senha, perfil | conta persistida | e-mail duplicado; não admin |
| Alterar | id, nome/e-mail/senha/perfil | persistido | não encontrado; último admin; aluno com progresso promovido |
| Remover | id | removida | último admin; auto-remoção; aluno com progresso |

## 10. RNFs aplicáveis

RNF05/RNF06 recusa na API; RNF03 CRUD sem LLM &lt; 2 s; RNF09 log sem senha/hash/JWT.

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-008-01 | Admin autenticado | Cadastra aluno ou administrador | Conta persistida com perfil XOR; senha em hash |
| AC-008-02 | Aluno autenticado | Tenta listar ou criar conta | API recusa |
| AC-008-03 | E-mail já cadastrado | Admin tenta criar | Recusa; nenhuma conta nova |
| AC-008-04 | Único administrador | Tenta remover ou mudar o perfil para aluno | Recusa; conta intacta |
| AC-008-05 | Admin autenticado | Tenta remover a própria conta | Recusa |
| AC-008-06 | Aluno com progresso | Admin tenta remover ou promover | Recusa; progresso intacto |
| AC-008-07 | Aluno sem progresso | Admin remove | Conta deixa de existir |

## 12. Casos de teste derivados

1. CRUD feliz de aluno e de administrador pelo admin.
2. Recusa por aluno e anônimo.
3. Recusa de e-mail duplicado.
4. Recusa do último administrador e da auto-remoção.
5. Recusa de aluno com progresso.
6. Resposta sem senha; listagem &lt; 2 s.

## 13. Questões em aberto

Nenhuma.

## 14. Definition of Done

AC-008-* e INV-008-* atendidos; testes da §12 aprovados; RNFs verificados; layout `aprovado` antes do código.

---

# SPEC-009 — Consultar progresso dos alunos

**Status:** `implementada`  
**Layout:** `aprovado`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-009 |
| **Nome** | Consultar progresso dos alunos |
| **Objetivo** | Permitir que o administrador consulte, somente leitura, quais trilhas cada aluno acompanha e o percentual derivado, sem executar o UC01. |
| **Valor** | Mariana vê o andamento da turma sem marcar conclusão nem conversar no lugar do aluno. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF15; reutiliza RF06 |
| **RB** | RB04, RB06, RB14, RB18 |
| **RNF** | RNF05, RNF06, RNF03, RNF04, RNF07, RNF09 |
| **UC / fluxo** | UC04 |
| **Entidades** | `Aluno`, `Progresso`, `Trilha`, `Etapa`, `ConclusaoEtapa` |
| **Drivers** | AD-RF02, AD-RF03, AD-QA02 |
| **ADRs** | ADR-004 |
| **OPEN fechados** | OPEN-25; não reabre OPEN-21 |

## 3. Escopo

**Incluído:** listagem administrativa de alunos com resumo de trilhas e percentual; detalhe somente leitura (etapas concluídas / pendentes, próxima etapa); recusa de escrita (conclusão, escolha de trilha, conversa) pelo administrador; UI `/acompanhamentos`.

**Fora do escopo:** gestão de contas (SPEC-008); motor de recomendação; o administrador estudar como aluno; conversa (SPEC-007).

## Telas e evidência de layout

**Gate:** Layout `aprovado` em 2026-10-08. Implementação `implementada` em 2026-10-08.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Lista de alunos e andamento | [`spec-009.html#lista`](layout/spec-009.html#lista) | [x] | [x] | humano | 2026-10-08 |
| Detalhe do aluno | [`#aluno`](layout/spec-009.html#aluno) | [x] | [x] | humano | 2026-10-08 |
| Detalhe de uma trilha | [`#trilha`](layout/spec-009.html#trilha) | [x] | [x] | humano | 2026-10-08 |
| Aluno sem progresso | [`#vazio`](layout/spec-009.html#vazio) | [x] | [x] | humano | 2026-10-08 |

Protótipo: [`docs/layout/spec-009.html`](layout/spec-009.html). Reutiliza a casca admin da SPEC-001 e a paleta RNF10. Sem botão de concluir etapa.

## 4. Dependências

SPEC-004 (progresso individual e percentual derivado); SPEC-008 (contas listáveis).

## 5. Comportamento esperado

**Pré-condições:** administrador autenticado.

**Fluxo principal:** administrador abre a lista de alunos com trilhas e percentual; abre um aluno; vê etapas concluídas e pendentes.

**Alternativos:** aluno sem progresso; só a lista.

**Exceções:** aluno/anônimo recusado; pedido de conclusão, escolha de trilha ou conversa pelo administrador recusado.

**Pós-condição de sucesso:** visualização; nenhum `Progresso` nem `ConclusaoEtapa` alterado.  
**Falha:** estado inalterado.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-009-01 | Só `Administrador` consulta o andamento alheio. |
| INV-009-02 | Percentual é o mesmo derivado da SPEC-004 (conclusões ÷ etapas). |
| INV-009-03 | A consulta não cria, altera nem remove `Progresso` nem `ConclusaoEtapa`. |
| INV-009-04 | O administrador não executa o UC01. |

## 7. Modelo de domínio envolvido

- `Aluno` realiza `Progresso`; `Progresso` acompanha `Trilha`; `/percentualProgresso` derivado.
- Nenhuma associação estrutural nova do administrador.

## 8. Impacto arquitetural

Leitura no módulo de progresso, autorização ADR-004, perfil administrador. Sem adaptador LLM.

## 9. Contratos necessários

| Operação | Entrada | Sucesso | Erros |
|---|---|---|---|
| Listar acompanhamentos | — | alunos com resumo de trilhas e percentual | não autenticado / não admin |
| Detalhe do aluno | id do aluno | progressos daquele aluno | não encontrado; não admin |
| Detalhe de um progresso | id do aluno + id do progresso | etapas com concluída sim/não | não encontrado; não admin |

## 10. RNFs aplicáveis

RNF05/RNF06 recusa na API; RNF03 listagem &lt; 2 s; RNF09 log de consulta sem senha.

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-009-01 | Admin autenticado; aluno com progresso | Lista acompanhamentos | Vê o aluno, a trilha e o percentual derivado |
| AC-009-02 | Admin autenticado; aluno sem progresso | Lista ou abre o aluno | Vê o aluno sem trilhas; nada é criado |
| AC-009-03 | Aluno autenticado | Tenta a consulta administrativa | API recusa |
| AC-009-04 | Admin autenticado | Tenta marcar conclusão ou escolher trilha | API recusa; fatos intactos |
| AC-009-05 | Dois alunos com progressos distintos | Admin abre o detalhe de um | Vê só o progresso daquele aluno (RB04) |

## 12. Casos de teste derivados

1. Lista com percentual igual ao do aluno na SPEC-004.
2. Aluno sem progresso; nenhuma linha de `Progresso` nova.
3. Recusa por aluno e anônimo.
4. Recusa de POST de conclusão pelo admin.
5. Isolamento entre alunos.
6. Listagem &lt; 2 s.

## 13. Questões em aberto

Nenhuma.

## 14. Definition of Done

AC-009-* e INV-009-* atendidos; testes da §12 aprovados; RNFs verificados; layout `aprovado` antes do código.

---

## Definition of Done do conjunto

O conjunto SPEC-001 … SPEC-009 está **implementado** (001–007 em 2026-10-08; 008–009 pedidas e implementadas em 2026-10-08). Layout de todas as Specs: `aprovado`.

Ordem obrigatória por Spec:

1. texto da Spec `aprovada`;
2. evidências em `docs/layout/` e Layout `aprovado` (humano);
3. só então status `em implementação` — **uma Spec por vez**, começando pela SPEC-001;
4. `implementada` quando AC, INV, testes, RNFs e layout conferido na entrega.

Não misturar a Spec seguinte no mesmo pedido de código. Não implementar Spec com layout `pendente`.

Se durante a implementação surgir conflito entre código, esta Spec e a baseline:

1. corrigir a implementação para respeitar a baseline; ou
2. propor alteração da baseline para aprovação humana.

A decisão final é da equipe humana.
