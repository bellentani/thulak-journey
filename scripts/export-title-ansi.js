import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { titleSplashAnsi } from "../src/lib/title-splash.js";

const outputPath = resolve(process.cwd(), "site/assets/title-splash-ansi.js");
const output = `export const titleSplashAnsi = ${JSON.stringify(titleSplashAnsi)};\n`;

writeFileSync(outputPath, output, "utf8");

console.log(`Exported title splash ANSI to ${outputPath}`);
