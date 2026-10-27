import React from "react";
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
