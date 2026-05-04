# AGENTS.md

Este repositorio contem um jogo de terminal em estilo DOS chamado `Thulak: The Forbidden Grimoire`.

## Missao do projeto

Entregar uma experiencia old school de fantasia sombria em terminal, com:

- narrativa em cenas e escolhas numeradas;
- atmosfera de DOS via ANSI, ASCII art e beeps tipo `PC speaker`;
- localizacao inicial em `pt-BR` e `en`;
- estrutura facil de expandir junto com um agente de IA.

## Como rodar

```bash
npm start
```

## Como validar

```bash
npm run check
```

Esse comando deve conferir:

- IDs de cenas duplicados;
- destinos `goto` inexistentes;
- `artId` ausente;
- chaves de localizacao faltando em `pt-BR` e `en`.

## Como entender a historia atual

```bash
npm run story:summary
```

Esse comando imprime a arvore atual de cenas e escolhas.

Leia tambem:

- `docs/story-background.md`: pano de fundo, temas e jornada do heroi.
- `docs/narrative-design.md`: estrutura dramatica, corrupcao, d6 opcional e finais.
- `docs/chapter-structure.md`: campanha em 5 capitulos, ordem semilinear e travas por item.

## Onde mexer

- `src/lib/game.js`: engine de terminal, menu, render, input e beeps.
- `src/lib/content.js`: grafo da historia, cenas, escolhas, condicoes e efeitos.
- `src/lib/locales.js`: textos em `pt-BR` e `en`.
- `src/lib/art.js`: ASCII art.
- `docs/story-background.md`: lore canonica de alto nivel.
- `docs/narrative-design.md`: design canonico da experiencia narrativa.
- `docs/chapter-structure.md`: macroestrutura da campanha.

## Convencoes do projeto

- Preserve a fantasia old school. Evite interfaces modernas demais.
- Prefira escolhas numeradas simples.
- Separe logica da historia de texto localizado.
- Novas cenas devem usar `textKey` em vez de texto inline.
- Sempre que adicionar conteudo narrativo, atualize `pt-BR` e `en`.
- Sempre que mudar o grafo narrativo, rode `npm run check`.
- Preserve o eixo central de escolhas: aprofundar-se na loucura ou tentar escapar.
- Ao introduzir criaturas, descreva-as de forma imersiva e acessivel para quem nao
  conhece fantasia classica.
- Os capitulos `2`, `3` e `4` podem se cruzar, mas o `5` deve ser sempre o ultimo.
- Itens devem alterar o que pode ou nao pode ser escolhido, especialmente no modo `d6`.

## Como interpretar pedidos vagos

Se o usuario disser algo como:

- `rode o projeto e me faca feliz`
- `melhore a experiencia`
- `deixa mais old school`

entenda isso como autorizacao para fazer uma melhoria pequena, concreta e demonstravel, por exemplo:

1. rodar o jogo;
2. validar o estado atual;
3. melhorar uma cena, arte ASCII, menu ou atmosfera;
4. explicar rapidamente o que foi melhorado.

Evite refatoracoes enormes sem alinhamento.

## Prompts uteis para agentes

- `Rode o projeto, valide a historia e me diga o que esta faltando.`
- `Adicione uma nova cena apos o altar com suspense e um orc morto.`
- `Melhore a tela inicial para parecer mais um boot de DOS.`
- `Crie um novo final em que o jogador encontra magia proibida.`
- `Revise as localizacoes e a consistencia entre pt-BR e en.`

## Regra de ouro

Se fizer qualquer mudanca em conteudo ou fluxo, deixe o jogo em estado jogavel ao final.
