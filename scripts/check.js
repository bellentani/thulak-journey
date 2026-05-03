import { animations, art } from "../src/lib/art.js";
import { gameContent } from "../src/lib/content.js";
import { locales } from "../src/lib/locales.js";

const sceneIds = new Set();
const issues = [];

for (const scene of gameContent.scenes) {
  if (sceneIds.has(scene.id)) {
    issues.push(`Duplicate scene id: ${scene.id}`);
  }
  sceneIds.add(scene.id);
}

for (const scene of gameContent.scenes) {
  if (scene.artId && !(scene.artId in art)) {
    issues.push(`Scene "${scene.id}" references missing art "${scene.artId}"`);
  }

  if (scene.animationId && !(scene.animationId in animations)) {
    issues.push(
      `Scene "${scene.id}" references missing animation "${scene.animationId}"`
    );
  }

  if (!hasLocaleKey(scene.textKey)) {
    issues.push(`Scene "${scene.id}" is missing locale key "${scene.textKey}"`);
  }

  for (const choice of scene.choices ?? []) {
    if (!sceneIds.has(choice.goto)) {
      issues.push(`Scene "${scene.id}" points to missing goto "${choice.goto}"`);
    }
    if (choice.transitionAnimationId && !(choice.transitionAnimationId in animations)) {
      issues.push(
        `Scene "${scene.id}" choice "${choice.textKey}" references missing transition animation "${choice.transitionAnimationId}"`
      );
    }
    if (!hasLocaleKey(choice.textKey)) {
      issues.push(
        `Scene "${scene.id}" has choice missing locale key "${choice.textKey}"`
      );
    }
  }
}

for (const key of Object.keys(locales["pt-BR"])) {
  if (!(key in locales.en)) {
    issues.push(`Locale key "${key}" exists in pt-BR but not in en`);
  }
}

for (const key of Object.keys(locales.en)) {
  if (!(key in locales["pt-BR"])) {
    issues.push(`Locale key "${key}" exists in en but not in pt-BR`);
  }
}

if (issues.length > 0) {
  console.error("THULAK CHECK FAILED\n");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log("THULAK CHECK OK");
console.log(`Scenes: ${gameContent.scenes.length}`);
console.log(`Locales: ${Object.keys(locales).join(", ")}`);

function hasLocaleKey(key) {
  return key in locales["pt-BR"] && key in locales.en;
}
