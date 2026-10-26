export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "ikions:theme";

/**
 * Runs before first paint (inlined in <head>) so the page never flashes the
 * wrong theme. It also marks the document with data-js, which lets CSS hide
 * scroll-triggered heading animations only when JavaScript will play them.
 * Keep it small and dependency free.
 */
export const themeScript = `(function(){document.documentElement.dataset.js="";try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");var d=p==="dark"||((!p||p==="system")&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`;
