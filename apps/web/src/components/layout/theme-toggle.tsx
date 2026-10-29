"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme";
import { MoonIcon, SunIcon } from "@ikions/react";
import { Segmented } from "../ui/segmented";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (readPreference() === "system") apply("system");
    listener();
  };
  media.addEventListener("change", onChange);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onChange);
  };
}

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

/**
 * Switches the theme with a View Transition: the browser cross-fades one
 * snapshot of the page instead of animating the colours of every element,
 * which stays smooth on pages with thousands of icons. Browsers without View
 * Transitions, and reduced motion, switch instantly.
 */
function apply(preference: ThemePreference) {
  const root = document.documentElement;
  const dark = preference === "dark" || (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  const theme = dark ? "dark" : "light";
  if (root.dataset.theme === theme) return;
  // The transition applies the theme a frame later; listeners then re-read it.
  const swap = () => {
    root.dataset.theme = theme;
    listeners.forEach((l) => l());
  };
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) swap();
  else document.startViewTransition(swap);
}

function setPreference(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage disabled: the theme still applies for this page view.
  }
  apply(preference);
  listeners.forEach((l) => l());
}

export function useTheme() {
  const preference = useSyncExternalStore(subscribe, readPreference, () => "system" as ThemePreference);
  const resolved = useSyncExternalStore(
    subscribe,
    () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
    () => "light",
  );
  return { preference, resolved, setPreference: useCallback(setPreference, []) };
}

/** Header button: flips between light and dark. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, setPreference } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      className={className}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {resolved === "dark" ? <SunIcon size={18} key="sun" className="ik-swap" /> : <MoonIcon size={18} key="moon" className="ik-swap" />}
    </button>
  );
}

/** Three-way preference control (used in the footer and mobile menu). */
export function ThemeSelect() {
  const { preference, setPreference } = useTheme();
  return (
    <Segmented
      label="Colour theme"
      size="sm"
      value={preference}
      onChange={setPreference}
      options={[
        { value: "system", label: "System" },
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ]}
    />
  );
}
