import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

const GLOBAL_CSS = `
:root {
  --bg: #0b0f16;
  --bg-soft: rgba(255, 255, 255, 0.04);
  --panel: rgba(255, 255, 255, 0.05);
  --panel-strong: rgba(255, 255, 255, 0.08);
  --line: rgba(255, 255, 255, 0.08);
  --line-strong: rgba(214, 175, 110, 0.35);
  --text: #eee8de;
  --muted: #a8a39c;
  --subtle: #6d685f;
  --accent: #d6af6e;
  --accent-strong: #efc983;
  --accent-soft: rgba(214, 175, 110, 0.14);
  --shadow: 0 28px 80px rgba(0, 0, 0, 0.32);
  --serif: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
  --sans: Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  color: var(--text);
  background:
    radial-gradient(circle at 18% 18%, rgba(214, 175, 110, 0.12), transparent 22%),
    radial-gradient(circle at 78% 10%, rgba(255, 255, 255, 0.08), transparent 20%),
    radial-gradient(circle at 50% 110%, rgba(214, 175, 110, 0.08), transparent 30%),
    linear-gradient(180deg, #0b0f16 0%, #0f141d 45%, #0b0f16 100%);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle, rgba(214, 175, 110, 0.08) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.35;
  pointer-events: none;
}

body::after {
  content: "";
  position: fixed;
  inset: -20vh 25vw auto;
  height: 55vh;
  background: radial-gradient(ellipse, rgba(214, 175, 110, 0.08) 0%, transparent 72%);
  pointer-events: none;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
a {
  transition:
    transform 180ms var(--ease),
    color 180ms var(--ease),
    border-color 180ms var(--ease),
    background-color 180ms var(--ease),
    box-shadow 180ms var(--ease);
}

button {
  font: inherit;
}

#root {
  min-height: 100vh;
}

.page {
  position: relative;
  width: min(1240px, calc(100% - 32px));
  margin: 0 auto;
  padding: 20px 0 64px;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 0 18px;
  backdrop-filter: blur(16px);
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand__eyebrow {
  margin: 0;
  color: var(--accent);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.brand__name {
  margin: 0;
  font-family: var(--serif);
  font-size: 1.35rem;
  font-weight: 400;
  letter-spacing: 0.01em;
}

.topbar__meta {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.site-nav {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(14px);
}

.site-nav a {
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.site-nav a:hover {
  color: var(--accent-strong);
}

.lang-switch {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
}

.lang-btn {
  min-height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  color: var(--muted);
  background: transparent;
  cursor: pointer;
  letter-spacing: 0.08em;
}

.lang-btn.active {
  color: var(--bg);
  background: var(--accent);
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 22px;
  padding: 18px 0 34px;
}

.hero__panel,
.hero__aside,
.card,
.stat-card,
.contact-card,
.about-card {
  border: 1px solid var(--line);
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
}

.hero__panel {
  position: relative;
  padding: clamp(24px, 4vw, 40px);
  overflow: hidden;
}

.hero__panel::before {
  content: "";
  position: absolute;
  inset: 22px auto auto 22px;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 1px solid rgba(214, 175, 110, 0.18);
  background: radial-gradient(circle, rgba(214, 175, 110, 0.12), transparent 70%);
  pointer-events: none;
}

.hero__panel::after {
  content: "";
  position: absolute;
  right: -8%;
  top: 12%;
  width: 34%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(214, 175, 110, 0.4), transparent);
  pointer-events: none;
}

.hero__kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  color: var(--accent);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero__kicker::before {
  content: "";
  width: 28px;
  height: 1px;
  background: var(--accent);
}

.hero__name {
  position: relative;
  z-index: 1;
  margin: 6px 0 0;
  max-width: 7ch;
  font-family: var(--serif);
  font-size: clamp(4.6rem, 9vw, 7.6rem);
  font-weight: 400;
  line-height: 0.88;
  letter-spacing: -0.1em;
}

.hero__role {
  position: relative;
  z-index: 1;
  max-width: 44ch;
  margin: 16px 0 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.75;
}

.hero__tags {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.hero__tag {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--text);
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.92rem;
}

.hero__actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn--solid {
  color: var(--bg);
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  box-shadow: 0 16px 30px rgba(214, 175, 110, 0.22);
}

.btn--ghost {
  color: var(--text);
  border-color: var(--line-strong);
  background: rgba(255, 255, 255, 0.03);
}

.hero__aside {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.monogram {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 240px;
  border: 1px solid var(--line);
  border-radius: 22px;
  background:
    radial-gradient(circle at 50% 50%, rgba(214, 175, 110, 0.16), transparent 36%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  overflow: hidden;
}

.monogram__label {
  position: absolute;
  left: 18px;
  top: 18px;
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.monogram::before,
.monogram::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(214, 175, 110, 0.28);
}

.monogram::before {
  inset: 20px;
}

.monogram::after {
  inset: 54px;
  border-color: rgba(255, 255, 255, 0.18);
}

.monogram__core {
  display: grid;
  place-items: center;
  width: 78px;
  height: 78px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  background: rgba(214, 175, 110, 0.14);
  font-family: var(--serif);
  font-size: 1.9rem;
  color: var(--accent-strong);
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  border: 1px solid var(--line);
  border-radius: 22px;
  overflow: hidden;
  background: var(--line);
}

.stat-card {
  padding: 18px;
  border: 0;
  border-radius: 0;
  background: rgba(255, 255, 255, 0.04);
}

.stat-card__value {
  margin: 0 0 6px;
  font-family: var(--serif);
  font-size: 1.85rem;
  font-weight: 400;
  color: var(--accent-strong);
  line-height: 1;
}

.stat-card__label {
  margin: 0 0 4px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.stat-card__detail {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.55;
}

.section {
  padding: 34px 0 0;
}

.section__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding-top: 22px;
  border-top: 1px solid var(--line);
}

.section__head > div {
  min-width: 0;
}

.section__kicker {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.section__title {
  margin: 0;
  font-family: var(--serif);
  font-size: clamp(1.5rem, 2.5vw, 2.8rem);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.04em;
  white-space: nowrap;
}

.section__index {
  font-family: var(--serif);
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.08);
  line-height: 1;
  user-select: none;
}

.about-card,
.card,
.contact-card {
  padding: 22px;
}

.about-card {
  max-width: 860px;
}

.card-grid--2,
.card-grid--3,
.contact-card__meta {
  display: grid;
  gap: 16px;
}

.card-grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.card-grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.card {
  transition:
    transform 220ms var(--ease),
    border-color 220ms var(--ease),
    background-color 220ms var(--ease);
}

.card:hover {
  transform: translateY(-2px);
  border-color: var(--line-strong);
  background: var(--panel-strong);
}

.card__meta {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.card__title {
  margin: 0 0 10px;
  font-family: var(--serif);
  font-size: 1.28rem;
  font-weight: 400;
  line-height: 1.25;
}

.card__body {
  margin: 0;
  color: var(--muted);
  font-size: 0.98rem;
  line-height: 1.75;
}

.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.pill {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
  font-size: 0.9rem;
}

.project-card {
  position: relative;
  overflow: hidden;
}

.project-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(214, 175, 110, 0.06), transparent);
  opacity: 0;
  transition: opacity 220ms var(--ease);
}

.project-card:hover::before {
  opacity: 1;
}

.project-card__index {
  margin: 0 0 14px;
  font-family: var(--serif);
  font-size: 3.4rem;
  color: rgba(255, 255, 255, 0.08);
  line-height: 1;
}

.contact-card {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
  gap: 18px;
}

.contact-card__body {
  margin: 0;
  max-width: 54ch;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.8;
}

.contact-card__meta {
  grid-template-columns: 1fr;
}

.contact-card__meta > div {
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
}

.contact-label {
  display: block;
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.contact-value {
  color: var(--text);
  font-weight: 700;
}

.contact-value--stack {
  display: grid;
  gap: 8px;
}

.contact-value--stack a {
  display: block;
  line-height: 1.5;
}

.contact-value:hover {
  color: var(--accent-strong);
}

.reveal {
  opacity: 0;
  transform: translateY(14px);
  animation: rise 700ms var(--ease) forwards;
}

@keyframes rise {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .card-grid--3,
  .contact-card {
    grid-template-columns: 1fr;
  }

  .section__head {
    align-items: flex-start;
    flex-direction: column;
  }

  .section__index {
    display: none;
  }

  .section__title {
    white-space: nowrap;
    font-size: clamp(1.3rem, 4.8vw, 2.1rem);
  }
}

@media (max-width: 760px) {
  .page {
    width: min(100%, calc(100% - 20px));
    padding-top: 10px;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .topbar__meta {
    justify-content: flex-start;
  }

  .site-nav {
    border-radius: 22px;
  }

  .card-grid--2,
  .stats {
    grid-template-columns: 1fr;
  }

  .hero__panel,
  .hero__aside,
  .about-card,
  .card,
  .contact-card {
    border-radius: 22px;
    padding: 18px;
  }

  .hero__name {
    max-width: 100%;
  }
}
`;

type Language = "zh" | "en";

type Card = {
  title: string;
  body: string;
  meta?: string;
};

type Copy = {
  pageTitle: string;
  brand: string;
  displayName: string;
  role: string;
  heroTags: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  nav: {
    education: string;
    projects: string;
    contact: string;
  };
  stats: Array<{
    value: string;
    label: string;
    detail: string;
  }>;
  education: {
    eyebrow: string;
    title: string;
    cards: Card[];
  };
  projects: {
    eyebrow: string;
    title: string;
    cards: Card[];
  };
  contact: {
    eyebrow: string;
    title: string;
    body: string;
    emailLabel: string;
    phoneLabel: string;
    email: string;
    phone: string;
  };
};

const content: Record<Language, Copy> = {
  zh: {
    pageTitle: "张航宁 / 个人作品集",
    brand: "Shawn / 张航宁",
    displayName: "张航宁",
    role: "自动化专业学生 · 工程实现 · 研究表达",
    heroTags: ["工程实现", "科研表达"],
    ctaPrimary: "查看项目",
    ctaSecondary: "联系我",
    nav: {
      education: "教育",
      projects: "项目",
      contact: "联系",
    },
    stats: [
      { value: "20+", label: "荣誉奖项", detail: "国家级、省级、校级累计成果" },
      { value: "No.1", label: "综合测评", detail: "大一综合测评专业第一" },
      { value: "1st", label: "智能车竞赛", detail: "全国大学生智能车竞赛国家一等奖" },
      { value: "ZH / EN", label: "双语展示", detail: "中文与国际访客同步阅读" },
    ],
    education: {
      eyebrow: "教育",
      title: "学习路径与研究方向",
      cards: [
        {
          title: "杭州电子科技大学",
          meta: "2024 - 至今 · 自动化（新工科）本科",
          body: "关注自动化、智能系统、视觉感知与工程落地，在课程、竞赛与研究训练之间建立比较完整的能力链路。",
        },
        {
          title: "学业表现",
          meta: "综合评价与奖学金",
          body: "大一综合测评专业第一，获得两次校一等奖学金、省政府奖学金，以及优秀学生、优秀团员等荣誉。",
        },
      ],
    },
    projects: {
      eyebrow: "项目",
      title: "代表性工作",
      cards: [
        {
          title: "智能车系统",
          body: "围绕嵌入式感知、路径规划与控制协同展开，用于竞赛级自动驾驶实验与工程验证。",
        },
        {
          title: "医学影像研究",
          body: "面向多模态深度学习、图像分析与实验结果表达，强调研究过程的可解释性与展示质量。",
        },
        {
          title: "CAD 草图识别",
          body: "聚焦工程图理解、约束推断与装配关系识别，体现算法与应用之间的结合能力。",
        },
      ],
    },
    contact: {
      eyebrow: "联系",
      title: "请通过邮箱，随时联系我",
      body: "非常希望和大家交流学习，如果有任何问题或者合作意向，欢迎通过邮箱联系我！",
      emailLabel: "邮箱",
      phoneLabel: "电话",
      email: "教育邮箱：24061733@hdu.edu.cn 或 私人邮箱：3400136344@qq.com",
      phone: "15957455889",
    },
  },
  en: {
    pageTitle: "Zhang Hangning / Portfolio",
    brand: "Shawn / Zhang Hangning",
    displayName: "Zhang Hangning",
    role: "Automation student · Engineering delivery · Research communication · Bilingual presentation",
    heroTags: ["Engineering", "Research", "Bilingual"],
    ctaPrimary: "View Projects",
    ctaSecondary: "Contact Me",
    nav: {
      education: "Education",
      projects: "Projects",
      contact: "Contact",
    },
    stats: [
      { value: "20+", label: "Honors", detail: "National, provincial, and university-level results" },
      { value: "No.1", label: "Major ranking", detail: "First in freshman-year comprehensive evaluation" },
      { value: "1st", label: "National contest", detail: "National first prize in the smart vehicle competition" },
      { value: "ZH / EN", label: "Bilingual", detail: "Built for local and international readers" },
    ],
    education: {
      eyebrow: "Education",
      title: "Study path and research direction",
      cards: [
        {
          title: "Hangzhou Dianzi University",
          meta: "2024 - Present · B.Eng. in Automation",
          body: "Focused on automation, intelligent systems, visual perception, and real engineering delivery across coursework, competitions, and research training.",
        },
        {
          title: "Academic performance",
          meta: "Rankings and scholarships",
          body: "First place in major-level comprehensive evaluation during freshman year, plus two first-class scholarships, a provincial government scholarship, and additional honors.",
        },
      ],
    },
    projects: {
      eyebrow: "Projects",
      title: "Representative work",
      cards: [
        {
          title: "Intelligent vehicle system",
          body: "Built around embedded perception, path planning, and control coordination for competition-grade autonomous driving experiments.",
        },
        {
          title: "Medical imaging research",
          body: "Designed for multimodal deep learning, image analysis, and clear presentation of research results and methods.",
        },
        {
          title: "CAD sketch recognition",
          body: "Focused on engineering drawing understanding, constraint inference, and assembly-aware geometric recognition.",
        },
      ],
    },
    contact: {
      eyebrow: "Contact",
      title: "Please feel free to reach out via email",
      body: "I am always open to chatting and collaboration. If you have any questions or opportunities, please don't hesitate to contact me via email!",
      emailLabel: "Email",
      phoneLabel: "Phone",
      email: "edu：24061733@hdu.edu.cn or private：3400136344@qq.com",
      phone: "15957455889",
    },
  },
};

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "zh";
  }

  const saved = window.localStorage.getItem("language");
  if (saved === "zh" || saved === "en") {
    return saved;
  }

  return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function InjectStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.prepend(style);
    return () => style.remove();
  }, []);

  return null;
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`reveal ${className}`.trim()} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  index,
}: {
  eyebrow: string;
  title: string;
  index: string;
}) {
  return (
    <div className="section__head">
      <div>
        <p className="section__kicker">{eyebrow}</p>
        <h2 className="section__title">{title}</h2>
      </div>
      <span className="section__index" aria-hidden="true">
        {index}
      </span>
    </div>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const copy = content[language];

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = copy.pageTitle;
    window.localStorage.setItem("language", language);
  }, [copy.pageTitle, language]);

  return (
    <>
      <InjectStyles />

      <main className="page">
        <header className="topbar">
          <div className="brand">
            <p className="brand__eyebrow">{copy.brand}</p>
          </div>

          <div className="topbar__meta">
            <nav className="site-nav" aria-label={language === "zh" ? "主导航" : "Primary navigation"}>
              <a href="#education">{copy.nav.education}</a>
              <a href="#projects">{copy.nav.projects}</a>
              <a href="#contact">{copy.nav.contact}</a>
            </nav>

            <div className="lang-switch" aria-label="Language switch">
              <button
                type="button"
                className={language === "zh" ? "lang-btn active" : "lang-btn"}
                onClick={() => setLanguage("zh")}
              >
                中文
              </button>
              <button
                type="button"
                className={language === "en" ? "lang-btn active" : "lang-btn"}
                onClick={() => setLanguage("en")}
              >
                EN
              </button>
            </div>
          </div>
        </header>

        <section className="hero">
          <Reveal className="hero__panel">
            <div className="hero__kicker">{copy.brand}</div>
            <h1 className="hero__name">{copy.displayName}</h1>
            <p className="hero__role">{copy.role}</p>

            <div className="hero__tags">
              {copy.heroTags.map((tag) => (
                <span className="hero__tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="hero__actions">
              <a className="btn btn--solid" href="#projects">
                {copy.ctaPrimary}
              </a>
              <a className="btn btn--ghost" href="#contact">
                {copy.ctaSecondary}
              </a>
            </div>
          </Reveal>

          <div className="hero__aside">
            <Reveal delay={80}>
              <div className="monogram" aria-hidden="true">
                <div className="monogram__label">Portfolio</div>
                <div className="monogram__core">Z</div>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="stats">
                {copy.stats.map((stat) => (
                  <article className="stat-card" key={stat.label}>
                    <p className="stat-card__value">{stat.value}</p>
                    <p className="stat-card__label">{stat.label}</p>
                    <p className="stat-card__detail">{stat.detail}</p>
                  </article>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section" id="education">
          <Reveal>
            <SectionHeader eyebrow={copy.education.eyebrow} title={copy.education.title} index="01" />
          </Reveal>
          <div className="card-grid--2">
            {copy.education.cards.map((card, index) => (
              <Reveal delay={index * 90} key={card.title}>
                <article className="card">
                  {card.meta ? <p className="card__meta">{card.meta}</p> : null}
                  <h3 className="card__title">{card.title}</h3>
                  <p className="card__body">{card.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section" id="projects">
          <Reveal>
            <SectionHeader eyebrow={copy.projects.eyebrow} title={copy.projects.title} index="02" />
          </Reveal>
          <div className="card-grid--3">
            {copy.projects.cards.map((card, index) => (
              <Reveal delay={index * 90} key={card.title}>
                <article className="card project-card">
                  <p className="project-card__index">0{index + 1}</p>
                  <h3 className="card__title">{card.title}</h3>
                  <p className="card__body">{card.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section" id="contact">
          <Reveal>
            <SectionHeader eyebrow={copy.contact.eyebrow} title={copy.contact.title} index="03" />
          </Reveal>
          <Reveal delay={80}>
            <div className="contact-card">
              <p className="contact-card__body">{copy.contact.body}</p>
              <div className="contact-card__meta">
                <div>
                  <span className="contact-label">{copy.contact.emailLabel}</span>
                  <div className="contact-value contact-value--stack">
                    {copy.contact.email
                      .split(/\s+(?:or|或)\s+/)
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .map((item) => {
                        const match = item.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
                        const email = match?.[0] ?? item;

                        return (
                          <a key={item} href={`mailto:${email}`}>
                            {item}
                          </a>
                        );
                      })}
                  </div>
                </div>
                <div>
                  <span className="contact-label">{copy.contact.phoneLabel}</span>
                  <a className="contact-value" href={`tel:${copy.contact.phone}`}>
                    {copy.contact.phone}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
