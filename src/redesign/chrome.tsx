import React, { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { aboutProfile, blogPosts } from "../markdown-data";
import { AccentPicker, SkinSwitch, useSkin } from "./skin";

export type NavItem = {
  to: string;
  label: string;
  en: string;
};

type HeaderProps = {
  items: NavItem[];
  inWork: boolean;
  onToggleWork: () => void;
};

export function RedesignHeader({ items, inWork, onToggleWork }: HeaderProps) {
  const { skin } = useSkin();

  return (
    <header className={`px-header${skin === "dev" ? " px-header--dev" : ""}`}>
      <Link className="px-brand" to="/" aria-label="返回首页">
        <span className="px-brand__mark" aria-hidden="true">
          S<i>.</i>
        </span>
        <span className="px-brand__copy">
          <strong>SHAWN ZHANG</strong>
          <small>PORTFOLIO / 2026</small>
        </span>
      </Link>

      <nav className="px-nav" aria-label="主导航">
        {items.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `px-nav__link${isActive ? " is-active" : ""}`}
          >
            <span className="px-nav__index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="px-nav__label">{item.label}</span>
            <em aria-hidden="true">{item.en}</em>
          </NavLink>
        ))}
      </nav>

      <div className="px-tools">
        <AccentPicker />
        <SkinSwitch />
        <button
          type="button"
          className={`px-work${inWork ? " is-active" : ""}`}
          aria-pressed={inWork}
          onClick={onToggleWork}
          title={inWork ? "退出 Work 模式" : "进入 Work 模式"}
        >
          <i aria-hidden="true" />
          <span>{inWork ? "EXIT WORK" : "WORK"}</span>
        </button>
      </div>
    </header>
  );
}

export function CyberFrame() {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    const onPointerMove = (event: PointerEvent) => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        frame.style.setProperty("--px-mx", `${event.clientX}px`);
        frame.style.setProperty("--px-my", `${event.clientY}px`);
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="px-cyber" aria-hidden="true" ref={frameRef}>
      <span className="px-cyber__grid" />
      <span className="px-cyber__cursor" />
      <span className="px-cyber__noise" />
      <span className="px-cyber__scan" />
      <span className="px-cyber__corner px-cyber__corner--tl" />
      <span className="px-cyber__corner px-cyber__corner--tr" />
      <span className="px-cyber__corner px-cyber__corner--bl" />
      <span className="px-cyber__corner px-cyber__corner--br" />
      <span className="px-cyber__rail px-cyber__rail--left">HDU // AUTOMATION // 2024—2028</span>
      <span className="px-cyber__rail px-cyber__rail--right">UPLINK STABLE // 30.27°N 120.35°E</span>
    </div>
  );
}

const FOOTER_LINKS = [
  { to: "/", label: "首页", en: "HOME" },
  { to: "/projects", label: "项目", en: "PROJECTS" },
  { to: "/about", label: "关于", en: "ABOUT" },
  { to: "/resume", label: "简历", en: "RESUME" },
  { to: "/workspace", label: "工作台", en: "WORKSPACE" },
  ...(blogPosts.length > 0 ? [{ to: "/blog", label: "博客", en: "WRITING" }] : []),
];

export function RedesignFooter() {
  const { skin } = useSkin();
  return (
    <footer className={`px-footer${skin === "dev" ? " px-footer--dev" : ""}`}>
      <div className="px-footer__grid">
        <div className="px-footer__identity">
          <p className="px-footer__kicker">/ END OF INDEX</p>
          <strong>{aboutProfile.name} · SHAWN ZHANG</strong>
          <small>
            {aboutProfile.school} · {aboutProfile.college}
          </small>
        </div>

        <nav className="px-footer__links" aria-label="页脚导航">
          {FOOTER_LINKS.map((item, index) => (
            <Link key={item.to} to={item.to}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.label}
              <em>{item.en}</em>
            </Link>
          ))}
        </nav>

        <div className="px-footer__meta">
          <span>
            <i aria-hidden="true" /> {skin === "dev" ? "DEVELOPER MODE" : "2026 EDITION"}
          </span>
          <span>HANGZHOU · CN</span>
          <span>© {new Date().getFullYear()} SHAWN ZHANG</span>
          <span>NO TRACKING · LOCAL FIRST</span>
        </div>
      </div>
      <div className="px-footer__word" aria-hidden="true">
        SHAWN
      </div>
    </footer>
  );
}
