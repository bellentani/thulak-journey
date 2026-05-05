# Story Workspace

Esta pasta existe para voce escrever a campanha em um formato humano, antes de
transformar tudo em cenas jogaveis no codigo.

## Como usar

Pense nela como uma mesa de trabalho narrativa:

1. escreva ou ajuste a estrutura macro em `campaign-map.md`;
2. abra o capitulo correspondente em `chapters/`;
3. descreva cenas, clima, informacao revelada e escolhas;
4. quando o bloco estiver bom, nos transformamos isso em `src/lib/content.js`
   e `src/lib/locales.js`.

## Voz recomendada

Escreva, de preferencia, em `segunda pessoa`.

Em vez de:

- `Thulak entra na capela e observa o altar.`

Prefira:

- `Voce entra na capela e observa o altar.`

Isso tende a deixar a leitura mais imersiva e mais natural para o formato de
aventura textual.

## Filosofia

O objetivo nao e forcar voce a escrever em formato tecnico demais.
O objetivo e organizar bem o suficiente para:

- preservar a historia;
- enxergar a jornada do jogador;
- mapear escolhas e consequencias;
- saber o que vira item, flag, condicao ou final.

## Ordem recomendada de escrita

Para cada capitulo, preencha nesta ordem:

1. `Objetivo narrativo`
2. `Estado emocional de Thulak`
3. `O que o jogador deve descobrir`
4. `Quais itens importam`
5. `Quais escolhas de tentacao e resistencia existem`
6. `Quais saidas levam a outros capitulos ou finais`

Depois disso, escreva as cenas.

## Regra pratica

Se voce conseguir responder estas perguntas para uma cena, ela ja esta pronta
para virar jogo:

- O que o jogador ve?
- O que o jogador sente?
- O que o jogador aprende?
- O que pode escolher?
- O que muda se ele escolher cada caminho?

## Arquivos desta pasta

- `campaign-map.md`
  Mapa mestre da campanha em 5 capitulos.

- `SCENE_TEMPLATE.md`
  Modelo de cena com campos para texto, escolhas, itens e consequencias.

- `chapters/`
  Um arquivo por capitulo, para voce ir escrevendo a historia com calma.

## Fluxo com IA

Quando voce terminar ou avancar um trecho, pode pedir algo como:

- `Transforme o capitulo 2 em cenas jogaveis.`
- `Leia story/chapters/chapter-02-catacombs.md e converta para o jogo.`
- `Preencha as localizacoes em ingles do que escrevi no capitulo 3.`
- `Crie as flags e itens necessarios para estas escolhas.`

Assim voce continua autor da historia, e a IA entra como adaptadora de estrutura,
localizacao e implementacao.
