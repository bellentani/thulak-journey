# Roadmap Oculto de Evolucao

Este arquivo existe como area reservada para planejamento de longo prazo.
Ele nao precisa aparecer no material publico do projeto. A intencao e servir
como base para um futuro fork focado em aprendizado e evolucao para outras
plataformas.

## Visao

`A Descoberta de Thulak` nao precisa terminar como um jogo de terminal.
Este repositorio pode funcionar como:

- laboratorio de narrativa interativa;
- base de aprendizado em design de sistemas;
- prototipo de campanha;
- semente para um jogo maior;
- fundacao para um port futuro em `Roblox`, `Godot`, `Unity` ou web.

O objetivo nao e abandonar a experiencia CLI. O objetivo e usa-la como
primeira forma jogavel de um universo maior.

## Principio central

Separar sempre `conteudo`, `regras` e `apresentacao`.

Enquanto essa separacao for preservada, a historia de Thulak pode mudar de
plataforma sem ser reescrita do zero.

### Conteudo

- capitulos;
- cenas;
- personagens;
- itens;
- criaturas;
- misterios;
- finais;
- lore.

### Regras

- flags;
- inventario;
- gating por item;
- eixos de corrupcao, clareza, vinculos e conhecimento proibido;
- testes opcionais com `d6`;
- consequencias de escolha.

### Apresentacao

- terminal CLI;
- browser;
- Roblox;
- jogo proprio em engine futura.

## Fases de evolucao

## Fase 1 - Base narrativa

Meta:

- consolidar os `5` capitulos;
- fortalecer o fluxo entre `2`, `3` e `4`;
- estruturar itens importantes;
- deixar o capitulo `5` como culminacao forte;
- manter CLI e web em sincronia.

Aprendizados principais:

- narrativa ramificada;
- design de pacing;
- escrita interativa;
- localizacao;
- validacao de conteudo.

## Fase 2 - Sistemas jogaveis

Meta:

- criar sistema de itens mais formal;
- registrar melhor os estados internos de Thulak;
- definir vantagens narrativas do modo `d6`;
- introduzir travas e atalhos baseados em recursos.

Possiveis sistemas:

- chaves e portas;
- manuscritos e cifras;
- reliquias protetoras;
- resistencia mental;
- corrupcao necromantica;
- companheiros e vinculos;
- eventos de risco.

Aprendizados principais:

- design de sistemas;
- balanceamento;
- progressao;
- jogo orientado a estados.

## Fase 3 - Prototipo de RPG mais completo

Meta:

- transformar a estrutura atual em um RPG narrativo com mais persistencia;
- permitir continuidade entre capitulos;
- salvar inventario, marcas mentais e relacoes;
- modelar encontros de forma mais robusta.

Possiveis expansoes:

- tela de inventario;
- mapa simplificado;
- diario de descobertas;
- glossario de criaturas;
- registro de rotas e finais;
- dificuldade narrativa.

Aprendizados principais:

- arquitetura de jogo;
- UX de RPG;
- persistencia de dados;
- organizacao de conteudo vivo.

## Fase 4 - Port para Roblox

Meta:

- reinterpretar `A Descoberta de Thulak` como experiencia espacial e exploravel;
- manter a historia e os capitulos;
- trocar parte da navegacao textual por exploracao, interacao e dialogo.

O que pode ser reaproveitado quase diretamente:

- lore;
- capitulos;
- itens;
- flags narrativas;
- arcos de corrupcao;
- ordem macro da campanha;
- descricoes de criaturas e salas;
- eventos importantes;
- gating por item.

O que precisa ser redesenhado:

- exploracao em tempo real;
- camera;
- controles;
- interface diegetica;
- encontros e perigos;
- ritmo de leitura versus ritmo de movimento.

Sistemas Roblox possiveis:

- dialogos por caixas e escolhas;
- interacao com portas, altares, estantes e reliquias;
- inventario visual;
- areas bloqueadas por item;
- cutscenes curtas para revelacoes;
- triggers de corrupcao em zonas proibidas.

Aprendizados principais:

- scripting de jogo;
- level design;
- estados de missao;
- UX espacial;
- adaptacao de narrativa para jogo exploravel.

## Fase 5 - Jogo proprio

Meta:

- decidir se Thulak deve virar um jogo autoral completo fora de plataformas;
- escolher engine com base no tipo final de experiencia.

Se a prioridade for:

- narrativa e 2D:
  `Godot` e uma candidata forte.

- pipeline maior, 3D ou ecossistema profissional:
  `Unity` pode fazer sentido.

- continuidade com a base web:
  uma experiencia em `HTML/CSS/JS` ou canvas tambem pode ser valida.

Aprendizados principais:

- producao real de jogo;
- pipeline de assets;
- build e distribuicao;
- escopo;
- produto autoral.

## Estruturas que devemos preservar desde ja

Para facilitar qualquer port futuro, vale proteger estas ideias:

### 1. Grafo de conteudo independente

As cenas devem continuar separadas da engine.

Idealmente, no futuro:

- historia em arquivo de dados;
- regras em camada propria;
- interface apenas consumindo esse conteudo.

### 2. IDs estaveis

Nao tratar IDs como detalhe descartavel.

Exemplos:

- capitulos;
- cenas;
- itens;
- flags;
- criaturas;
- locais.

IDs estaveis ajudam em:

- saves;
- migracoes;
- localizacao;
- ports de plataforma;
- analytics futuros;
- conteudo gerado por ferramentas.

### 3. Itens com papel sistemico

Itens nao devem ser so flavor.

Cada item importante deveria responder:

- o que destrava;
- o que protege;
- o que explica;
- o que altera no modo `d6`;
- em qual capitulo ele volta a ser relevante.

### 4. Capitulo como unidade de design

Cada capitulo deve ter:

- tema emocional;
- tipo de risco predominante;
- itens principais;
- revelacoes centrais;
- saidas possiveis;
- relacao com corrupcao, clareza, vinculos e conhecimento proibido.

### 5. Criaturas como experiencia, nao so categoria

Ao portar para motores mais visuais, lembrar que a forca atual das criaturas
vem da forma como sao apresentadas.

Nao basta dizer:

- orc;
- morto-vivo;
- esqueleto;
- necromante.

E preciso preservar:

- estranheza;
- impacto emocional;
- contexto historico;
- relacao com o medo de Thulak.

## Roadmap de aprendizagem

Este projeto pode ser usado como trilha pessoal de estudo.

## Etapa A - Fundamentos

Estudar enquanto expande o projeto atual:

- JavaScript;
- estrutura de dados;
- estados;
- narrativa interativa;
- terminal UX;
- localizacao.

## Etapa B - Sistemas

Estudar ao desenhar modo avancado e inventario:

- loops de jogo;
- gating;
- progressao;
- economia de recursos;
- balanceamento;
- probabilidade simples.

## Etapa C - Web game thinking

Estudar ao fortalecer o `site/`:

- arquitetura frontend;
- render de UI;
- persistencia local;
- transicoes;
- responsividade;
- deploy.

## Etapa D - Roblox ou engine

Estudar ao portar:

- cena e espacamento;
- input;
- camera;
- colisao;
- scripting;
- save state;
- interacoes no mundo.

## Fork futuro

Quando chegar a hora de criar um fork focado em game dev, o caminho recomendado e:

1. congelar a base narrativa deste repositorio;
2. abrir um fork com foco em plataforma;
3. manter os documentos de lore e campanha como fonte de verdade;
4. adaptar apenas a camada de apresentacao e interacao;
5. evitar reescrever a historia sem necessidade.

## Nome sugerido para um fork

Opcoes de trabalho:

- `thulak-rpg`
- `thulak-chronicles`
- `blue-gem-project`
- `thulak-game-lab`
- `thulak-necromancy-prototype`

## Decisoes futuras importantes

Antes de um port grande, responder:

1. O foco continua sendo narrativa ou vira exploracao primeiro?
2. O combate sera simbolico, tatico ou em tempo real?
3. O modo `d6` vira sistema interno ou permanece opcional e interpretativo?
4. O inventario sera pequeno e dramatico ou amplo e sistemico?
5. O jogo final quer ser horror narrativo, RPG de exploracao ou hibrido?

## Regra final desta area oculta

Se este arquivo comecar a guiar demais o repositorio principal, mover o
desenvolvimento futuro para um fork. O projeto principal deve continuar leve,
jogavel e fiel a sua identidade terminal-first.
