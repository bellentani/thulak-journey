/**
 * Copia `site/` para `dist/<SITE_SUBPATH>/` para deploy em subpath (ex.: /rpg/grimoire/).
 * Se mudar o caminho padrão, atualize também `redirects` em `vercel.json`.
 */
import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteDir = fileURLToPath(new URL("../site", import.meta.url));
const distRoot = fileURLToPath(new URL("../dist", import.meta.url));

const raw = process.env.SITE_SUBPATH ?? "rpg/grimoire";
const subpath = raw.replace(/^\/+/u, "").replace(/\/+$/u, "");
const segments = subpath.split("/").filter(Boolean);
const outDir = path.join(distRoot, ...segments);

await mkdir(outDir, { recursive: true });
await cp(siteDir, outDir, { recursive: true, force: true });

console.log(`Packaged site → dist/${subpath}/`);
