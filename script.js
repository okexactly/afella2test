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

const canvas = document.getElementById("canvas");
const randomizeBtn = document.getElementById("randomizeBtn");
const statusEl = document.getElementById("status");

const layerElements = new Map();
let manifest = null;

function createLayerElements() {
  canvas.innerHTML = "";

  LAYER_ORDER.forEach((layerName) => {
    const img = document.createElement("img");
    img.dataset.layer = layerName;
    img.alt = "";
    img.style.display = "none";
    canvas.appendChild(img);
    layerElements.set(layerName, img);
  });
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function preload(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = reject;
    image.src = src;
  });
}

async function randomizeLayers() {
  if (!manifest) {
    return;
  }

  randomizeBtn.disabled = true;

  const picks = LAYER_ORDER.flatMap((layerName) => {
    const files = manifest.categories[layerName] || [];

    if (files.length === 0) {
      return [];
    }

    return [{ layerName, src: randomItem(files) }];
  });

  if (picks.length === 0) {
    statusEl.textContent = "No images found in the configured layer folders.";
    randomizeBtn.disabled = false;
    return;
  }

  try {
    await Promise.all(picks.map((pick) => preload(pick.src)));

    LAYER_ORDER.forEach((layerName) => {
      const img = layerElements.get(layerName);
      img.style.display = "none";
      img.removeAttribute("src");
    });

    picks.forEach(({ layerName, src }) => {
      const img = layerElements.get(layerName);
      img.src = src;
      img.alt = `${layerName} layer`;
      img.style.display = "block";
    });

    statusEl.textContent = `Generated ${picks.length} layers.`;
  } catch {
    statusEl.textContent = "Could not load one or more selected images.";
  } finally {
    randomizeBtn.disabled = false;
  }
}

async function initialize() {
  createLayerElements();

  try {
    const response = await fetch("layers-manifest.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Manifest request failed: ${response.status}`);
    }

    manifest = await response.json();

    randomizeBtn.disabled = false;
    statusEl.textContent = "Layers loaded.";
    await randomizeLayers();
  } catch {
    statusEl.textContent =
      "Missing manifest. Run: node scripts/generate-manifest.mjs";
  }
}

randomizeBtn.addEventListener("click", randomizeLayers);

initialize();
