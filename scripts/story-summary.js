import { gameContent } from "../src/lib/content.js";
import { locales } from "../src/lib/locales.js";

const chapters = gameContent.chapters ?? [];
const scenesByChapter = new Map(chapters.map((chapter) => [chapter.id, []]));

for (const scene of gameContent.scenes) {
  if (!scenesByChapter.has(scene.chapterId)) {
    scenesByChapter.set(scene.chapterId, []);
  }
  scenesByChapter.get(scene.chapterId).push(scene);
}

for (const chapter of chapters) {
  console.log(`# ${locales["pt-BR"][chapter.titleKey] ?? chapter.id}`);
  console.log(trimText(locales["pt-BR"][chapter.summaryKey] ?? chapter.summaryKey, 140));
  console.log(`  implemented: ${chapter.implemented ? "yes" : "no"}`);
  console.log(`  next: ${(chapter.nextChapterIds ?? []).join(", ") || "none"}`);
  console.log("");

  for (const scene of scenesByChapter.get(chapter.id) ?? []) {
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
}

function trimText(text, max = 110) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) {
    return normalized;
  }
  return `${normalized.slice(0, max - 3)}...`;
}
