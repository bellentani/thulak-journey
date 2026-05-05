import readline from "node:readline/promises";
import { emitKeypressEvents } from "node:readline";
import { stdin as input, stdout as output } from "node:process";

import { ansi, color } from "./ansi.js";
import { animations, art } from "./art.js";
import { gameContent } from "./content.js";
import { locales } from "./locales.js";
import {
  defaultStoryModeId,
  getStoryMode,
  resolveStoryModeId,
  storyModeLocales,
  storyModes
} from "./story-modes.js";
import { titleSplashAnsi } from "./title-splash.js";

const KONAMI_SEQUENCE = ["up", "up", "down", "down", "left", "right", "left", "right", "b", "a"];
const SECRET_SIGNAL = -2;

export function createGame(options = {}) {
  const requestedStoryMode = resolveStoryModeId(options.storyMode);
  const skipLanguageSelection = Boolean(options.skipLanguageSelection);
  const sceneMap = new Map(gameContent.scenes.map((scene) => [scene.id, scene]));
  const rl = readline.createInterface({ input, output });
  const supportsLiveInput = Boolean(input.isTTY && typeof input.setRawMode === "function");

  if (supportsLiveInput) {
    emitKeypressEvents(input);
  }

  const state = {
    language: gameContent.initialLanguage,
    sceneId: gameContent.initialSceneId,
    flags: new Set(gameContent.initialState.flags),
    items: new Set(gameContent.initialState.items),
    soundEnabled: true,
    shouldQuit: false,
    storyMode: requestedStoryMode,
    unlockedModes: new Set([defaultStoryModeId, requestedStoryMode]),
    pendingNoticeKey:
      requestedStoryMode !== defaultStoryModeId ? getStoryMode(requestedStoryMode).unlockKey : null,
    konamiIndex: 0
  };

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
    return getStoryMode(state.storyMode);
  }

  function currentTitle() {
    return t(currentModeMeta().titleKey, { modeId: state.storyMode });
  }

  function availableAlternateModes() {
    return storyModes.filter(
      (mode) => state.unlockedModes.has(mode.id) && mode.id !== state.storyMode
    );
  }

  function resetProgress() {
    state.flags = new Set(gameContent.initialState.flags);
    state.items = new Set(gameContent.initialState.items);
    state.sceneId = gameContent.initialSceneId;
  }

  function activateStoryMode(modeId, { showNotice = false } = {}) {
    const resolvedModeId = resolveStoryModeId(modeId);
    state.storyMode = resolvedModeId;
    state.unlockedModes.add(resolvedModeId);
    resetProgress();

    if (showNotice) {
      state.pendingNoticeKey = getStoryMode(resolvedModeId).unlockKey ?? null;
    }
  }

  function clearScreen() {
    output.write(ansi.clear);
  }

  async function ask(prompt) {
    try {
      return await rl.question(prompt);
    } catch (error) {
      if (error && error.code === "ERR_USE_AFTER_CLOSE") {
        state.shouldQuit = true;
        return null;
      }
      throw error;
    }
  }

  async function bell(times = 1, gap = 90) {
    if (!state.soundEnabled) {
      return;
    }
    for (let index = 0; index < times; index += 1) {
      output.write("\u0007");
      if (index < times - 1) {
        await wait(gap);
      }
    }
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function wrapText(text, width = getContentWidth()) {
    const words = text.split(/\s+/);
    const lines = [];
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > width) {
        if (current) {
          lines.push(current);
        }
        current = word;
      } else {
        current = candidate;
      }
    }

    if (current) {
      lines.push(current);
    }

    return lines.join("\n");
  }

  function getContentWidth() {
    return Math.max(48, Math.min(88, output.columns ? output.columns - 6 : 74));
  }

  function frame(title, body) {
    const width = getContentWidth();
    const horizontal = "=".repeat(width + 2);
    return [
      color(horizontal, ansi.fgBlue, ansi.bold),
      color(` ${title.padEnd(width)} `, ansi.bgBlue, ansi.fgWhite, ansi.bold),
      color(horizontal, ansi.fgBlue, ansi.bold),
      body,
      color(horizontal, ansi.fgBlue, ansi.bold)
    ].join("\n");
  }

  function renderStatus() {
    const items =
      state.items.size > 0
        ? [...state.items].map((item) => t(`item.${item}`)).join(", ")
        : t("ui.none");

    return color(
      `${t("ui.status_language")}: ${state.language}   ${t("ui.status_story")}: ${t(currentModeMeta().menuKey, { modeId: state.storyMode })}   ${t("ui.status_items")}: ${items}`,
      ansi.fgYellow
    );
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

  function renderVisualBlock(scene, frameOverride = null) {
    if (frameOverride) {
      return color(frameOverride, ansi.fgCyan);
    }
    if (scene.artId && art[scene.artId]) {
      return color(art[scene.artId], ansi.fgCyan);
    }
    const animation = resolveAnimation(scene.animationId);
    if (animation?.frames?.length) {
      return color(animation.frames[animation.frames.length - 1], ansi.fgCyan);
    }
    return "";
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
      resetProgress();
    }
  }

  function secretTokenFromKey(str, key) {
    if (key?.name === "up" || key?.name === "down" || key?.name === "left" || key?.name === "right") {
      return key.name;
    }

    const lowered = str?.toLowerCase();
    if (lowered === "a" || lowered === "b") {
      return lowered;
    }

    return null;
  }

  function feedSecretSequence(str, key) {
    const token = secretTokenFromKey(str, key);

    if (!token) {
      state.konamiIndex = 0;
      return false;
    }

    const expected = KONAMI_SEQUENCE[state.konamiIndex];
    if (token === expected) {
      state.konamiIndex += 1;
      if (state.konamiIndex === KONAMI_SEQUENCE.length) {
        state.konamiIndex = 0;
        activateStoryMode("designer", { showNotice: true });
        return true;
      }
      return "progress";
    }

    state.konamiIndex = token === KONAMI_SEQUENCE[0] ? 1 : 0;
    return state.konamiIndex > 0 ? "progress" : false;
  }

  async function promptEnter() {
    if (!supportsLiveInput) {
      await ask(`\n${color(t("ui.press_enter"), ansi.dim)} `);
      return;
    }

    output.write(`\n${color(t("ui.press_enter"), ansi.dim)}\n`);
    await waitForKeypress();
  }

  async function chooseFrom(options, { secretContext = false } = {}) {
    if (supportsLiveInput) {
      const choice = await waitForChoiceKey(options.length, { secretContext });
      if (choice === null) {
        return "quit";
      }
      if (choice === SECRET_SIGNAL) {
        return "__secret__";
      }
      return options[choice];
    }

    const answer = await ask(`\n${color(t("ui.choose_option"), ansi.fgGreen)} `);
    if (answer === null) {
      return "quit";
    }
    const index = Number.parseInt(answer, 10) - 1;
    if (Number.isNaN(index) || index < 0 || index >= options.length) {
      await bell(2, 60);
      output.write(`\n${color(t("ui.invalid_option"), ansi.fgRed)}\n`);
      await wait(700);
      return chooseFrom(options, { secretContext });
    }
    return options[index];
  }

  async function selectInitialLanguage() {
    clearScreen();

    const body = [
      color("SELECT LANGUAGE / SELECIONE O IDIOMA", ansi.fgCyan, ansi.bold),
      "",
      "1. Portugues",
      "2. English"
    ].join("\n");

    output.write(`${frame("Language", body)}\n`);

    if (supportsLiveInput) {
      output.write(`${color("Press 1 or 2", ansi.fgGreen)}\n`);
      const choice = await waitForChoiceKey(2);
      if (choice === null) {
        state.shouldQuit = true;
        return;
      }
      state.language = choice === 0 ? "pt-BR" : "en";
      return;
    }

    const answer = await ask(`\n${color("Press 1 or 2", ansi.fgGreen)} `);
    if (answer === null) {
      state.shouldQuit = true;
      return;
    }

    if (answer.trim() === "1") {
      state.language = "pt-BR";
      return;
    }

    if (answer.trim() === "2") {
      state.language = "en";
      return;
    }

    await bell(2, 60);
    output.write(`\n${color("Invalid option.", ansi.fgRed)}\n`);
    await wait(700);
    return selectInitialLanguage();
  }

  async function waitForKeypress() {
    return new Promise((resolve) => {
      const onKeypress = (_str, key) => {
        if (key?.ctrl && key.name === "c") {
          state.shouldQuit = true;
        }
        cleanup();
        resolve();
      };

      const cleanup = () => {
        input.off("keypress", onKeypress);
        input.setRawMode(false);
      };

      input.setRawMode(true);
      input.on("keypress", onKeypress);
      input.resume();
    });
  }

  async function waitForChoiceKey(
    optionCount,
    { allowBack = false, secretContext = false } = {}
  ) {
    return new Promise((resolve) => {
      const validDigits = new Set(
        Array.from({ length: optionCount }, (_, index) => String(index + 1))
      );

      const onKeypress = (str, key) => {
        if (key?.ctrl && key.name === "c") {
          state.shouldQuit = true;
          cleanup();
          resolve(null);
          return;
        }

        if (secretContext) {
          const secretState = feedSecretSequence(str, key);
          if (secretState === true) {
            void bell(2, 50);
            cleanup();
            resolve(SECRET_SIGNAL);
            return;
          }
          if (secretState === "progress") {
            return;
          }
        }

        if (key?.name === "return" || key?.name === "enter") {
          return;
        }

        if (allowBack && str === "0") {
          cleanup();
          resolve(-1);
          return;
        }

        if (validDigits.has(str)) {
          cleanup();
          resolve(Number.parseInt(str, 10) - 1);
          return;
        }

        void bell(1, 0);
      };

      const cleanup = () => {
        input.off("keypress", onKeypress);
        input.setRawMode(false);
      };

      input.setRawMode(true);
      input.on("keypress", onKeypress);
      input.resume();
    });
  }

  function buildMenuOptions() {
    return [
      {
        id: "new",
        label: t("ui.new_game"),
        detail: t("ui.current_adventure")
      },
      ...availableAlternateModes().map((mode) => ({
        id: `mode:${mode.id}`,
        modeId: mode.id,
        label: t(mode.menuKey, { modeId: mode.id }),
        detail: t(mode.descriptionKey, { modeId: mode.id })
      })),
      {
        id: "rules",
        label: t("ui.advanced_rules")
      },
      {
        id: "language",
        label: `${t("ui.language")}: ${state.language}`
      },
      {
        id: "sound",
        label: `${t("ui.sound")}: ${state.soundEnabled ? t("ui.sound_on") : t("ui.sound_off")}`
      },
      {
        id: "quit",
        label: t("ui.quit")
      }
    ];
  }

  async function renderMenu() {
    clearScreen();
    const menuTitleArt = output.isTTY ? titleSplashAnsi : art.title;
    const menuOptions = buildMenuOptions();
    const noticeKey = state.pendingNoticeKey;
    state.pendingNoticeKey = null;

    const body = [
      menuTitleArt,
      color(t("menu.subtitle"), ansi.fgMagenta),
      "",
      wrapText(t("menu.intro")),
      "",
      color(
        `${t("ui.current_adventure")}: ${t(currentModeMeta().menuKey, { modeId: state.storyMode })}`,
        ansi.fgGreen,
        ansi.bold
      ),
      noticeKey ? color(wrapText(t(noticeKey)), ansi.fgGreen, ansi.bold) : "",
      "",
      ...menuOptions.map((option, index) =>
        option.detail
          ? `${index + 1}. ${option.label} (${option.detail})`
          : `${index + 1}. ${option.label}`
      ),
      "",
      color(t("ui.footer"), ansi.dim)
    ]
      .filter(Boolean)
      .join("\n");

    output.write(`${frame(currentTitle(), body)}\n`);
    if (supportsLiveInput) {
      output.write(`${color(t("ui.choose_option"), ansi.fgGreen)}\n`);
    }

    const option = await chooseFrom(menuOptions, { secretContext: true });
    if (option === "__secret__") {
      return renderMenu();
    }

    if (option === "quit" || option?.id === "quit") {
      state.shouldQuit = true;
      return;
    }

    if (option?.id === "new") {
      resetProgress();
      return;
    }

    if (option?.id?.startsWith("mode:")) {
      activateStoryMode(option.modeId);
      return renderMenu();
    }

    if (option?.id === "rules") {
      await showAdvancedRules();
      return renderMenu();
    }

    if (option?.id === "language") {
      state.language = state.language === "pt-BR" ? "en" : "pt-BR";
      return renderMenu();
    }

    if (option?.id === "sound") {
      state.soundEnabled = !state.soundEnabled;
      if (state.soundEnabled) {
        await bell(1);
      }
      return renderMenu();
    }
  }

  async function showAdvancedRules() {
    clearScreen();

    const body = [
      color(t("rules.title"), ansi.fgCyan, ansi.bold),
      "",
      wrapText(t("rules.intro")),
      "",
      color(t("rules.how_title"), ansi.fgYellow, ansi.bold),
      wrapText(`1. ${t("rules.how_1")}`),
      wrapText(`2. ${t("rules.how_2")}`),
      "",
      color(t("rules.scale_title"), ansi.fgYellow, ansi.bold),
      t("rules.scale_1"),
      t("rules.scale_2"),
      t("rules.scale_3"),
      "",
      wrapText(t("rules.note"))
    ].join("\n");

    output.write(`${frame(currentTitle(), body)}\n`);
    await promptEnter();
  }

  function buildSceneBody(scene, visibleChoices, visualBlock, showChoices = true) {
    const endingLabel = scene.ending ? `${color(t("ui.ending"), ansi.fgRed, ansi.bold)}\n\n` : "";
    const bodyLines = [
      renderStatus(),
      "",
      visualBlock,
      endingLabel + wrapText(t(scene.textKey)),
      ""
    ];

    if (showChoices) {
      bodyLines.push(...visibleChoices.map((choice, index) => `${index + 1}. ${t(choice.textKey)}`));
      bodyLines.push("");
      bodyLines.push(`0. ${t("ui.back_to_menu")}`);
    }

    return bodyLines.filter(Boolean).join("\n");
  }

  async function playTransitionAnimation(animationId) {
    const animation = resolveAnimation(animationId);
    if (!animation?.frames?.length) {
      return;
    }

    for (const frameText of animation.frames) {
      clearScreen();
      output.write(`${color(frameText, ansi.fgCyan, ansi.bold)}\n`);
      await wait(animation.delay ?? 120);
    }
  }

  async function playLoopingAnimation({
    frames,
    delay,
    renderFrame,
    optionCount,
    allowBack = false,
    secretContext = false
  }) {
    if (!supportsLiveInput) {
      renderFrame(frames.at(-1) ?? null);
      return null;
    }

    const frameSet = frames.length > 0 ? frames : [null];
    let frameIndex = 0;

    renderFrame(frameSet[frameIndex]);

    const timer =
      frameSet.length > 1
        ? setInterval(() => {
            frameIndex = (frameIndex + 1) % frameSet.length;
            renderFrame(frameSet[frameIndex]);
          }, delay)
        : null;

    const selectedIndex = await waitForChoiceKey(optionCount, { allowBack, secretContext });

    if (timer) {
      clearInterval(timer);
    }

    return selectedIndex;
  }

  async function renderScene(scene, options = {}) {
    const { skipAnimation = false } = options;
    const visibleChoices = scene.choices.filter((choice) => passesConditions(choice.conditions));
    const animation = skipAnimation ? null : resolveAnimation(scene.animationId);

    const renderFrame = (frameText = null) => {
      clearScreen();
      const body = buildSceneBody(scene, visibleChoices, renderVisualBlock(scene, frameText), true);
      output.write(`${frame(currentTitle(), body)}\n`);
      if (supportsLiveInput) {
        output.write(`${color(t("ui.choose_option"), ansi.fgGreen)}\n`);
      }
    };

    let index;

    if (supportsLiveInput) {
      index = await playLoopingAnimation({
        frames: animation?.frames ?? [null],
        delay: animation?.delay ?? 140,
        renderFrame,
        optionCount: visibleChoices.length,
        allowBack: true,
        secretContext: true
      });
      if (index === null) {
        return "menu";
      }
      if (index === SECRET_SIGNAL || index === -1) {
        return "menu";
      }
    } else {
      renderFrame();
      const answer = await ask(`\n${color(t("ui.choose_option"), ansi.fgGreen)} `);
      if (answer === null) {
        return "menu";
      }
      if (answer.trim() === "0") {
        return "menu";
      }
      index = Number.parseInt(answer, 10) - 1;
      if (Number.isNaN(index) || index < 0 || index >= visibleChoices.length) {
        await bell(2, 60);
        output.write(`\n${color(t("ui.invalid_option"), ansi.fgRed)}\n`);
        await wait(700);
        return renderScene(scene, { skipAnimation: true });
      }
    }

    const selected = visibleChoices[index];
    await playTransitionAnimation(selected.transitionAnimationId);
    for (const effect of selected.effects ?? []) {
      applyEffect(effect);
    }
    state.sceneId = selected.goto;
    return "scene";
  }

  async function bootSequence() {
    clearScreen();
    output.write(ansi.hideCursor);

    const bootAnimation = animations.cryptBoot;
    if (bootAnimation?.frames?.length) {
      for (const frameText of bootAnimation.frames) {
        clearScreen();
        output.write(`${color(frameText, ansi.fgGreen, ansi.bold)}\n`);
        await bell(1, 30);
        await wait(bootAnimation.delay ?? 120);
      }
    }
    clearScreen();

    const lines = [
      "THULAK BIOS v0.86",
      "640 KB RAM SYSTEM  OK",
      "SCANNING CRYPT SEALS OK",
      "MORTUARY TORCH ARRAY OK",
      "LOADING DUNGEON MEMORY..."
    ];

    for (const line of lines) {
      output.write(`${color(line, ansi.fgGreen)}\n`);
      await bell(1, 40);
      await wait(240);
    }

    await wait(300);
    await bell(2, 70);
    output.write(`\n${color("READY.", ansi.fgWhite, ansi.bold)}\n`);
    output.write(ansi.showCursor);
    await promptEnter();
  }

  async function run() {
    try {
      if (!skipLanguageSelection) {
        await selectInitialLanguage();
        if (state.shouldQuit) {
          return;
        }
      }

      await bootSequence();
      while (!state.shouldQuit) {
        await renderMenu();
        while (!state.shouldQuit) {
          const scene = resolveScene(state.sceneId);
          const outcome = await renderScene(scene);
          if (outcome === "menu") {
            break;
          }
        }
      }
      clearScreen();
      output.write(color("THULAK SESSION CLOSED.\n", ansi.fgYellow));
    } finally {
      output.write(ansi.showCursor);
      rl.close();
    }
  }

  return { run };
}
