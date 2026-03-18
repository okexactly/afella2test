import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const LAYER_ORDER = [
  "bkg",
  "bkg overlay",
  "bkg overlay 2",
  "back",
  "character",
  "outfit",
  "accessory",
  "head",
  "left",
  "right",
  "top"
];

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

const projectRoot = process.cwd();
const layersRoot = path.join(projectRoot, "layers");
const outputPath = path.join(projectRoot, "layers-manifest.json");

function encodePathSegment(segment) {
  return encodeURIComponent(segment).replace(/%2F/g, "/");
}

async function directoryExists(dirPath) {
  try {
    const info = await stat(dirPath);
    return info.isDirectory();
  } catch {
    return false;
  }
}

async function readLayerFiles(layerName) {
  const layerDir = path.join(layersRoot, layerName);

  if (!(await directoryExists(layerDir))) {
    return [];
  }

  const entries = await readdir(layerDir, { withFileTypes: true });

  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  return files.map(
    (fileName) =>
      `layers/${encodePathSegment(layerName)}/${encodePathSegment(fileName)}`
  );
}

async function buildManifest() {
  const categories = {};

  for (const layerName of LAYER_ORDER) {
    categories[layerName] = await readLayerFiles(layerName);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    order: LAYER_ORDER,
    categories
  };

  await writeFile(outputPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  const total = Object.values(categories).reduce((sum, files) => sum + files.length, 0);
  console.log(`Wrote ${outputPath}`);
  console.log(`Layers: ${LAYER_ORDER.length} categories, ${total} images total`);
}

buildManifest().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
