import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const root = process.cwd();
const manifestPath = path.join(root, "public", "home", "manifest.json");
const outDir = path.join(root, "public", "home");

const MODEL = process.env.HOME_IMAGE_MODEL || "gpt-image-1";
const QUALITY = process.env.HOME_IMAGE_QUALITY || "high";
const API_KEY = process.env.OPENAI_API_KEY || (await loadEnvApiKey());

if (!API_KEY) {
  console.error("Missing OPENAI_API_KEY. Add it to your shell or .env.local.");
  process.exit(1);
}

const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : 0;
const skipExisting = process.argv.includes("--skip-existing");

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const items = Array.isArray(manifest.items) ? manifest.items : [];
const tempDir = await fs.mkdtemp(path.join("/tmp", "sma-hope-home-images-"));

async function loadEnvApiKey() {
  const envPath = path.join(root, ".env.local");
  try {
    const raw = await fs.readFile(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx < 1) continue;
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      if (k === "OPENAI_API_KEY" && v) return v;
    }
    return null;
  } catch {
    return null;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resizeWithSips(inputPath, outputPath, width, height) {
  try {
    await execFileAsync("sips", ["-z", String(height), String(width), inputPath, "--out", outputPath]);
    return true;
  } catch {
    return false;
  }
}

async function generateImage(item, index, total) {
  const destPath = path.join(outDir, item.filename);
  await fs.mkdir(path.dirname(destPath), { recursive: true });

  if (skipExisting && (await fileExists(destPath))) {
    console.log(`[${index + 1}/${total}] Skipping existing ${item.filename}`);
    return;
  }

  const payload = {
    model: MODEL,
    prompt: item.prompt,
    size: item.source_size || "1536x1024",
    quality: QUALITY,
    n: 1,
  };

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const imageB64 = data?.data?.[0]?.b64_json;
  if (!imageB64) throw new Error("No image data returned from OpenAI.");

  const rawPath = path.join(tempDir, `raw-${item.id}.png`);
  await fs.writeFile(rawPath, Buffer.from(imageB64, "base64"));

  const [targetWidth, targetHeight] = String(item.size || "").split("x").map(Number);
  const [sourceWidth, sourceHeight] = String(item.source_size || "").split("x").map(Number);
  const canResize =
    Number.isFinite(targetWidth) &&
    Number.isFinite(targetHeight) &&
    Number.isFinite(sourceWidth) &&
    Number.isFinite(sourceHeight) &&
    (targetWidth !== sourceWidth || targetHeight !== sourceHeight);

  if (canResize) {
    const resized = await resizeWithSips(rawPath, destPath, targetWidth, targetHeight);
    if (!resized) {
      await fs.copyFile(rawPath, destPath);
    }
  } else {
    await fs.copyFile(rawPath, destPath);
  }

  console.log(`[${index + 1}/${total}] Wrote ${item.filename}`);
}

const total = limit > 0 ? Math.min(limit, items.length) : items.length;
for (let i = 0; i < total; i += 1) {
  await generateImage(items[i], i, total);
}

console.log(`Done. Generated ${total} image(s).`);
