import { siteData } from "./shared-data.js";

const { animations, art, gameContent, locales } = siteData;

const ui = {
  body: document.querySelector("#screenBody"),
  choices: document.querySelector("#choices"),
  footer: document.querySelector("#footerCopy"),
  menuBar: document.querySelector("#menuBar"),
  metaNote: document.querySelector("#metaNote"),
  statusBar: document.querySelector("#statusBar"),
  title: document.querySelector("#screenTitle"),
  titleBarLabel: document.querySelector("#titleBarLabel"),
  visualFrame: document.querySelector("#visualFrame")
};

const sceneMap = new Map(gameContent.scenes.map((scene) => [scene.id, scene]));
const CLI_REPO_URL = "";
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const state = {
  currentMenuAction: "home",
  currentView: "language",
  language: gameContent.initialLanguage,
  motionEnabled: !reducedMotionQuery.matches,
  sceneId: gameContent.initialSceneId,
  flags: new Set(gameContent.initialState.flags),
  items: new Set(gameContent.initialState.items),
  soundEnabled: true
};

let currentAnimationFrame = 0;
let currentAnimationId = null;
let animationTimer = null;
let audioContext = null;

function t(key) {
  return locales[state.language]?.[key] ?? locales.en?.[key] ?? key;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function resolveScene(sceneId) {
  const scene = sceneMap.get(sceneId);
  if (!scene) {
    throw new Error(`Unknown scene: ${sceneId}`);
  }
  return scene;
}

function resolveAnimation(animationId) {
  return animationId ? animations[animationId] ?? null : null;
}

function finalAnimationFrame(animation) {
  if (!animation?.frames?.length) {
    return art.title;
  }
  return animation.frames[animation.frames.length - 1];
}

function passesConditions(conditions = []) {
  return conditions.every((condition) => {
    if (condition.type === "hasItem") {
      return state.items.has(condition.item);
    }
    if (condition.type === "hasFlag") {
      return state.flags.has(condition.flag);
    }
    return true;
  });
}

function applyEffect(effect) {
  if (effect.type === "setFlag") {
    state.flags.add(effect.flag);
    return;
  }

  if (effect.type === "addItem") {
    state.items.add(effect.item);
    return;
  }

  if (effect.type === "resetState") {
    state.sceneId = gameContent.initialSceneId;
    state.flags = new Set(gameContent.initialState.flags);
    state.items = new Set(gameContent.initialState.items);
  }
}

function updateStatus() {
  const items =
    state.items.size > 0
      ? [...state.items].map((item) => t(`item.${item}`)).join(", ")
      : t("ui.none");

  ui.statusBar.textContent = `${t("ui.status_language")}: ${state.language}   ${t("ui.status_items")}: ${items}`;
}

function setBodyHtml(markup) {
  ui.body.innerHTML = markup;
}

function setChoices(actions = []) {
  ui.choices.innerHTML = "";

  for (const action of actions) {
    const button = document.createElement(action.href ? "a" : "button");

    if (action.href) {
      button.href = action.href;
      button.target = "_blank";
      button.rel = "noreferrer";
      button.className = "link-button";
    } else {
      button.type = "button";
      button.className = "choice-button";
      button.addEventListener("click", action.onSelect);
    }

    if (action.description) {
      button.innerHTML = `<strong>${escapeHtml(action.label)}</strong><span>${escapeHtml(action.description)}</span>`;
    } else {
      button.textContent = action.label;
    }

    ui.choices.append(button);
  }
}

function stopVisualAnimation() {
  if (animationTimer !== null) {
    window.clearTimeout(animationTimer);
    animationTimer = null;
  }
  currentAnimationId = null;
}

function setStaticVisual(frame) {
  stopVisualAnimation();
  ui.visualFrame.textContent = frame;
}

function startVisualAnimation(animationId, { loop = true } = {}) {
  const animation = resolveAnimation(animationId);

  if (!animation?.frames?.length) {
    return;
  }

  if (!state.motionEnabled) {
    setStaticVisual(finalAnimationFrame(animation));
    return;
  }

  stopVisualAnimation();
  currentAnimationId = animationId;
  currentAnimationFrame = 0;

  const tick = () => {
    if (currentAnimationId !== animationId) {
      return;
    }

    ui.visualFrame.textContent = animation.frames[currentAnimationFrame];
    currentAnimationFrame += 1;

    if (currentAnimationFrame >= animation.frames.length) {
      if (!loop) {
        currentAnimationId = null;
        return;
      }
      currentAnimationFrame = 0;
    }

    animationTimer = window.setTimeout(tick, animation.delay ?? 130);
  };

  tick();
}

async function ensureAudio() {
  if (audioContext || !window.AudioContext) {
    return;
  }
  audioContext = new window.AudioContext();
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
}

async function beep({ duration = 0.06, frequency = 660 } = {}) {
  if (!state.soundEnabled || !window.AudioContext) {
    return;
  }

  await ensureAudio();
  if (!audioContext) {
    return;
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "square";
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.02;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  const now = audioContext.currentTime;
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function visualForScene(scene) {
  if (scene.artId && art[scene.artId]) {
    return { kind: "static", value: art[scene.artId] };
  }

  if (scene.animationId && resolveAnimation(scene.animationId)) {
    return { kind: "animation", value: scene.animationId };
  }

  return { kind: "static", value: art.title };
}

function titleForView(view) {
  if (view === "language") {
    return "Language";
  }
  if (view === "menu") {
    return state.language === "pt-BR" ? "Inicio" : "Home";
  }
  if (view === "rules") {
    return t("rules.title");
  }
  if (view === "help") {
    return state.language === "pt-BR" ? "Atalhos do Teclado" : "Keyboard Shortcuts";
  }
  if (view === "scene") {
    return gameContent.title;
  }
  return gameContent.title;
}

function titleBarText() {
  if (state.currentView === "language") {
    return "A DESCOBERTA DE THULAK :: LANGUAGE SETUP";
  }
  if (state.currentView === "rules") {
    return "A DESCOBERTA DE THULAK :: RULES";
  }
  if (state.currentView === "help") {
    return "A DESCOBERTA DE THULAK :: KEYBOARD HELP";
  }
  if (state.currentView === "scene") {
    return "A DESCOBERTA DE THULAK :: RUNNING STORY MODE";
  }
  return "A DESCOBERTA DE THULAK :: DOS RUNTIME";
}

function updateChrome() {
  ui.titleBarLabel.textContent = titleBarText();
}

async function goHome() {
  state.currentView = "menu";
  state.currentMenuAction = "home";
  await beep({ duration: 0.03, frequency: 620 });
  render();
}

async function startNewGame() {
  state.sceneId = gameContent.initialSceneId;
  state.flags = new Set(gameContent.initialState.flags);
  state.items = new Set(gameContent.initialState.items);
  state.currentView = "scene";
  state.currentMenuAction = "new_game";
  await beep({ duration: 0.04, frequency: 690 });
  render();
}

async function openRules() {
  state.currentView = "rules";
  state.currentMenuAction = "rules";
  await beep({ duration: 0.03, frequency: 650 });
  render();
}

async function openLanguage() {
  state.currentView = "language";
  state.currentMenuAction = "language";
  await beep({ duration: 0.03, frequency: 650 });
  render();
}

async function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  state.currentMenuAction = "sound";
  if (state.soundEnabled) {
    await beep({ duration: 0.03, frequency: 700 });
  }
  render();
}

async function toggleMotion() {
  state.motionEnabled = !state.motionEnabled;
  state.currentMenuAction = "motion";
  await beep({ duration: 0.03, frequency: 640 });
  render();
}

async function toggleFullscreen() {
  await beep({ duration: 0.03, frequency: 610 });

  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }

  await document.documentElement.requestFullscreen();
}

async function openHelp() {
  state.currentView = "help";
  state.currentMenuAction = "help";
  await beep({ duration: 0.03, frequency: 630 });
  render();
}

function getMenuEntries() {
  return [
    {
      id: "home",
      label: state.language === "pt-BR" ? "Inicio" : "Home",
      shortcutLabel: "H",
      onSelect: goHome
    },
    {
      id: "new_game",
      label: state.language === "pt-BR" ? "Novo Jogo" : "New Game",
      shortcutLabel: "N",
      onSelect: startNewGame
    },
    {
      id: "rules",
      label: state.language === "pt-BR" ? "Regras" : "Rules",
      shortcutLabel: "R",
      onSelect: openRules
    },
    {
      id: "language",
      label: state.language === "pt-BR" ? "Idioma" : "Language",
      shortcutLabel: "L",
      onSelect: openLanguage
    },
    {
      id: "sound",
      label:
        state.language === "pt-BR"
          ? `Som ${state.soundEnabled ? "Ligado" : "Desligado"}`
          : `Sound ${state.soundEnabled ? "On" : "Off"}`,
      shortcutLabel: "S",
      onSelect: toggleSound
    },
    {
      id: "motion",
      label:
        state.language === "pt-BR"
          ? `Animacao ${state.motionEnabled ? "Ligada" : "Parada"}`
          : `Motion ${state.motionEnabled ? "On" : "Off"}`,
      shortcutLabel: "M",
      onSelect: toggleMotion
    },
    {
      id: "fullscreen",
      label:
        document.fullscreenElement
          ? state.language === "pt-BR"
            ? "Janela"
            : "Windowed"
          : state.language === "pt-BR"
            ? "Tela Cheia"
            : "Full Screen",
      shortcutLabel: "F",
      onSelect: async () => {
        state.currentMenuAction = "fullscreen";
        await toggleFullscreen();
        render();
      }
    },
    {
      id: "help",
      label: state.language === "pt-BR" ? "Ajuda" : "Help",
      shortcutLabel: "?",
      onSelect: openHelp
    }
  ];
}

function findMenuEntry(menuId) {
  return getMenuEntries().find((entry) => entry.id === menuId);
}

function renderMenuBar() {
  const entries = getMenuEntries();
  ui.menuBar.innerHTML = "";

  for (const entry of entries) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "menu-command";
    button.dataset.menuId = entry.id;
    button.innerHTML = `<span class="menu-command__key">${escapeHtml(entry.shortcutLabel)}</span><span class="menu-command__label">${escapeHtml(entry.label)}</span>`;
    button.title = entry.shortcutLabel;
    button.setAttribute(
      "aria-label",
      `${entry.label}. ${state.language === "pt-BR" ? "Tecla" : "Key"} ${entry.shortcutLabel}.`
    );
    if (entry.id === state.currentMenuAction) {
      button.classList.add("is-active");
    }
    button.addEventListener("click", () => {
      void entry.onSelect();
    });
    ui.menuBar.append(button);
  }
}

function moveFocusWithin(elements, currentElement, step) {
  if (!elements.length) {
    return;
  }

  const index = Math.max(0, elements.indexOf(currentElement));
  const nextIndex = (index + step + elements.length) % elements.length;
  elements[nextIndex].focus();
}

function focusFirstChoice() {
  const firstChoice = ui.choices.querySelector("button, a");
  if (firstChoice) {
    firstChoice.focus();
    return true;
  }
  return false;
}

function focusMenuCommand(menuId = state.currentMenuAction) {
  const target =
    ui.menuBar.querySelector(`[data-menu-id="${menuId}"]`) ??
    ui.menuBar.querySelector(".menu-command");
  if (target) {
    target.focus();
    return true;
  }
  return false;
}

function scheduleFocusRestore() {
  const deferFocus = window.queueMicrotask
    ? window.queueMicrotask.bind(window)
    : (callback) => window.setTimeout(callback, 0);

  deferFocus(() => {
    if (state.currentView === "language" || state.currentView === "scene") {
      if (focusFirstChoice()) {
        return;
      }
    }

    if (state.currentView === "menu" || state.currentView === "rules" || state.currentView === "help") {
      if (focusMenuCommand()) {
        return;
      }
    }

    ui.title.focus();
  });
}

async function playTransition(animationId) {
  const animation = resolveAnimation(animationId);
  if (!animation?.frames?.length) {
    return;
  }

  if (!state.motionEnabled) {
    setStaticVisual(finalAnimationFrame(animation));
    return;
  }

  stopVisualAnimation();

  for (const frame of animation.frames) {
    ui.visualFrame.textContent = frame;
    await beep({ duration: 0.03, frequency: 520 });
    await new Promise((resolve) => {
      window.setTimeout(resolve, animation.delay ?? 130);
    });
  }
}

async function onChoiceSelected(choice) {
  await beep({ duration: 0.04, frequency: 740 });
  state.currentMenuAction = "new_game";

  if (choice.transitionAnimationId) {
    await playTransition(choice.transitionAnimationId);
  }

  for (const effect of choice.effects ?? []) {
    applyEffect(effect);
  }

  state.sceneId = choice.goto;
  state.currentView = "scene";
  render();
}

function renderLanguageScreen() {
  ui.title.textContent = titleForView("language");
  setStaticVisual(art.title);
  setBodyHtml(`
    <div class="stack">
      <p>Escolha o idioma antes de entrar em Karad-Zhul.</p>
      <p>Select your language before entering Karad-Zhul.</p>
    </div>
  `);
  ui.metaNote.textContent =
    state.language === "pt-BR"
      ? "Escolha um idioma abaixo. O restante da navegacao fica concentrado na barra superior."
      : "Choose a language below. All remaining navigation lives in the top command bar.";
  setChoices([
    {
      label: "1. Portugues",
      description: "Comecar em portugues com toda a interface localizada.",
      onSelect: async () => {
        state.language = "pt-BR";
        state.currentView = "menu";
        state.currentMenuAction = "home";
        await beep({ duration: 0.04, frequency: 720 });
        render();
      }
    },
    {
      label: "2. English",
      description: "Start in English with the same branching narrative.",
      onSelect: async () => {
        state.language = "en";
        state.currentView = "menu";
        state.currentMenuAction = "home";
        await beep({ duration: 0.04, frequency: 720 });
        render();
      }
    }
  ]);
}

function renderMenu() {
  ui.title.textContent = titleForView("menu");
  startVisualAnimation("cryptBoot");
  setBodyHtml(`
    <div class="stack">
      <p>${escapeHtml(t("menu.subtitle"))}</p>
      <p>${escapeHtml(t("menu.intro"))}</p>
    </div>
  `);
  setChoices([]);

  const shortcuts = state.language === "pt-BR"
    ? "Teclas H inicio, N novo jogo, R regras, L idioma, S som, M animacao, F tela cheia, ? ajuda."
    : "Keys H home, N new game, R rules, L language, S sound, M motion, F full screen, ? help.";

  ui.metaNote.textContent =
    state.language === "pt-BR"
      ? `Use apenas a barra superior para navegar. ${shortcuts}`
      : `Use the top command bar as the single navigation surface. ${shortcuts}`;
}

function renderRules() {
  ui.title.textContent = titleForView("rules");
  startVisualAnimation("campfireRest");
  setBodyHtml(`
    <div class="stack">
      <p>${escapeHtml(t("rules.intro"))}</p>
      <p><strong>${escapeHtml(t("rules.how_title"))}</strong></p>
      <ul class="rule-list">
        <li>${escapeHtml(t("rules.how_1"))}</li>
        <li>${escapeHtml(t("rules.how_2"))}</li>
      </ul>
      <p><strong>${escapeHtml(t("rules.scale_title"))}</strong></p>
      <ul class="rule-list">
        <li>${escapeHtml(t("rules.scale_1"))}</li>
        <li>${escapeHtml(t("rules.scale_2"))}</li>
        <li>${escapeHtml(t("rules.scale_3"))}</li>
      </ul>
      <p>${escapeHtml(t("rules.note"))}</p>
    </div>
  `);
  setChoices([]);
  ui.metaNote.textContent =
    state.language === "pt-BR"
      ? "Use Home ou Novo Jogo na barra superior para continuar."
      : "Use Home or New Game in the top bar to continue.";
}

function renderHelp() {
  ui.title.textContent = titleForView("help");
  setStaticVisual(art.title);
  setBodyHtml(`
    <div class="stack">
      <p>${state.language === "pt-BR" ? "A barra superior concentra os comandos principais do shell:" : "The top command bar concentrates the shell's primary controls:"}</p>
      <ul class="rule-list">
        <li>${state.language === "pt-BR" ? "H: Inicio" : "H: Home"}</li>
        <li>${state.language === "pt-BR" ? "N: Novo Jogo" : "N: New Game"}</li>
        <li>${state.language === "pt-BR" ? "R: Regras" : "R: Rules"}</li>
        <li>${state.language === "pt-BR" ? "L: Idioma" : "L: Language"}</li>
        <li>${state.language === "pt-BR" ? "S: Som" : "S: Sound"}</li>
        <li>${state.language === "pt-BR" ? "M: Animacao" : "M: Motion"}</li>
        <li>${state.language === "pt-BR" ? "F: Tela Cheia" : "F: Full Screen"}</li>
        <li>${state.language === "pt-BR" ? "?: Ajuda" : "?: Help"}</li>
        <li>${state.language === "pt-BR" ? "Setas esquerda/direita: navegar no menu superior" : "Left/right arrows: move through the top command bar"}</li>
        <li>${state.language === "pt-BR" ? "Setas cima/baixo: navegar entre escolhas da historia" : "Up/down arrows: move through story choices"}</li>
        <li>${state.language === "pt-BR" ? "1 a 9: ativar opcoes numeradas da tela atual" : "1 through 9: activate numbered options on the current screen"}</li>
        <li>${state.language === "pt-BR" ? "Escape: voltar o foco para o menu superior" : "Escape: return focus to the top command bar"}</li>
      </ul>
    </div>
  `);
  setChoices([]);
  ui.metaNote.textContent =
    state.language === "pt-BR"
      ? "Os atalhos estao ligados e a barra superior e o unico centro de navegacao global."
      : "Shortcuts are active and the top command bar is the only global navigation center.";
}

function renderScene() {
  const scene = resolveScene(state.sceneId);
  const visibleChoices = scene.choices.filter((choice) => passesConditions(choice.conditions));

  ui.title.textContent = titleForView("scene");
  const visual = visualForScene(scene);

  if (visual.kind === "animation") {
    startVisualAnimation(visual.value);
  } else {
    setStaticVisual(visual.value);
  }

  setBodyHtml(`<p>${escapeHtml(t(scene.textKey))}</p>`);
  setChoices(
    visibleChoices.map((choice, index) => ({
      label: `${index + 1}. ${t(choice.textKey)}`,
      description:
        state.language === "pt-BR"
          ? "Avancar por este ramo da historia."
          : "Advance through this branch of the story.",
      onSelect: () => onChoiceSelected(choice)
    }))
  );

  ui.metaNote.textContent = scene.ending
    ? t("ui.ending")
    : state.language === "pt-BR"
      ? "Use as setas para mudar de escolha e Enter para confirmar."
      : "Use arrow keys to move between choices and Enter to confirm.";
}

function render() {
  document.documentElement.lang = state.language;
  renderMenuBar();
  updateStatus();
  updateChrome();
  ui.footer.textContent = t("ui.footer");

  if (state.currentView === "language") {
    renderLanguageScreen();
    scheduleFocusRestore();
    return;
  }

  if (state.currentView === "rules") {
    renderRules();
    scheduleFocusRestore();
    return;
  }

  if (state.currentView === "help") {
    renderHelp();
    scheduleFocusRestore();
    return;
  }

  if (state.currentView === "scene") {
    renderScene();
    scheduleFocusRestore();
    return;
  }

  renderMenu();
  scheduleFocusRestore();
}

document.addEventListener("fullscreenchange", () => {
  render();
});

const onReducedMotionChange = (event) => {
  if (state.currentMenuAction !== "motion") {
    state.motionEnabled = !event.matches;
    render();
  }
};

if (typeof reducedMotionQuery.addEventListener === "function") {
  reducedMotionQuery.addEventListener("change", onReducedMotionChange);
} else if (typeof reducedMotionQuery.addListener === "function") {
  reducedMotionQuery.addListener(onReducedMotionChange);
}

document.addEventListener("keydown", (event) => {
  const menuCommands = [...ui.menuBar.querySelectorAll(".menu-command")];
  const choices = [...ui.choices.querySelectorAll("button, a")];
  const activeElement = document.activeElement;

  const usesModifier = event.altKey || event.ctrlKey || event.metaKey;

  if (!usesModifier) {
    const key = event.key.toLowerCase();
    const shortcutMap = {
      h: "home",
      n: "new_game",
      r: "rules",
      l: "language",
      s: "sound",
      m: "motion",
      f: "fullscreen",
      "/": "help",
      "?": "help"
    };

    const menuId = shortcutMap[key];
    if (menuId) {
      event.preventDefault();
      void findMenuEntry(menuId)?.onSelect();
      return;
    }

    if (/^[1-9]$/.test(event.key)) {
      const choiceIndex = Number(event.key) - 1;
      const targetChoice = choices[choiceIndex];
      if (targetChoice) {
        event.preventDefault();
        targetChoice.click();
        return;
      }
    }
  }

  if (event.key === "Escape") {
    event.preventDefault();
    focusMenuCommand();
    return;
  }

  if (activeElement?.classList?.contains("menu-command")) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveFocusWithin(menuCommands, activeElement, 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveFocusWithin(menuCommands, activeElement, -1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      menuCommands[0]?.focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      menuCommands[menuCommands.length - 1]?.focus();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusFirstChoice();
    }
    return;
  }

  if (activeElement?.classList?.contains("choice-button") || activeElement?.classList?.contains("link-button")) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      moveFocusWithin(choices, activeElement, 1);
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveFocusWithin(choices, activeElement, -1);
      return;
    }
    return;
  }

  if (activeElement === ui.title && event.key === "ArrowDown") {
    event.preventDefault();
    focusFirstChoice();
    return;
  }

  if (event.key === "ArrowDown") {
    focusFirstChoice();
  }
});

render();
