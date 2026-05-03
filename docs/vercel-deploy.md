# Deploy na Vercel

## Como ficou configurado

O projeto usa [`vercel.json`](/Users/fernandobellentani/workspace/bellentani/rpg-cli/vercel.json) com:

- `buildCommand`: `npm run site:prepare`
- `outputDirectory`: `site`

Isso faz a Vercel:

1. gerar `site/shared-data.js`;
2. publicar a pasta `site` como site estatico.

## O que sera publicado

- a experiencia web em browser;
- o conteudo compartilhado gerado a partir da historia atual;
- o visual old school com ASCII e animacoes em loop.

## O que nao muda

- a experiencia CLI continua no repositorio;
- o fluxo de terminal continua publico e separado da versao web;
- o deploy web nao interfere no jogo em `src`.
