# Identidade visual — EstudaAI

Pedido humano (2026-09-30): a marca precisa de **logotipo** e **cores** registrados na especificação. Este arquivo é a fonte normativa. Amostra visual: [`layout/identidade.html`](layout/identidade.html).

Rastreio: [RNF10](EstudaAI_RNF.md). Entra no layout da **SPEC-001** e vale nas Specs seguintes. Não é ADR: trocar tom de verde não reescreve o domínio.

Aprovação humana: **aprovada** em 2026-09-30. Layout das telas da SPEC-001: **aprovado** em 2026-09-30.

## Ideia da marca

O EstudaAI organiza estudo em **trilhas**. A marca mostra um percurso que sobe (etapas) e um ponto de ouro no destino (apoio do agente, quando o administrador o habilita).

Não há slogan nesta versão. O nome escrito é **EstudaAI** (sem espaço; **AI** em caixa alta).

## Logotipo

| Peça | Uso | Arquivo |
|---|---|---|
| Marca (ícone) | favicon, avatar, espaço estreito | [`identidade/marca.svg`](identidade/marca.svg) · [`identidade/marca.jpg`](identidade/marca.jpg) |
| Assinatura horizontal | cabeçalho, login (fundo claro) | [`identidade/logo-horizontal.svg`](identidade/logo-horizontal.svg) · [`identidade/logo-horizontal.jpg`](identidade/logo-horizontal.jpg) |
| Assinatura inversa | painel escuro (Ink) | [`identidade/logo-horizontal-inverso.svg`](identidade/logo-horizontal-inverso.svg) |

A **marca** é um quadrado arredondado Ink com três nós ligados: a trilha. Os dois primeiros nós são Menta; o último é Faísca.

A **assinatura** junta a marca ao nome: **Estuda** em Ink, **AI** em Trilha.

### Área de respiro e o que não fazer

- Ao redor da marca, deixar vazio no mínimo a largura de um nó (~1/8 da altura do ícone).
- Não distorcer, não recolorir a trilha com azul genérico, não aplicar sombra, não colocar o ícone sobre foto ocupada.
- Não escrever “Estuda AI”, “ESTUDA.AI” nem “Estuda-ai”.
- Não inventar um segundo símbolo para aluno e outro para administrador: o perfil aparece na casca (SPEC-001), não na marca.

## Cores

| Token | Hex | RGB | Uso |
|---|---|---|---|
| **Ink** | `#123047` | 18, 48, 71 | texto principal, painel escuro, fundo da marca |
| **Trilha** | `#1A7A72` | 26, 122, 114 | ação primária, “AI” no nome, links |
| **Trilha-escuro** | `#14635D` | 20, 99, 93 | hover / pressionado do botão primário |
| **Menta** | `#D7F0ED` | 215, 240, 237 | fundo suave, nós da trilha |
| **Faísca** | `#E3A008` | 227, 160, 8 | só o destino da marca e ênfase rara (LLM ligado) |
| **Papel** | `#F7F4EE` | 247, 244, 238 | fundo de página / aside claro |
| **Neve** | `#FFFFFF` | 255, 255, 255 | cartões, campos |
| **Traço** | `#D6DED9` | 214, 222, 217 | bordas |
| **Mudo** | `#5B6B73` | 91, 107, 115 | texto secundário |

Cores de estado (não são marca; repetir shadcn):

| Estado | Hex | Uso |
|---|---|---|
| Sucesso | `#047857` | confirmação (ex.: e-mail de recuperação enviado) |
| Perigo | `#B91C1C` | recusa (credencial inválida, e-mail duplicado) |

Contraste: texto Ink sobre Neve/Papel e texto Neve sobre Ink/Trilha atendem leitura em corpo. Faísca **não** é cor de texto sobre Neve.

### Tailwind (SPEC-001 em diante)

```js
colors: {
  brand: {
    ink: "#123047",
    trail: "#1A7A72",
    trailDark: "#14635D",
    mint: "#D7F0ED",
    spark: "#E3A008",
    paper: "#F7F4EE"
  }
}
```

Botão primário: fundo `brand.trail`, hover `brand.trailDark`, texto Neve. Não usar o azul padrão do Tailwind (`blue-600`) como cor de marca.

## Tipografia

A UI continua no sans do sistema / shadcn (OPEN-03). O **nome na assinatura** segue o SVG; na interface, “EstudaAI” em texto só aparece se o SVG não couber (espaço &lt; 32 px de altura: usar só a marca).

## Aplicação

| Superfície | Marca | Fundo |
|---|---|---|
| Login / cadastro / recuperação (coluna esquerda, desktop) | assinatura inversa | Ink |
| Mesmas telas, smartphone | assinatura horizontal | Papel / Neve |
| Casca autenticada (aluno e admin) | marca + nome | Neve, texto Ink |

Aluno e administrador compartilham a mesma identidade; o XOR de perfil não gera duas marcas.

## Fora de escopo

- Manual impresso, papelaria, vídeo.
- Tema escuro completo da aplicação (só o painel Ink do login).
- Ícone distinto para “modo LLM”.
