import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const ROOT = fs.existsSync(path.join(__dirname, "dist"))
  ? path.join(__dirname, "dist")
  : __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
  let filePath = path.join(ROOT, safePath);

  // If not found in dist, check in root/public
  if (!fs.existsSync(filePath)) {
    const pubPath = path.join(__dirname, "public", safePath);
    if (fs.existsSync(pubPath)) {
      filePath = pubPath;
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  // SPA fallback
  if (!fs.existsSync(filePath)) {
    filePath = path.join(ROOT, "index.html");
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    // Handle HTTP Range requests for audio
    const range = req.headers.range;
    if (range && contentType.startsWith("audio/")) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": contentType,
      });

      const fileStream = fs.createReadStream(filePath, { start, end });
      fileStream.pipe(res);
      return;
    }

    res.writeHead(200, {
      "Content-Length": stats.size,
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`🌲 Treefy server running at http://localhost:${PORT}`);
});
