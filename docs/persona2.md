 # Persona 2 — Administrador do Sistema

 ## Mariana Costa

 > **“Quero manter trilhas confiáveis e bem organizadas para que os alunos encontrem percursos de aprendizagem consistentes.”**

 ### Perfil

 - **Idade:** 34 anos
 - **Ocupação:** coordenadora pedagógica e responsável pelo conteúdo da plataforma
 - **Nível de familiaridade com tecnologia:** intermediário a avançado
 - **Contexto de uso:** utiliza o EstudaAI pelo computador para cadastrar e revisar conteúdos
 - **Frequência esperada:** semanalmente ou sempre que uma trilha precisar de atualização

 ### Objetivos

 - Organizar o catálogo de aprendizagem por categorias relevantes.
 - Publicar trilhas pré-definidas curadas por especialistas.
 - Estruturar cada trilha com etapas ordenadas e conteúdos coerentes.
 - Atualizar ou remover conteúdos desatualizados sem comprometer a experiência dos alunos.
 - Garantir que o catálogo ofereça percursos claros e úteis para diferentes objetivos de estudo.
 - Preservar a confiança na plataforma, mantendo a curadoria separada das sugestões geradas pelo LLM.

 ### Necessidades

 - Acesso administrativo protegido por autenticação e controle de perfil.
 - Operações de cadastro, consulta, alteração e remoção de categorias.
 - Operações de cadastro, consulta, alteração e remoção de trilhas pré-definidas.
 - Operações de cadastro, consulta, alteração e remoção de etapas.
 - Associação de etapas às trilhas e definição explícita da sequência.
 - Interface clara para revisar os dados antes de disponibilizá-los aos alunos.
 - Código modular e manutenível para permitir a evolução das funcionalidades administrativas.

 ### Dores e frustrações

 - Manter catálogos em planilhas ou ferramentas desconectadas gera retrabalho.
 - Uma etapa fora de ordem pode prejudicar a compreensão do aluno.
 - Alterações em etapas já utilizadas podem afetar o progresso registrado.
 - Não quer que sugestões automáticas sejam confundidas com conteúdo oficialmente curado.
 - Precisa de permissões bem definidas para evitar alterações administrativas indevidas.

 ### Comportamento no EstudaAI

 1. Autentica-se com uma conta de administradora.
 2. Cadastra ou atualiza categorias de aprendizagem.
 3. Cadastra trilhas pré-definidas e associa cada uma a uma categoria.
 4. Cadastra etapas e associa-as às trilhas na sequência adequada.
 5. Consulta e revisa o catálogo para corrigir informações ou remover conteúdos obsoletos.
 6. Avalia o impacto da remoção de etapas vinculadas antes de concluir a alteração.

 ### Requisitos relacionados

 - **RF02:** autenticar-se para acessar as funcionalidades do seu perfil.
 - **RF09:** gerenciar categorias.
 - **RF10:** gerenciar trilhas pré-definidas.
 - **RF11 e RF12:** gerenciar etapas e associá-las às trilhas em uma sequência definida.
 - **RNF05 e RNF06:** proteger operações administrativas e restringi-las ao perfil de administrador.
 - **RNF04 e RNF07:** manter uma interface consistente e uma base de código organizada.
 - **RB02, RB03, RB07 e RB11:** garantir administração restrita, integridade do catálogo e tratamento do impacto de remoções.

 ### Critérios de sucesso

 Mariana consegue manter categorias, trilhas e etapas de forma centralizada, definir sequências sem ambiguidades e realizar alterações com segurança, sem permitir acesso administrativo a alunos nem comprometer o progresso existente.
