import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { DailyLogPage, TimelinePage, WorkspacePage } from "./project-management";
import { aboutProfile, blogPosts, showcaseProjects, type BlogPost } from "./markdown-data";
import { MemoryPage } from "./secret-memories";
import { SkinProvider, SkinSwitch, useSkin } from "./redesign/skin";
import { RedesignFooter, RedesignHeader, CyberFrame, type NavItem } from "./redesign/chrome";
import { RedesignHome } from "./redesign/home";
import { DevDock, DevStatusBar } from "./redesign/devtools";
import "./styles.css";
import "./redesign/redesign.css";
import "./redesign/cyber.css";

type CommentItem = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

type StudyQuestion = {
  id: string;
  chapter: string;
  type: "单选题" | "多选题" | "判断题";
  stem: string;
  options: { key: string; text: string }[];
  answer: string[];
  explanation: string;
};

type StudyRecord = {
  selected: string[];
  correct: boolean;
};

const STUDY_QUESTIONS: StudyQuestion[] = [
  {
    id: "control-1",
    chapter: "自动控制基础",
    type: "单选题",
    stem: "线性定常系统在单位阶跃输入下达到稳态后，稳态误差主要由什么决定？",
    options: [
      { key: "A", text: "系统型别与开环增益" },
      { key: "B", text: "采样频率" },
      { key: "C", text: "绘图颜色" },
      { key: "D", text: "仿真窗口尺寸" },
    ],
    answer: ["A"],
    explanation: "稳态误差与系统型别、输入类型以及低频开环增益有关。",
  },
  {
    id: "control-2",
    chapter: "自动控制基础",
    type: "多选题",
    stem: "PID 控制器中，常见作用包括哪些？",
    options: [
      { key: "A", text: "比例项提高响应速度" },
      { key: "B", text: "积分项消除稳态误差" },
      { key: "C", text: "微分项改善动态趋势判断" },
      { key: "D", text: "一定能够消除全部噪声" },
    ],
    answer: ["A", "B", "C"],
    explanation: "微分项通常会放大高频噪声，因此 D 不正确。",
  },
  {
    id: "git-1",
    chapter: "工程实践",
    type: "判断题",
    stem: "一个项目一天一篇 Markdown 日报，可以通过 Git 历史完整追踪每日修改。",
    options: [
      { key: "A", text: "正确" },
      { key: "B", text: "错误" },
    ],
    answer: ["A"],
    explanation: "前提是日报文件被提交到 Git 仓库，并使用明确的提交信息。",
  },
  {
    id: "project-1",
    chapter: "项目管理",
    type: "单选题",
    stem: "项目总体进度最不适合按哪种方式计算？",
    options: [
      { key: "A", text: "里程碑完成情况" },
      { key: "B", text: "验收标准达成情况" },
      { key: "C", text: "日报文件数量" },
      { key: "D", text: "阶段性成果" },
    ],
    answer: ["C"],
    explanation: "日报数量只反映记录频率，不能代表实际项目推进程度。",
  },
];

const COMMENT_STORAGE_KEY = "shawn-blog-comments-v7";
const STUDY_STORAGE_KEY = "shawn-study-progress-v1";

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function usePersistentState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => loadJson(key, fallback));
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}

function formatDate(value: string) {
  if (!value) return "日期待补充";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}

function sameAnswer(left: string[], right: string[]) {
  return [...left].sort().join("|") === [...right].sort().join("|");
}

function Paragraphs({ text }: { text: string }) {
  const blocks: (string | string[])[] = [];
  text.split("\n").filter(Boolean).forEach((line) => {
    if (!line.startsWith("• ")) return blocks.push(line);
    const last = blocks.at(-1);
    if (Array.isArray(last)) last.push(line.slice(2));
    else blocks.push([line.slice(2)]);
  });
  return <>{blocks.map((block, index) => Array.isArray(block)
    ? <ul className="section-list" key={index}>{block.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul>
    : <p key={index}>{block}</p>)}</>;
}

const WORK_PATHS = ["/workspace", "/daily", "/timeline", "/study"];
const WORK_MODE_STORAGE_KEY = "shawn-work-mode";
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

function HomePage() {
  return (
    <main className="page page--home">
      <section className="landing card">
        <div className="landing__rule" />
        <p className="eyebrow">Automation · Research · Engineering</p>
        <h1>{aboutProfile.name}</h1>
        <p className="landing__subtitle">{aboutProfile.school} · {aboutProfile.major}</p>
        <p className="landing__lead">{aboutProfile.lead}</p>
        <div className="landing__actions">
          <NavLink className="button button--solid" to="/projects">查看项目</NavLink>
          <NavLink className="button button--ghost" to="/resume">查看简历</NavLink>
          <NavLink className="button button--ghost" to="/about">关于我</NavLink>
        </div>
        {aboutProfile.highlights.length > 0 ? (
          <div className="landing__stats">
            {aboutProfile.highlights.map((item) => <article key={item.value}><strong>{item.value}</strong><span>{item.label}</span></article>)}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function ResumePage() {
  const [language, setLanguage] = useState<"cn" | "en">("cn");
  const documentPath = asset(`resumes/zhang-hangning-${language}.pdf`);
  const previewPath = asset(`resumes/zhang-hangning-${language}.png`);
  const documentLabel = language === "cn" ? "中文简历" : "English Resume";

  return (
    <main className="page page--content resume-page">
      <section className="resume-toolbar card">
        <div className="resume-switcher" role="tablist" aria-label="简历语言">
          <button className={language === "cn" ? "is-active" : ""} type="button" role="tab" aria-selected={language === "cn"} onClick={() => setLanguage("cn")}>中文</button>
          <button className={language === "en" ? "is-active" : ""} type="button" role="tab" aria-selected={language === "en"} onClick={() => setLanguage("en")}>English</button>
        </div>
        <div className="resume-toolbar__meta">
          <span>{documentLabel}</span>
          <a className="button button--ghost" href={documentPath} target="_blank" rel="noreferrer">新窗口打开</a>
          <a className="button button--solid" href={documentPath} download>下载 PDF</a>
        </div>
      </section>

      <section className="resume-viewer card" aria-label={documentLabel}>
        <a className="resume-preview-link" href={documentPath} target="_blank" rel="noreferrer">
          <img src={previewPath} alt={documentLabel} />
        </a>
      </section>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="page page--content about-page">
      <section className="about-intro">
        <p className="eyebrow">About</p>
        <h1>{aboutProfile.name}</h1>
        <p className="about-intro__meta">{[aboutProfile.school, aboutProfile.college, aboutProfile.major].filter(Boolean).join(" · ")}</p>
        <p className="about-intro__lead">{aboutProfile.lead}</p>
        <div className="about-tags">{aboutProfile.focusAreas.map((item) => <span key={item}>{item}</span>)}</div>
      </section>

      <section className="about-sheet card">
        <div className="about-row">
          <h2>教育经历<small>Education</small></h2>
          <ul className="about-list">{aboutProfile.education.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="about-row">
          <h2>科研与项目<small>Research</small></h2>
          <div>
            <ul className="about-list">{aboutProfile.research.map((item) => <li key={item}>{item}</li>)}</ul>
            <NavLink className="about-link" to="/projects">查看项目详情 →</NavLink>
          </div>
        </div>
        <div className="about-row">
          <h2>竞赛与荣誉<small>Honors</small></h2>
          <ul className="about-list about-list--columns">{aboutProfile.honors.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>
    </main>
  );
}

function BlogPage() {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return blogPosts;
    return blogPosts.filter((post) => [post.title, post.category, post.excerpt, post.tags.join(" ")].join(" ").toLowerCase().includes(normalized));
  }, [query]);

  return (
    <main className="page page--content">
      <section className="hero card"><div><p className="eyebrow">Writing Archive</p><h1>博客</h1><p className="lead">项目记录、技术笔记与思考。</p></div></section>
      <section className="filter-bar card">
        <label className="field field--inline"><span>搜索</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、分类或标签" /></label>
      </section>
      <section className="blog-grid">
        {visible.map((post) => (
          <NavLink className="blog-card card" key={post.id} to={`/blog/${post.id}`}>
            <p className="blog-card__meta">{post.category} · {formatDate(post.date)}</p>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <div className="tag-row">{post.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          </NavLink>
        ))}
        {visible.length === 0 ? <div className="empty-state card"><h2>暂无公开文章</h2></div> : null}
      </section>
    </main>
  );
}

function BlogDetailPage({ comments, setComments }: {
  comments: Record<string, CommentItem[]>;
  setComments: React.Dispatch<React.SetStateAction<Record<string, CommentItem[]>>>;
}) {
  const { postId } = useParams();
  const post = blogPosts.find((item) => item.id === postId);
  const [name, setName] = useState("Shawn");
  const [content, setContent] = useState("");
  if (!post) return <Navigate to="/blog" replace />;
  const activePostId = post.id;
  const postComments = comments[activePostId] ?? [];

  function addComment(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    const next: CommentItem = { id: uid(), name: name.trim() || "匿名", content: content.trim(), createdAt: new Date().toISOString() };
    setComments((current) => ({ ...current, [activePostId]: [next, ...(current[activePostId] ?? [])] }));
    setContent("");
  }

  return (
    <main className="page page--content">
      <article className="article card">
        <div className="article__head"><div><p className="eyebrow">{post.category} · {formatDate(post.date)}</p><h1>{post.title}</h1><p className="lead">{post.excerpt}</p></div></div>
        <div className="article__sections">
          {post.sections.map((section, index) => <section className="article-section" key={`${section.title}-${index}`}><span>{section.label}</span><h2>{section.title}</h2><Paragraphs text={section.body} /></section>)}
        </div>
        <div className="tag-row">{post.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
      </article>
      <section className="comment-panel card">
        <div><p className="eyebrow">Local Comments</p><h2>评论区</h2><p className="muted">评论只保存在当前浏览器。</p></div>
        <form className="comment-form" onSubmit={addComment}>
          <label className="field"><span>昵称</span><input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label className="field field--wide"><span>评论</span><textarea value={content} onChange={(event) => setContent(event.target.value)} /></label>
          <button className="button button--solid" type="submit">发布评论</button>
        </form>
        <div className="comment-list">
          {postComments.map((comment) => <article className="comment-card" key={comment.id}><div className="comment-card__avatar">{comment.name.slice(0, 2)}</div><div><strong>{comment.name}</strong><span>{formatDate(comment.createdAt)}</span><p>{comment.content}</p></div></article>)}
          {postComments.length === 0 ? <p className="muted">还没有评论。</p> : null}
        </div>
      </section>
    </main>
  );
}

function ProjectMeta({ project }: { project: (typeof showcaseProjects)[number] }) {
  const items = [["角色", project.role], ["时间", project.period], ["指导", project.advisor]].filter(([, value]) => value);
  if (items.length === 0) return null;
  return <dl className="project-meta">{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

function ProjectPage() {
  return (
    <main className="page page--content">
      <section className="hero card"><div><p className="eyebrow">Projects</p><h1>项目经历</h1><p className="lead">竞赛、科研与工程实践中的代表性项目。</p></div></section>
      <section className="showcase-list">
        {showcaseProjects.map((project) => (
          <NavLink className="showcase-card card" key={project.id} to={`/projects/${project.id}`}>
            <div className="showcase-card__head">
              <p className="eyebrow">{[project.category, project.status].filter(Boolean).join(" · ")}</p>
              {project.highlight ? <span className="showcase-card__highlight">{project.highlight}</span> : null}
            </div>
            <h2>{project.title}</h2>
            <p>{project.summary}</p>
            <ProjectMeta project={project} />
            <div className="tag-row">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          </NavLink>
        ))}
        {showcaseProjects.length === 0 ? <div className="empty-state card"><h2>项目整理中</h2></div> : null}
      </section>
    </main>
  );
}

function ProjectDetailPage() {
  const { projectId } = useParams();
  const project = showcaseProjects.find((item) => item.id === projectId);
  if (!project) return <Navigate to="/projects" replace />;
  return (
    <main className="page page--content">
      <article className="article card">
        <div className="article__head"><div>
          <p className="eyebrow">{[project.category, project.status].filter(Boolean).join(" · ")}</p>
          <h1>{project.title}</h1>
          <p className="lead">{project.summary}</p>
          {project.highlight ? <span className="showcase-card__highlight">{project.highlight}</span> : null}
          <ProjectMeta project={project} />
        </div></div>
        <div className="article__sections">{project.sections.map((section) => <section className="article-section" key={section.title}><h2>{section.title}</h2><Paragraphs text={section.body} /></section>)}</div>
        <div className="tag-row">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
        <p className="content-source"><NavLink to="/projects">← 返回项目列表</NavLink></p>
      </article>
    </main>
  );
}

function StudyPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [records, setRecords] = usePersistentState<Record<string, StudyRecord>>(STUDY_STORAGE_KEY, {});
  const question = STUDY_QUESTIONS[index];
  const record = records[question.id];
  const correctCount = Object.values(records).filter((item) => item.correct).length;

  function toggle(key: string) {
    if (record) return;
    if (question.type === "多选题") setSelected((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
    else setSelected([key]);
  }

  function submit() {
    if (selected.length === 0) return;
    setRecords((current) => ({ ...current, [question.id]: { selected, correct: sameAnswer(selected, question.answer) } }));
  }

  function goto(nextIndex: number) {
    const next = (nextIndex + STUDY_QUESTIONS.length) % STUDY_QUESTIONS.length;
    setIndex(next);
    setSelected(records[STUDY_QUESTIONS[next].id]?.selected ?? []);
  }

  useEffect(() => setSelected(record?.selected ?? []), [index]);

  return (
    <main className="page page--content">
      <section className="hero card"><div><p className="eyebrow">Study Space</p><h1>学习练习</h1><p className="lead">保留学习入口，可继续扩展完整题库。</p></div><div className="study-summary"><strong>{correctCount}/{STUDY_QUESTIONS.length}</strong><span>当前正确</span></div></section>
      <section className="study-layout">
        <article className="study-question card">
          <div className="study-question__meta"><span>{question.chapter}</span><span>{question.type}</span><span>{index + 1}/{STUDY_QUESTIONS.length}</span></div>
          <h2>{question.stem}</h2>
          <div className="option-list">{question.options.map((option) => {
            const active = selected.includes(option.key);
            const isCorrect = record && question.answer.includes(option.key);
            const isWrong = record && active && !question.answer.includes(option.key);
            return <button className={`option ${active ? "is-selected" : ""} ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`.trim()} type="button" onClick={() => toggle(option.key)} key={option.key}><strong>{option.key}</strong><span>{option.text}</span></button>;
          })}</div>
          {record ? <div className={record.correct ? "answer-panel is-correct" : "answer-panel is-wrong"}><strong>{record.correct ? "回答正确" : `正确答案：${question.answer.join("、")}`}</strong><p>{question.explanation}</p></div> : null}
          <div className="action-row"><button className="button button--ghost" type="button" onClick={() => goto(index - 1)}>上一题</button><button className="button button--solid" type="button" onClick={record ? () => goto(index + 1) : submit}>{record ? "下一题" : "提交答案"}</button></div>
        </article>
        <aside className="study-sidebar card"><p className="eyebrow">Question Index</p><h3>题目导航</h3><div className="question-index">{STUDY_QUESTIONS.map((item, itemIndex) => <button className={`${itemIndex === index ? "is-active" : ""} ${records[item.id]?.correct ? "is-done" : ""}`} type="button" key={item.id} onClick={() => goto(itemIndex)}>{itemIndex + 1}</button>)}</div><button className="button button--ghost" type="button" onClick={() => setRecords({})}>清空练习记录</button></aside>
      </section>
    </main>
  );
}

const PUBLIC_NAV_ITEMS: NavItem[] = [
  { to: "/", label: "首页", en: "HOME" },
  { to: "/projects", label: "项目", en: "PROJECTS" },
  { to: "/about", label: "关于", en: "ABOUT" },
  { to: "/resume", label: "简历", en: "RESUME" },
  ...(blogPosts.length > 0 ? [{ to: "/blog", label: "博客", en: "WRITING" }] : []),
];

const WORK_NAV_ITEMS: NavItem[] = [
  { to: "/workspace", label: "工作台", en: "WORKSPACE" },
  { to: "/daily", label: "每日记录", en: "DAILY" },
  { to: "/timeline", label: "时间线", en: "TIMELINE" },
  { to: "/study", label: "学习", en: "STUDY" },
];

function AppContent({ comments, setComments }: {
  comments: Record<string, CommentItem[]>;
  setComments: React.Dispatch<React.SetStateAction<Record<string, CommentItem[]>>>;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { skin, isRedesign, shareMode } = useSkin();
  const [workMode, setWorkMode] = usePersistentState(WORK_MODE_STORAGE_KEY, false);
  if (location.pathname === "/our-film") return <MemoryPage />;

  const inWork = workMode || WORK_PATHS.includes(location.pathname);
  const isLanding = location.pathname === "/" || location.pathname === "/2026";
  const homePath = shareMode ? "/2026" : "/";
  const publicNavItems = PUBLIC_NAV_ITEMS.map((item) => (item.to === "/" ? { ...item, to: homePath } : item));
  const navClass = ({ isActive }: { isActive: boolean }) => isActive ? "nav-link active" : "nav-link";
  function toggleWork() {
    setWorkMode(!inWork);
    navigate(inWork ? homePath : "/workspace");
  }

  return (
      <div className={`shell ${isLanding ? "shell--landing" : ""}${isRedesign ? " shell--redesign" : ""}${skin === "dev" ? " shell--dev" : ""}${shareMode ? " shell--share" : ""}`}>
        {isRedesign ? (
          <RedesignHeader items={inWork ? WORK_NAV_ITEMS : publicNavItems} inWork={inWork} onToggleWork={toggleWork} />
        ) : (
          <header className="topbar">
            <NavLink className="brand" to="/"><span>Shawn</span><small>{inWork ? "Work" : "个人主页"}</small></NavLink>
            <div className="topbar__right">
              <nav className="nav">
                {inWork ? (
                  <>
                    <NavLink className={navClass} to="/workspace">工作台</NavLink>
                    <NavLink className={navClass} to="/daily">每日记录</NavLink>
                    <NavLink className={navClass} to="/timeline">时间线</NavLink>
                    <NavLink className={navClass} to="/study">学习</NavLink>
                  </>
                ) : (
                  <>
                    <NavLink className={navClass} to="/" end>首页</NavLink>
                    <NavLink className={navClass} to="/projects">项目</NavLink>
                    <NavLink className={navClass} to="/about">关于</NavLink>
                    <NavLink className={navClass} to="/resume">简历</NavLink>
                    {blogPosts.length > 0 ? <NavLink className={navClass} to="/blog">博客</NavLink> : null}
                  </>
                )}
                <button className={`nav-link nav-mode ${inWork ? "active" : ""}`} type="button" onClick={toggleWork}>{inWork ? "退出 Work" : "Work"}</button>
              </nav>
              <SkinSwitch compact />
            </div>
          </header>
        )}
        <Routes>
          <Route path="/" element={isRedesign ? <RedesignHome /> : <HomePage />} />
          <Route path="/2026" element={<RedesignHome />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:postId" element={<BlogDetailPage comments={comments} setComments={setComments} />} />
          <Route path="/projects" element={<ProjectPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/daily" element={<DailyLogPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {isRedesign ? (
          <RedesignFooter />
        ) : (
          <footer className="footer"><span>© {new Date().getFullYear()} {aboutProfile.name}</span><span>{aboutProfile.school} · {aboutProfile.college}</span></footer>
        )}
        {skin === "dev" ? <DevDock /> : null}
        {skin === "dev" ? <DevStatusBar /> : null}
        {skin === "payathon" ? <CyberFrame /> : null}
      </div>
  );
}

function App() {
  const [comments, setComments] = usePersistentState<Record<string, CommentItem[]>>(COMMENT_STORAGE_KEY, {});
  return <SkinProvider><HashRouter><AppContent comments={comments} setComments={setComments} /></HashRouter></SkinProvider>;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<React.StrictMode><App /></React.StrictMode>);
