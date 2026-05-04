import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildSiteData } from "./build-site-data.js";

const rootDir = fileURLToPath(new URL("../site", import.meta.url));
const port = Number.parseInt(process.env.PORT ?? "4173", 10);
const host = "127.0.0.1";

/** Ex.: `rpg/grimoire` — espelha o subpath de produção em http://127.0.0.1:4173/rpg/grimoire/ */
function normalizeBasePath(raw) {
  const s = (raw ?? "").trim().replace(/^\/+/u, "").replace(/\/+$/u, "");
  return s ? `/${s.split("/").filter(Boolean).join("/")}` : "";
}

const basePath = normalizeBasePath(process.env.SITE_BASE_PATH ?? "");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function stripBasePath(urlPath) {
  if (!basePath) {
    return urlPath;
  }
  if (urlPath === basePath || urlPath === `${basePath}/`) {
    return "/";
  }
  if (urlPath.startsWith(`${basePath}/`)) {
    return urlPath.slice(basePath.length) || "/";
  }
  return null;
}

function resolvePath(urlPath) {
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const absolutePath = path.join(rootDir, requestedPath);
  const normalizedPath = path.normalize(absolutePath);

  if (!normalizedPath.startsWith(rootDir)) {
    return null;
  }

  return normalizedPath;
}

await buildSiteData();

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
  let pathname = requestUrl.pathname;

  if (basePath) {
    if (pathname === "/") {
      response.writeHead(302, { Location: `${basePath}/` });
      response.end();
      return;
    }
    const stripped = stripBasePath(pathname);
    if (stripped === null) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    pathname = stripped;
  }

  const filePath = resolvePath(pathname);

  if (!filePath) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  try {
    await access(filePath);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const extension = path.extname(filePath);
  const contentType = mimeTypes[extension] ?? "application/octet-stream";

  response.writeHead(200, { "Content-Type": contentType });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  const url = basePath
    ? `http://${host}:${port}${basePath}/`
    : `http://${host}:${port}/`;
  console.log(`Thulak site running at ${url}`);
});
