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

## RB02 - Administração restrita

**Tipo EARS:** Conditional

**IF** uma pessoa usuária solicitar a criação, alteração ou remoção de uma categoria, trilha pré-definida ou etapa, o sistema **SHALL** permitir a operação somente quando ela possuir perfil de administrador.

## RB03 - Organização das trilhas

**Tipo EARS:** Ubiquitous

Toda trilha de aprendizagem **SHALL** possuir uma categoria e ser composta por uma ou mais etapas ordenadas.

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

**WHEN** uma trilha personalizada for criada, o sistema **SHALL** associá-la ao aluno que a solicitou para permitir o acompanhamento de seu progresso.

## RB10 - Resposta do agente LLM

**Tipo EARS:** Ubiquitous

As sugestões produzidas pelo agente LLM **SHALL** ter caráter de apoio ao estudo e **SHALL NOT** substituir a curadoria das trilhas pré-definidas.

## RB11 - Integridade das etapas

**Tipo EARS:** Conditional

**IF** uma pessoa usuária solicitar a remoção de uma etapa vinculada a uma trilha, o sistema **SHALL** tratar o impacto dessa remoção sobre o progresso dos alunos que utilizam a trilha antes de concluí-la.

## RB12 - Histórico de progresso

**Tipo EARS:** State-driven

**WHILE** uma trilha estiver ativa no acompanhamento de um aluno, o sistema **SHALL** manter registrada a conclusão de cada etapa desse aluno.