"use client";
import { useEffect, useSyncExternalStore, useState } from "react";
import * as Select from "@radix-ui/react-select";
import { THEME_STORAGE_KEY, validTheme, resolveTheme, type ThemePreference } from "@/lib/theme";

const eventName = "smahope:appearance";
function paint(preference: ThemePreference) {
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = resolveTheme(preference, matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", root.dataset.theme === "dark" ? "#101c1e" : "#fbfaf7");
  window.dispatchEvent(new Event(eventName));
}
function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  return () => window.removeEventListener(eventName, callback);
}
function snapshot(): ThemePreference {
  const preference = document.documentElement.dataset.themePreference;
  return validTheme(preference) ? preference : "light";
}
const serverSnapshot = (): ThemePreference => "light";
const appearanceOptions = [
  { value: "light", label: "Light", path: "M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0" },
  { value: "dark", label: "Dark", path: "M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" },
  { value: "system", label: "System", path: "M3 4h18v13H3zM8 21h8m-4-4v4" },
] as const;
function AppearanceIcon({ path }: { path: string }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    paint(snapshot());
    const systemChange = () => { if (snapshot() === "system") paint("system"); };
    const storageChange = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) paint(validTheme(event.newValue) ? event.newValue : "light");
    };
    media.addEventListener("change", systemChange);
    window.addEventListener("storage", storageChange);
    return () => {
      media.removeEventListener("change", systemChange);
      window.removeEventListener("storage", storageChange);
    };
  }, []);
  return children;
}

export function ThemePicker() {
  const preference = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [notice, setNotice] = useState("");
  const selected = appearanceOptions.find(option => option.value === preference)!;
  return <div className="theme-picker">
    <Select.Root value={preference} onValueChange={(next) => {
      if (!validTheme(next)) return;
      paint(next);
      setNotice("");
      try { localStorage.setItem(THEME_STORAGE_KEY, next); }
      catch { setNotice("Appearance changed for this visit. Your browser could not save the preference."); }
    }}>
      <Select.Trigger className="theme-trigger" aria-label={`Choose appearance: ${selected.label}`} title="Choose appearance">
        <AppearanceIcon path={selected.path} />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="theme-menu" position="popper" align="end" sideOffset={6} collisionPadding={12}>
          <Select.Viewport>
            {appearanceOptions.map(option => <Select.Item className="theme-option" key={option.value} value={option.value}>
              <AppearanceIcon path={option.path} />
              <Select.ItemText>{option.label}</Select.ItemText>
              <Select.ItemIndicator className="theme-check">✓</Select.ItemIndicator>
            </Select.Item>)}
            <p className="theme-hint">System follows your device.</p>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
    <span className="sr-only" role="status">{notice}</span>
  </div>;
}
