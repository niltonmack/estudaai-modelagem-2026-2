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

Specs posteriores acrescentam eventos no mesmo formato (`catalogo.*`, `progresso.*`, `llm.*`), sem senha nem chave Gemini.

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
