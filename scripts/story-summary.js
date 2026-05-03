import { gameContent } from "../src/lib/content.js";
import { locales } from "../src/lib/locales.js";

for (const scene of gameContent.scenes) {
  const title = `[${scene.id}]`;
  const body = locales["pt-BR"][scene.textKey] ?? scene.textKey;

  console.log(title);
  console.log(trimText(body));

  for (const [index, choice] of (scene.choices ?? []).entries()) {
    const label = locales["pt-BR"][choice.textKey] ?? choice.textKey;
    const markers = [];

    if (choice.conditions?.length) {
      markers.push("conditional");
    }
    if (choice.effects?.length) {
      markers.push("effects");
    }

    const suffix = markers.length ? ` (${markers.join(", ")})` : "";
    console.log(`  ${index + 1}. ${label} -> ${choice.goto}${suffix}`);
  }

  if (scene.ending) {
    console.log("  ending: yes");
  }

  console.log("");
}

function trimText(text, max = 110) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) {
    return normalized;
  }
  return `${normalized.slice(0, max - 3)}...`;
}
