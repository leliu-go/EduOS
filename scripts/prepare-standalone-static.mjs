import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const appDir = resolve(process.env.APP_DIR ?? process.cwd());
const standaloneServerPath = join(appDir, ".next", "standalone", "server.js");

if (!existsSync(standaloneServerPath)) {
  console.log("Standalone server.js not found; skipping standalone static asset preparation.");
  process.exit(0);
}

const sourceStaticPath = join(appDir, ".next", "static");
const targetStaticPath = join(appDir, ".next", "standalone", ".next", "static");

if (existsSync(sourceStaticPath)) {
  mkdirSync(targetStaticPath, { recursive: true });
  cpSync(sourceStaticPath, targetStaticPath, { recursive: true });
}

const sourcePublicPath = join(appDir, "public");
const targetPublicPath = join(appDir, ".next", "standalone", "public");

if (existsSync(sourcePublicPath)) {
  mkdirSync(targetPublicPath, { recursive: true });
  cpSync(sourcePublicPath, targetPublicPath, { recursive: true });
}

console.log("Prepared standalone static assets without printing secrets.");
