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

No acompanhamento, cada etapa **SHALL** aparecer em sanfona: o título fica visível e o conteúdo permanece oculto até o aluno clicar na etapa.

**WHERE** o Markdown da etapa contiver as seções `## Exercício` e `## Resposta`, o sistema **SHALL** mostrar o enunciado na etapa e **SHALL** revelar a resposta somente quando o aluno acionar **Ver resposta**, em um lightbox sobre a página.

**WHEN** o aluno acionar um link de vídeo do YouTube (`youtube.com` ou `youtu.be`) no Markdown da etapa, o sistema **SHALL** abrir esse vídeo em um lightbox sobre a página, sem abandonar o acompanhamento. Os demais links **SHALL** permanecer links.

**WHERE** o Markdown contiver fórmula entre `$` ou `$$`, o sistema **SHALL** desenhá-la como expressão matemática. A vírgula entre algarismos permanece vírgula decimal.

## RF06 - Visualizar progresso

**Tipo EARS:** State-driven

**WHILE** o aluno estiver utilizando uma trilha de aprendizagem, o sistema **SHALL** disponibilizar seu progresso nessa trilha.

## RF07 - Marcar etapa como concluída

**Tipo EARS:** Event-driven

**WHEN** o aluno solicitar a conclusão de uma etapa da trilha, o sistema **SHALL** registrar essa etapa como concluída.

## RF08 - Conversar com o agente LLM

**Tipo EARS:** Event-driven

**WHEN** o aluno autenticado, com uma trilha em andamento, enviar uma mensagem na interface de conversa, o sistema **SHALL** permitir a solicitação de sugestões, o esclarecimento de dúvidas e o recebimento de apoio relacionado a essa trilha.

**WHEN** o aluno acionar **Conversar sobre esta trilha** no acompanhamento, o sistema **SHALL** abrir essa conversa em um lightbox sobre a página, sem abandonar a trilha.

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

## RF14 - Gerenciar usuários

**Tipo EARS:** State-driven

**WHILE** uma pessoa usuária administradora estiver autenticada, o sistema **SHALL** permitir o cadastro, a consulta, a alteração e a remoção de contas de aluno e de administrador, observada a exclusividade de perfil (RB14) e a preservação de ao menos um administrador (RB16).

**IF** o e-mail informado já estiver cadastrado, o sistema **SHALL** recusar o cadastro.

O cadastro público (RF01) continua criando somente aluno. Contas de administrador além do seed nascem nesta operação.

## RF15 - Consultar progresso dos alunos

**Tipo EARS:** State-driven

**WHILE** uma pessoa usuária administradora estiver autenticada, o sistema **SHALL** disponibilizar a consulta das trilhas que cada aluno acompanha e o percentual de progresso correspondente.

O administrador **SHALL NOT** registrar conclusão de etapa, iniciar acompanhamento nem conversar com o agente no lugar do aluno. Essa consulta **não** é o UC01.

## RF16 - Ajustar trilha personalizada com LLM

**Tipo EARS:** Event-driven

**WHEN** o aluno dono de uma trilha `personalizada` reenviar um prompt para corrigir ou melhorar essa trilha **e** a funcionalidade de LLM estiver habilitada, o sistema **SHALL** pedir ao agente a trilha revista e **SHALL** gravar o resultado na mesma `Trilha`, sem criar outra e sem alterar trilhas pré-definidas.

O aluno **SHALL** poder pedir inclusão, exclusão ou reescrita de etapas. A etapa que permanece conserva a conclusão já marcada. A etapa excluída deixa de compor a trilha, e a conclusão só dela é removida. A etapa nova nasce sem conclusão.

## RF17 - Buscar conteúdo das trilhas por significado

**Tipo EARS:** Event-driven

**WHEN** o aluno autenticado enviar uma pergunta em linguagem natural na página do catálogo, o sistema **SHALL** devolver as etapas cujo conteúdo é semanticamente próximo dessa pergunta, na mesma página, acima da lista por categoria.

A busca **SHALL** percorrer as trilhas disponíveis para todos: as pré-definidas publicadas e as personalizadas que o autor deixou disponíveis. **SHALL** incluir também as personalizadas ainda privadas desse aluno. **SHALL NOT** devolver a personalizada privada de outro aluno.

Cada resultado **SHALL** identificar a trilha, a etapa e, na personalizada, o autor. O aluno que ainda não acompanha essa trilha **SHALL** poder começá-la dali. O MySQL permanece a fonte do conteúdo; o índice vetorial só acelera a busca.

## RF18 - Disponibilizar trilha personalizada

**Tipo EARS:** Event-driven

**WHEN** o autor de uma trilha `personalizada` deixá-la disponível, o sistema **SHALL** passá-la a constar para todos os alunos, na categoria **Personalizada**, sem copiar a trilha e sem criar outro `Progresso` para o autor.

**WHEN** outro aluno começar essa trilha, o sistema **SHALL** criar o `Progresso` dele sobre a mesma `Trilha` e as mesmas etapas. A autoria **SHALL** permanecer com quem a solicitou. As conclusões de um aluno **SHALL NOT** alterar as de outro.

## Observação sobre `SHOULD` e `IF`

`SHOULD` não foi usado no corpo dos RFs porque o arquivo descreve capacidades obrigatórias. `IF` aparece onde a entrevista humana definiu condição excepcional (e-mail duplicado, conversa sem trilha).