"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useAppShellActions, useAppShellState } from "@/state/app-shell-context";
import type { ThemeMode } from "@/state/app-shell-context";

const THEME_ORDER: ThemeMode[] = ["system", "light", "dark"];

const ICONS: Record<ThemeMode, typeof Monitor> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

const noopSubscribe = () => () => {};

/**
 * Quick theme switcher for the top bar. Cycles system → light → dark.
 * The authoritative control (and persistence) lives in the app shell
 * context; Settings › Appearance shows the same mode as a select.
 */
export function ThemeToggle() {
  const { themeMode } = useAppShellState();
  const { setThemeMode } = useAppShellActions();

  // themeMode is derived from localStorage, which doesn't exist during
  // SSR. Gate the icon on mount so the server-rendered markup is stable
  // and hydration never mismatches (the `dark` class itself is applied
  // pre-hydration by the bootstrap script in layout.tsx, so the page
  // still paints correctly before this swaps the icon).
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const shownMode: ThemeMode = mounted ? themeMode : "system";
  const Icon = ICONS[shownMode];
  const next = THEME_ORDER[(THEME_ORDER.indexOf(shownMode) + 1) % THEME_ORDER.length];

  return (
    <button
      type="button"
      onClick={() => setThemeMode(next)}
      aria-label={`Theme is ${shownMode}. Activate to switch to ${next}.`}
      title={`Theme: ${shownMode} (click for ${next})`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <Icon size={15} aria-hidden="true" />
    </button>
  );
}