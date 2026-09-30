# Visão do Produto

## EstudaAI – Sistema de Trilhas de Aprendizagem

### Objetivo

O **EstudaAI** é uma aplicação web voltada para auxiliar estudantes no planejamento de seus estudos por meio de trilhas de aprendizagem. A interface é implementada em **Next.js** (React) e a API em **Node**. O sistema oferece duas formas de utilização:

- **Trilhas Pré-definidas**: O aluno pode escolher entre trilhas de estudo já curadas por especialistas, prontas para serem seguidas
- **Trilhas Personalizadas**: O aluno pode criar trilhas personalizadas com o auxílio de um agente baseado em LLM (**Gemini**), quando a funcionalidade estiver habilitada pelo administrador

A “recomendação inteligente” e a “adaptação ao perfil e ritmo” **não** entram nesta versão: não há RF, RB nem entidade para motor de ranking.

### Funcionalidades Principais

1. **Escolha de trilhas**
   - Catálogo curado, organizado por categoria
   - Acompanhamento individual de progresso (fora desta versão: algoritmo de ranking e adaptação automática ao ritmo)

2. **Trilhas Pré-definidas**
   - Conteúdos curados por especialistas da área
   - Estruturados conforme melhores práticas pedagógicas
   - Pronto para uso imediato

3. **Geração de Trilhas Personalizadas**
   - Integração com Gemini para criação de trilhas sob demanda
   - Função desligável pelo administrador
   - Customização baseada nas necessidades específicas do estudante
   - Flexibilidade e personalização do percurso de aprendizagem

### Público-Alvo

- Estudantes que desejam otimizar seu tempo de estudo
- Pessoas que buscam aprimoramento contínuo e organizado
- Aprendices que preferem estrutura guiada ou flexibilidade personalizada
