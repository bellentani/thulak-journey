import { siteData } from "./shared-data.js";

const { animations, art, gameContent, locales, storyModes, storyModeLocales } = siteData;

const ui = {
  announcer: document.querySelector("#screenAnnouncer"),
  body: document.querySelector("#screenBody"),
  choices: document.querySelector("#choices"),
  footer: document.querySelector("#footerCopy"),
  menuBar: document.querySelector("#menuBar"),
  metaNote: document.querySelector("#metaNote"),
  statusBar: document.querySelector("#statusBar"),
  title: document.querySelector("#screenTitle"),
  titleBarLabel: document.querySelector("#titleBarLabel"),
  visualPoster: document.querySelector("#visualPoster"),
  visualFrame: document.querySelector("#visualFrame")
};

const sceneMap = new Map(gameContent.scenes.map((scene) => [scene.id, scene]));
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const seo = {
  canonical: document.querySelector('link[rel="canonical"]'),
  description: document.querySelector('meta[name="description"]'),
  ogDescription: document.querySelector('meta[property="og:description"]'),
  ogLocale: document.querySelector('meta[property="og:locale"]'),
  ogTitle: document.querySelector('meta[property="og:title"]'),
  ogUrl: document.querySelector('meta[property="og:url"]'),
  twitterDescription: document.querySelector('meta[name="twitter:description"]'),
  twitterTitle: document.querySelector('meta[name="twitter:title"]')
};

const SITE_NAME = "Thulak: The Forbidden Grimoire";
const DEFAULT_STORY_MODE = "thulak";
const KONAMI_SEQUENCE = ["up", "up", "down", "down", "left", "right", "left", "right", "b", "a"];
const GITHUB_REPO_URL = "https://github.com/poebellentani/thulak-journey";
const GITHUB_README_URL = "https://github.com/poebellentani/thulak-journey#readme";
const ABOUT_COPY = {
  "pt-BR": {
    title: "Sobre o Projeto",
    intro:
      "Thulak: The Forbidden Grimoire e um jogo narrativo de fantasia sombria com atmosfera old school inspirada na era DOS.",
    bullets: [
      "Duas experiencias paralelas: versao CLI (terminal) e versao web (browser).",
      "Foco em narrativa ramificada, escolhas numeradas, arte ASCII e tom de horror fantastico.",
      "Suporte bilingue em pt-BR e en, com estrutura pronta para expansao de capitulos."
    ],
    premise:
      "A historia acompanha Thulak, um jovem meio-elfo e mago novato, atraido por um grimorio proibido e pela lenda da Gema Azul.",
    ctaRepo: "Repositorio no GitHub:",
    ctaReadme: "README completo na web:"
  },
  en: {
    title: "About the Project",
    intro:
      "Thulak: The Forbidden Grimoire is a dark-fantasy narrative game with an old-school atmosphere inspired by the DOS era.",
    bullets: [
      "Two parallel experiences: CLI version (terminal) and web version (browser).",
      "Focused on branching narrative, numbered choices, ASCII art, and fantasy-horror tone.",
      "Bilingual support in pt-BR and en, with structure ready for chapter expansion."
    ],
    premise:
      "The story follows Thulak, a young half-elf novice mage drawn to a forbidden grimoire and the legend of the Blue Gem.",
    ctaRepo: "GitHub repository:",
    ctaReadme: "Full README on the web:"
  }
};

function analyticsEnabled() {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

function trackEvent(eventName, params = {}) {
  if (!analyticsEnabled()) {
    return;
  }
  window.gtag("event", eventName, params);
}

function detectPreferredLanguage() {
  const browserLanguages = [...(navigator.languages ?? []), navigator.language].filter(Boolean);

  for (const language of browserLanguages) {
    const normalized = language.toLowerCase();
    if (normalized.startsWith("pt")) {
      return "pt-BR";
    }
    if (normalized.startsWith("en")) {
      return "en";
    }
  }

  return gameContent.initialLanguage;
}

function getStoryModeMeta(modeId) {
  return storyModes.find((mode) => mode.id === modeId) ?? storyModes[0];
}

function resolveStoryModeId(value) {
  if (!value) {
    return DEFAULT_STORY_MODE;
  }

  const normalized = String(value).trim().toLowerCase();
  for (const mode of storyModes) {
    if (mode.id === normalized || mode.aliases?.includes(normalized)) {
      return mode.id;
    }
  }

  return DEFAULT_STORY_MODE;
}

function readInitialStoryMode() {
  const params = new URLSearchParams(window.location.search);
  return resolveStoryModeId(params.get("mode"));
}

const initialStoryMode = readInitialStoryMode();

const state = {
  currentMenuAction: "home",
  currentView: initialStoryMode === DEFAULT_STORY_MODE ? "language" : "menu",
  language: detectPreferredLanguage(),
  motionEnabled: !reducedMotionQuery.matches,
  sceneId: gameContent.initialSceneId,
  flags: new Set(gameContent.initialState.flags),
  items: new Set(gameContent.initialState.items),
  soundEnabled: true,
  storyMode: initialStoryMode,
  unlockedModes: new Set([DEFAULT_STORY_MODE, initialStoryMode]),
  pendingNoticeKey:
    initialStoryMode !== DEFAULT_STORY_MODE ? getStoryModeMeta(initialStoryMode).unlockKey : null,
  konamiIndex: 0,
  viewedScenes: new Set(),
  sessionChoiceCount: 0
};

let currentAnimationFrame = 0;
let currentAnimationId = null;
let animationTimer = null;
let audioContext = null;

function translate(key, { modeId = state.storyMode, language = state.language } = {}) {
  return (
    storyModeLocales[modeId]?.[language]?.[key] ??
    storyModeLocales[modeId]?.en?.[key] ??
    locales[language]?.[key] ??
    locales.en?.[key] ??
    key
  );
}

function t(key, options = {}) {
  return translate(key, options);
}

function currentModeMeta() {
  return getStoryModeMeta(state.storyMode);
}

function currentTitle() {
  return t(currentModeMeta().titleKey, { modeId: state.storyMode });
}

function availableAlternateModes() {
  return storyModes.filter(
    (mode) => state.unlockedModes.has(mode.id) && mode.id !== state.storyMode
  );
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

function resetProgress() {
  state.sceneId = gameContent.initialSceneId;
  state.flags = new Set(gameContent.initialState.flags);
  state.items = new Set(gameContent.initialState.items);
  state.viewedScenes = new Set();
  state.sessionChoiceCount = 0;
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
    resetProgress();
  }
}

function updateStatus() {
  const items =
    state.items.size > 0
      ? [...state.items].map((item) => t(`item.${item}`)).join(", ")
      : t("ui.none");

  ui.statusBar.textContent = `${t("ui.status_language")}: ${state.language}   ${t("ui.status_story")}: ${t(currentModeMeta().menuKey, { modeId: state.storyMode })}   ${t("ui.status_items")}: ${items}`;
}

function setBodyHtml(markup) {
  ui.body.innerHTML = markup;
}

function showPosterVisual() {
  stopVisualAnimation();
  ui.visualPoster.classList.remove("hidden");
  ui.visualFrame.classList.add("hidden");
}

function showAsciiVisual() {
  ui.visualPoster.classList.add("hidden");
  ui.visualFrame.classList.remove("hidden");
}

function setChoices(actions = []) {
  ui.choices.innerHTML = "";
  ui.choices.hidden = actions.length === 0;

  for (const action of actions) {
    const item = document.createElement("li");
    item.className = "choice-item";
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

    item.append(button);
    ui.choices.append(item);
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
  showAsciiVisual();
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
  showAsciiVisual();
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
    return state.language === "pt-BR" ? "Idioma" : "Language";
  }
  if (view === "rules") {
    return t("rules.title");
  }
  if (view === "help") {
    return state.language === "pt-BR" ? "Atalhos do Teclado" : "Keyboard Shortcuts";
  }
  if (view === "about") {
    return ABOUT_COPY[state.language].title;
  }
  return currentTitle();
}

function titleBarText() {
  const upperTitle = currentTitle().toUpperCase();
  if (state.currentView === "language") {
    return `${upperTitle} :: LANGUAGE SETUP`;
  }
  if (state.currentView === "rules") {
    return `${upperTitle} :: RULES`;
  }
  if (state.currentView === "help") {
    return `${upperTitle} :: KEYBOARD HELP`;
  }
  if (state.currentView === "about") {
    return `${upperTitle} :: PROJECT INFO`;
  }
  if (state.currentView === "scene") {
    return `${upperTitle} :: RUNNING STORY MODE`;
  }
  return `${upperTitle} :: DOS RUNTIME`;
}

function updateChrome() {
  ui.titleBarLabel.textContent = titleBarText();
}

function pageDescription() {
  if (state.storyMode === "designer") {
    if (state.language === "pt-BR") {
      return "Parodia secreta em estilo DOS sobre um designer que descobre o terminal, com humor, atmosfera ASCII e escolhas ramificadas.";
    }

    return "A secret DOS-style parody about a designer discovering the terminal, with humor, ASCII atmosphere, and branching choices.";
  }

  if (state.language === "pt-BR") {
    return "Aventura textual de fantasia sombria inspirada em DOS, com atmosfera ASCII, escolhas ramificadas e suporte bilingue no browser.";
  }

  return "A DOS-inspired dark fantasy text adventure with ASCII atmosphere, branching choices, and bilingual browser support.";
}

function documentTitleForView() {
  if (state.currentView === "scene") {
    return `${currentTitle()} | ${state.language === "pt-BR" ? "Aventura" : "Adventure"}`;
  }

  if (state.currentView === "rules") {
    return `${currentTitle()} | ${state.language === "pt-BR" ? "Regras" : "Rules"}`;
  }

  if (state.currentView === "help") {
    return `${currentTitle()} | ${state.language === "pt-BR" ? "Ajuda" : "Help"}`;
  }
  if (state.currentView === "about") {
    return `${currentTitle()} | ${state.language === "pt-BR" ? "Sobre" : "About"}`;
  }

  if (state.currentView === "language") {
    return `${SITE_NAME} | ${state.language === "pt-BR" ? "Idioma" : "Language"}`;
  }

  return currentTitle();
}

function updateDocumentMetadata() {
  const description = pageDescription();
  const canonicalUrl = new URL(window.location.pathname || "/", window.location.href).href;
  const locale = state.language === "pt-BR" ? "pt_BR" : "en_US";
  const title = documentTitleForView();

  document.title = title;

  seo.description?.setAttribute("content", description);
  seo.ogDescription?.setAttribute("content", description);
  seo.twitterDescription?.setAttribute("content", description);
  seo.ogTitle?.setAttribute("content", title);
  seo.twitterTitle?.setAttribute("content", title);
  seo.ogLocale?.setAttribute("content", locale);
  seo.ogUrl?.setAttribute("content", canonicalUrl);
  seo.canonical?.setAttribute("href", canonicalUrl);
}

function trackSceneView(scene, visibleChoices) {
  const firstTimeInSession = !state.viewedScenes.has(scene.id);
  if (firstTimeInSession) {
    state.viewedScenes.add(scene.id);
  }

  trackEvent("story_scene_view", {
    scene_id: scene.id,
    story_mode: state.storyMode,
    language: state.language,
    ending: Boolean(scene.ending),
    visible_choices: visibleChoices.length,
    first_time_in_session: firstTimeInSession
  });
}

function announceScreenChange() {
  const announcement = [ui.title.textContent?.trim(), ui.metaNote.textContent?.trim()]
    .filter(Boolean)
    .join(". ");
  ui.announcer.textContent = announcement;
}

function secretTokenFromKey(key) {
  const lowered = key.toLowerCase();
  if (lowered === "arrowup") {
    return "up";
  }
  if (lowered === "arrowdown") {
    return "down";
  }
  if (lowered === "arrowleft") {
    return "left";
  }
  if (lowered === "arrowright") {
    return "right";
  }
  if (lowered === "a" || lowered === "b") {
    return lowered;
  }
  return null;
}

function feedSecretSequence(key) {
  const token = secretTokenFromKey(key);

  if (!token) {
    state.konamiIndex = 0;
    return false;
  }

  const expected = KONAMI_SEQUENCE[state.konamiIndex];
  if (token === expected) {
    state.konamiIndex += 1;
    if (state.konamiIndex === KONAMI_SEQUENCE.length) {
      state.konamiIndex = 0;
      return true;
    }
    return "progress";
  }

  state.konamiIndex = token === KONAMI_SEQUENCE[0] ? 1 : 0;
  return state.konamiIndex > 0 ? "progress" : false;
}

function activateStoryMode(modeId, { showNotice = false } = {}) {
  state.storyMode = resolveStoryModeId(modeId);
  state.unlockedModes.add(state.storyMode);
  resetProgress();
  state.currentView = "menu";
  state.currentMenuAction = "home";

  if (showNotice) {
    state.pendingNoticeKey = getStoryModeMeta(state.storyMode).unlockKey ?? null;
  }
}

async function goHome() {
  state.currentView = "menu";
  state.currentMenuAction = "home";
  await beep({ duration: 0.03, frequency: 620 });
  render();
}

async function startNewGame() {
  resetProgress();
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

async function openAbout() {
  state.currentView = "about";
  state.currentMenuAction = "about";
  trackEvent("story_about_opened", {
    story_mode: state.storyMode,
    language: state.language
  });
  await beep({ duration: 0.03, frequency: 635 });
  render();
}

async function switchStoryMode(modeId) {
  activateStoryMode(modeId);
  await beep({ duration: 0.04, frequency: 730 });
  render();
}

function getMenuEntries() {
  const modeEntries = availableAlternateModes().map((mode) => ({
    id: `mode:${mode.id}`,
    label: t(mode.menuKey, { modeId: mode.id }),
    shortcutLabel: mode.shortcutLabel,
    onSelect: () => switchStoryMode(mode.id)
  }));

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
    ...modeEntries,
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
    },
    {
      id: "about",
      label: state.language === "pt-BR" ? "Sobre" : "About",
      shortcutLabel: "A",
      onSelect: openAbout
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
    button.setAttribute(
      "aria-keyshortcuts",
      entry.shortcutLabel === "?" ? "Shift+Slash" : entry.shortcutLabel
    );
    if (entry.id === state.currentMenuAction) {
      button.classList.add("is-active");
      button.setAttribute("aria-current", "page");
    }

    if (entry.id === "sound") {
      button.setAttribute("aria-pressed", String(state.soundEnabled));
    }

    if (entry.id === "motion") {
      button.setAttribute("aria-pressed", String(state.motionEnabled));
    }

    if (entry.id === "fullscreen") {
      button.setAttribute("aria-pressed", String(Boolean(document.fullscreenElement)));
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

    if (
      state.currentView === "menu" ||
      state.currentView === "rules" ||
      state.currentView === "help" ||
      state.currentView === "about"
    ) {
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
  const fromSceneId = state.sceneId;

  if (choice.transitionAnimationId) {
    await playTransition(choice.transitionAnimationId);
  }

  for (const effect of choice.effects ?? []) {
    applyEffect(effect);
  }

  state.sessionChoiceCount += 1;
  trackEvent("story_choice_selected", {
    from_scene_id: fromSceneId,
    to_scene_id: choice.goto,
    choice_text_key: choice.textKey,
    story_mode: state.storyMode,
    language: state.language,
    has_transition_animation: Boolean(choice.transitionAnimationId),
    effects_count: (choice.effects ?? []).length,
    session_choice_count: state.sessionChoiceCount
  });

  state.sceneId = choice.goto;
  state.currentView = "scene";
  render();
}

function renderLanguageScreen() {
  ui.title.textContent = titleForView("language");
  showPosterVisual();
  ui.choices.setAttribute(
    "aria-label",
    state.language === "pt-BR" ? "Opcoes de idioma" : "Language options"
  );
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
  showPosterVisual();
  ui.choices.setAttribute(
    "aria-label",
    state.language === "pt-BR" ? "Sem escolhas nesta tela" : "No choices on this screen"
  );
  setBodyHtml(`
    <div class="stack">
      <p>${escapeHtml(t("menu.subtitle"))}</p>
      <p>${escapeHtml(t("menu.intro"))}</p>
      <p><strong>${escapeHtml(t("ui.current_adventure"))}:</strong> ${escapeHtml(
        t(currentModeMeta().menuKey, { modeId: state.storyMode })
      )}</p>
    </div>
  `);
  setChoices([]);

  const shortcuts = getMenuEntries()
    .map((entry) => `${entry.shortcutLabel} ${entry.label}`)
    .join(", ");

  const noticeKey = state.pendingNoticeKey;
  state.pendingNoticeKey = null;

  const defaultNote =
    state.language === "pt-BR"
      ? `Use apenas a barra superior para navegar. Teclas: ${shortcuts}.`
      : `Use the top command bar as the single navigation surface. Keys: ${shortcuts}.`;

  ui.metaNote.textContent = noticeKey
    ? `${t(noticeKey)} ${defaultNote}`
    : defaultNote;
}

function renderRules() {
  ui.title.textContent = titleForView("rules");
  startVisualAnimation("campfireRest");
  ui.choices.setAttribute(
    "aria-label",
    state.language === "pt-BR" ? "Sem escolhas nesta tela" : "No choices on this screen"
  );
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
      ? "Use Home, Novo Jogo ou um atalho de aventura na barra superior para continuar."
      : "Use Home, New Game, or a story-mode shortcut in the top bar to continue.";
}

function renderHelp() {
  ui.title.textContent = titleForView("help");
  setStaticVisual(art.title);
  ui.choices.setAttribute(
    "aria-label",
    state.language === "pt-BR" ? "Sem escolhas nesta tela" : "No choices on this screen"
  );

  const modeHelpItems = availableAlternateModes().map(
    (mode) =>
      `<li>${escapeHtml(
        `${mode.shortcutLabel}: ${t(mode.menuKey, { modeId: mode.id })}`
      )}</li>`
  );

  setBodyHtml(`
    <div class="stack">
      <p>${state.language === "pt-BR" ? "A barra superior concentra os comandos principais do shell:" : "The top command bar concentrates the shell's primary controls:"}</p>
      <ul class="rule-list">
        <li>${state.language === "pt-BR" ? "H: Inicio" : "H: Home"}</li>
        <li>${state.language === "pt-BR" ? "N: Novo Jogo" : "N: New Game"}</li>
        ${modeHelpItems.join("")}
        <li>${state.language === "pt-BR" ? "R: Regras" : "R: Rules"}</li>
        <li>${state.language === "pt-BR" ? "L: Idioma" : "L: Language"}</li>
        <li>${state.language === "pt-BR" ? "S: Som" : "S: Sound"}</li>
        <li>${state.language === "pt-BR" ? "M: Animacao" : "M: Motion"}</li>
        <li>${state.language === "pt-BR" ? "F: Tela Cheia" : "F: Full Screen"}</li>
        <li>${state.language === "pt-BR" ? "?: Ajuda" : "?: Help"}</li>
        <li>${state.language === "pt-BR" ? "A: Sobre o Projeto" : "A: About the Project"}</li>
        <li>${state.language === "pt-BR" ? "Setas esquerda/direita: navegar no menu superior" : "Left/right arrows: move through the top command bar"}</li>
        <li>${state.language === "pt-BR" ? "Setas cima/baixo: navegar entre escolhas da historia" : "Up/down arrows: move through story choices"}</li>
        <li>${state.language === "pt-BR" ? "1 a 9: ativar opcoes numeradas da tela atual" : "1 through 9: activate numbered options on the current screen"}</li>
        <li>${state.language === "pt-BR" ? "Escape: voltar o foco para o menu superior" : "Escape: return focus to the top command bar"}</li>
      </ul>
      <p>
        ${state.language === "pt-BR" ? "Projeto no GitHub:" : "Project on GitHub:"}
        <a id="helpGithubLink" href="${GITHUB_REPO_URL}" target="_blank" rel="noreferrer">GitHub</a>
      </p>
      <p>
        ${state.language === "pt-BR" ? "Leia o README na web:" : "Read the README on the web:"}
        <a id="helpReadmeLink" href="${GITHUB_README_URL}" target="_blank" rel="noreferrer">README</a>
      </p>
    </div>
  `);

  const githubLink = document.querySelector("#helpGithubLink");
  const readmeLink = document.querySelector("#helpReadmeLink");
  githubLink?.addEventListener("click", () => {
    trackEvent("story_help_link_click", {
      link_type: "github_repo",
      story_mode: state.storyMode,
      language: state.language
    });
  });
  readmeLink?.addEventListener("click", () => {
    trackEvent("story_help_link_click", {
      link_type: "github_readme",
      story_mode: state.storyMode,
      language: state.language
    });
  });

  setChoices([]);
  ui.metaNote.textContent =
    state.language === "pt-BR"
      ? "Os atalhos estao ligados e a barra superior e o unico centro de navegacao global."
      : "Shortcuts are active and the top command bar is the only global navigation center.";
}

function renderAbout() {
  const copy = ABOUT_COPY[state.language];
  ui.title.textContent = titleForView("about");
  setStaticVisual(art.title);
  ui.choices.setAttribute(
    "aria-label",
    state.language === "pt-BR" ? "Sem escolhas nesta tela" : "No choices on this screen"
  );

  const bulletItems = copy.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  setBodyHtml(`
    <div class="stack">
      <p>${escapeHtml(copy.intro)}</p>
      <ul class="rule-list">${bulletItems}</ul>
      <p>${escapeHtml(copy.premise)}</p>
      <p>${escapeHtml(copy.ctaRepo)} <a id="aboutGithubLink" href="${GITHUB_REPO_URL}" target="_blank" rel="noreferrer">GitHub</a></p>
      <p>${escapeHtml(copy.ctaReadme)} <a id="aboutReadmeLink" href="${GITHUB_README_URL}" target="_blank" rel="noreferrer">README</a></p>
    </div>
  `);

  document.querySelector("#aboutGithubLink")?.addEventListener("click", () => {
    trackEvent("story_about_link_click", {
      link_type: "github_repo",
      story_mode: state.storyMode,
      language: state.language
    });
  });
  document.querySelector("#aboutReadmeLink")?.addEventListener("click", () => {
    trackEvent("story_about_link_click", {
      link_type: "github_readme",
      story_mode: state.storyMode,
      language: state.language
    });
  });

  setChoices([]);
  ui.metaNote.textContent =
    state.language === "pt-BR"
      ? "Este resumo vem do README do projeto. Abra os links para aprofundar."
      : "This summary comes from the project README. Open the links for full details.";
}

function renderScene() {
  const scene = resolveScene(state.sceneId);
  const visibleChoices = scene.choices.filter((choice) => passesConditions(choice.conditions));

  ui.title.textContent = titleForView("scene");
  ui.choices.setAttribute(
    "aria-label",
    state.language === "pt-BR"
      ? "Escolhas disponiveis nesta cena"
      : "Available choices in this scene"
  );
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

  trackSceneView(scene, visibleChoices);
}

function render() {
  document.documentElement.lang = state.language;
  renderMenuBar();
  updateStatus();
  updateChrome();
  ui.footer.textContent = t("ui.footer");

  if (state.currentView === "language") {
    renderLanguageScreen();
    updateDocumentMetadata();
    announceScreenChange();
    scheduleFocusRestore();
    return;
  }

  if (state.currentView === "rules") {
    renderRules();
    updateDocumentMetadata();
    announceScreenChange();
    scheduleFocusRestore();
    return;
  }

  if (state.currentView === "help") {
    renderHelp();
    updateDocumentMetadata();
    announceScreenChange();
    scheduleFocusRestore();
    return;
  }

  if (state.currentView === "about") {
    renderAbout();
    updateDocumentMetadata();
    announceScreenChange();
    scheduleFocusRestore();
    return;
  }

  if (state.currentView === "scene") {
    renderScene();
    updateDocumentMetadata();
    announceScreenChange();
    scheduleFocusRestore();
    return;
  }

  renderMenu();
  updateDocumentMetadata();
  announceScreenChange();
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
    const secretResult = feedSecretSequence(event.key);
    if (secretResult === true) {
      event.preventDefault();
      trackEvent("story_secret_unlock_konami", {
        method: "konami_code",
        story_mode_before: state.storyMode,
        language: state.language,
        scene_id: state.sceneId
      });
      activateStoryMode("designer", { showNotice: true });
      void beep({ duration: 0.05, frequency: 760 }).then(() => render());
      return;
    }
  }

  if (!usesModifier) {
    const key = event.key.toLowerCase();
    const shortcutMap = new Map(
      getMenuEntries().map((entry) => [
        entry.shortcutLabel === "?" ? "/" : entry.shortcutLabel.toLowerCase(),
        entry.id
      ])
    );
    shortcutMap.set("?", "help");

    const menuId = shortcutMap.get(key);
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

  if (
    activeElement?.classList?.contains("choice-button") ||
    activeElement?.classList?.contains("link-button")
  ) {
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

if (initialStoryMode !== DEFAULT_STORY_MODE) {
  trackEvent("story_secret_access_url", {
    method: "query_mode",
    mode_id: initialStoryMode,
    is_secret_mode: initialStoryMode === "designer",
    language: state.language
  });
}

trackEvent("story_session_start", {
  initial_story_mode: initialStoryMode,
  language: state.language,
  reduced_motion_preferred: reducedMotionQuery.matches
});

render();
