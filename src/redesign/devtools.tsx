import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { aboutProfile, blogPosts, showcaseProjects } from "../markdown-data";
import { ACCENTS, useSkin } from "./skin";

const TABS = [
  { id: "route", label: "ROUTE" },
  { id: "tokens", label: "TOKENS" },
  { id: "data", label: "DATA" },
  { id: "storage", label: "STORAGE" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type StorageEntry = {
  key: string;
  value: string;
  size: number;
};

const ROUTES = [
  { to: "/", label: "首页", en: "HOME" },
  { to: "/projects", label: "项目", en: "PROJECTS" },
  { to: "/about", label: "关于", en: "ABOUT" },
  { to: "/resume", label: "简历", en: "RESUME" },
  { to: "/workspace", label: "工作台", en: "WORKSPACE" },
  { to: "/daily", label: "每日记录", en: "DAILY" },
  { to: "/timeline", label: "时间线", en: "TIMELINE" },
  { to: "/study", label: "学习", en: "STUDY" },
  { to: "/our-film", label: "私人电影", en: "OUR FILM" },
];

function readStorage(): StorageEntry[] {
  const entries: StorageEntry[] = [];
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key) continue;
      const value = window.localStorage.getItem(key) ?? "";
      entries.push({ key, value, size: value.length });
    }
  } catch {
    /* storage can be blocked */
  }
  return entries.sort((left, right) => left.key.localeCompare(right.key));
}

function useViewport() {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? 0 : window.innerWidth,
    height: typeof window === "undefined" ? 0 : window.innerHeight,
    dpr: typeof window === "undefined" ? 1 : window.devicePixelRatio,
  }));
  useEffect(() => {
    function update() {
      setViewport({ width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio });
    }
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return viewport;
}

export function DevDock() {
  const { skin, setSkin, accent, setAccent } = useSkin();
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("route");
  const [open, setOpen] = useState(() => (typeof window === "undefined" ? true : window.innerWidth > 1080));
  const [grid, setGrid] = useState(false);
  const [history, setHistory] = useState<string[]>([location.pathname]);
  const [storage, setStorage] = useState<StorageEntry[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState("");
  const viewport = useViewport();

  const dataPayload = useMemo(
    () => ({
      profile: {
        name: aboutProfile.name,
        school: aboutProfile.school,
        college: aboutProfile.college,
        major: aboutProfile.major,
        period: aboutProfile.period,
        focus: aboutProfile.focusAreas,
        highlights: aboutProfile.highlights,
      },
      metrics: {
        projects: showcaseProjects.length,
        posts: blogPosts.length,
        honors: aboutProfile.honors.length,
      },
      projects: showcaseProjects.map((project) => ({
        id: project.id,
        title: project.title,
        category: project.category,
        status: project.status,
        tags: project.tags,
      })),
      routes: ROUTES.map((route) => route.to),
    }),
    [],
  );

  useEffect(() => {
    setHistory((current) => {
      if (current.at(-1) === location.pathname) return current;
      return [...current, location.pathname].slice(-8);
    });
  }, [location.pathname]);

  useEffect(() => {
    if (!open || tab !== "storage") return;
    setStorage(readStorage());
  }, [open, tab, location.pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("dev-grid", grid);
    return () => document.documentElement.classList.remove("dev-grid");
  }, [grid]);

  useEffect(() => {
    function onStorageChanged() {
      setStorage(readStorage());
    }
    window.addEventListener("shawn-storage-change", onStorageChanged);
    return () => window.removeEventListener("shawn-storage-change", onStorageChanged);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || !event.shiftKey) return;
      if (event.key.toLowerCase() === "g") {
        event.preventDefault();
        setGrid((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function copyText(text: string, label: string) {
    try {
      await window.navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setCopied("COPY FAILED");
    }
  }

  function removeKey(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setStorage(readStorage());
    setSelectedKey(null);
    window.dispatchEvent(new Event("shawn-storage-change"));
  }

  function clearStorage() {
    if (!window.confirm("清空本站 localStorage？主题设置与本地评论都会被删除。")) return;
    try {
      window.localStorage.clear();
    } catch {
      /* ignore */
    }
    setStorage([]);
    setSelectedKey(null);
    window.dispatchEvent(new Event("shawn-storage-change"));
  }

  const computed = useMemo(() => {
    if (typeof window === "undefined") return {} as Record<string, string>;
    const styles = window.getComputedStyle(document.documentElement);
    return {
      "--p-bg": styles.getPropertyValue("--p-bg").trim(),
      "--p-panel": styles.getPropertyValue("--p-panel").trim(),
      "--p-ink": styles.getPropertyValue("--p-ink").trim(),
      "--p-muted": styles.getPropertyValue("--p-muted").trim(),
      "--p-line": styles.getPropertyValue("--p-line").trim(),
      "--p-accent": accent,
    };
  }, [accent, skin]);

  return (
    <aside className={`dev-dock${open ? " is-open" : ""}`} aria-label="开发者面板">
      <button
        type="button"
        className="dev-dock__handle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        title="切换开发者面板"
      >
        <i className="dev-dock__led" aria-hidden="true" />
        <span>DEVTOOLS</span>
        <em>{open ? "COLLAPSE" : "EXPAND"}</em>
        <b aria-hidden="true">{open ? "–" : "+"}</b>
      </button>

      {open ? (
        <div className="dev-dock__panel">
          <header className="dev-dock__head">
            <div>
              <span>RUNTIME INSPECTOR</span>
              <strong>developer mode</strong>
            </div>
            <button type="button" onClick={() => setSkin("payathon")} title="退出开发者模式">
              EXIT
            </button>
          </header>

          <div className="dev-dock__tabs" role="tablist" aria-label="开发者面板标签">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                className={tab === item.id ? "is-active" : ""}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="dev-dock__body" role="tabpanel">
            {tab === "route" ? (
              <div className="dev-dock__section">
                <dl className="dev-dock__kv">
                  <div>
                    <dt>path</dt>
                    <dd>{location.pathname}</dd>
                  </div>
                  <div>
                    <dt>hash</dt>
                    <dd>{location.hash || "—"}</dd>
                  </div>
                  <div>
                    <dt>key</dt>
                    <dd>{location.key.slice(0, 8)}</dd>
                  </div>
                </dl>
                <div className="dev-dock__routes">
                  {ROUTES.map((route) => (
                    <button
                      key={route.to}
                      type="button"
                      className={location.pathname === route.to ? "is-active" : ""}
                      onClick={() => navigate(route.to)}
                    >
                      <span>{route.to}</span>
                      <em>{route.en}</em>
                    </button>
                  ))}
                </div>
                <div className="dev-dock__history">
                  <p>HISTORY</p>
                  <ol>
                    {history.map((path, index) => (
                      <li key={`${path}-${index}`} className={index === history.length - 1 ? "is-current" : ""}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {path}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : null}

            {tab === "tokens" ? (
              <div className="dev-dock__section">
                <div className="dev-dock__palette">
                  {ACCENTS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      title={item.name}
                      aria-label={item.name}
                      className={accent === item.value ? "is-active" : ""}
                      style={{ "--swatch": item.value } as React.CSSProperties}
                      onClick={() => setAccent(item.value)}
                    >
                      <i aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <dl className="dev-dock__kv dev-dock__kv--tokens">
                  {Object.entries(computed).map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>
                        {value}
                        {key === "--p-accent" ? <i style={{ background: value }} aria-hidden="true" /> : null}
                      </dd>
                    </div>
                  ))}
                </dl>
                <dl className="dev-dock__kv">
                  <div>
                    <dt>viewport</dt>
                    <dd>
                      {viewport.width} × {viewport.height}
                    </dd>
                  </div>
                  <div>
                    <dt>dpr</dt>
                    <dd>{viewport.dpr}</dd>
                  </div>
                  <div>
                    <dt>skin</dt>
                    <dd>{skin}</dd>
                  </div>
                  <div>
                    <dt>motion</dt>
                    <dd>{window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "full"}</dd>
                  </div>
                </dl>
                <button type="button" className="dev-dock__action" onClick={() => setGrid((value) => !value)}>
                  {grid ? "HIDE" : "SHOW"} 12-COL GRID <kbd>⌘⇧G</kbd>
                </button>
              </div>
            ) : null}

            {tab === "data" ? (
              <div className="dev-dock__section">
                <div className="dev-dock__metrics">
                  <div>
                    <strong>{showcaseProjects.length}</strong>
                    <span>PROJECTS</span>
                  </div>
                  <div>
                    <strong>{blogPosts.length}</strong>
                    <span>POSTS</span>
                  </div>
                  <div>
                    <strong>{aboutProfile.honors.length}</strong>
                    <span>HONORS</span>
                  </div>
                </div>
                <div className="dev-dock__code-head">
                  <span>profile.json</span>
                  <button type="button" onClick={() => copyText(JSON.stringify(dataPayload, null, 2), "DATA")}>
                    {copied === "DATA" ? "COPIED" : "COPY"}
                  </button>
                </div>
                <pre className="dev-dock__pre">{JSON.stringify(dataPayload, null, 2)}</pre>
              </div>
            ) : null}

            {tab === "storage" ? (
              <div className="dev-dock__section">
                <div className="dev-dock__code-head">
                  <span>localStorage · {storage.length} keys</span>
                  <button type="button" onClick={() => setStorage(readStorage())}>
                    REFRESH
                  </button>
                </div>
                <div className="dev-dock__storage">
                  {storage.length === 0 ? <p className="dev-dock__empty">暂无本地数据。</p> : null}
                  {storage.map((entry) => (
                    <div className={`dev-dock__storage-row${selectedKey === entry.key ? " is-open" : ""}`} key={entry.key}>
                      <button type="button" className="dev-dock__storage-head" onClick={() => setSelectedKey(selectedKey === entry.key ? null : entry.key)}>
                        <span>{entry.key}</span>
                        <em>{entry.size}B</em>
                      </button>
                      {selectedKey === entry.key ? (
                        <div className="dev-dock__storage-value">
                          <pre>{entry.value || "—"}</pre>
                          <div>
                            <button type="button" onClick={() => copyText(entry.value, entry.key)}>
                              {copied === entry.key ? "COPIED" : "COPY"}
                            </button>
                            <button type="button" className="is-danger" onClick={() => removeKey(entry.key)}>
                              DELETE
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
                <button type="button" className="dev-dock__action is-danger" onClick={clearStorage}>
                  CLEAR LOCAL STORAGE
                </button>
              </div>
            ) : null}
          </div>

          <footer className="dev-dock__foot">
            <button type="button" className={grid ? "is-active" : ""} onClick={() => setGrid((value) => !value)}>
              GRID {grid ? "ON" : "OFF"}
            </button>
            <span>⌘/CTRL + SHIFT + D</span>
            <span>v2.2.0</span>
          </footer>
        </div>
      ) : null}
    </aside>
  );
}

export function DevStatusBar() {
  const location = useLocation();
  const { accent } = useSkin();
  const viewport = useViewport();
  const [storageCount, setStorageCount] = useState(0);

  useEffect(() => {
    const update = () => {
      try {
        setStorageCount(window.localStorage.length);
      } catch {
        setStorageCount(0);
      }
    };
    update();
    window.addEventListener("shawn-storage-change", update);
    window.addEventListener("storage", update);
    window.addEventListener("focus", update);
    return () => {
      window.removeEventListener("shawn-storage-change", update);
      window.removeEventListener("storage", update);
      window.removeEventListener("focus", update);
    };
  }, [location.pathname]);

  return (
    <div className="dev-status" role="status" aria-label="开发者模式状态栏">
      <span className="dev-status__mode">
        <i aria-hidden="true" /> DEV MODE
      </span>
      <span className="dev-status__item">
        <em>route</em> {location.pathname}
      </span>
      <span className="dev-status__item">
        <em>viewport</em> {viewport.width}×{viewport.height}
      </span>
      <span className="dev-status__item">
        <em>accent</em> {accent}
      </span>
      <span className="dev-status__item">
        <em>storage</em> {storageCount}
      </span>
      <span className="dev-status__hint">CTRL/⌘ + SHIFT + D 退出</span>
    </div>
  );
}
