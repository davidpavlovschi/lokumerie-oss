"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Sun, Moon, SunDim, SunMedium, Sparkles } from "lucide-react";
import { setTheme } from "@/lib/actions/theme";
import { useRouter } from "next/navigation";

const themes = [
  { id: "miel", label: "Miel", color: "#d4a373" },
  { id: "pistache", label: "Pistache", color: "#6aad7b" },
  { id: "rose", label: "Rose", color: "#e05688" },
  { id: "menthe", label: "Menthe", color: "#4cc9a0" },
  { id: "cafe", label: "Cafe", color: "#a07850" },
] as const;

const contrastLevels = [
  { id: "dim", label: "Dim", icon: SunDim },
  { id: "default", label: "Default", icon: SunMedium },
  { id: "vivid", label: "Vivid", icon: Sparkles },
] as const;

function parseTheme(current: string): { flavor: string; mode: string; contrast: string } {
  const parts = current.split("-");
  if (parts.length === 3) {
    return { flavor: parts[0], mode: parts[1], contrast: parts[2] };
  }
  if (parts.length === 2) {
    return { flavor: parts[0], mode: parts[1], contrast: "default" };
  }
  return { flavor: current, mode: "dark", contrast: "default" };
}

export function ThemeSwitcher({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { flavor, mode, contrast } = parseTheme(current);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function apply(newFlavor: string, newMode: string, newContrast: string) {
    const value = newContrast === "default"
      ? `${newFlavor}-${newMode}`
      : `${newFlavor}-${newMode}-${newContrast}`;
    document.documentElement.setAttribute("data-theme", newFlavor);
    document.documentElement.setAttribute("data-mode", newMode);
    document.documentElement.setAttribute("data-contrast", newContrast);
    await setTheme(value);
    router.refresh();
  }

  async function toggleMode() {
    const newMode = mode === "dark" ? "light" : "dark";
    await apply(flavor, newMode, contrast);
  }

  async function pickFlavor(id: string) {
    await apply(id, mode, contrast);
    setOpen(false);
  }

  async function pickContrast(id: string) {
    await apply(flavor, mode, id);
  }

  return (
    <div className="flex items-center gap-0.5" ref={ref}>
      <button
        onClick={toggleMode}
        className="rounded-xl p-2 text-text-muted transition-colors hover:bg-overlay-hover hover:text-text-secondary"
      >
        {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="relative">
        <button
          onClick={() => setOpen((p) => !p)}
          className="rounded-xl p-2 text-text-muted transition-colors hover:bg-overlay-hover hover:text-text-secondary"
        >
          <Palette className="h-4 w-4" />
        </button>

        {open && (
          <div className="absolute bottom-full left-0 mb-2 rounded-xl border border-border bg-bg-surface/95 backdrop-blur-xl p-3 shadow-xl animate-slideDown space-y-3">
            {/* Flavor picker */}
            <div className="flex gap-1.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => pickFlavor(t.id)}
                  title={t.label}
                  className={`group relative flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                    flavor === t.id
                      ? "ring-2 ring-accent ring-offset-1 ring-offset-bg-surface"
                      : "hover:scale-110"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ background: t.color }}
                  />
                </button>
              ))}
            </div>

            {/* Contrast picker */}
            <div className="flex gap-1 border-t border-border pt-2">
              {contrastLevels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => pickContrast(c.id)}
                  title={c.label}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-all ${
                    contrast === c.id
                      ? "bg-accent/10 text-accent"
                      : "text-text-muted hover:text-text-secondary hover:bg-overlay-hover"
                  }`}
                >
                  <c.icon className="h-3 w-3" />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
