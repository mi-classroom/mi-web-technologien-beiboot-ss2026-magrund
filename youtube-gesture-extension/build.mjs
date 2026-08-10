import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("manifest.json", "dist/manifest.json");
await cp("src/content.js", "dist/content.js");
await cp("src/control.html", "dist/control.html");
await cp("src/control.css", "dist/control.css");
await cp("src/control.js", "dist/control.js");
await cp("library", "dist/library", { recursive: true });
await cp("assets", "dist/assets", { recursive: true });
console.log("Built Chrome extension in dist/");
