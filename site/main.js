import { siteData } from "./shared-data.js";

const { animations, art, gameContent, locales } = siteData;

const ui = {
  body: document.querySelector("#screenBody"),
  choices: document.querySelector("#choices"),
  footer: document.querySelector("#footerCopy"),
  menuButton: document.querySelector("#menuButton"),
  metaNote: document.querySelector("#metaNote"),
  statusBar: document.querySelector("#statusBar"),
  title: document.querySelector("#screenTitle"),
  visualFrame: document.querySelector("#visualFrame")
};

const sceneMap = new Map(gameContent.scenes.map((scene) => [scene.id, scene]));
const CLI_REPO_URL = "";

const state = {
  currentView: "language",
  language: gameContent.initialLanguage,
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

    if (action.kind === "compact") {
      button.classList.add("ghost-button");
      button.textContent = action.label;
    } else if (action.description) {
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
    return "Opening Screen";
  }
  if (view === "rules") {
    return t("rules.title");
  }
  if (view === "scene") {
    return gameContent.title;
  }
  return gameContent.title;
}

async function playTransition(animationId) {
  const animation = resolveAnimation(animationId);
  if (!animation?.frames?.length) {
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
  ui.metaNote.textContent = "The browser version keeps the same story graph as the CLI build.";
  setChoices([
    {
      label: "1. Portugues",
      description: "Comecar em portugues com toda a interface localizada.",
      onSelect: async () => {
        state.language = "pt-BR";
        state.currentView = "menu";
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

  const actions = [
    {
      label: t("ui.new_game"),
      description: state.language === "pt-BR" ? "Entrar na aventura de Thulak." : "Enter Thulak's adventure.",
      onSelect: async () => {
        state.sceneId = gameContent.initialSceneId;
        state.flags = new Set(gameContent.initialState.flags);
        state.items = new Set(gameContent.initialState.items);
        state.currentView = "scene";
        await beep({ duration: 0.05, frequency: 680 });
        render();
      }
    },
    {
      label: t("ui.advanced_rules"),
      description: state.language === "pt-BR" ? "Entender como usar o d6 no estilo RPG de mesa." : "See how to use the optional d6 mode.",
      onSelect: async () => {
        state.currentView = "rules";
        await beep({ duration: 0.04, frequency: 660 });
        render();
      }
    },
    {
      label: t("ui.language"),
      description: state.language === "pt-BR" ? "Trocar o idioma antes de comecar." : "Switch language before you begin.",
      onSelect: async () => {
        state.currentView = "language";
        await beep({ duration: 0.04, frequency: 660 });
        render();
      }
    },
    {
      label: t("ui.sound"),
      description: state.soundEnabled ? t("ui.sound_on") : t("ui.sound_off"),
      onSelect: async () => {
        state.soundEnabled = !state.soundEnabled;
        if (state.soundEnabled) {
          await beep({ duration: 0.03, frequency: 700 });
        }
        render();
      }
    }
  ];

  if (CLI_REPO_URL) {
    actions.push({
      label: state.language === "pt-BR" ? "CLI no GitHub" : "CLI on GitHub",
      description:
        state.language === "pt-BR"
          ? "Abrir a versao publica em terminal no repositorio."
          : "Open the public terminal version in the repository.",
      href: CLI_REPO_URL
    });
  }

  setChoices(actions);
  ui.metaNote.textContent =
    state.language === "pt-BR"
      ? "Se quiser ligar esta versao ao repositorio publico, preencha a constante CLI_REPO_URL em site/main.js."
      : "If you want this build to link to the public repository, fill in CLI_REPO_URL in site/main.js.";
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
  setChoices([
    {
      label: t("ui.back_to_menu"),
      description:
        state.language === "pt-BR"
          ? "Voltar para a tela de abertura."
          : "Return to the opening screen.",
      onSelect: async () => {
        state.currentView = "menu";
        await beep({ duration: 0.04, frequency: 650 });
        render();
      }
    }
  ]);
  ui.metaNote.textContent =
    state.language === "pt-BR"
      ? "O d6 continua opcional na web, assim como na versao CLI."
      : "The d6 remains optional on the web, just like in the CLI version.";
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
      ? "As animacoes desta sala continuam em loop enquanto voce decide."
      : "Room animations keep looping while you decide.";
}

function render() {
  document.documentElement.lang = state.language;
  updateStatus();
  ui.footer.textContent = t("ui.footer");
  ui.menuButton.textContent = state.language === "pt-BR" ? "Menu" : "Menu";

  if (state.currentView === "language") {
    renderLanguageScreen();
    return;
  }

  if (state.currentView === "rules") {
    renderRules();
    return;
  }

  if (state.currentView === "scene") {
    renderScene();
    return;
  }

  renderMenu();
}

ui.menuButton.addEventListener("click", async () => {
  state.currentView = "menu";
  await beep({ duration: 0.03, frequency: 620 });
  render();
});

render();
