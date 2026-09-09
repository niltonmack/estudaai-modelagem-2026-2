# ESTUDA-AI — Modelagem de Software 2026-2

O **EstudaAI** é uma aplicação web de recomendação de trilhas de aprendizagem. A interface é implementada em **Next.js** (React) e a API em **Node**.

O aluno pode:

- seguir **trilhas pré-definidas**, curadas por especialistas e organizadas por categoria;
- criar **trilhas personalizadas** com o apoio de um agente baseado em LLM (OpenAI ou Ollama).

O administrador mantém o catálogo (categorias, trilhas e etapas) sem que as sugestões do LLM substituam a curadoria.

A visão completa está em [`docs/visaodoproduto.md`](docs/visaodoproduto.md).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (React) |
| Backend | Node |
| LLM (opcional) | OpenAI ou Ollama |

O código **SHALL** ser organizado em módulos compatíveis com essa arquitetura (RNF07).

## Documentação

| Artefato | Arquivo |
|---|---|
| Visão do produto | [`docs/visaodoproduto.md`](docs/visaodoproduto.md) |
| Personas | [`docs/persona1.md`](docs/persona1.md) (aluno), [`docs/persona2.md`](docs/persona2.md) (administrador) |
| Requisitos funcionais | [`docs/EstudaAI_RF.md`](docs/EstudaAI_RF.md) |
| Requisitos não funcionais | [`docs/EstudaAI_RNF.md`](docs/EstudaAI_RNF.md) |
| Regras de negócio | [`docs/EstudaAI_RB.md`](docs/EstudaAI_RB.md) |
| Modelo conceitual | [`docs/modelo-conceitual.md`](docs/modelo-conceitual.md) · [`docs/modelo-conceitual.png`](docs/modelo-conceitual.png) |
| Caso de uso do aluno (UC01) | [`docs/caso-uso-aluno.md`](docs/caso-uso-aluno.md) · [`docs/caso-uso-aluno.png`](docs/caso-uso-aluno.png) |
| Caso de uso do administrador (UC02) | [`docs/caso-uso-admin.md`](docs/caso-uso-admin.md) · [`docs/caso-uso-admin.png`](docs/caso-uso-admin.png) |
| Drivers arquiteturais | [`docs/drivers-arquiteturais.md`](docs/drivers-arquiteturais.md) |
| ADRs | [`docs/adr.md`](docs/adr.md) |

## Público-alvo

- Estudantes que desejam otimizar o tempo de estudo
- Pessoas que buscam aprimoramento contínuo e organizado
- Aprendizes que preferem estrutura guiada ou flexibilidade personalizada
