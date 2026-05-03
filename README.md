# A Descoberta de Thulak

Jogo de suspense em alta fantasia, inspirado nos RPGs e livros-aventura que rodavam em terminais e nos tempos de DOS.

## Rodar

```bash
npm start
```

## Rodar o site

```bash
npm run site:serve
```

O site sobe em `http://127.0.0.1:4173` e usa a pasta [`site`](/Users/fernandobellentani/workspace/bellentani/rpg-cli/site).

## Verificar

```bash
npm run check
```

## Resumo da historia

```bash
npm run story:summary
```

## Para usar com IA

Este repositorio agora inclui um [AGENTS.md](/Users/fernandobellentani/workspace/bellentani/rpg-cli/AGENTS.md) com contexto de projeto, comandos uteis e exemplos de pedidos para agentes como Codex, Claude Code e Cursor.

## Browser e deploy

- A versao CLI continua vivendo em [`src`](/Users/fernandobellentani/workspace/bellentani/rpg-cli/src).
- A versao web vive em [`site`](/Users/fernandobellentani/workspace/bellentani/rpg-cli/site).
- Os dados compartilhados do jogo sao gerados em [`site/shared-data.js`](/Users/fernandobellentani/workspace/bellentani/rpg-cli/site/shared-data.js) por [`scripts/build-site-data.js`](/Users/fernandobellentani/workspace/bellentani/rpg-cli/scripts/build-site-data.js).
- Como o site e estatico, ele pode ser publicado em um dominio ou subdominio usando qualquer hospedagem de arquivos estaticos.
