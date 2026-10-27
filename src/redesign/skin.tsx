import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export type Skin = "classic" | "payathon" | "dev";

export const SKIN_STORAGE_KEY = "shawn-skin-v2";
export const ACCENT_STORAGE_KEY = "shawn-accent-v1";

export const SKINS: { id: Skin; label: string; en: string; short: string }[] = [
  { id: "classic", label: "经典", en: "CLASSIC", short: "C" },
  { id: "payathon", label: "2026", en: "2026", short: "26" },
  { id: "dev", label: "开发者", en: "DEV", short: "DEV" },
];

export const ACCENTS = [
  { name: "冰川蓝", value: "#86eaff" },
  { name: "电光蓝", value: "#60b5ff" },
  { name: "薄荷绿", value: "#8ef0c2" },
  { name: "柠檬黄", value: "#ffe29b" },
  { name: "杏橙", value: "#ffb06f" },
  { name: "珊瑚", value: "#ff9c83" },
  { name: "玫红", value: "#ff97c6" },
  { name: "紫罗兰", value: "#bd9bff" },
  { name: "靛蓝", value: "#9baaff" },
  { name: "暖金", value: "#f8d581" },
  { name: "蜜桃", value: "#ffd18b" },
  { name: "沙金", value: "#efd0a0" },
];

type SkinContextValue = {
  skin: Skin;
  setSkin: (skin: Skin) => void;
  accent: string;
  setAccent: (accent: string) => void;
  isRedesign: boolean;
};

const SkinContext = createContext<SkinContextValue | null>(null);

function isSkin(value: unknown): value is Skin {
  return value === "classic" || value === "payathon" || value === "dev";
}

function readInitialSkin(): Skin {
  if (typeof window === "undefined") return "payathon";
  const fromQuery = new URLSearchParams(window.location.search).get("skin");
  if (isSkin(fromQuery)) return fromQuery;
  const fromAttribute = document.documentElement.dataset.skin;
  if (isSkin(fromAttribute)) return fromAttribute;
  try {
    const stored = window.localStorage.getItem(SKIN_STORAGE_KEY);
    if (isSkin(stored)) return stored;
  } catch {
    /* storage can be unavailable */
  }
  return "payathon";
}

function readInitialAccent(): string {
  if (typeof window === "undefined") return ACCENTS[0].value;
  try {
    const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY);
    if (stored && ACCENTS.some((accent) => accent.value === stored)) return stored;
  } catch {
    /* ignore */
  }
  const fromStyle = window.getComputedStyle(document.documentElement).getPropertyValue("--p-accent").trim();
  if (ACCENTS.some((accent) => accent.value === fromStyle)) return fromStyle;
  return ACCENTS[0].value;
}

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const [skin, setSkin] = useState<Skin>(readInitialSkin);
  const [accent, setAccent] = useState<string>(readInitialAccent);

  useEffect(() => {
    document.documentElement.dataset.skin = skin;
    document.title =
      skin === "classic"
        ? "Shawn · Our Story"
        : skin === "dev"
          ? "dev://shawn — Developer Mode"
          : "Shawn Zhang · 张航宁 · Portfolio 2026";
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", skin === "classic" ? "#0d0c0b" : "#08090a");
    try {
      window.localStorage.setItem(SKIN_STORAGE_KEY, skin);
    } catch {
      /* ignore */
    }
  }, [skin]);

  useEffect(() => {
    document.documentElement.style.setProperty("--p-accent", accent);
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, accent);
    } catch {
      /* ignore */
    }
  }, [accent]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        setSkin(skin === "dev" ? "payathon" : "dev");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [skin]);

  return (
    <SkinContext.Provider value={{ skin, setSkin, accent, setAccent, isRedesign: skin !== "classic" }}>
      {children}
    </SkinContext.Provider>
  );
}

export function useSkin() {
  const value = useContext(SkinContext);
  if (!value) throw new Error("useSkin must be used inside SkinProvider");
  return value;
}

export function SkinSwitch({ compact = false }: { compact?: boolean }) {
  const { skin, setSkin } = useSkin();
  return (
    <div className={`skin-switch${compact ? " skin-switch--compact" : ""}`} role="group" aria-label="显示模式 / Display mode">
      <span className="skin-switch__caption" aria-hidden="true">
        MODE
      </span>
      <div className="skin-switch__track">
        {SKINS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={skin === item.id ? "is-active" : ""}
            aria-pressed={skin === item.id}
            title={`${item.label}模式`}
            onClick={() => setSkin(item.id)}
          >
            <span aria-hidden="true">{item.short}</span>
            <em>{item.label}</em>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AccentPicker() {
  const { accent, setAccent } = useSkin();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="accent-picker" ref={rootRef}>
      <button
        type="button"
        className={`accent-picker__trigger${open ? " is-open" : ""}`}
        aria-label="切换强调色"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <i style={{ background: accent }} aria-hidden="true" />
        <span>ACCENT</span>
      </button>
      {open ? (
        <div className="accent-picker__panel" role="dialog" aria-label="强调色">
          <p>ACCENT / 强调色</p>
          <div className="accent-picker__grid">
            {ACCENTS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={accent === item.value ? "is-active" : ""}
                style={{ "--swatch": item.value } as React.CSSProperties}
                aria-label={item.name}
                aria-pressed={accent === item.value}
                title={item.name}
                onClick={() => {
                  setAccent(item.value);
                  setOpen(false);
                }}
              >
                <i aria-hidden="true" />
              </button>
            ))}
          </div>
          <small>
            CURRENT <em>{accent}</em>
          </small>
        </div>
      ) : null}
    </div>
  );
}
