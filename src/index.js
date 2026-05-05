import { createGame } from "./lib/game.js";
import { defaultStoryModeId, resolveStoryModeId } from "./lib/story-modes.js";

function parseCliOptions(argv) {
  const options = {
    skipLanguageSelection: false,
    storyMode: defaultStoryModeId
  };

  for (const arg of argv) {
    if (arg === "--designer-mode" || arg === "--design-mode") {
      options.storyMode = "designer";
      options.skipLanguageSelection = true;
      continue;
    }

    if (arg.startsWith("--mode=")) {
      options.storyMode = resolveStoryModeId(arg.slice("--mode=".length));
      options.skipLanguageSelection = options.storyMode !== defaultStoryModeId;
    }
  }

  return options;
}

const game = createGame(parseCliOptions(process.argv.slice(2)));

await game.run();
