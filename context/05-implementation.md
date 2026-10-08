# Implementação SPEC-001

Status: código da SPEC-001 (identidade, JWT, autorização na API, casca Next.js).

## Desvios em relação à Spec

| # | Referência | Desvio | Motivo | Impacto |
|---|---|---|---|---|
| 1 | §9 operações conceituais | Paths HTTP concretos (`/auth/*`, `/categorias`, `/progresso/escolher-trilha`, `/progresso/:id/mensagens`, `/configuracao/llm`, `/solicitacoes-trilha`, `/usuarios`, `/acompanhamentos`) | A Spec não fixa paths; os testes de AC precisam de operação recusável na API | `/categorias` persistiu na SPEC-002; `/progresso/escolher-trilha` na SPEC-004; `/configuracao/llm` e `/solicitacoes-trilha` na SPEC-006; `/progresso/:id/mensagens` na SPEC-007; `/usuarios` na SPEC-008; `/acompanhamentos` na SPEC-009 |
| 2 | Modelo conceitual XOR | Uma tabela `usuario` com coluna `perfil` (STI) | Equivale ao XOR sem duas tabelas vazias | Fácil de evoluir para tabelas de subtipo depois |
| 3 | Modelo conceitual | Tabelas `token_revogado` e `recuperacao_senha` | AC-001-05 exige recusar o token após logout; RF02 exige procedimento de recuperação | Não são entidades de domínio |
| 4 | MySQL/MariaDB | Testes usam `sql.js` em memória | Laboratório Windows / CI sem MySQL dedicado | Dev local (2026-10-02): MySQL80 em `127.0.0.1:3306`, schema `estudaai` (usuário `estudaai`). `dentalapp` não é usado. Docker Compose permanece opcional |
| 5 | SMTP | Adaptador `ConsoleEnvioEmail` / `MemoriaEnvioEmail` | Canal SMTP não foi escolhido | Recuperação funciona; e-mail real entra quando houver fornecedor |
| 6 | Toolkit shadcn/ui | Componentes no padrão visual shadcn (botão, input, alerta), sem CLI shadcn | Fidelidade ao protótipo aprovado | Visual alinhado a RNF10 |
| 7 | `Trilha.descricao` TEXT | Sem `DEFAULT ''` no MySQL 8 (`ER_BLOB_CANT_HAVE_DEFAULT`) | sql.js aceitava o default; MySQL80 não | TypeORM `synchronize` no banco local; valor continua obrigatório na aplicação |
| 8 | Flag `LLM_HABILITADO` de ambiente | Substituída por linha persistida em `configuracao_llm` | SPEC-006 / RF13: interruptor na UI admin | `GET`/`POST /configuracao/llm`; seed desligado |

## Como executar

1. MySQL local em `127.0.0.1:3306` com o banco `estudaai` (não usar `dentalapp`)
2. `npm install`
3. `npm run seed` (admin + sentinela Personalizada + interruptor LLM desligado)
4. `npm run api`
5. `npm run web`
6. Login admin: `mariana@estudaai.local` / `AdminTemp1`

## SPEC-002

CRUD de `Categoria` em `/categorias` (admin JWT). Seed da sentinela **Personalizada**. Entidade `Trilha` passou a ter CRUD na SPEC-003.

## SPEC-003

CRUD de trilha `pré-definida` em `/trilhas` e etapas em `/trilhas/:id/etapas`. Publicar em `POST /trilhas/:id/publicar` só com RB03. Sentinela **Personalizada** recusada como categoria de pré-definida.

## SPEC-004

Catálogo público em `GET /catalogo` (sem autenticação): só trilhas `pré-definida` com `disponivel`. `POST /progresso/escolher-trilha` cria ou retoma `Progresso` do aluno. `GET /progresso` e `GET /progresso/:id` devolvem `/percentualProgresso` derivado (conclusões ÷ etapas). `POST /progresso/:id/etapas/:etapaId/conclusao` é idempotente. Interruptor LLM persistido (`GET`/`POST /configuracao/llm`) na SPEC-006. Sem pausar/abandonar/reiniciar.

## SPEC-005

`DELETE /trilhas/:id/etapas/:etapaId` consulta `Progresso` vigente na trilha antes de apagar. Se houver acompanhamento, responde 409 com `remoção recusada` e resumo de afetados; `ConclusaoEtapa` e `/percentualProgresso` permanecem. Recusa da última etapa (RB03) vale com ou sem progresso. Sem confirmação que apague etapa em uso.

## SPEC-006

Interruptor persistido em `configuracao_llm` (`GET`/`POST /configuracao/llm`; só admin altera). Porta Gemini só na API Nest (`PORTA_LLM`); testes usam adaptador falso. `POST /solicitacoes-trilha` (aluno, síncrono, 60 s) valida JSON `{titulo, descricao, etapas[]}`, persiste `SolicitacaoTrilha` + `Trilha` `personalizada` na sentinela **Personalizada** + etapas + `Progresso` na mesma transação. Timeout/JSON inválido/LLM off não criam trilha. Chave Gemini fora do Next.js.

UI: aluno `/personalizada`; admin `/agente` (Faísca só com Gemini ligado). Resultado reusa `/progresso/:id`.

Esquema físico em `apps/api/src/db/schema.sql` (inclui `configuracao_llm`, `solicitacao_trilha` e `mensagem`). `configuracao_llm` **não** é entidade do modelo conceitual (é o interruptor RF13).

Acesso Gemini no laboratório (2026-10-02): `generateContent` com a chave de `apps/api/.env` retornou HTTP 200 no modelo `gemini-3.5-flash-lite`. O modelo `gemini-2.5-flash-lite` foi recusado pelo provedor para usuários novos; a configuração passou a `GEMINI_MODEL=gemini-3.5-flash-lite`. A chave **não** entra neste arquivo.

## SPEC-007

`GET`/`POST /progresso/:id/mensagens` (aluno JWT). Exige `Progresso.ativo` do próprio aluno na trilha (OPEN-14). Reusa `PORTA_LLM.conversar` (texto in → mensagem out, 60 s). Persistência: `Mensagem` com `origem ∈ {aluno, agente LLM}` e `trilha_id` obrigatório. Timeout/LLM off/sem progresso não alteram catálogo nem etapas. Admin e anônimo recusados. Chave Gemini continua só na API Nest.

UI: em `/progresso/:id`, *Conversar sobre esta trilha* abre a conversa em lightbox (OPEN-26). A rota direta `/progresso/:id/conversa` continua válida. As etapas do acompanhamento são sanfona; `## Resposta` só aparece no lightbox *Ver resposta*.

## SPEC-008

CRUD administrativo de contas em `/usuarios` (admin JWT). `POST` cria aluno ou administrador; `PATCH` altera nome, e-mail, senha e/ou perfil; `DELETE` recusa último admin, auto-remoção e aluno com `Progresso`. Respostas sem senha/hash. UI `/usuarios`. O cadastro público `/auth/cadastro` continua só aluno.

## SPEC-009

Consulta somente leitura em `/acompanhamentos` (admin JWT). Lista alunos com trilhas e percentual derivado (mesmo cálculo da SPEC-004). Detalhe `/acompanhamentos/:alunoId` e `/acompanhamentos/:alunoId/progressos/:progressoId` (etapas concluídas/pendentes, sem conteúdo Markdown obrigatório na lista). Não cria nem altera `Progresso`/`ConclusaoEtapa`. UI `/acompanhamentos`. Admin continua recusado em `POST /progresso/*`.
