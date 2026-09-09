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

**WHEN** uma pessoa usuária solicitar seu cadastro, o sistema **SHALL** permitir o registro de uma nova conta.

## RF02 - Autenticar usuário

**Tipo EARS:** Event-driven

**WHEN** uma pessoa usuária cadastrada enviar suas credenciais, o sistema **SHALL** realizar o login e liberar as funcionalidades disponíveis para seu perfil.

## RF03 - Escolher trilha pré-definida

**Tipo EARS:** Event-driven

**WHEN** o aluno acessar o catálogo de aprendizagem, o sistema **SHALL** exibir as trilhas pré-definidas organizadas por área ou categoria e permitir a escolha de uma trilha.

## RF04 - Criar trilha personalizada com LLM

**Tipo EARS:** Event-driven

**WHEN** o aluno enviar seus objetivos de estudo em linguagem natural, o sistema **SHALL** permitir a solicitação de uma trilha personalizada com o apoio de um agente baseado em LLM.

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

**WHEN** o aluno enviar uma mensagem na interface de conversa, o sistema **SHALL** permitir a solicitação de sugestões, o esclarecimento de dúvidas e o recebimento de apoio relacionado à sua trilha de aprendizagem.

## RF09 - Gerenciar categorias

**Tipo EARS:** State-driven

**WHILE** uma pessoa usuária administradora estiver autenticada, o sistema **SHALL** permitir o cadastro, a consulta, a alteração e a remoção de categorias de aprendizagem.

## RF10 - Gerenciar trilhas

**Tipo EARS:** State-driven

**WHILE** uma pessoa usuária administradora estiver autenticada, o sistema **SHALL** permitir o cadastro, a consulta, a alteração e a remoção de trilhas pré-definidas.

## RF11 - Gerenciar etapas

**Tipo EARS:** State-driven

**WHILE** uma pessoa usuária administradora estiver autenticada, o sistema **SHALL** permitir o cadastro, a consulta, a alteração e a remoção de etapas associadas às trilhas.

## RF12 - Associar etapas a trilhas

**Tipo EARS:** Complex

**WHILE** uma pessoa usuária administradora estiver autenticada, **WHEN** ela organizar uma trilha, o sistema **SHALL** permitir a associação das etapas que a compõem e a definição da sequência dessas etapas.

## Observação sobre `SHOULD` e `IF`

`SHOULD` não foi usado no corpo dos RFs porque o arquivo de origem descreve capacidades obrigatórias; substituí-lo por `SHOULD` reduziria a força normativa de “deve permitir”. `IF` também não foi inventado nos requisitos, pois o texto de origem não define comportamento para condições excepcionais. Ambos ficam registrados na legenda para uso quando essas condições forem especificadas.