# Log da aplicação — EstudaAI

Pedido humano (2026-09-30): a API Nest **registra operações**; não é uma tela do produto e **não** é entidade do modelo conceitual.

Rastreio: [RNF09](EstudaAI_RNF.md). Entra na implementação da **SPEC-001** e vale nas Specs seguintes.

Biblioteca: o **Logger do NestJS** (troca reversível; não é ADR). Destino: `stdout`. Em desenvolvimento, também `logs/estudaai.log` (arquivo **fora** do Git).

## O que entra no log (SPEC-001)

| Evento | Quando |
|---|---|
| `auth.cadastro.ok` | Conta de aluno criada |
| `auth.cadastro.email_duplicado` | Cadastro recusado |
| `auth.login.ok` | JWT emitido (inclui perfil XOR) |
| `auth.login.falha` | Credencial inválida |
| `auth.logout.ok` | Sessão encerrada |
| `auth.recuperacao.solicitada` | Pedido de redefinição (sem dizer se o e-mail existe) |
| `auth.autorizacao.recusada` | Aluno em operação admin, admin no UC01, ou anônimo em escrita |
| `auth.seed.admin` | Seed do primeiro administrador |

## O que entra no log (SPEC-002)

| Evento | Quando |
|---|---|
| `catalogo.categoria.criada` | Admin persistiu uma categoria |
| `catalogo.categoria.alterada` | Admin alterou nome ou descrição |
| `catalogo.categoria.removida` | Admin removeu categoria sem trilhas |
| `catalogo.categoria.remocao_recusada` | RB13 ou sentinela **Personalizada** |
| `catalogo.seed.personalizada` | Seed da sentinela (idempotente) |

## O que entra no log (SPEC-003)

| Evento | Quando |
|---|---|
| `catalogo.trilha.criada` | Admin persistiu trilha pré-definida |
| `catalogo.trilha.alterada` | Admin alterou título, descrição ou categoria |
| `catalogo.trilha.removida` | Admin removeu trilha sem progresso |
| `catalogo.trilha.publicada` | Trilha passou a ficar disponível (RB03) |
| `catalogo.trilha.publicacao_recusada` | Disponibilizar recusado (RB03 falso) |
| `catalogo.etapa.criada` | Etapa associada à trilha |
| `catalogo.etapa.alterada` | Título, Markdown ou ordem alterados |
| `catalogo.etapa.removida` | Etapa removida (restam 1..*) |
| `catalogo.etapa.remocao_recusada` | Recusa da última etapa ou de etapa com progresso vigente (RB11) |
| `catalogo.etapa.reordenada` | Nova sequência gravada |

## O que entra no log (SPEC-004)

| Evento | Quando |
|---|---|
| `progresso.iniciado` | Aluno criou `Progresso` em trilha pré-definida |
| `progresso.retomado` | Aluno voltou ao mesmo `Progresso.ativo` |
| `progresso.conclusao.ok` | `ConclusaoEtapa` gravada (ou idempotente) |
| `catalogo.indisponivel` | Listagem vazia e LLM desligado (E4) |

## O que entra no log (SPEC-006)

| Evento | Quando |
|---|---|
| `llm.interruptor.alterado` | Admin persistiu o flag ligado/desligado |
| `llm.geracao.ok` | `SolicitacaoTrilha` + trilha personalizada + progresso gravados |
| `llm.geracao.recusada` | LLM desligado (AC-006-02) ou E4 |
| `llm.geracao.timeout` | Timeout 60 s ou provedor mudo (E2) |
| `llm.geracao.json_invalido` | `respostaLLM` sem título, descrição ou etapas (E3) |
| `llm.geracao.persistencia_falhou` | JSON válido, transação revertida; nenhuma trilha órfã |
| `llm.ajuste.ok` | Mesma trilha personalizada revista pelo prompt do aluno |
| `llm.ajuste.recusada` | LLM desligado, trilha pré-definida ou aluno que não é o dono |
| `llm.ajuste.timeout` | Timeout 60 s ou provedor mudo; trilha anterior permanece |
| `llm.ajuste.json_invalido` | JSON sem título, descrição ou etapas; trilha anterior permanece |
| `llm.ajuste.persistencia_falhou` | JSON válido, transação revertida; trilha anterior permanece |

A chave Gemini **não** entra no log.

## O que entra no log (SPEC-007)

| Evento | Quando |
|---|---|
| `llm.conversa.ok` | Turnos aluno e agente persistidos referidos à trilha |
| `llm.conversa.recusada` | Sem progresso ativo ou LLM desligado |
| `llm.conversa.timeout` | Timeout 60 s ou provedor mudo (E2) |

A chave Gemini **não** entra no log.

## O que entra no log (SPEC-011)

| Evento | Quando |
|---|---|
| `busca.ok` | A pergunta do aluno voltou do índice; o log leva a quantidade de resultados, sem o texto da pergunta nem o conteúdo da etapa |
| `busca.falha` | Pinecone ausente, timeout ou erro; nada no MySQL foi alterado |
| `indice.upsert` | Registro `trilhaId#etapaId` gravado ou atualizado depois do commit no MySQL |
| `indice.removido` | Registro removido porque a etapa saiu do conjunto pesquisável |
| `indice.falha` | A gravação no Pinecone falhou depois do commit; a trilha no MySQL permanece |
| `trilha.disponibilizada` | O autor deixou a personalizada disponível a todos |
| `trilha.retirada` | O autor retirou a disponibilidade; progressos já abertos permanecem |

A chave Pinecone **não** entra no log. O campo `text` do registro **não** entra no log.

## O que entra no log (SPEC-008)

| Evento | Quando |
|---|---|
| `usuario.criado` | Admin persistiu conta de aluno ou administrador |
| `usuario.alterado` | Admin alterou nome, e-mail, senha ou perfil |
| `usuario.removido` | Admin removeu conta sem vínculo impeditivo |
| `usuario.remocao_recusada` | Último admin, auto-remoção ou aluno com progresso |
| `usuario.alteracao_recusada` | Último admin, e-mail duplicado ou aluno com progresso promovido |

A senha, o hash e o JWT **não** entram no log.

## O que entra no log (SPEC-009)

| Evento | Quando |
|---|---|
| `acompanhamento.consultado` | Admin listou alunos ou abriu o detalhe de um progresso |
| `auth.autorizacao.recusada` | Aluno ou anônimo tentou a consulta administrativa |

Nenhuma escrita em `Progresso` nem `ConclusaoEtapa`.

## Campos

| Campo | Obrigatório |
|---|---|
| `timestamp` | ISO-8601 |
| `level` | `info`, `warn` ou `error` |
| `event` | identificador da tabela acima |
| `outcome` | `ok` ou `recusado` / `falha` |
| `email` | quando houver, para operação de identidade |
| `perfil` | `aluno`, `administrador` ou `anonimo` |
| `message` | frase curta |

**Proibido:** senha, hash, JWT completo, `Authorization` header, connection string, chave Gemini.

## Fora de escopo

- Tela administrativa para “ver logs”.
- Entidade `Log` no modelo conceitual.
- Retenção/SIEM externos (não decididos; não inventar).
