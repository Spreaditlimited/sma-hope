export type ThemePreference = "light" | "dark" | "system";
export const THEME_STORAGE_KEY = "smahope:appearance:v1";
export function validTheme(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}
export function resolveTheme(preference: ThemePreference, systemDark: boolean) {
  return preference === "system" ? (systemDark ? "dark" : "light") : preference;
}
// Static trusted code runs before paint; no account data or user input is interpolated.
export const themeInitScript = `(()=>{let p='light';try{const s=localStorage.getItem('${THEME_STORAGE_KEY}');if(['light','dark','system'].includes(s))p=s;}catch{}const r=document.documentElement;r.dataset.themePreference=p;r.dataset.theme=p==='dark'||p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';})();`;
