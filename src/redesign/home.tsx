import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { aboutProfile, blogPosts, showcaseProjects } from "../markdown-data";

const GRADUATION = new Date("2028-06-30T00:00:00+08:00");
const HDU_DAY_ONE = new Date("2024-09-01T00:00:00+08:00");

const TERMINAL_LINES: { text: string; tone?: "accent" | "comment" | "string" | "code" }[] = [
  { text: "$ whoami", tone: "accent" },
  { text: "zhang-hangning · 张航宁" },
  { text: "" },
  { text: "$ cat profile.ts", tone: "accent" },
  { text: "/**", tone: "comment" },
  { text: " * 杭州电子科技大学 · 自动化（新工科实验班）", tone: "comment" },
  { text: " * 控制 / 强化学习 / 机器人 / 雷达信号处理", tone: "comment" },
  { text: " */", tone: "comment" },
  { text: "const shawn = {", tone: "code" },
  { text: '  school:  "HDU",', tone: "string" },
  { text: '  gpa:     "4.51 / 5.00",', tone: "string" },
  { text: '  focus:   ["Control", "RL", "Robotics"],', tone: "string" },
  { text: '  status:  "building / learning / shipping",', tone: "string" },
  { text: "};", tone: "code" },
  { text: "" },
  { text: "$ echo $NEXT", tone: "accent" },
  { text: "// ▶ Read. Build. Ship.", tone: "accent" },
];

const MARQUEE_ITEMS = [
  "AUTOMATION",
  "REINFORCEMENT LEARNING",
  "ROBOTICS",
  "RADAR SIGNAL PROCESSING",
  "HDU · 2024—2028",
  "BUILD / LEARN / SHIP",
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useCountdown(target: Date) {
  const calculate = () => {
    const distance = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(distance / 86400000),
      hours: Math.floor((distance / 3600000) % 24),
      minutes: Math.floor((distance / 60000) % 60),
      seconds: Math.floor((distance / 1000) % 60),
    };
  };
  const [value, setValue] = useState(calculate);
  useEffect(() => {
    const timer = window.setInterval(() => setValue(calculate()), 1000);
    return () => window.clearInterval(timer);
  }, [target]);
  return value;
}

function HeroTerminal() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(reduced ? TERMINAL_LINES.length : 3);

  useEffect(() => {
    if (reduced) {
      setVisible(TERMINAL_LINES.length);
      return;
    }
    setVisible(3);
    const timer = window.setInterval(() => {
      setVisible((current) => {
        if (current >= TERMINAL_LINES.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 105);
    return () => window.clearInterval(timer);
  }, [reduced]);

  return (
    <div className="px-terminal" role="img" aria-label="终端窗口：张航宁，杭州电子科技大学自动化专业，关注控制、强化学习、机器人、雷达信号处理，GPA 4.51。">
      <div className="px-terminal__bar" aria-hidden="true">
        <span className="px-terminal__dots">
          <i />
          <i />
          <i />
        </span>
        <em>shawn@hdu: ~</em>
        <b>zsh</b>
      </div>
      <div className="px-terminal__body" aria-hidden="true">
        {TERMINAL_LINES.map((line, index) => (
          <div
            key={index}
            className={`px-terminal__line${line.tone ? ` is-${line.tone}` : ""}${index >= visible ? " is-pending" : ""}`}
          >
            {line.text || "\u00a0"}
            {index === visible - 1 ? <span className="px-terminal__cursor" /> : null}
          </div>
        ))}
      </div>
      <div className="px-terminal__foot" aria-hidden="true">
        <span>UTF-8</span>
        <span>LF</span>
        <span>{String(TERMINAL_LINES.length).padStart(2, "0")} LINES</span>
        <span className="px-terminal__live">LIVE</span>
      </div>
    </div>
  );
}

function CountdownBlock() {
  const { days, hours, minutes, seconds } = useCountdown(GRADUATION);
  const parts = [
    { value: String(days).padStart(3, "0"), label: "DAYS" },
    { value: String(hours).padStart(2, "0"), label: "HRS" },
    { value: String(minutes).padStart(2, "0"), label: "MIN" },
    { value: String(seconds).padStart(2, "0"), label: "SEC" },
  ];

  return (
    <div className="px-countdown" aria-label={`距离 2028 年 6 月毕业还有 ${days} 天`}>
      <p className="px-countdown__label">
        <span className="px-live" aria-hidden="true" /> COUNTDOWN TO GRADUATION · 2028.06
      </p>
      <div className="px-countdown__digits" aria-hidden="true">
        {parts.map((part, index) => (
          <React.Fragment key={part.label}>
            <span className="px-countdown__part">
              <strong>{part.value}</strong>
              <small>{part.label}</small>
            </span>
            {index < parts.length - 1 ? <i className="px-countdown__colon">:</i> : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function RedesignHome() {
  const daysAtHdu = useMemo(
    () => Math.max(0, Math.floor((Date.now() - HDU_DAY_ONE.getTime()) / 86400000)),
    [],
  );
  const projects = showcaseProjects.slice(0, 3);
  const indexItems = [
    { to: "/projects", num: "01", title: "项目", en: "PROJECTS", desc: "竞赛、科研与工程实践的切片。" },
    { to: "/about", num: "02", title: "关于", en: "ABOUT", desc: "教育经历、研究方向与竞赛荣誉。" },
    { to: "/resume", num: "03", title: "简历", en: "RESUME", desc: "中文 / English，一份可下载的 PDF。" },
    { to: "/workspace", num: "04", title: "工作台", en: "WORKSPACE", desc: "项目进度、每日记录与时间线。" },
    { to: "/study", num: "05", title: "学习", en: "STUDY", desc: "自动控制、工程实践与项目管理练习。" },
    ...(blogPosts.length > 0
      ? [{ to: "/blog", num: "06", title: "博客", en: "WRITING", desc: "项目记录、技术笔记与思考。" }]
      : []),
  ];

  return (
    <main className="px-home">
      <section className="px-hero" aria-labelledby="px-hero-title">
        <div className="px-hero__meta">
          <span className="px-hero__status">
            <i aria-hidden="true" /> STUDENT RESEARCHER · CLASS OF 2028
          </span>
          <span className="px-hero__coord">
            HANGZHOU, CN · 30.27°N 120.35°E · DAY {String(daysAtHdu).padStart(3, "0")}
          </span>
        </div>

        <p className="px-hero__kicker">ZHANG HANGNING · PERSONAL ARCHIVE / 2026</p>

        <h1 className="px-hero__title" id="px-hero-title" aria-label="张航宁 · Shawn Zhang">
          <span className="px-hero__line">SHAWN</span>
          <span className="px-hero__line px-hero__line--outline">
            ZHANG<i aria-hidden="true">.</i>
          </span>
        </h1>

        <div className="px-hero__sub">
          <span>张航宁</span>
          <i aria-hidden="true">/</i>
          <span>{aboutProfile.school}</span>
          <i aria-hidden="true">/</i>
          <span>{aboutProfile.major}</span>
        </div>

        <div className="px-hero__grid">
          <div className="px-hero__statement">
            <p className="px-eyebrow">/ OVERVIEW</p>
            <h2>
              让复杂系统
              <br />
              变得<em>可解释</em>。
            </h2>
            <p className="px-hero__lead">{aboutProfile.lead}</p>
            <div className="px-actions">
              <Link className="px-button px-button--solid" to="/projects">
                查看项目 <span aria-hidden="true">↗</span>
              </Link>
              <Link className="px-button" to="/resume">
                查看简历 <span aria-hidden="true">↓</span>
              </Link>
            </div>
            <p className="px-hero__note">
              <span aria-hidden="true">⌁</span> 从控制理论到真实机器人，把论文里的方法落到能跑的系统中。
            </p>
          </div>

          <div className="px-hero__orb-wrap">
            <Link className="px-orb" to="/projects" aria-label="查看精选项目">
              <span className="px-orb__rings" aria-hidden="true">
                <i />
                <i />
              </span>
              <span className="px-orb__copy">
                精选
                <br />
                项目
              </span>
              <span className="px-orb__arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
            <span className="px-orb__hint">SELECTED WORK / 2024—2026</span>
          </div>

          <HeroTerminal />
        </div>

        <div className="px-hero__foot">
          <CountdownBlock />
          <div className="px-highlights">
            {aboutProfile.highlights.map((item) => (
              <article key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="px-marquee" aria-hidden="true">
        <div className="px-marquee__track">
          {[0, 1].map((copy) => (
            <div className="px-marquee__group" key={copy}>
              {MARQUEE_ITEMS.map((item) => (
                <span key={`${copy}-${item}`}>
                  {item} <i>✳</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="px-section" id="index">
        <header className="px-section__head">
          <div>
            <p className="px-section__num">/ 01</p>
            <h2>INDEX / 索引</h2>
          </div>
          <p className="px-section__desc">
            五个入口，一份持续更新的个人档案。像浏览一份代码仓库那样浏览它。
          </p>
        </header>
        <nav className="px-index" aria-label="站点索引">
          {indexItems.map((item) => (
            <Link className="px-index__row" to={item.to} key={item.to}>
              <span className="px-index__num">{item.num}</span>
              <span className="px-index__title">
                {item.title}
                <em>{item.en}</em>
              </span>
              <span className="px-index__desc">{item.desc}</span>
              <span className="px-index__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </nav>
      </section>

      <section className="px-section" id="work">
        <header className="px-section__head">
          <div>
            <p className="px-section__num">/ 02</p>
            <h2>SELECTED WORK</h2>
          </div>
          <p className="px-section__desc">从智能车到低空雷达，从仿真环境到真实硬件。</p>
        </header>
        <div className="px-projects">
          {projects.map((project, index) => (
            <Link className="px-project" to={`/projects/${project.id}`} key={project.id}>
              <div className="px-project__visual" data-index={index} aria-hidden="true">
                <span className="px-project__visual-grid" />
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <em>{project.category}</em>
                <i className="px-project__cross" />
              </div>
              <div className="px-project__meta">
                <span>{project.category}</span>
                <span>{project.status}</span>
              </div>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <div className="px-project__tags">
                {project.tags.slice(0, 4).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <span className="px-project__link">
                查看项目 <i aria-hidden="true">↗</i>
              </span>
            </Link>
          ))}
        </div>
        <div className="px-section__more">
          <Link className="px-button" to="/projects">
            全部项目 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="px-section px-honors" id="honors">
        <header className="px-section__head">
          <div>
            <p className="px-section__num">/ 03</p>
            <h2>HONORS / 荣誉</h2>
          </div>
          <p className="px-section__desc">国家级、省级与校级。排名不分先后，记录每一次把想法做完。</p>
        </header>
        <div className="px-honors__grid">
          <div className="px-honors__lead">
            <p className="px-eyebrow">/ RECORD</p>
            <h3>
              4.51<span>/ 5.00</span>
            </h3>
            <p>大一学年专业综合测评排名第一 · 省政府奖学金 · 三次校一等奖学金</p>
            <Link className="px-text-link" to="/about">
              查看完整履历 <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ol className="px-honors__list">
            {aboutProfile.honors.map((honor, index) => (
              <li key={honor}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{honor}</p>
                <i aria-hidden="true">✳</i>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-section px-profile" id="profile">
        <header className="px-section__head">
          <div>
            <p className="px-section__num">/ 04</p>
            <h2>PROFILE / 档案</h2>
          </div>
          <p className="px-section__desc">
            在杭州电子科技大学读自动化，也在做控制、强化学习与机器人。
          </p>
        </header>
        <div className="px-profile__grid">
          <article className="px-profile__block">
            <p className="px-eyebrow">/ EDUCATION</p>
            <h3>{aboutProfile.school}</h3>
            <p className="px-profile__meta">{aboutProfile.period}</p>
            <ul>
              {aboutProfile.education.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="px-profile__block">
            <p className="px-eyebrow">/ RESEARCH</p>
            <h3>Research & Projects</h3>
            <p className="px-profile__meta">控制 · 机器人 · 雷达</p>
            <ul>
              {aboutProfile.research.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <aside className="px-profile__focus">
            <p className="px-eyebrow">/ FOCUS</p>
            <div className="px-profile__tags">
              {aboutProfile.focusAreas.map((item, index) => (
                <span key={item}>
                  <em>{String(index + 1).padStart(2, "0")}</em>
                  {item}
                </span>
              ))}
            </div>
            <Link className="px-text-link" to="/about">
              更多关于我 <span aria-hidden="true">↗</span>
            </Link>
          </aside>
        </div>
      </section>

      <section className="px-end" id="contact">
        <p className="px-eyebrow">/ NEXT</p>
        <h2>
          LET&apos;S BUILD
          <br />
          <span>SOMETHING.</span>
        </h2>
        <p>
          如果对我的项目或方向感兴趣，欢迎从一份简历、一个项目，或者一句「你好」开始。
        </p>
        <div className="px-actions px-actions--center">
          <Link className="px-button px-button--solid" to="/resume">
            下载简历 <span aria-hidden="true">↗</span>
          </Link>
          <Link className="px-button" to="/projects">
            浏览项目
          </Link>
          <Link className="px-button" to="/about">
            关于我
          </Link>
        </div>
        <div className="px-end__foot">
          <span>
            <i aria-hidden="true" /> STUDENT RESEARCHER · HDU
          </span>
          <span>{aboutProfile.school} · {aboutProfile.college}</span>
          <span>LOCAL TIME · ASIA/SHANGHAI</span>
        </div>
      </section>
    </main>
  );
}
