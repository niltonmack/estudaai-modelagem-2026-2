# EstudaAI - Requisitos Funcionais

Os requisitos seguem o modelo EARS (Easy Approach to Requirements Syntax). As palavras-chave são usadas da seguinte forma:

- `SHALL`: comportamento obrigatório do sistema.
- `SHOULD`: comportamento recomendado, mas não obrigatório.
- `WHEN`: evento que dispara o comportamento.
- `WHILE`: estado durante o qual o comportamento deve ocorrer.
- `IF`: condição ou situação excepcional.
- `WHERE`: funcionalidade opcional ou contexto de aplicação.

## RF01 - Cadastrar usuário

**Tipo EARS:** Event-driven

**WHEN** uma pessoa usuária solicitar seu cadastro com um e-mail ainda não utilizado, o sistema **SHALL** permitir o registro de uma nova conta de aluno, armazenando a senha com hash.

**IF** o e-mail informado já estiver cadastrado, o sistema **SHALL** recusar o registro.

## RF02 - Autenticar usuário

**Tipo EARS:** Event-driven

**WHEN** uma pessoa usuária cadastrada enviar suas credenciais, o sistema **SHALL** realizar o login, emitir um token JWT (Bearer) e liberar as funcionalidades disponíveis para seu perfil.

**WHEN** uma pessoa usuária autenticada solicitar o encerramento da sessão, o sistema **SHALL** efetuar o logout.

**WHEN** uma pessoa usuária solicitar a recuperação de senha, o sistema **SHALL** enviar o procedimento de redefinição para o e-mail cadastrado.

## RF03 - Escolher trilha pré-definida

**Tipo EARS:** Event-driven

**WHEN** uma pessoa acessar o catálogo de aprendizagem, o sistema **SHALL** exibir as trilhas pré-definidas organizadas por área ou categoria, inclusive sem autenticação.

**WHEN** o aluno autenticado escolher uma trilha pré-definida, o sistema **SHALL** permitir essa escolha.

## RF04 - Criar trilha personalizada com LLM

**Tipo EARS:** Event-driven

**WHEN** o aluno autenticado enviar seus objetivos de estudo em linguagem natural **e** a funcionalidade de LLM estiver habilitada, o sistema **SHALL** solicitar ao agente uma trilha personalizada de forma síncrona, a partir de `respostaLLM` em JSON com `titulo`, `descricao` e lista de etapas `{titulo, conteudo, ordem}`, classificada na categoria sentinela **Personalizada**.

## RF05 - Visualizar trilha de aprendizagem

**Tipo EARS:** Event-driven

**WHEN** o aluno selecionar uma trilha pré-definida ou personalizada, o sistema **SHALL** exibir suas etapas, conteúdos e sequência.

## RF06 - Visualizar progresso

**Tipo EARS:** State-driven

**WHILE** o aluno estiver utilizando uma trilha de aprendizagem, o sistema **SHALL** disponibilizar seu progresso nessa trilha.

## RF07 - Marcar etapa como concluída

**Tipo EARS:** Event-driven

**WHEN** o aluno solicitar a conclusão de uma etapa da trilha, o sistema **SHALL** registrar essa etapa como concluída.

## RF08 - Conversar com o agente LLM

**Tipo EARS:** Event-driven

**WHEN** o aluno autenticado, com uma trilha em andamento, enviar uma mensagem na interface de conversa, o sistema **SHALL** permitir a solicitação de sugestões, o esclarecimento de dúvidas e o recebimento de apoio relacionado a essa trilha.

**IF** não houver trilha em andamento, o sistema **SHALL** recusar a conversa.

## RF09 - Gerenciar categorias

**Tipo EARS:** State-driven

**WHILE** uma pessoa usuária administradora estiver autenticada, o sistema **SHALL** permitir o cadastro, a consulta, a alteração e a remoção de categorias de aprendizagem, observada a integridade das trilhas classificadas (RB13).

## RF10 - Gerenciar trilhas

**Tipo EARS:** State-driven

**WHILE** uma pessoa usuária administradora estiver autenticada, o sistema **SHALL** permitir o cadastro, a consulta, a alteração e a remoção de trilhas pré-definidas.

## RF11 - Gerenciar etapas

**Tipo EARS:** State-driven

**WHILE** uma pessoa usuária administradora estiver autenticada, o sistema **SHALL** permitir o cadastro, a consulta, a alteração e a remoção de etapas associadas às trilhas, observada a integridade do progresso (RB11).

## RF12 - Associar etapas a trilhas

**Tipo EARS:** Complex

**WHILE** uma pessoa usuária administradora estiver autenticada, **WHEN** ela organizar uma trilha, o sistema **SHALL** permitir a associação das etapas que a compõem e a definição da sequência dessas etapas.

## RF13 - Habilitar ou desabilitar o LLM

**Tipo EARS:** State-driven

**WHILE** uma pessoa usuária administradora estiver autenticada, o sistema **SHALL** permitir habilitar ou desabilitar a funcionalidade de modelo de linguagem (RNF02).

## Observação sobre `SHOULD` e `IF`

`SHOULD` não foi usado no corpo dos RFs porque o arquivo descreve capacidades obrigatórias. `IF` aparece onde a entrevista humana definiu condição excepcional (e-mail duplicado, conversa sem trilha).