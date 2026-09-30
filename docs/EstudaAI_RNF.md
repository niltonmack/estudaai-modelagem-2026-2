# EstudaAI - Requisitos Não Funcionais

Os requisitos seguem o modelo EARS (Easy Approach to Requirements Syntax). As palavras-chave são usadas da seguinte forma:

- `SHALL`: comportamento obrigatório do sistema.
- `SHOULD`: comportamento recomendado, mas não obrigatório.
- `WHEN`: evento que dispara o comportamento.
- `WHILE`: estado durante o qual o comportamento deve ocorrer.
- `IF`: condição para aplicação do comportamento.
- `WHERE`: funcionalidade ou contexto opcional de aplicação.

## RNF01 - Responsividade

**Tipo EARS:** Ubíquo

O sistema **SHALL** adaptar o conteúdo da interface para uso em computadores, tablets e smartphones.

## RNF02 - Integração com LLM

**Tipo EARS:** Optional feature

**WHERE** a funcionalidade de modelo de linguagem estiver habilitada, o sistema **SHALL** permitir a integração com uma API de modelo de linguagem utilizando **Gemini**. O administrador **SHALL** poder habilitar ou desabilitar essa funcionalidade pela interface administrativa. Chamadas ao LLM **SHALL** aplicar timeout de 60 segundos e **SHALL NOT** entrar no orçamento de 2 segundos do RNF03.

## RNF03 - Desempenho

**Tipo EARS:** Complex

**WHEN** uma pessoa usuária executar uma ação principal do sistema, **IF** a operação não depender diretamente de um serviço externo de LLM, o sistema **SHALL** apresentar tempo de resposta inferior a 2 segundos.

## RNF04 - Usabilidade

**Tipo EARS:** Ubíquo

A interface **SHALL** apresentar navegação clara e consistente, permitindo que o aluno localize trilhas, etapas e informações de progresso sem exigir conhecimento técnico.

## RNF05 - Segurança de acesso

**Tipo EARS:** Unwanted behavior

**IF** uma funcionalidade manipular dados pessoais, progresso ou dados de administração do sistema, o sistema **SHALL** exigir autenticação antes de permitir sua execução.

## RNF06 - Controle de acesso

**Tipo EARS:** Unwanted behavior

**IF** uma pessoa usuária solicitar uma operação administrativa de categorias, trilhas ou etapas, o sistema **SHALL** permitir a operação somente quando ela possuir perfil de administrador.

## RNF07 - Manutenibilidade

**Tipo EARS:** Ubíquo

O código do sistema **SHALL** ser organizado em módulos e seguir boas práticas compatíveis com um backend em Node e um frontend em React, facilitando correções e a evolução do sistema.

## RNF08 - Compatibilidade web

**Tipo EARS:** Ubíquo

O sistema **SHALL** funcionar nas versões atuais dos principais navegadores web utilizados em computadores e dispositivos móveis.

## RNF09 - Registro de operação (log)

**Tipo EARS:** Ubíquo

O sistema **SHALL** registrar em log as operações de identidade, autorização e falhas relevantes da API Nest.

Cada registro **SHALL** incluir data/hora, nível, evento e desfecho. O log **SHALL NOT** conter senha em texto aberto, hash de senha, token JWT completo nem chaves de provedor.

Não há tela de consulta de log nesta versão: o destino é a saída da API (console e, em desenvolvimento, arquivo em `logs/`). Política detalhada: [`logging.md`](logging.md).

## RNF10 - Identidade visual

**Tipo EARS:** Ubíquo

O sistema **SHALL** aplicar o logotipo e a paleta definidos em [`identidade-visual.md`](identidade-visual.md) em toda superfície web (aluno e administrador).

O sistema **SHALL NOT** usar uma segunda paleta de marca nem um segundo símbolo por perfil. Cores de estado (sucesso, perigo) não substituem Ink, Trilha nem Faísca.

## Observação sobre `SHOULD`

`SHOULD` não foi usado no corpo dos RNFs porque o arquivo de origem descreve características obrigatórias. Usá-lo reduziria a força normativa dos requisitos originais; ele deve ser aplicado apenas a comportamentos recomendados que não sejam obrigatórios.