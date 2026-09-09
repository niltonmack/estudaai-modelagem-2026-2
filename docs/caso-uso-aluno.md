# UC01 — Caso de uso do aluno

**Sistema:** EstudaAI  
**Caso de uso:** Acompanhar trilha de aprendizagem  
**Ator primário:** Aluno  
**Ator secundário:** Agente LLM  

O diagrama em PNG está em [`caso-uso-aluno.png`](caso-uso-aluno.png). Fundamentação: [modelo conceitual](modelo-conceitual.md), [RF01–RF08](EstudaAI_RF.md), [RB01 e RB04–RB10](EstudaAI_RB.md) e persona [Lucas Almeida](persona1.md).

![Diagrama de caso de uso do aluno](caso-uso-aluno.png)

## 1. Diagrama (Mermaid)

```mermaid
flowchart TB
    aluno(["Aluno<br/>ator primário"])
    llm(["Agente LLM<br/>ator secundário"])

    subgraph EstudaAI["EstudaAI"]
        auth(("Autenticar usuário"))
        uc01(("Acompanhar trilha<br/>de aprendizagem"))
        escolher(("Escolher trilha<br/>pré-definida"))
        criar(("Criar trilha<br/>personalizada"))
        progresso(("Registrar conclusão<br/>e progresso"))
        conversar(("Conversar com<br/>o agente LLM"))
    end

    aluno --- uc01
    llm --- criar
    llm --- conversar
    uc01 -.->|«include»| auth
    uc01 -.->|«include»| progresso
    escolher -.->|«extend»| uc01
    criar -.->|«extend»| uc01
    conversar -.->|«extend»| uc01
```

## 2. Relacionamentos do diagrama

| Relação | Tipo | Significado |
|---|---|---|
| Acompanhar trilha → Autenticar usuário | «include» | RB01 exige autenticação para selecionar trilha, criar trilha personalizada ou registrar progresso |
| Acompanhar trilha → Registrar conclusão e progresso | «include» | O acompanhamento sempre consulta `Progresso` e pode registrar `ConclusaoEtapa` |
| Escolher trilha pré-definida → Acompanhar trilha | «extend» | Caminho opcional: o aluno escolhe uma `Trilha` curada do catálogo |
| Criar trilha personalizada → Acompanhar trilha | «extend» | Caminho opcional: `SolicitacaoTrilha` origina `Trilha` personalizada com apoio do Agente LLM |
| Conversar com o agente LLM → Acompanhar trilha | «extend» | Apoio opcional; as `Mensagem` não substituem a curadoria (RB10) |

## 3. Caso de uso textual

### Identificação

| Campo | Conteúdo |
|---|---|
| Identificador | UC01 |
| Nome | Acompanhar trilha de aprendizagem |
| Ator primário | Aluno |
| Atores secundários | Agente LLM |
| Nível | Objetivo do usuário |
| Tipo | Concreto |
| Entidades do modelo conceitual | `Usuario`/`Aluno`, `Categoria`, `Trilha`, `Etapa`, `Progresso`, `ConclusaoEtapa`, `SolicitacaoTrilha`, `Mensagem` |

### Objetivo

Permitir que o aluno inicie ou retome uma trilha, visualize etapas e sequência, registre conclusões explícitas e acompanhe o percentual de progresso, com opção de trilha personalizada e de conversa com o agente LLM.

### Pré-condições

1. O aluno possui uma conta de `Usuario` com perfil de aluno, ou se cadastra no início do fluxo (RF01).
2. Existem trilhas pré-definidas no catálogo **ou** o serviço de LLM está disponível para gerar uma trilha personalizada.

### Pós-condições de sucesso

1. O aluno está autenticado.
2. Existe um `Progresso` individual do aluno associado a uma `Trilha` (pré-definida ou personalizada).
3. A trilha visível possui categoria e uma ou mais etapas ordenadas (RB03).
4. O `/percentualProgresso` reflete apenas etapas com `ConclusaoEtapa` (RB05, RB06).
5. Se o caminho personalizado foi usado, existem `SolicitacaoTrilha` e `Trilha` do tipo `personalizada` associadas ao aluno (RB08, RB09).

### Pós-condição de falha

Nenhuma trilha é associada ao aluno e nenhum `Progresso` novo é persistido. Tentativas sem autenticação são recusadas (RB01).

### Fluxo principal

Caminho feliz: o aluno autenticado escolhe uma trilha pré-definida e registra progresso.

1. O aluno informa e-mail e senha.
2. O sistema autentica o `Usuario` e libera as funções do perfil aluno (RF02).
3. O sistema exibe o catálogo de trilhas pré-definidas organizadas por `Categoria` (RF03).
4. O aluno escolhe uma trilha pré-definida.
5. O sistema cria ou retoma o `Progresso` individual desse aluno nessa `Trilha` (RB04).
6. O sistema exibe titulo, descrição, etapas, conteúdos e sequência (RF05).
7. O sistema exibe o `/percentualProgresso` (RF06, RB06).
8. O aluno solicita a conclusão de uma etapa que estudou (RF07).
9. O sistema registra `ConclusaoEtapa` com `dataConclusao` somente mediante essa marcação explícita (RB05).
10. O sistema recalcula o percentual e mantém o histórico enquanto `Progresso.ativo` for verdadeiro (RB12).
11. O caso de uso encerra com o aluno ciente da próxima etapa.

### Fluxos alternativos

**A1 — Cadastro na primeira utilização (RF01)**  
No passo 1, se o aluno ainda não possui conta, o sistema permite o cadastro e retorna ao passo 1.

**A2 — Credenciais inválidas**  
No passo 2, o sistema informa a falha e volta ao passo 1. O catálogo e o progresso permanecem inacessíveis.

**A3 — Criar trilha personalizada (ponto de extensão, RF04, RB08, RB09)**  
No passo 3, o aluno descreve o objetivo de estudo em linguagem natural em vez de escolher o catálogo.

1. O sistema registra `SolicitacaoTrilha.textoObjetivo` e encaminha o texto ao Agente LLM.
2. O Agente LLM devolve `respostaLLM` com proposta de percurso.
3. O sistema cria `Trilha` do tipo `personalizada`, com `Categoria` e uma ou mais `Etapa` ordenadas (RB03).
4. O sistema associa a trilha ao aluno por meio de `Progresso` (RB09).
5. O fluxo continua no passo 6.

**A4 — Apenas consultar o progresso**  
No passo 7, o aluno encerra sem marcar nova etapa. O histórico já registrado é preservado (RB12).

**A5 — Conversar com o agente LLM (ponto de extensão, RF08, RB10)**  
Após o passo 6, o aluno envia uma `Mensagem` sobre a trilha em andamento. O Agente LLM responde com apoio ao estudo. A conversa **não** altera a curadoria das trilhas pré-definidas.

**A6 — Retomar trilha já acompanhada**  
No passo 4, se já existir `Progresso` ativo para a trilha escolhida, o sistema retoma etapas, conclusões e percentual existentes, sem criar outro acompanhamento.

### Fluxos de exceção

**E1 — Uso sem autenticação (RB01)**  
Se o aluno tentar escolher trilha, criar trilha personalizada ou registrar progresso sem sessão autenticada, o sistema recusa a operação e conduz à autenticação.

**E2 — Agente LLM indisponível**  
Em A3, se o Agente LLM não produzir resposta, o sistema não cria `Trilha` personalizada, informa a falha e oferece o catálogo pré-definido.

**E3 — Resposta do LLM sem etapas suficientes (RB03)**  
Em A3, se a resposta não permitir montar uma trilha com categoria e ao menos uma etapa, o sistema não persiste a trilha e solicita nova descrição ou cancelamento.

### Regras de negócio e requisitos

| Item | Papel neste caso de uso |
|---|---|
| RF01, RF02 | Cadastro e autenticação |
| RF03, RF05 | Catálogo, etapas, conteúdos e sequência |
| RF04, RB08, RB09 | Trilha personalizada a partir de `SolicitacaoTrilha` |
| RF06, RF07, RB04, RB05, RB06, RB12 | Progresso individual, conclusão explícita e percentual derivado |
| RF08, RB10 | Conversa de apoio, sem substituir trilhas curadas |
| RB01 | Autenticação obrigatória para trilhas e progresso |
| RB03 | Trilha sempre com categoria e etapas ordenadas |
