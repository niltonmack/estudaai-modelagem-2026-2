# EstudaAI - Regras de Negócio

As regras abaixo seguem o modelo EARS (Easy Approach to Requirements Syntax). As palavras-chave são usadas da seguinte forma:

- `SHALL`: comportamento ou restrição obrigatória.
- `SHALL NOT`: comportamento proibido.
- `WHEN`: evento que dispara a regra.
- `WHILE`: estado durante o qual a regra se aplica.
- `IF`: condição para aplicação da regra.
- `WHERE`: contexto específico de aplicação.

## RB01 - Autenticação para uso das trilhas

**Tipo EARS:** Conditional

**IF** um aluno quiser selecionar uma trilha, criar uma trilha personalizada ou registrar seu progresso, o sistema **SHALL** exigir que ele esteja autenticado.

A listagem do catálogo de trilhas pré-definidas **SHALL NOT** exigir autenticação.

## RB02 - Administração restrita

**Tipo EARS:** Conditional

**IF** uma pessoa usuária solicitar a criação, alteração ou remoção de uma categoria, trilha pré-definida ou etapa, o sistema **SHALL** permitir a operação somente quando ela possuir perfil de administrador.

## RB03 - Organização das trilhas

**Tipo EARS:** Ubiquitous

Toda trilha de aprendizagem **SHALL** possuir uma categoria e ser composta por uma ou mais etapas ordenadas.

Toda trilha personalizada **SHALL** ser classificada na categoria sentinela de nome **Personalizada**. Essa categoria **SHALL** existir no catálogo e **SHALL NOT** ser escolhida pelo aluno nem pelo LLM.

## RB04 - Progresso individual

**Tipo EARS:** Ubiquitous

O sistema **SHALL** registrar o progresso de uma trilha individualmente para cada aluno.

## RB05 - Conclusão de etapas

**Tipo EARS:** Conditional

**IF** uma etapa não tiver sido explicitamente marcada como concluída pelo aluno, o sistema **SHALL NOT** considerá-la concluída.

## RB06 - Cálculo do progresso

**Tipo EARS:** Ubiquitous

O sistema **SHALL** calcular o percentual de progresso de uma trilha com base na quantidade de etapas concluídas em relação ao total de etapas da trilha.

## RB07 - Trilhas pré-definidas

**Tipo EARS:** Ubiquitous

Trilhas pré-definidas **SHALL** ser cadastradas e organizadas previamente por pessoas usuárias administradoras.

## RB08 - Trilhas personalizadas

**Tipo EARS:** Event-driven

**WHEN** o aluno enviar uma solicitação textual e o agente LLM produzir uma resposta, o sistema **SHALL** criar a trilha personalizada a partir da solicitação e da resposta produzida.

## RB09 - Persistência da trilha personalizada

**Tipo EARS:** Event-driven

**WHEN** uma trilha personalizada for criada, o sistema **SHALL** registrar o aluno que a solicitou como autor da `Trilha` e **SHALL** abrir o `Progresso` desse autor.

A autoria **SHALL NOT** ser inferida pelo `Progresso`. Outro aluno **SHALL** poder ter o próprio `Progresso` na mesma trilha quando ela estiver disponível (RF18). Cada `Progresso` guarda só as conclusões daquele aluno.

## RB10 - Resposta do agente LLM

**Tipo EARS:** Ubiquitous

As sugestões produzidas pelo agente LLM **SHALL** ter caráter de apoio ao estudo e **SHALL NOT** substituir a curadoria das trilhas pré-definidas.

## RB11 - Integridade das etapas

**Tipo EARS:** Conditional

**IF** uma pessoa usuária solicitar a remoção de uma etapa vinculada a uma trilha que possua progresso de alunos, o sistema **SHALL NOT** concluir a remoção.

**IF** a remoção deixaria a trilha sem etapas, o sistema **SHALL** recusar a operação (RB03).

`ConclusaoEtapa` já registradas **SHALL** ser preservadas no histórico. Só é permitido remover ou desassociar a etapa quando ninguém a utiliza.

## RB12 - Histórico de progresso

**Tipo EARS:** State-driven

**WHILE** uma trilha estiver ativa no acompanhamento de um aluno, o sistema **SHALL** manter registrada a conclusão de cada etapa desse aluno.

Nesta versão o sistema **SHALL NOT** oferecer operação de pausar, abandonar ou reiniciar o `Progresso`. O atributo `ativo` apenas distingue o acompanhamento vigente.

## RB13 - Integridade das categorias

**Tipo EARS:** Conditional

**IF** uma pessoa usuária solicitar a remoção de uma `Categoria` que ainda classifique trilhas, o sistema **SHALL NOT** concluir a remoção.

Não há cascata nem recategorização automática.

## RB14 - Perfil exclusivo

**Tipo EARS:** Ubiquitous

Todo `Usuario` **SHALL** ser **somente** aluno **ou** **somente** administrador. O sistema **SHALL NOT** acumular os dois perfis na mesma conta. O fluxo de acompanhamento de trilhas (UC01) é exclusivo do aluno.

A consulta administrativa do progresso dos alunos (RF15) **SHALL NOT** ser tratada como execução do UC01: o administrador vê o andamento, não estuda no lugar do aluno.

## RB15 - Gestão de usuários restrita

**Tipo EARS:** Conditional

**IF** uma pessoa usuária solicitar a criação, alteração ou remoção de uma conta de `Usuario`, o sistema **SHALL** permitir a operação somente quando ela possuir perfil de administrador.

## RB16 - Persistência do último administrador

**Tipo EARS:** Conditional

**IF** a remoção de uma conta ou a alteração de perfil deixaria o sistema sem nenhum administrador, o sistema **SHALL NOT** concluir a operação.

O sistema **SHALL NOT** permitir que o administrador remova a própria conta.

## RB17 - Integridade da conta do aluno

**Tipo EARS:** Conditional

**IF** uma pessoa usuária solicitar a remoção de um aluno que possua `Progresso`, o sistema **SHALL NOT** concluir a remoção.

**IF** uma pessoa usuária solicitar a alteração do perfil de um aluno para administrador **WHILE** existir `Progresso` desse aluno, o sistema **SHALL NOT** concluir a alteração.

## RB18 - Consulta administrativa somente leitura

**Tipo EARS:** State-driven

**WHILE** o administrador consultar o progresso de um aluno, o sistema **SHALL NOT** criar, alterar nem remover `Progresso` nem `ConclusaoEtapa`.

## RB19 - Busca semântica do conteúdo

**Tipo EARS:** Event-driven

**WHEN** o aluno buscar por significado, o sistema **SHALL** percorrer as etapas das trilhas disponíveis a todos e as das personalizadas privadas desse aluno.

**WHEN** uma etapa entrar, mudar ou sair desse conjunto, o sistema **SHALL** refletir a mudança no índice vetorial. Uma etapa **SHALL** corresponder a um único registro, identificado por `id da trilha` + `id da etapa`.

A busca **SHALL NOT** criar, alterar nem remover `Trilha`, `Etapa`, `Progresso` nem `ConclusaoEtapa`. Começar a trilha encontrada é o fluxo já usado no catálogo, não um efeito da pergunta.

## RB20 - Trilha personalizada disponível a todos

**Tipo EARS:** Event-driven

**WHEN** o autor deixar a trilha `personalizada` disponível, qualquer aluno **SHALL** poder encontrá-la e abrir o próprio `Progresso` nela. O sistema **SHALL NOT** duplicar `Trilha` nem `Etapa`.

**WHILE** outro aluno tiver `Progresso` nessa trilha, o autor **SHALL NOT** remover etapa (RB11). Pode reescrever etapa existente e incluir etapa nova. Só o autor ajusta a trilha pelo agente (RF16).

**WHEN** o autor retirar a disponibilidade, a trilha **SHALL** sair do catálogo e da busca dos demais. Os `Progresso` já abertos **SHALL** permanecer. Um aluno novo **SHALL NOT** começá-la enquanto estiver indisponível. A personalizada nasce indisponível para os demais.