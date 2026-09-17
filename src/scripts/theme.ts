const HOME_THEME_TOGGLE_SELECTOR = "[data-home-theme-toggle]";
const THEME_STORAGE_KEY = "phx:theme";
const DEFAULT_THEME_SOURCE = "dark";
const THEME_VARIANTS = {
  dark: "night",
  light: "bumblebee",
} as const;

const systemMediaQuery = window.matchMedia
  ? window.matchMedia("(prefers-color-scheme: dark)")
  : null;

const resolveSystemDark = () => (systemMediaQuery ? systemMediaQuery.matches : false);

const normalizeThemeSource = (theme: string | null): "dark" | "light" | "system" => {
  if (!theme) return DEFAULT_THEME_SOURCE;
  const normalized = `${theme}`.toLowerCase();
  if (normalized === "system") return DEFAULT_THEME_SOURCE;
  if (THEME_VARIANTS[normalized as "dark" | "light"]) return normalized as "dark" | "light";
  const fallbackEntry = (
    Object.entries(THEME_VARIANTS) as Array<[string, string]>
  ).find(([, value]) => value === normalized);
  return fallbackEntry ? (fallbackEntry[0] as "dark" | "light") : DEFAULT_THEME_SOURCE;
};

const getStoredThemeSource = () => normalizeThemeSource(localStorage.getItem(THEME_STORAGE_KEY));

const resolveThemeName = (source: "dark" | "light" | "system"): "night" | "bumblebee" => {
  const normalized = normalizeThemeSource(source);
  if (normalized === "system") {
    return THEME_VARIANTS[resolveSystemDark() ? "dark" : "light"];
  }
  return THEME_VARIANTS[normalized] ?? THEME_VARIANTS.dark;
};

const syncHomeThemeToggles = (themeSource: "dark" | "light" | "system") => {
  const normalized = normalizeThemeSource(themeSource);
  const resolvedSource =
    normalized === "system" ? (resolveSystemDark() ? "dark" : "light") : normalized;
  document.querySelectorAll(HOME_THEME_TOGGLE_SELECTOR).forEach((toggle) => {
    (toggle as HTMLInputElement).checked = resolvedSource === "dark";
    toggle.dataset.themeState = resolvedSource;
  });
};

const applyTheme = (themeSource: "dark" | "light" | "system") => {
  const normalized = normalizeThemeSource(themeSource);
  const storedValue = normalized === "system" ? null : normalized;

  if (storedValue) {
    localStorage.setItem(THEME_STORAGE_KEY, storedValue);
  } else {
    localStorage.removeItem(THEME_STORAGE_KEY);
  }

  const themeName = resolveThemeName(normalized);
  if (themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
  }

  document.documentElement.dataset.themeSource = normalized;
  document.documentElement.dataset.themeResolved = themeName;
  syncHomeThemeToggles(normalized);
};

const initThemeManager = () => {
  applyTheme(getStoredThemeSource());

  if (systemMediaQuery) {
    systemMediaQuery.addEventListener("change", () => {
      if (getStoredThemeSource() === "system") {
        applyTheme("system");
      }
    });
  }

  window.addEventListener("storage", (event) => {
    if (event.key === THEME_STORAGE_KEY) {
      applyTheme((event.newValue as "dark" | "light" | "system") || "system");
    }
  });
};

const initHomeThemeToggle = () => {
  const toggles = document.querySelectorAll(HOME_THEME_TOGGLE_SELECTOR);
  if (!toggles.length) return;

  syncHomeThemeToggles(getStoredThemeSource());

  toggles.forEach((toggle) => {
    if (toggle.dataset.themeBound) return;
    toggle.dataset.themeBound = "true";

    toggle.addEventListener("change", (event) => {
      applyTheme((event.currentTarget as HTMLInputElement).checked ? "dark" : "light");
    });
  });
};

export const initTheme = () => {
  initThemeManager();
  initHomeThemeToggle();
};
