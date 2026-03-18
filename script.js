const LAYER_ORDER = [
  "bkg",
  "bkg overlay",
  "bkg overlay 2",
  "back",
  "character",
  "outfit",
  "head",
  "accessory",
  "left",
  "right",
  "top"
];
const CONTROL_ORDER = [...LAYER_ORDER].reverse();
const EYE_OPEN_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3.2"/></svg>';
const EYE_CLOSED_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.4 4.2"/><path d="M6.2 6.3A18 18 0 0 0 2 12s3.5 7 10 7c1.4 0 2.6-.3 3.8-.7"/></svg>';
const LOCK_INLINE_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 10h-1V7a4 4 0 0 0-8 0v3H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-7-3a2 2 0 0 1 4 0v3h-4V7z"/></svg>';
const FOLDER_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z"/></svg>';
const BACK_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5 3 12l7 7"/><path d="M3 12h18"/></svg>';
const FAVORITES_STORAGE_KEY = "afella2:favorites:v1";

const sidebar = document.getElementById("sidebar");
const canvas = document.getElementById("canvas");
const layersView = document.getElementById("layersView");
const galleryView = document.getElementById("galleryView");
const galleryGrid = document.getElementById("galleryGrid");
const layerControls = document.getElementById("layerControls");
const randomizeBtn = document.getElementById("randomizeBtn");
const downloadBtn = document.getElementById("downloadBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const statusRefreshBtn = document.getElementById("statusRefreshBtn");
const sidebarModeBtn = document.getElementById("sidebarModeBtn");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const sidebarOpenBtn = document.getElementById("sidebarOpenBtn");
const statusEl = document.getElementById("status");
const particleField = document.getElementById("particleField");

const layerElements = new Map();
const layerState = new Map();
const layerView = new Map();
let compositePreviewImage = null;

let manifest = null;
let renderRequestId = 0;
const STATUS_DIM_DELAY_MS = 2200;
let statusDimTimeoutId = null;
let previousStackSnapshot = null;
let actionButtonsDisabled = true;
let actionDisableOwnerRequestId = null;
let randomizeLoadingOwnerRequestId = null;
let favorites = [];

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

  const preview = document.createElement("img");
  preview.className = "composite-save-image";
  preview.alt = "Current composite image";
  preview.style.display = "none";
  canvas.appendChild(preview);
  compositePreviewImage = preview;
}

function formatLayerName(layerName) {
  return layerName.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function decodeFileName(filePath) {
  const fileName = filePath.split("/").pop() || filePath;
  const decoded = decodeURIComponent(fileName);
  const withoutExtension = decoded.replace(/\.[^.]+$/, "");
  return withoutExtension.replace(/_/g, "'");
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function preload(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function setActionButtonsDisabled(disabled) {
  actionButtonsDisabled = disabled;
  randomizeBtn.disabled = disabled;
  downloadBtn.disabled = disabled;
  updateFavoriteButtonState();
  updateStatusRefreshButtonState();
}

function updateStatusRefreshButtonState() {
  if (statusRefreshBtn) {
    statusRefreshBtn.disabled = actionButtonsDisabled || !previousStackSnapshot;
  }
}

function setRandomizeLoading(isLoading) {
  randomizeBtn.classList.toggle("is-loading", isLoading);
  randomizeBtn.setAttribute("aria-busy", String(isLoading));
}

function setStatus(message) {
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
  statusEl.classList.remove("is-dimmed");

  if (statusDimTimeoutId) {
    window.clearTimeout(statusDimTimeoutId);
  }

  statusDimTimeoutId = window.setTimeout(() => {
    statusEl.classList.add("is-dimmed");
  }, STATUS_DIM_DELAY_MS);
}

function setSidebarCollapsed(collapsed) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);

  if (!sidebarOpenBtn || !sidebarCloseBtn) {
    return;
  }

  sidebarOpenBtn.setAttribute("aria-hidden", String(!collapsed));
  sidebarOpenBtn.setAttribute("aria-expanded", String(!collapsed));
  sidebarCloseBtn.setAttribute("aria-expanded", String(!collapsed));
}

function setSidebarGalleryView(showGallery) {
  if (!sidebar || !layersView || !galleryView || !sidebarModeBtn) {
    return;
  }

  sidebar.classList.toggle("is-gallery-view", showGallery);
  layersView.hidden = showGallery;
  galleryView.hidden = !showGallery;

  sidebarModeBtn.innerHTML = showGallery ? BACK_ICON : FOLDER_ICON;
  sidebarModeBtn.setAttribute(
    "aria-label",
    showGallery ? "Back to layers" : "Open saved gallery"
  );
  sidebarModeBtn.title = showGallery ? "Back to layers" : "Open saved gallery";
}

function buildSnapshotSignature(snapshot) {
  const normalized = {};

  LAYER_ORDER.forEach((layerName) => {
    const source = snapshot[layerName] || {};
    const disabled = Array.isArray(source.disabled)
      ? Array.from(new Set(source.disabled.filter((item) => typeof item === "string"))).sort()
      : [];

    normalized[layerName] = {
      selected: typeof source.selected === "string" ? source.selected : null,
      locked: typeof source.locked === "string" ? source.locked : null,
      hidden: Boolean(source.hidden),
      disabled
    };
  });

  return JSON.stringify(normalized);
}

function getCurrentSnapshotSignature() {
  if (!hasSelectedLayers()) {
    return null;
  }

  return buildSnapshotSignature(createStackSnapshot());
}

function loadFavoritesFromStorage() {
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!raw) {
      favorites = [];
      return;
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      favorites = [];
      return;
    }

    favorites = parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object" || !entry.snapshot) {
          return null;
        }

        const id = typeof entry.id === "string" ? entry.id : null;
        const preview = 
          typeof entry.preview === "string" && entry.preview.length > 0
            ? entry.preview
            : null;
        const snapshot = entry.snapshot;

        if (!id) {
          return null;
        }

        return {
          id,
          preview,
          snapshot,
          signature: buildSnapshotSignature(snapshot),
          savedAt:
            typeof entry.savedAt === "number" && Number.isFinite(entry.savedAt)
              ? entry.savedAt
              : Date.now()
        };
      })
      .filter(Boolean);

    // Rewrite in compact format so large legacy preview payloads don't block future saves.
    persistFavorites();
  } catch {
    favorites = [];
  }
}

function persistFavorites() {
  try {
    const serialized = favorites.map((item) => ({
      id: item.id,
      snapshot: item.snapshot,
      savedAt: item.savedAt
    }));
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(serialized));
  } catch {
    // Ignore storage failures silently.
  }
}

function getSnapshotPicks(snapshot) {
  return LAYER_ORDER.flatMap((layerName) => {
    const state = getLayerState(layerName);
    const layerSnapshot = snapshot[layerName];

    if (!state || !layerSnapshot || layerSnapshot.hidden) {
      return [];
    }

    const selected =
      typeof layerSnapshot.selected === "string" &&
      state.files.includes(layerSnapshot.selected)
        ? layerSnapshot.selected
        : null;

    if (!selected) {
      return [];
    }

    const disabledSet = new Set(
      Array.isArray(layerSnapshot.disabled) ? layerSnapshot.disabled : []
    );

    if (disabledSet.has(selected)) {
      return [];
    }

    return [{ layerName, source: selected }];
  });
}

async function buildSnapshotPreview(snapshot) {
  const picks = getSnapshotPicks(snapshot);

  if (picks.length === 0) {
    return "";
  }

  const images = await Promise.all(picks.map((pick) => preload(pick.source)));
  const previewCanvas = buildCompositeCanvas(images);
  return previewCanvas.toDataURL("image/png");
}

async function hydrateFavoritePreview(favorite, previewEl) {
  const favoriteId = favorite.id;
  previewEl.dataset.favoriteId = favoriteId;

  if (favorite.preview) {
    previewEl.src = favorite.preview;
    return;
  }

  try {
    const src = await buildSnapshotPreview(favorite.snapshot);

    if (previewEl.dataset.favoriteId !== favoriteId || !src) {
      return;
    }

    previewEl.src = src;
    favorite.preview = src;
  } catch {
    // Ignore preview generation failures silently.
  }
}

function renderFavoritesGallery() {
  if (!galleryGrid) {
    return;
  }

  galleryGrid.innerHTML = "";

  favorites.forEach((favorite) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "gallery-item";
    item.setAttribute("aria-label", "Load saved favorite");
    item.title = "Load saved favorite";

    const preview = document.createElement("img");
    preview.alt = "Saved favorite preview";
    hydrateFavoritePreview(favorite, preview);

    item.appendChild(preview);
    item.addEventListener("click", () => {
      loadFavoriteById(favorite.id);
    });

    galleryGrid.appendChild(item);
  });
}

function updateFavoriteButtonState() {
  if (!favoriteBtn) {
    return;
  }

  const currentSignature = getCurrentSnapshotSignature();
  const isFavorited =
    Boolean(currentSignature) &&
    favorites.some((favorite) => favorite.signature === currentSignature);

  favoriteBtn.classList.toggle("is-favorited", isFavorited);
  favoriteBtn.setAttribute("aria-pressed", String(isFavorited));
  favoriteBtn.disabled = actionButtonsDisabled || !currentSignature;
  favoriteBtn.setAttribute(
    "aria-label",
    isFavorited ? "Remove current favorite" : "Save current favorite"
  );
  favoriteBtn.title = isFavorited ? "Remove current favorite" : "Save current favorite";
}

async function loadFavoriteById(id) {
  const favorite = favorites.find((item) => item.id === id);

  if (!favorite) {
    return;
  }

  capturePreviousStackSnapshot();
  applyStackSnapshot(favorite.snapshot);
  updateAllCategoryViews();
  setSidebarGalleryView(false);
  await renderSelectedLayers("Loaded favorite", {
    disableActions: true
  });
}

function saveCurrentFavorite() {
  if (!favoriteBtn) {
    return;
  }

  if (!hasSelectedLayers()) {
    setStatus("No layers selected");
    return;
  }

  const snapshot = createStackSnapshot();
  const signature = buildSnapshotSignature(snapshot);
  const existing = favorites.find((item) => item.signature === signature);

  if (existing) {
    favorites = favorites.filter((item) => item.signature !== signature);
    persistFavorites();
    renderFavoritesGallery();
    updateFavoriteButtonState();
    setStatus("Removed from favorites");
    return;
  }

  favorites.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    preview:
      compositePreviewImage && typeof compositePreviewImage.src === "string"
        ? compositePreviewImage.src
        : null,
    snapshot,
    signature,
    savedAt: Date.now()
  });

  persistFavorites();
  renderFavoritesGallery();
  updateFavoriteButtonState();
  setStatus("Saved to favorites");
}

function hasSelectedLayers() {
  return LAYER_ORDER.some((layerName) => {
    const state = getLayerState(layerName);
    return Boolean(state && state.selected);
  });
}

function createStackSnapshot() {
  const snapshot = {};

  LAYER_ORDER.forEach((layerName) => {
    const state = getLayerState(layerName);

    if (!state) {
      return;
    }

    snapshot[layerName] = {
      selected: state.selected,
      locked: state.locked,
      hidden: state.hidden,
      disabled: Array.from(state.disabled)
    };
  });

  return snapshot;
}

function capturePreviousStackSnapshot() {
  if (!hasSelectedLayers()) {
    return;
  }

  previousStackSnapshot = createStackSnapshot();
  updateStatusRefreshButtonState();
}

function applyStackSnapshot(snapshot) {
  LAYER_ORDER.forEach((layerName) => {
    const state = getLayerState(layerName);
    const layerSnapshot = snapshot[layerName];

    if (!state || !layerSnapshot) {
      return;
    }

    const disabled = new Set(
      (layerSnapshot.disabled || []).filter((source) => state.files.includes(source))
    );
    const locked =
      typeof layerSnapshot.locked === "string" &&
      state.files.includes(layerSnapshot.locked) &&
      !disabled.has(layerSnapshot.locked)
        ? layerSnapshot.locked
        : null;

    let selected =
      typeof layerSnapshot.selected === "string" &&
      state.files.includes(layerSnapshot.selected)
        ? layerSnapshot.selected
        : null;

    state.hidden = Boolean(layerSnapshot.hidden);
    state.disabled = disabled;
    state.locked = locked;

    if (selected && state.disabled.has(selected)) {
      selected = null;
    }

    if (!selected && state.locked) {
      selected = state.locked;
    }

    if (!selected) {
      selected = firstAvailableSource(state);
    }

    state.selected = selected;
  });
}

async function restorePreviousStack() {
  if (!previousStackSnapshot) {
    return;
  }

  const snapshot = previousStackSnapshot;
  previousStackSnapshot = null;
  updateStatusRefreshButtonState();

  applyStackSnapshot(snapshot);
  updateAllCategoryViews();
  await renderSelectedLayers("Restored previous stack", {
    disableActions: true
  });
}

function updateCanvasAspectRatio(images) {
  const widths = images
    .map((image) => image.naturalWidth || 0)
    .filter((value) => value > 0);
  const heights = images
    .map((image) => image.naturalHeight || 0)
    .filter((value) => value > 0);

  if (widths.length === 0 || heights.length === 0) {
    return;
  }

  const width = Math.max(...widths);
  const height = Math.max(...heights);
  canvas.style.setProperty("--canvas-ratio", `${width} / ${height}`);
}

function buildCompositeCanvas(images) {
  const width = Math.max(...images.map((image) => image.naturalWidth || 0));
  const height = Math.max(...images.map((image) => image.naturalHeight || 0));

  if (!width || !height) {
    throw new Error("Invalid image dimensions");
  }

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = width;
  exportCanvas.height = height;

  const context = exportCanvas.getContext("2d");

  if (!context) {
    throw new Error("Missing canvas context");
  }

  images.forEach((image) => {
    context.drawImage(image, 0, 0);
  });

  return exportCanvas;
}

function initializeCanvasTilt() {
  if (!canvas) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  const maxTilt = 7;
  const activeScale = 1.012;
  const smooth = 0.17;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isHovering = false;
  let animationFrameId = 0;

  function canTilt() {
    return !reducedMotion.matches && finePointer.matches;
  }

  function renderTilt() {
    const scale = isHovering ? activeScale : 1;
    canvas.style.transform = `rotateX(${currentY.toFixed(2)}deg) rotateY(${currentX.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
  }

  function animateTilt() {
    animationFrameId = 0;

    currentX += (targetX - currentX) * smooth;
    currentY += (targetY - currentY) * smooth;
    renderTilt();

    const motionRemaining =
      Math.abs(targetX - currentX) + Math.abs(targetY - currentY);

    if (motionRemaining > 0.03 || isHovering) {
      animationFrameId = window.requestAnimationFrame(animateTilt);
    }
  }

  function requestTiltFrame() {
    if (!animationFrameId) {
      animationFrameId = window.requestAnimationFrame(animateTilt);
    }
  }

  function resetTilt() {
    targetX = 0;
    targetY = 0;
    isHovering = false;
    canvas.classList.remove("is-tilting");
    requestTiltFrame();
  }

  function handleMove(event) {
    if (!canTilt()) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const ratioX = (event.clientX - rect.left) / rect.width;
    const ratioY = (event.clientY - rect.top) / rect.height;

    const normalizedX = ratioX * 2 - 1;
    const normalizedY = ratioY * 2 - 1;

    targetX = normalizedX * maxTilt;
    targetY = -normalizedY * maxTilt;
    isHovering = true;
    canvas.classList.add("is-tilting");
    requestTiltFrame();
  }

  function handleEnter(event) {
    if (!canTilt()) {
      return;
    }

    handleMove(event);
  }

  function handlePreferenceChange() {
    if (!canTilt()) {
      targetX = 0;
      targetY = 0;
      currentX = 0;
      currentY = 0;
      canvas.style.transform = "";
      canvas.classList.remove("is-tilting");
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
    }
  }

  canvas.addEventListener("mousemove", handleMove);
  canvas.addEventListener("mouseenter", handleEnter);
  canvas.addEventListener("mouseleave", resetTilt);

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", handlePreferenceChange);
  } else if (typeof reducedMotion.addListener === "function") {
    reducedMotion.addListener(handlePreferenceChange);
  }

  if (typeof finePointer.addEventListener === "function") {
    finePointer.addEventListener("change", handlePreferenceChange);
  } else if (typeof finePointer.addListener === "function") {
    finePointer.addListener(handlePreferenceChange);
  }
}

function initializeParticleField() {
  if (!particleField) {
    return;
  }

  const context = particleField.getContext("2d");

  if (!context) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrameId = 0;

  function buildParticles() {
    const area = width * height;
    const targetCount = Math.max(48, Math.min(180, Math.round(area / 9000)));

    particles = Array.from({ length: targetCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.8 + Math.random() * 2.2,
      driftX: (Math.random() - 0.5) * 0.08,
      driftY: 0.05 + Math.random() * 0.2,
      wobble: 2 + Math.random() * 12,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.004 + Math.random() * 0.012,
      alpha: 0.14 + Math.random() * 0.28,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.008 + Math.random() * 0.016,
      twinkleDepth: 0.28 + Math.random() * 0.38,
      glow: 4 + Math.random() * 10,
      hue: 42 + Math.random() * 12,
      saturation: 86 + Math.random() * 10,
      lightness: 68 + Math.random() * 14
    }));
  }

  function resizeParticleField() {
    width = window.innerWidth;
    height = window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    particleField.width = Math.floor(width * dpr);
    particleField.height = Math.floor(height * dpr);
    particleField.style.width = `${width}px`;
    particleField.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildParticles();
  }

  function drawFrame(animate) {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      if (animate) {
        particle.x += particle.driftX;
        particle.y -= particle.driftY;
        particle.phase += particle.phaseSpeed;
        particle.twinklePhase += particle.twinkleSpeed;
      }

      if (particle.y < -18) {
        particle.y = height + 18;
        particle.x = Math.random() * width;
      }

      if (particle.x < -18) {
        particle.x = width + 18;
      } else if (particle.x > width + 18) {
        particle.x = -18;
      }

      const wobbleX = Math.sin(particle.phase) * particle.wobble;
      const twinkle =
        1 - particle.twinkleDepth / 2 +
        ((Math.sin(particle.twinklePhase) + 1) / 2) * particle.twinkleDepth;
      const alpha = particle.alpha * twinkle;
      const lightness = Math.min(
        92,
        particle.lightness * (0.82 + twinkle * 0.24)
      );

      context.shadowBlur = particle.glow * (0.7 + twinkle * 0.8);
      context.shadowColor = `hsla(${particle.hue}, ${particle.saturation}%, ${Math.min(
        97,
        lightness + 8
      )}%, ${Math.min(0.8, alpha + 0.16)})`;
      context.beginPath();
      context.arc(particle.x + wobbleX, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `hsla(${particle.hue}, ${particle.saturation}%, ${lightness}%, ${alpha})`;
      context.fill();
    });

    context.shadowBlur = 0;
  }

  function animateParticleField() {
    drawFrame(true);
    animationFrameId = window.requestAnimationFrame(animateParticleField);
  }

  function startParticleField() {
    window.cancelAnimationFrame(animationFrameId);

    if (reducedMotion.matches) {
      drawFrame(false);
      return;
    }

    animateParticleField();
  }

  resizeParticleField();
  startParticleField();

  window.addEventListener("resize", () => {
    resizeParticleField();
    startParticleField();
  });

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", startParticleField);
  } else if (typeof reducedMotion.addListener === "function") {
    reducedMotion.addListener(startParticleField);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrameId);
      return;
    }

    startParticleField();
  });
}

function getLayerState(layerName) {
  return layerState.get(layerName);
}

function updateCategoryView(layerName) {
  const state = getLayerState(layerName);
  const view = layerView.get(layerName);

  if (!state || !view) {
    return;
  }

  const currentLabel = state.selected ? decodeFileName(state.selected) : "None selected";
  const lockBadge = state.locked
    ? `<span class="current-lock-icon" title="Locked" aria-label="Locked">${LOCK_INLINE_ICON}</span>`
    : "";
  view.current.innerHTML = `${currentLabel}${lockBadge}`;

  view.visibilityBtn.classList.toggle("is-hidden", state.hidden);
  view.visibilityBtn.setAttribute("aria-pressed", String(state.hidden));
  view.visibilityBtn.setAttribute(
    "aria-label",
    `${state.hidden ? "Show" : "Hide"} ${formatLayerName(layerName)} layer`
  );
  view.visibilityBtn.innerHTML = state.hidden ? EYE_CLOSED_ICON : EYE_OPEN_ICON;

  view.category.classList.toggle("is-layer-hidden", state.hidden);

  state.files.forEach((source) => {
    const itemView = view.items.get(source);

    if (!itemView) {
      return;
    }

    const isSelected = state.selected === source;
    const isDisabled = state.disabled.has(source);
    const isLocked = state.locked === source;

    itemView.row.classList.toggle("is-selected", isSelected);
    itemView.row.classList.toggle("is-disabled", isDisabled);

    itemView.pick.classList.toggle("is-selected", isSelected);

    itemView.disableBtn.classList.toggle("is-active", isDisabled);
    itemView.disableBtn.setAttribute("aria-pressed", String(isDisabled));

    itemView.lockBtn.classList.toggle("is-active", isLocked);
    itemView.lockBtn.setAttribute("aria-pressed", String(isLocked));
    itemView.lockBtn.disabled = isDisabled;
  });
}

function updateAllCategoryViews() {
  LAYER_ORDER.forEach((layerName) => updateCategoryView(layerName));
}

function getSelectionPicks() {
  return LAYER_ORDER.flatMap((layerName) => {
    const state = getLayerState(layerName);

    if (!state || !state.selected || state.hidden) {
      return [];
    }

    return [{ layerName, source: state.selected }];
  });
}

async function renderSelectedLayers(
  successMessage,
  { disableActions = false, blurDuringLoad = false, showRandomizeLoading = false } = {}
) {
  const picks = getSelectionPicks();
  const requestId = ++renderRequestId;

  if (showRandomizeLoading) {
    randomizeLoadingOwnerRequestId = requestId;
    setRandomizeLoading(true);
  } else if (randomizeLoadingOwnerRequestId !== null) {
    randomizeLoadingOwnerRequestId = null;
    setRandomizeLoading(false);
  }

  if (blurDuringLoad) {
    canvas.classList.add("is-loading-blur");
  } else {
    canvas.classList.remove("is-loading-blur");
  }

  if (disableActions) {
    actionDisableOwnerRequestId = requestId;
    setActionButtonsDisabled(true);
  } else if (actionDisableOwnerRequestId !== null) {
    actionDisableOwnerRequestId = null;
    setActionButtonsDisabled(false);
  }

  if (picks.length === 0) {
    setStatus("No layers selected");
    updateFavoriteButtonState();
    if (showRandomizeLoading && randomizeLoadingOwnerRequestId === requestId) {
      randomizeLoadingOwnerRequestId = null;
      setRandomizeLoading(false);
    }
    if (disableActions && actionDisableOwnerRequestId === requestId) {
      actionDisableOwnerRequestId = null;
      setActionButtonsDisabled(false);
    }
    return;
  }

  try {
    const loadedImages = await Promise.all(
      picks.map((pick) => preload(pick.source))
    );
    updateCanvasAspectRatio(loadedImages);

    if (requestId !== renderRequestId) {
      return;
    }

    LAYER_ORDER.forEach((layerName) => {
      const img = layerElements.get(layerName);
      img.style.display = "none";
      img.removeAttribute("src");
    });

    picks.forEach(({ layerName, source }) => {
      const img = layerElements.get(layerName);
      img.src = source;
      img.alt = `${layerName} layer`;
      img.style.display = "block";
    });

    if (compositePreviewImage) {
      const compositeCanvas = buildCompositeCanvas(loadedImages);
      compositePreviewImage.src = compositeCanvas.toDataURL("image/png");
      compositePreviewImage.style.display = "block";
    }

    setStatus(successMessage || `Rendered ${picks.length} layers`);
  } catch {
    if (requestId === renderRequestId) {
      setStatus("Could not load one or more selected images");
    }
  } finally {
    if (showRandomizeLoading && randomizeLoadingOwnerRequestId === requestId) {
      randomizeLoadingOwnerRequestId = null;
      setRandomizeLoading(false);
    }

    if (requestId === renderRequestId) {
      canvas.classList.remove("is-loading-blur");
    }

    if (disableActions && actionDisableOwnerRequestId === requestId) {
      actionDisableOwnerRequestId = null;
      setActionButtonsDisabled(false);
    }

    if (requestId === renderRequestId) {
      updateFavoriteButtonState();
    }
  }
}

async function downloadCompositeImage() {
  const picks = getSelectionPicks();

  if (picks.length === 0) {
    setStatus("Nothing to download yet");
    return;
  }

  setActionButtonsDisabled(true);

  try {
    const images = await Promise.all(picks.map((pick) => preload(pick.source)));
    const exportCanvas = buildCompositeCanvas(images);

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const link = document.createElement("a");
    link.href = exportCanvas.toDataURL("image/png");
    link.download = `afella custom-${stamp}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setStatus("Downloaded PNG");
  } catch {
    setStatus("Could not export the current composite");
  } finally {
    setActionButtonsDisabled(false);
  }
}

function firstAvailableSource(state) {
  return state.files.find((source) => !state.disabled.has(source)) || null;
}

async function pickLayer(layerName, source) {
  const state = getLayerState(layerName);

  if (!state) {
    return;
  }

  capturePreviousStackSnapshot();

  if (state.disabled.has(source)) {
    state.disabled.delete(source);
  }

  const changedSelection = state.selected !== source;
  if (changedSelection && state.locked) {
    state.locked = null;
  }

  state.selected = source;
  updateCategoryView(layerName);
  await renderSelectedLayers("Layer selection updated");
}

async function toggleLayerDisabled(layerName, source) {
  const state = getLayerState(layerName);
  let isDisabledNow = false;

  if (!state) {
    return;
  }

  capturePreviousStackSnapshot();

  if (state.disabled.has(source)) {
    state.disabled.delete(source);
    isDisabledNow = false;
  } else {
    state.disabled.add(source);
    isDisabledNow = true;

    if (state.locked === source) {
      state.locked = null;
    }

    if (state.selected === source) {
      state.selected = firstAvailableSource(state);
    }
  }

  updateCategoryView(layerName);
  await renderSelectedLayers(
    isDisabledNow ? "Layer removed from random pool" : "Layer enabled in random pool"
  );
}

async function toggleLayerLock(layerName, source) {
  const state = getLayerState(layerName);

  if (!state || state.disabled.has(source)) {
    return;
  }

  capturePreviousStackSnapshot();

  if (state.locked === source) {
    state.locked = null;
  } else {
    state.locked = source;
    state.selected = source;
  }

  updateCategoryView(layerName);
  await renderSelectedLayers(state.locked ? "Layer locked" : "Layer unlocked");
}

async function toggleCategoryVisibility(layerName) {
  const state = getLayerState(layerName);

  if (!state) {
    return;
  }

  capturePreviousStackSnapshot();

  state.hidden = !state.hidden;
  updateCategoryView(layerName);
  await renderSelectedLayers(
    state.hidden ? "Category hidden" : "Category shown"
  );
}

function createLayerControls() {
  layerControls.innerHTML = "";
  layerState.clear();
  layerView.clear();
  previousStackSnapshot = null;
  updateStatusRefreshButtonState();

  CONTROL_ORDER.forEach((layerName) => {
    const files = manifest.categories[layerName] || [];

    const state = {
      files,
      selected: null,
      locked: null,
      disabled: new Set(),
      hidden: false
    };

    layerState.set(layerName, state);

    const categoryRow = document.createElement("div");
    categoryRow.className = "layer-category-row";

    const category = document.createElement("details");
    category.className = "layer-category";
    category.open = false;

    const summary = document.createElement("summary");
    summary.className = "layer-category-summary";

    const caret = document.createElement("span");
    caret.className = "category-caret";
    caret.setAttribute("aria-hidden", "true");
    caret.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';

    const name = document.createElement("span");
    name.className = "layer-category-name";
    name.textContent = formatLayerName(layerName);

    const current = document.createElement("span");
    current.className = "layer-category-current";
    current.textContent = files.length === 0 ? "No images" : "None selected";

    summary.append(caret, name, current);
    category.appendChild(summary);

    const list = document.createElement("div");
    list.className = "layer-list";

    const itemViewMap = new Map();

    if (files.length === 0) {
      const empty = document.createElement("p");
      empty.className = "layer-empty";
      empty.textContent = "No images found.";
      list.appendChild(empty);
    } else {
      files.forEach((source) => {
        const row = document.createElement("div");
        row.className = "layer-item";

        const pick = document.createElement("button");
        pick.type = "button";
        pick.className = "layer-pick";
        pick.textContent = decodeFileName(source);
        pick.addEventListener("click", () => {
          pickLayer(layerName, source);
        });

        const disableBtn = document.createElement("button");
        disableBtn.type = "button";
        disableBtn.className = "item-toggle item-disable";
        disableBtn.textContent = "X";
        disableBtn.title = "Disable this image in random generation";
        disableBtn.setAttribute("aria-label", `Disable ${decodeFileName(source)}`);
        disableBtn.setAttribute("aria-pressed", "false");
        disableBtn.addEventListener("click", () => {
          toggleLayerDisabled(layerName, source);
        });

        const lockBtn = document.createElement("button");
        lockBtn.type = "button";
        lockBtn.className = "item-toggle item-lock";
        lockBtn.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-7-2a2 2 0 1 1 4 0v2h-4V7z"/></svg>';
        lockBtn.title = "Lock this image for this category";
        lockBtn.setAttribute("aria-label", `Lock ${decodeFileName(source)}`);
        lockBtn.setAttribute("aria-pressed", "false");
        lockBtn.addEventListener("click", () => {
          toggleLayerLock(layerName, source);
        });

        row.append(pick, disableBtn, lockBtn);
        list.appendChild(row);
        itemViewMap.set(source, { row, pick, disableBtn, lockBtn });
      });
    }

    category.appendChild(list);

    const visibilityBtn = document.createElement("button");
    visibilityBtn.type = "button";
    visibilityBtn.className = "category-visibility-btn";
    visibilityBtn.innerHTML = EYE_OPEN_ICON;
    visibilityBtn.setAttribute("aria-label", `Hide ${formatLayerName(layerName)} layer`);
    visibilityBtn.setAttribute("aria-pressed", "false");
    visibilityBtn.title = "Show or hide this category in the final image";
    visibilityBtn.addEventListener("click", () => {
      toggleCategoryVisibility(layerName);
    });

    categoryRow.append(category, visibilityBtn);
    layerControls.appendChild(categoryRow);

    layerView.set(layerName, {
      category,
      current,
      visibilityBtn,
      items: itemViewMap
    });
  });
}

async function randomizeLayers() {
  if (!manifest) {
    return;
  }

  capturePreviousStackSnapshot();

  let generatedCount = 0;

  LAYER_ORDER.forEach((layerName) => {
    const state = getLayerState(layerName);

    if (!state) {
      return;
    }

    const available = state.files.filter((source) => !state.disabled.has(source));

    if (state.locked && !available.includes(state.locked)) {
      state.locked = null;
    }

    if (state.locked) {
      state.selected = state.locked;
      generatedCount += 1;
      return;
    }

    if (available.length === 0) {
      state.selected = null;
      return;
    }

    state.selected = randomItem(available);
    generatedCount += 1;
  });

  updateAllCategoryViews();

  if (generatedCount === 0) {
    setStatus("No images available in the configured layer folders");
    return;
  }

  await renderSelectedLayers("Generated new afella <3", {
    disableActions: true,
    blurDuringLoad: true,
    showRandomizeLoading: true
  });
}

async function initialize() {
  createLayerElements();
  loadFavoritesFromStorage();
  renderFavoritesGallery();
  updateFavoriteButtonState();

  try {
    const response = await fetch("layers-manifest.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Manifest request failed: ${response.status}`);
    }

    manifest = await response.json();
    createLayerControls();
    renderFavoritesGallery();

    setActionButtonsDisabled(false);
    await randomizeLayers();
  } catch {
    setStatus("Missing manifest. Run: node scripts/generate-manifest.mjs");
    setActionButtonsDisabled(true);
  }
}

randomizeBtn.addEventListener("click", randomizeLayers);
downloadBtn.addEventListener("click", downloadCompositeImage);

if (statusRefreshBtn) {
  statusRefreshBtn.addEventListener("click", restorePreviousStack);
}

if (favoriteBtn) {
  favoriteBtn.addEventListener("click", saveCurrentFavorite);
}

if (sidebarModeBtn) {
  sidebarModeBtn.addEventListener("click", () => {
    setSidebarGalleryView(
      sidebar ? !sidebar.classList.contains("is-gallery-view") : false
    );
  });
}

if (sidebarCloseBtn) {
  sidebarCloseBtn.addEventListener("click", () => {
    setSidebarCollapsed(true);
  });
}

if (sidebarOpenBtn) {
  sidebarOpenBtn.addEventListener("click", () => {
    setSidebarCollapsed(false);
  });
}

setSidebarCollapsed(false);
setSidebarGalleryView(false);
setRandomizeLoading(false);

initializeParticleField();
initializeCanvasTilt();
initialize();
