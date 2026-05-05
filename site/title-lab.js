import { titleSplashAnsi } from "./assets/title-splash-ansi.js";

const preview = document.getElementById("ansiPreview");
const stats = document.getElementById("ansiStats");

function applyCodes(codes, state) {
  for (let index = 0; index < codes.length; index += 1) {
    const code = codes[index];

    if (code === 0) {
      state.fg = "";
      state.bg = "";
      continue;
    }

    if (code === 38 && codes[index + 1] === 2) {
      state.fg = `rgb(${codes[index + 2]}, ${codes[index + 3]}, ${codes[index + 4]})`;
      index += 4;
      continue;
    }

    if (code === 48 && codes[index + 1] === 2) {
      state.bg = `rgb(${codes[index + 2]}, ${codes[index + 3]}, ${codes[index + 4]})`;
      index += 4;
    }
  }
}

function appendGlyph(fragment, glyph, state) {
  const span = document.createElement("span");
  span.textContent = glyph;

  if (state.fg) {
    span.style.color = state.fg;
  }

  if (state.bg) {
    span.style.backgroundColor = state.bg;
  }

  fragment.append(span);
}

function renderAnsiText(text, target) {
  const fragment = document.createDocumentFragment();
  const state = { fg: "", bg: "" };
  let index = 0;

  while (index < text.length) {
    if (text[index] === "\u001b" && text[index + 1] === "[") {
      const end = text.indexOf("m", index);

      if (end === -1) {
        break;
      }

      const codes = text
        .slice(index + 2, end)
        .split(";")
        .map((value) => Number.parseInt(value, 10))
        .filter((value) => Number.isFinite(value));

      applyCodes(codes, state);
      index = end + 1;
      continue;
    }

    appendGlyph(fragment, text[index], state);
    index += 1;
  }

  target.replaceChildren(fragment);
}

const lines = titleSplashAnsi.split("\n");
const maxWidth = Math.max(...lines.map((line) => line.replace(/\u001b\[[0-9;]*m/g, "").length));

renderAnsiText(titleSplashAnsi, preview);
stats.textContent = `ANSI grid: ${maxWidth} columns x ${lines.length} lines`;
