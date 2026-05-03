export const ansi = {
  reset: "\u001B[0m",
  clear: "\u001B[2J\u001B[H",
  hideCursor: "\u001B[?25l",
  showCursor: "\u001B[?25h",
  fgCyan: "\u001B[36m",
  fgGreen: "\u001B[32m",
  fgYellow: "\u001B[33m",
  fgWhite: "\u001B[37m",
  fgRed: "\u001B[31m",
  fgMagenta: "\u001B[35m",
  fgBlue: "\u001B[34m",
  bold: "\u001B[1m",
  dim: "\u001B[2m",
  bgBlue: "\u001B[44m"
};

export function color(text, ...codes) {
  return `${codes.join("")}${text}${ansi.reset}`;
}
