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
const DICE_FACE_VALUES = [1, 2, 3, 4, 5, 6];
const DICE_FACE_PIPS = {
  1: [
    [12, 12]
  ],
  2: [
    [9, 9],
    [15, 15]
  ],
  3: [
    [9, 9],
    [12, 12],
    [15, 15]
  ],
  4: [
    [9, 9],
    [15, 9],
    [9, 15],
    [15, 15]
  ],
  5: [
    [9, 9],
    [15, 9],
    [12, 12],
    [9, 15],
    [15, 15]
  ],
  6: [
    [9, 8],
    [15, 8],
    [9, 12],
    [15, 12],
    [9, 16],
    [15, 16]
  ]
};
const DICE_SHUFFLE_INTERVAL_MS = 95;
const DICE_ICONS_BY_FACE = DICE_FACE_VALUES.reduce((icons, face) => {
  icons[face] = buildDiceIcon(face);
  return icons;
}, {});
const DICE_ICON = DICE_ICONS_BY_FACE[2];
const LOCK_INLINE_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 10h-1V7a4 4 0 0 0-8 0v3H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-7-3a2 2 0 0 1 4 0v3h-4V7z"/></svg>';
const FOLDER_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z"/></svg>';
const BACK_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5 3 12l7 7"/><path d="M3 12h18"/></svg>';
const GEAR_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"/><path d="m3 13.4 1.8.4a7.4 7.4 0 0 0 .7 1.7l-1 1.6 2.2 2.2 1.6-1a7.4 7.4 0 0 0 1.7.7l.4 1.8h3.2l.4-1.8a7.4 7.4 0 0 0 1.7-.7l1.6 1 2.2-2.2-1-1.6a7.4 7.4 0 0 0 .7-1.7l1.8-.4v-3.2l-1.8-.4a7.4 7.4 0 0 0-.7-1.7l1-1.6-2.2-2.2-1.6 1a7.4 7.4 0 0 0-1.7-.7L13.4 3h-3.2l-.4 1.8a7.4 7.4 0 0 0-1.7.7l-1.6-1-2.2 2.2 1 1.6a7.4 7.4 0 0 0-.7 1.7L3 10.2Z"/></svg>';
const FAVORITES_STORAGE_KEY = "afella2:favorites:v1";
const DISABLED_LAYERS_STORAGE_KEY = "afella2:disabled-layers:v1";
const SETTINGS_TOGGLES_STORAGE_KEY = "afella2:settings-toggles:v1";
const METADATA_TEMPLATE_PATH = "0.json";
const DEFAULT_METADATA_NAME = "afella 2 custom";
const DEFAULT_METADATA_DESCRIPTION = "transformed magical girl";
const RANDOM_HIDE_EXCLUDED_CATEGORIES = new Set(["bkg", "outfit"]);
const DEFAULT_HIDE_CHANCE = 0.15;
const CHARACTER_HIDE_CHANCE = 0.05;
const MAX_UNDO_HISTORY = 3;
const IMAGE_WARMUP_CONCURRENCY = 3;
const IMAGE_WARMUP_IDLE_TIMEOUT_MS = 220;

const sidebar = document.getElementById("sidebar");
const canvas = document.getElementById("canvas");
const layersView = document.getElementById("layersView");
const galleryView = document.getElementById("galleryView");
const settingsView = document.getElementById("settingsView");
const mintView = document.getElementById("mintView");
const galleryGrid = document.getElementById("galleryGrid");
const favoritesCount = document.getElementById("favoritesCount");
const layerControls = document.getElementById("layerControls");
const randomizeBtn = document.getElementById("randomizeBtn");
const downloadBtn = document.getElementById("downloadBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const statusRefreshBtn = document.getElementById("statusRefreshBtn");
const sidebarMintBtn = document.getElementById("sidebarMintBtn");
const sidebarModeBtn = document.getElementById("sidebarModeBtn");
const sidebarSettingsBtn = document.getElementById("sidebarSettingsBtn");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const sidebarOpenBtn = document.getElementById("sidebarOpenBtn");
const statusEl = document.getElementById("status");
const particleField = document.getElementById("particleField");
const downloadMetadataCheckbox = document.getElementById("downloadMetadataCheckbox");
const allowRandomizeHideCheckbox = document.getElementById("allowRandomizeHideCheckbox");
const enableEffectsCheckbox = document.getElementById("enableEffectsCheckbox");
const downloadFavoritesBtn = document.getElementById("downloadFavoritesBtn");
const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");
const clearFavoritesConfirmModal = document.getElementById("clearFavoritesConfirmModal");
const clearFavoritesConfirmYesBtn = document.getElementById("clearFavoritesConfirmYesBtn");
const clearFavoritesConfirmNoBtn = document.getElementById("clearFavoritesConfirmNoBtn");
const SIDEBAR_MINT_HOME_ICON = sidebarMintBtn ? sidebarMintBtn.innerHTML : "";

const layerElements = new Map();
const layerState = new Map();
const layerView = new Map();
const imagePreloadCache = new Map();
let compositePreviewImage = null;
let initialLoadMessageEl = null;

let manifest = null;
let renderRequestId = 0;
const STATUS_DIM_DELAY_MS = 2200;
let statusDimTimeoutId = null;
let previousStackSnapshots = [];
let actionButtonsDisabled = true;
let actionDisableOwnerRequestId = null;
let randomizeLoadingOwnerRequestId = null;
let diceShuffleOwnerRequestId = null;
let diceShuffleIntervalId = null;
let layerNameShuffleOwnerRequestId = null;
let layerNameShuffleIntervalId = null;
let refreshParticleFieldEffects = null;
let refreshCanvasTiltEffects = null;
let favorites = [];
let persistedDisabledLayers = {};
let sidebarViewMode = "layers";
let metadataTemplate = null;
let imageWarmupStarted = false;
let hasRenderedCompositeOnce = false;
let favoriteSparkleTimeoutId = null;

function getSettingsToggleEntries() {
  return [
    ["downloadMetadataCheckbox", downloadMetadataCheckbox, false],
    ["allowRandomizeHideCheckbox", allowRandomizeHideCheckbox, true],
    ["enableEffectsCheckbox", enableEffectsCheckbox, true]
  ];
}

function createLayerElements() {
  canvas.innerHTML = "";
  hasRenderedCompositeOnce = false;

  const initialMessage = document.createElement("p");
  initialMessage.className = "canvas-initial-load-message";
  initialMessage.textContent = "initial load can take some time";
  canvas.appendChild(initialMessage);
  initialLoadMessageEl = initialMessage;

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

function buildDiceIcon(face = 2) {
  const pips = DICE_FACE_PIPS[face] || DICE_FACE_PIPS[2];
  const pipMarkup = pips
    .map(
      ([cx, cy]) =>
        `<circle cx="${cx}" cy="${cy}" r="1.2" fill="currentColor" stroke="none"/>`
    )
    .join("");

  return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="4.5" width="15" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>${pipMarkup}</svg>`;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function areEffectsEnabled() {
  return !enableEffectsCheckbox || enableEffectsCheckbox.checked;
}

function isRandomHideExcludedCategory(layerName) {
  return RANDOM_HIDE_EXCLUDED_CATEGORIES.has(layerName);
}

function getCategoryHideChance(layerName) {
  if (isRandomHideExcludedCategory(layerName)) {
    return 0;
  }

  if (layerName === "character") {
    return CHARACTER_HIDE_CHANCE;
  }

  return DEFAULT_HIDE_CHANCE;
}

function getAvailableSources(state) {
  return state.files.filter((source) => !state.disabled.has(source));
}

function preload(src) {
  if (typeof src !== "string" || src.length === 0) {
    return Promise.reject(new Error("Missing image source"));
  }

  const cachedPromise = imagePreloadCache.get(src);

  if (cachedPromise) {
    return cachedPromise;
  }

  const preloadPromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";

    let settled = false;

    function resolveWithImage() {
      if (settled) {
        return;
      }

      settled = true;
      resolve(image);
    }

    function rejectWithError() {
      if (settled) {
        return;
      }

      settled = true;
      reject(new Error(`Could not load image: ${src}`));
    }

    image.onload = () => {
      if (typeof image.decode === "function") {
        image.decode().catch(() => null).finally(resolveWithImage);
        return;
      }

      resolveWithImage();
    };
    image.onerror = rejectWithError;
    image.src = src;

    if (image.complete && image.naturalWidth > 0) {
      image.onload();
    }
  });

  const trackedPromise = preloadPromise.catch((error) => {
    imagePreloadCache.delete(src);
    throw error;
  });

  imagePreloadCache.set(src, trackedPromise);

  return trackedPromise;
}

function scheduleIdleTask(task, timeout = IMAGE_WARMUP_IDLE_TIMEOUT_MS) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(
      () => {
        task();
      },
      { timeout }
    );
    return;
  }

  window.setTimeout(task, 0);
}

function collectManifestSources() {
  if (!manifest || !manifest.categories) {
    return [];
  }

  const uniqueSources = new Set();

  LAYER_ORDER.forEach((layerName) => {
    const files = manifest.categories[layerName];

    if (!Array.isArray(files)) {
      return;
    }

    files.forEach((source) => {
      if (typeof source === "string" && source.length > 0) {
        uniqueSources.add(source);
      }
    });
  });

  return Array.from(uniqueSources);
}

function warmImageCacheInBackground() {
  if (imageWarmupStarted) {
    return;
  }

  imageWarmupStarted = true;
  const sources = collectManifestSources();

  if (sources.length === 0) {
    return;
  }

  let cursor = 0;

  function preloadNextSource() {
    if (cursor >= sources.length) {
      return;
    }

    const source = sources[cursor];
    cursor += 1;

    preload(source)
      .catch(() => null)
      .finally(() => {
        scheduleIdleTask(preloadNextSource);
      });
  }

  const starterCount = Math.min(IMAGE_WARMUP_CONCURRENCY, sources.length);

  for (let index = 0; index < starterCount; index += 1) {
    scheduleIdleTask(preloadNextSource);
  }
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
    statusRefreshBtn.disabled = actionButtonsDisabled || previousStackSnapshots.length === 0;
  }
}

function setRandomizeLoading(isLoading) {
  randomizeBtn.classList.toggle("is-loading", isLoading);
  randomizeBtn.setAttribute("aria-busy", String(isLoading));
  document.body.classList.toggle("is-randomizing", isLoading);
}

function setCategoryDiceFace(button, face) {
  if (!button) {
    return;
  }

  const normalizedFace = String(face);

  if (button.dataset.diceFace === normalizedFace) {
    return;
  }

  button.dataset.diceFace = normalizedFace;
  button.innerHTML = DICE_ICONS_BY_FACE[face] || DICE_ICON;
}

function resetCategoryDiceFaces(face = 2) {
  layerView.forEach((view) => {
    if (!view || !view.categoryRandomizeBtn) {
      return;
    }

    setCategoryDiceFace(view.categoryRandomizeBtn, face);
  });
}

function shuffleCategoryDiceFaces() {
  layerView.forEach((view) => {
    if (!view || !view.categoryRandomizeBtn) {
      return;
    }

    const nextFace = randomItem(DICE_FACE_VALUES);
    setCategoryDiceFace(view.categoryRandomizeBtn, nextFace);
  });
}

function shuffleCategoryCurrentLayerNames() {
  LAYER_ORDER.forEach((layerName) => {
    const state = getLayerState(layerName);
    const view = layerView.get(layerName);

    if (!state || !view || !view.current) {
      return;
    }

    const available = getAvailableSources(state);

    if (available.length === 0) {
      return;
    }

    const nextSource = randomItem(available);
    const nextLabel = decodeFileName(nextSource);

    if (view.current.textContent !== nextLabel) {
      view.current.textContent = nextLabel;
    }
  });
}

function startDiceShuffle(requestId) {
  if (!areEffectsEnabled()) {
    stopDiceShuffle();
    resetCategoryDiceFaces(2);
    return;
  }

  diceShuffleOwnerRequestId = requestId;

  if (diceShuffleIntervalId !== null) {
    window.clearInterval(diceShuffleIntervalId);
  }

  shuffleCategoryDiceFaces();
  diceShuffleIntervalId = window.setInterval(shuffleCategoryDiceFaces, DICE_SHUFFLE_INTERVAL_MS);
}

function stopDiceShuffle(requestId = null) {
  if (requestId !== null && diceShuffleOwnerRequestId !== requestId) {
    return;
  }

  diceShuffleOwnerRequestId = null;

  if (diceShuffleIntervalId !== null) {
    window.clearInterval(diceShuffleIntervalId);
    diceShuffleIntervalId = null;
  }
}

function startLayerNameShuffle(requestId) {
  if (!areEffectsEnabled()) {
    stopLayerNameShuffle();
    return;
  }

  layerNameShuffleOwnerRequestId = requestId;

  if (layerNameShuffleIntervalId !== null) {
    window.clearInterval(layerNameShuffleIntervalId);
  }

  shuffleCategoryCurrentLayerNames();
  layerNameShuffleIntervalId = window.setInterval(
    shuffleCategoryCurrentLayerNames,
    DICE_SHUFFLE_INTERVAL_MS
  );
}

function stopLayerNameShuffle(requestId = null) {
  if (requestId !== null && layerNameShuffleOwnerRequestId !== requestId) {
    return;
  }

  const hadActiveShuffle =
    layerNameShuffleOwnerRequestId !== null || layerNameShuffleIntervalId !== null;

  layerNameShuffleOwnerRequestId = null;

  if (layerNameShuffleIntervalId !== null) {
    window.clearInterval(layerNameShuffleIntervalId);
    layerNameShuffleIntervalId = null;
  }

  if (hadActiveShuffle) {
    updateAllCategoryViews();
  }
}

function applyEffectsPreference() {
  if (!areEffectsEnabled()) {
    stopDiceShuffle();
    resetCategoryDiceFaces(2);
    stopLayerNameShuffle();
    stopFavoriteSparkle();
  }

  if (typeof refreshParticleFieldEffects === "function") {
    refreshParticleFieldEffects();
  }

  if (typeof refreshCanvasTiltEffects === "function") {
    refreshCanvasTiltEffects();
  }
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

function isClearFavoritesConfirmOpen() {
  return Boolean(clearFavoritesConfirmModal && !clearFavoritesConfirmModal.hidden);
}

function setClearFavoritesConfirmOpen(open, { restoreFocus = true } = {}) {
  if (!clearFavoritesConfirmModal) {
    return;
  }

  const shouldOpen = Boolean(open);
  clearFavoritesConfirmModal.hidden = !shouldOpen;
  clearFavoritesConfirmModal.setAttribute("aria-hidden", String(!shouldOpen));
  document.body.classList.toggle("confirm-modal-open", shouldOpen);

  if (shouldOpen) {
    if (clearFavoritesConfirmNoBtn) {
      clearFavoritesConfirmNoBtn.focus();
    }
  } else if (restoreFocus && clearFavoritesBtn) {
    clearFavoritesBtn.focus();
  }
}

function setSidebarView(mode) {
  if (!sidebar || !layersView || !galleryView) {
    return;
  }

  const hasSettingsView = Boolean(settingsView);
  const hasMintView = Boolean(mintView);
  const nextMode =
    mode === "gallery"
      ? "gallery"
      : mode === "settings" && hasSettingsView
        ? "settings"
        : mode === "mint" && hasMintView
          ? "mint"
        : "layers";
  sidebarViewMode = nextMode;

  const showGallery = nextMode === "gallery";
  const showSettings = nextMode === "settings";
  const showMint = nextMode === "mint";

  sidebar.classList.toggle("is-gallery-view", showGallery);
  sidebar.classList.toggle("is-settings-view", showSettings);
  sidebar.classList.toggle("is-mint-view", showMint);

  layersView.hidden = nextMode !== "layers";
  galleryView.hidden = !showGallery;
  if (settingsView) {
    settingsView.hidden = !showSettings;
  }
  if (mintView) {
    mintView.hidden = !showMint;
  }

  if (sidebarModeBtn) {
    sidebarModeBtn.innerHTML = showGallery ? BACK_ICON : FOLDER_ICON;
    sidebarModeBtn.setAttribute(
      "aria-label",
      showGallery ? "Back to layers" : "Open saved gallery"
    );
    sidebarModeBtn.title = showGallery ? "Back to layers" : "Open saved gallery";
  }

  if (sidebarSettingsBtn) {
    sidebarSettingsBtn.innerHTML = showSettings ? BACK_ICON : GEAR_ICON;
    sidebarSettingsBtn.setAttribute(
      "aria-label",
      showSettings ? "Back to layers" : "Open settings"
    );
    sidebarSettingsBtn.title = showSettings ? "Back to layers" : "Open settings";
  }

  if (sidebarMintBtn) {
    sidebarMintBtn.innerHTML = showMint ? BACK_ICON : SIDEBAR_MINT_HOME_ICON;
    sidebarMintBtn.setAttribute("aria-label", showMint ? "Back to layers" : "Open mint menu");
    sidebarMintBtn.title = showMint ? "Back to layers" : "Open mint menu";
    sidebarMintBtn.classList.toggle("is-active", showMint);
  }
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

function loadDisabledLayersFromStorage() {
  persistedDisabledLayers = {};

  try {
    const raw = window.localStorage.getItem(DISABLED_LAYERS_STORAGE_KEY);

    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return;
    }

    const normalized = {};

    LAYER_ORDER.forEach((layerName) => {
      const sources = parsed[layerName];

      if (!Array.isArray(sources)) {
        return;
      }

      const uniqueSources = Array.from(
        new Set(sources.filter((source) => typeof source === "string"))
      );

      if (uniqueSources.length > 0) {
        normalized[layerName] = uniqueSources;
      }
    });

    persistedDisabledLayers = normalized;
  } catch {
    persistedDisabledLayers = {};
  }
}

function persistDisabledLayers() {
  try {
    const serialized = {};

    LAYER_ORDER.forEach((layerName) => {
      const state = getLayerState(layerName);

      if (!state || state.disabled.size === 0) {
        return;
      }

      serialized[layerName] = Array.from(state.disabled)
        .filter((source) => state.files.includes(source))
        .sort();
    });

    window.localStorage.setItem(
      DISABLED_LAYERS_STORAGE_KEY,
      JSON.stringify(serialized)
    );
  } catch {
    // Ignore storage failures silently.
  }
}

function loadSettingsTogglesFromStorage() {
  const settingsEntries = getSettingsToggleEntries();
  let shouldPersistSettings = false;

  settingsEntries.forEach(([, toggleEl, defaultValue]) => {
    if (toggleEl) {
      toggleEl.checked = defaultValue;
    }
  });

  try {
    const raw = window.localStorage.getItem(SETTINGS_TOGGLES_STORAGE_KEY);

    if (!raw) {
      shouldPersistSettings = true;
      return;
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      shouldPersistSettings = true;
      return;
    }

    settingsEntries.forEach(([settingKey, toggleEl]) => {
      if (!toggleEl) {
        return;
      }

      if (!(settingKey in parsed)) {
        shouldPersistSettings = true;
      }

      const storedValue = parsed[settingKey];

      if (typeof storedValue === "boolean") {
        toggleEl.checked = storedValue;
      }
    });
  } catch {
    shouldPersistSettings = true;
    // Ignore storage failures silently.
  }

  if (shouldPersistSettings) {
    persistSettingsToggles();
  }
}

function persistSettingsToggles() {
  try {
    const serialized = {};

    getSettingsToggleEntries().forEach(([settingKey, toggleEl]) => {
      if (!toggleEl) {
        return;
      }

      serialized[settingKey] = Boolean(toggleEl.checked);
    });

    window.localStorage.setItem(SETTINGS_TOGGLES_STORAGE_KEY, JSON.stringify(serialized));
  } catch {
    // Ignore storage failures silently.
  }
}

async function loadMetadataTemplate() {
  try {
    const response = await fetch(METADATA_TEMPLATE_PATH, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Metadata template request failed: ${response.status}`);
    }

    const parsed = await response.json();

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid metadata template shape");
    }

    metadataTemplate = parsed;
    return true;
  } catch {
    metadataTemplate = null;
    return false;
  }
}

async function ensureMetadataTemplateLoaded() {
  if (metadataTemplate) {
    return true;
  }

  return loadMetadataTemplate();
}

function getMetadataLayerState(layerName, snapshot = null) {
  const state = getLayerState(layerName);
  const layerSnapshot =
    snapshot && snapshot[layerName] && typeof snapshot[layerName] === "object"
      ? snapshot[layerName]
      : null;

  const hidden = layerSnapshot ? Boolean(layerSnapshot.hidden) : state ? state.hidden : false;
  const disabled = layerSnapshot
    ? new Set(
        (Array.isArray(layerSnapshot.disabled) ? layerSnapshot.disabled : []).filter(
          (source) => typeof source === "string"
        )
      )
    : new Set(state ? state.disabled : []);

  let selected = layerSnapshot
    ? typeof layerSnapshot.selected === "string"
      ? layerSnapshot.selected
      : null
    : state && typeof state.selected === "string"
      ? state.selected
      : null;

  if (selected && disabled.has(selected)) {
    selected = null;
  }

  return {
    hidden,
    selected
  };
}

function buildDefaultMetadataAttributes(snapshot = null) {
  return CONTROL_ORDER.flatMap((layerName) => {
    const metadataLayerState = getMetadataLayerState(layerName, snapshot);

    if (!metadataLayerState || metadataLayerState.hidden) {
      return [];
    }

    return [
      {
        trait_type: formatLayerName(layerName),
        value: metadataLayerState.selected ? decodeFileName(metadataLayerState.selected) : ""
      }
    ];
  });
}

function buildDefaultMetadataDocument(imageFileName, snapshot = null) {
  return {
    name: DEFAULT_METADATA_NAME,
    description: DEFAULT_METADATA_DESCRIPTION,
    image: imageFileName,
    attributes: buildDefaultMetadataAttributes(snapshot),
    properties: {
      files: [
        {
          uri: imageFileName,
          type: "image/png"
        }
      ],
      category: "image"
    }
  };
}

function buildMetadataDocument(imageFileName, snapshot = null) {
  const hasTemplate =
    Boolean(metadataTemplate) &&
    typeof metadataTemplate === "object" &&
    !Array.isArray(metadataTemplate);
  const metadata = hasTemplate
    ? JSON.parse(JSON.stringify(metadataTemplate))
    : buildDefaultMetadataDocument(imageFileName, snapshot);
  const traitTypeToLayer = new Map(
    LAYER_ORDER.map((layerName) => [formatLayerName(layerName).toLowerCase(), layerName])
  );

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  metadata.image = imageFileName;

  if (
    !metadata.properties ||
    typeof metadata.properties !== "object" ||
    Array.isArray(metadata.properties)
  ) {
    metadata.properties = {};
  }

  if (Array.isArray(metadata.properties.files) && metadata.properties.files.length > 0) {
    metadata.properties.files = metadata.properties.files.map((entry, index) => {
      if (!entry || typeof entry !== "object" || index !== 0) {
        return entry;
      }

      return {
        ...entry,
        uri: imageFileName
      };
    });
  } else {
    metadata.properties.files = [
      {
        uri: imageFileName,
        type: "image/png"
      }
    ];
  }

  if (typeof metadata.properties.category !== "string") {
    metadata.properties.category = "image";
  }

  if (!Array.isArray(metadata.attributes)) {
    metadata.attributes = buildDefaultMetadataAttributes(snapshot);
    return metadata;
  }

  metadata.attributes = metadata.attributes.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const traitType =
      typeof entry.trait_type === "string" ? entry.trait_type.trim().toLowerCase() : "";
    const layerName = traitTypeToLayer.get(traitType);

    if (!layerName) {
      return [entry];
    }

    const metadataLayerState = getMetadataLayerState(layerName, snapshot);

    if (!metadataLayerState || metadataLayerState.hidden) {
      return [];
    }

    return [
      {
        ...entry,
        value: metadataLayerState.selected ? decodeFileName(metadataLayerState.selected) : ""
      }
    ];
  });

  return metadata;
}

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(",");

  if (parts.length !== 2) {
    return null;
  }

  const header = parts[0];
  const body = parts[1];
  const mimeMatch = header.match(/^data:([^;]+);base64$/);

  if (!mimeMatch) {
    return null;
  }

  const mime = mimeMatch[1];
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
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
  if (favoritesCount) {
    favoritesCount.textContent = `total favorites: ${favorites.length}`;
  }

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

function stopFavoriteSparkle() {
  if (!favoriteBtn) {
    return;
  }

  favoriteBtn.classList.remove("is-sparkling");

  if (favoriteSparkleTimeoutId) {
    window.clearTimeout(favoriteSparkleTimeoutId);
    favoriteSparkleTimeoutId = null;
  }
}

function triggerFavoriteSparkle() {
  if (!favoriteBtn) {
    return;
  }

  if (!areEffectsEnabled()) {
    stopFavoriteSparkle();
    return;
  }

  favoriteBtn.classList.remove("is-sparkling");
  void favoriteBtn.offsetWidth;
  favoriteBtn.classList.add("is-sparkling");

  if (favoriteSparkleTimeoutId) {
    window.clearTimeout(favoriteSparkleTimeoutId);
  }

  favoriteSparkleTimeoutId = window.setTimeout(() => {
    favoriteBtn.classList.remove("is-sparkling");
    favoriteSparkleTimeoutId = null;
  }, 1080);
}

async function loadFavoriteById(id) {
  const favorite = favorites.find((item) => item.id === id);

  if (!favorite) {
    return;
  }

  capturePreviousStackSnapshot();
  applyStackSnapshot(favorite.snapshot);
  updateAllCategoryViews();
  setSidebarView("layers");
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
  triggerFavoriteSparkle();
  setStatus("Saved to favorites");
}

async function downloadAllFavorites() {
  if (favorites.length === 0) {
    setStatus("No favorites to download");
    return;
  }

  const JSZipCtor =
    typeof window !== "undefined" && typeof window.JSZip === "function"
      ? window.JSZip
      : null;

  if (!JSZipCtor) {
    setStatus("Zip support unavailable");
    return;
  }

  setActionButtonsDisabled(true);

  if (downloadFavoritesBtn) {
    downloadFavoritesBtn.disabled = true;
  }

  try {
    const shouldDownloadMetadata = Boolean(
      downloadMetadataCheckbox && downloadMetadataCheckbox.checked
    );
    if (shouldDownloadMetadata) {
      await ensureMetadataTemplateLoaded();
    }
    const zip = new JSZipCtor();
    let downloadedImages = 0;
    let downloadedMetadata = 0;

    for (let index = 0; index < favorites.length; index += 1) {
      const favorite = favorites[index];
      const dataUrl = favorite.preview || (await buildSnapshotPreview(favorite.snapshot));
      const imageBlob = dataUrl ? dataUrlToBlob(dataUrl) : null;

      if (!imageBlob) {
        continue;
      }

      const baseFileName = `afella favorite-${String(index + 1).padStart(3, "0")}`;
      const imageFileName = `${baseFileName}.png`;
      zip.file(imageFileName, imageBlob);
      downloadedImages += 1;

      if (shouldDownloadMetadata) {
        const metadata = buildMetadataDocument(imageFileName, favorite.snapshot);

        if (metadata) {
          zip.file(`${baseFileName}.json`, JSON.stringify(metadata, null, 2));
          downloadedMetadata += 1;
        }
      }
    }

    if (downloadedImages === 0) {
      setStatus("No downloadable favorites");
      return;
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const zipUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = zipUrl;
    link.download = `afella favorites-${stamp}.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(zipUrl), 0);

    if (shouldDownloadMetadata) {
      setStatus(
        `Downloaded ${downloadedImages} favorites with ${downloadedMetadata} metadata files`
      );
    } else {
      setStatus(`Downloaded ${downloadedImages} favorites`);
    }
  } catch {
    setStatus("Could not download favorites");
  } finally {
    setActionButtonsDisabled(false);

    if (downloadFavoritesBtn) {
      downloadFavoritesBtn.disabled = false;
    }
  }
}

function clearAllFavorites() {
  if (favorites.length === 0) {
    setStatus("No favorites to clear");
    return;
  }

  favorites = [];
  persistFavorites();
  renderFavoritesGallery();
  updateFavoriteButtonState();
  setStatus("Cleared all favorites");
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

  const snapshot = createStackSnapshot();
  const signature = buildSnapshotSignature(snapshot);
  const latestSnapshot = previousStackSnapshots[previousStackSnapshots.length - 1];

  if (latestSnapshot && buildSnapshotSignature(latestSnapshot) === signature) {
    return;
  }

  previousStackSnapshots.push(snapshot);

  if (previousStackSnapshots.length > MAX_UNDO_HISTORY) {
    previousStackSnapshots.shift();
  }

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

  persistDisabledLayers();
}

async function restorePreviousStack() {
  if (previousStackSnapshots.length === 0) {
    return;
  }

  const snapshot = previousStackSnapshots.pop();
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
    return areEffectsEnabled() && !reducedMotion.matches && finePointer.matches;
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

  refreshCanvasTiltEffects = () => {
    handlePreferenceChange();
  };

  handlePreferenceChange();
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

    if (!areEffectsEnabled()) {
      context.clearRect(0, 0, width, height);
      return;
    }

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

  refreshParticleFieldEffects = () => {
    startParticleField();
  };

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
  view.current.textContent = currentLabel;
  view.summaryLockBtn.hidden = !state.locked;
  view.summaryLockBtn.setAttribute(
    "aria-label",
    state.locked
      ? `Unlock ${formatLayerName(layerName)} layer`
      : `No locked layer in ${formatLayerName(layerName)}`
  );
  view.summaryLockBtn.title = state.locked
    ? "Unlock locked layer"
    : "No locked layer";

  view.visibilityBtn.classList.toggle("is-hidden", state.hidden);
  view.visibilityBtn.setAttribute("aria-pressed", String(state.hidden));
  view.visibilityBtn.setAttribute(
    "aria-label",
    `${state.hidden ? "Show" : "Hide"} ${formatLayerName(layerName)} layer`
  );
  view.visibilityBtn.title = "Show or hide this category in the final image";
  view.visibilityBtn.innerHTML = state.hidden ? EYE_CLOSED_ICON : EYE_OPEN_ICON;

  const availableCount = getAvailableSources(state).length;
  view.categoryRandomizeBtn.disabled = availableCount === 0;

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
    document.body.classList.add("is-rendering-layers");
  } else if (actionDisableOwnerRequestId !== null) {
    actionDisableOwnerRequestId = null;
    setActionButtonsDisabled(false);
    document.body.classList.remove("is-rendering-layers");
  }

  if (picks.length === 0) {
    setStatus("No layers selected");
    stopDiceShuffle();
    stopLayerNameShuffle();
    updateFavoriteButtonState();
    if (showRandomizeLoading && randomizeLoadingOwnerRequestId === requestId) {
      randomizeLoadingOwnerRequestId = null;
      setRandomizeLoading(false);
    }
    if (disableActions && actionDisableOwnerRequestId === requestId) {
      actionDisableOwnerRequestId = null;
      setActionButtonsDisabled(false);
      document.body.classList.remove("is-rendering-layers");
    }
    return;
  }

  startDiceShuffle(requestId);
  startLayerNameShuffle(requestId);

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

    if (!hasRenderedCompositeOnce) {
      hasRenderedCompositeOnce = true;

      if (initialLoadMessageEl) {
        initialLoadMessageEl.classList.add("is-hidden");
      }
    }

    setStatus(successMessage || `Rendered ${picks.length} layers`);
  } catch {
    if (requestId === renderRequestId) {
      setStatus("Could not load one or more selected images");
    }
  } finally {
    stopDiceShuffle(requestId);
    stopLayerNameShuffle(requestId);

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
      document.body.classList.remove("is-rendering-layers");
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
    const baseFileName = `afella custom-${stamp}`;
    const imageFileName = `${baseFileName}.png`;
    const link = document.createElement("a");
    link.href = exportCanvas.toDataURL("image/png");
    link.download = imageFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    let downloadedMetadata = false;
    const shouldDownloadMetadata = Boolean(
      downloadMetadataCheckbox && downloadMetadataCheckbox.checked
    );

    if (shouldDownloadMetadata) {
      await ensureMetadataTemplateLoaded();
      const metadata = buildMetadataDocument(imageFileName);

      if (metadata) {
        const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
          type: "application/json"
        });
        const metadataUrl = URL.createObjectURL(metadataBlob);
        const metadataLink = document.createElement("a");
        metadataLink.href = metadataUrl;
        metadataLink.download = `${baseFileName}.json`;
        document.body.appendChild(metadataLink);
        metadataLink.click();
        metadataLink.remove();
        window.setTimeout(() => URL.revokeObjectURL(metadataUrl), 0);
        downloadedMetadata = true;
      }
    }

    if (downloadedMetadata) {
      setStatus("Downloaded PNG and metadata");
    } else {
      setStatus("Downloaded PNG");
    }
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
    persistDisabledLayers();
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

  persistDisabledLayers();
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

  if (state.locked === source) {
    state.locked = null;
  } else {
    state.locked = source;
    state.selected = source;
  }

  updateCategoryView(layerName);
  await renderSelectedLayers(state.locked ? "Layer locked" : "Layer unlocked");
}

async function unlockCategoryLock(layerName) {
  const state = getLayerState(layerName);

  if (!state || !state.locked) {
    return;
  }

  state.locked = null;
  updateCategoryView(layerName);
  await renderSelectedLayers("Layer unlocked");
}

async function toggleCategoryVisibility(layerName) {
  const state = getLayerState(layerName);

  if (!state) {
    return;
  }

  state.hidden = !state.hidden;
  updateCategoryView(layerName);
  await renderSelectedLayers(
    state.hidden ? "Category hidden" : "Category shown"
  );
}

async function randomizeCategory(layerName) {
  const state = getLayerState(layerName);

  if (!state) {
    return;
  }

  const available = getAvailableSources(state);

  if (available.length === 0) {
    setStatus(`No enabled images in ${formatLayerName(layerName)}`);
    return;
  }

  capturePreviousStackSnapshot();

  const pool =
    available.length > 1 && state.selected
      ? available.filter((source) => source !== state.selected)
      : available;
  const nextSource = randomItem(pool.length > 0 ? pool : available);
  const changedSelection = state.selected !== nextSource;

  if (changedSelection && state.locked) {
    state.locked = null;
  }

  state.selected = nextSource;
  updateCategoryView(layerName);
  await renderSelectedLayers(`Randomized ${formatLayerName(layerName)} layer`, {
    disableActions: true,
    blurDuringLoad: true
  });
}

function createLayerControls() {
  layerControls.innerHTML = "";
  layerState.clear();
  layerView.clear();
  previousStackSnapshots = [];
  updateStatusRefreshButtonState();

  CONTROL_ORDER.forEach((layerName) => {
    const files = manifest.categories[layerName] || [];
    const storedDisabledForLayer = Array.isArray(persistedDisabledLayers[layerName])
      ? persistedDisabledLayers[layerName]
      : [];

    const state = {
      files,
      selected: null,
      locked: null,
      disabled: new Set(
        storedDisabledForLayer.filter((source) => files.includes(source))
      ),
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

    const summaryLockBtn = document.createElement("button");
    summaryLockBtn.type = "button";
    summaryLockBtn.className = "summary-lock-btn";
    summaryLockBtn.innerHTML = LOCK_INLINE_ICON;
    summaryLockBtn.hidden = true;
    summaryLockBtn.setAttribute("aria-label", `Unlock ${formatLayerName(layerName)} layer`);
    summaryLockBtn.title = "Unlock locked layer";
    summaryLockBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      unlockCategoryLock(layerName);
    });

    summary.append(caret, name, current, summaryLockBtn);
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
        const displayName = decodeFileName(source);
        const row = document.createElement("div");
        row.className = "layer-item";

        const pick = document.createElement("button");
        pick.type = "button";
        pick.className = "layer-pick";
        pick.textContent = displayName;
        pick.addEventListener("click", () => {
          pickLayer(layerName, source);
        });

        const disableBtn = document.createElement("button");
        disableBtn.type = "button";
        disableBtn.className = "item-toggle item-disable";
        disableBtn.textContent = "X";
        disableBtn.title = "Disable this image in random generation";
        disableBtn.setAttribute("aria-label", `Disable ${displayName}`);
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
        lockBtn.setAttribute("aria-label", `Lock ${displayName}`);
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

    const categoryRandomizeBtn = document.createElement("button");
    categoryRandomizeBtn.type = "button";
    categoryRandomizeBtn.className = "category-randomize-btn";
    categoryRandomizeBtn.innerHTML = DICE_ICON;
    categoryRandomizeBtn.setAttribute(
      "aria-label",
      `Randomize ${formatLayerName(layerName)} layer`
    );
    categoryRandomizeBtn.title = "Randomize only this category";
    categoryRandomizeBtn.addEventListener("click", () => {
      randomizeCategory(layerName);
    });

    categoryRow.append(category, visibilityBtn, categoryRandomizeBtn);
    layerControls.appendChild(categoryRow);

    layerView.set(layerName, {
      category,
      current,
      summaryLockBtn,
      visibilityBtn,
      categoryRandomizeBtn,
      items: itemViewMap
    });
  });

  persistDisabledLayers();
}

async function randomizeLayers({ visibilityMode = "randomize" } = {}) {
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

    const available = getAvailableSources(state);

    if (state.locked && !available.includes(state.locked)) {
      state.locked = null;
    }

    if (visibilityMode === "randomize") {
      state.hidden = state.locked
        ? false
        : Math.random() < getCategoryHideChance(layerName);
    } else if (visibilityMode === "show-all") {
      state.hidden = false;
    } else {
      if (state.locked) {
        state.hidden = false;
      }
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
  loadDisabledLayersFromStorage();
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
    await randomizeLayers({ visibilityMode: "show-all" });
    warmImageCacheInBackground();
  } catch {
    setStatus("Missing manifest. Run: node scripts/generate-manifest.mjs");
    setActionButtonsDisabled(true);
  }
}

randomizeBtn.addEventListener("click", () => {
  const shouldRandomizeVisibility = Boolean(
    !allowRandomizeHideCheckbox || allowRandomizeHideCheckbox.checked
  );

  randomizeLayers({
    visibilityMode: shouldRandomizeVisibility ? "randomize" : "preserve"
  });
});
downloadBtn.addEventListener("click", downloadCompositeImage);

if (statusRefreshBtn) {
  statusRefreshBtn.addEventListener("click", restorePreviousStack);
}

if (favoriteBtn) {
  favoriteBtn.addEventListener("click", saveCurrentFavorite);
}

if (downloadFavoritesBtn) {
  downloadFavoritesBtn.addEventListener("click", downloadAllFavorites);
}

if (downloadMetadataCheckbox) {
  downloadMetadataCheckbox.addEventListener("change", persistSettingsToggles);
}

if (allowRandomizeHideCheckbox) {
  allowRandomizeHideCheckbox.addEventListener("change", persistSettingsToggles);
}

if (enableEffectsCheckbox) {
  const handleEnableEffectsChange = () => {
    persistSettingsToggles();
    applyEffectsPreference();
  };

  enableEffectsCheckbox.addEventListener("input", handleEnableEffectsChange);
  enableEffectsCheckbox.addEventListener("change", handleEnableEffectsChange);
}

if (clearFavoritesBtn) {
  clearFavoritesBtn.addEventListener("click", () => {
    if (favorites.length === 0) {
      setStatus("No favorites to clear");
      return;
    }

    setClearFavoritesConfirmOpen(true);
  });
}

if (clearFavoritesConfirmYesBtn) {
  clearFavoritesConfirmYesBtn.addEventListener("click", () => {
    setClearFavoritesConfirmOpen(false);
    clearAllFavorites();
  });
}

if (clearFavoritesConfirmNoBtn) {
  clearFavoritesConfirmNoBtn.addEventListener("click", () => {
    setClearFavoritesConfirmOpen(false);
  });
}

if (clearFavoritesConfirmModal) {
  clearFavoritesConfirmModal.addEventListener("click", (event) => {
    if (event.target === clearFavoritesConfirmModal) {
      setClearFavoritesConfirmOpen(false);
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isClearFavoritesConfirmOpen()) {
    event.preventDefault();
    setClearFavoritesConfirmOpen(false);
  }
});

if (sidebarModeBtn) {
  sidebarModeBtn.addEventListener("click", (event) => {
    event.preventDefault();
    setSidebarView(sidebarViewMode === "gallery" ? "layers" : "gallery");
  });
}

if (sidebarMintBtn) {
  sidebarMintBtn.addEventListener("click", (event) => {
    event.preventDefault();
    setSidebarView(sidebarViewMode === "mint" ? "layers" : "mint");
  });
}

if (sidebarSettingsBtn) {
  sidebarSettingsBtn.addEventListener("click", (event) => {
    event.preventDefault();
    setSidebarView(sidebarViewMode === "settings" ? "layers" : "settings");
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
setSidebarView("layers");
setRandomizeLoading(false);

loadSettingsTogglesFromStorage();
initializeParticleField();
initializeCanvasTilt();
applyEffectsPreference();
initialize();
