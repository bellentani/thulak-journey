# Deploy Web

## Objetivo

Permitir que `Thulak: The Forbidden Grimoire` rode no browser sem abandonar a versao CLI.

## Estrutura

- [`src`](/Users/fernandobellentani/workspace/bellentani/rpg-cli/src): experiencia de terminal.
- [`site`](/Users/fernandobellentani/workspace/bellentani/rpg-cli/site): experiencia web estatica.
- [`scripts/build-site-data.js`](/Users/fernandobellentani/workspace/bellentani/rpg-cli/scripts/build-site-data.js): gera os dados compartilhados consumidos pelo site.
- [`scripts/serve-site.js`](/Users/fernandobellentani/workspace/bellentani/rpg-cli/scripts/serve-site.js): sobe a pasta `site` localmente.

## Fluxo local

```bash
npm run site:serve
```

Isso:

1. Gera `site/shared-data.js`.
2. Publica a pasta `site`.
3. Abre o jogo em `http://127.0.0.1:4173`.

## Fluxo de deploy

Como a versao web e estatica, o publish pode apontar diretamente para a pasta `site`.

Checklist:

1. Rodar `npm run site:prepare`.
2. Garantir que `site/shared-data.js` esta atualizado.
3. Publicar a pasta `site` na hospedagem escolhida.
4. Apontar o dominio ou subdominio desejado para essa publicacao.

## Separacao de papeis

- O browser entrega acessibilidade publica, linkavel e facil de compartilhar.
- O CLI preserva a imersao old school e continua ideal para GitHub, terminal e agentes de IA.
- As duas experiencias compartilham a mesma historia base, reduzindo divergencia de conteudo.
