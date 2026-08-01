import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, NavLink, Route, Routes, useParams } from "react-router-dom";
import { DailyLogPage, TimelinePage, WorkspacePage } from "./project-management";
import { aboutProfile, blogPosts, showcaseProjects, type BlogPost } from "./markdown-data";
import "./styles.css";

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
  return <>{text.split("\n").filter(Boolean).map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</>;
}

function HomePage() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const start = new Date(now.getFullYear(), 0, 1).getTime();
  const end = new Date(now.getFullYear() + 1, 0, 1).getTime();
  const progress = ((now.getTime() - start) / (end - start)) * 100;

  return (
    <main className="page page--home">
      <section className="landing card">
        <div className="landing__rule" />
        <p className="eyebrow">Automation · Research · Engineering</p>
        <h1>{aboutProfile.name}</h1>
        <p className="landing__subtitle">个人主页与项目管理工作台</p>
        <p className="landing__lead">{aboutProfile.lead}</p>
        <div className="landing__actions">
          <NavLink className="button button--solid" to="/workspace">进入工作台</NavLink>
          <NavLink className="button button--ghost" to="/daily">查看每日记录</NavLink>
        </div>
        <div className="landing__stats">
          <article><span>当前时间</span><strong>{now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</strong></article>
          <article><span>当前日期</span><strong>{now.toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}</strong></article>
          <article><span>年度进度</span><strong>{progress.toFixed(1)}%</strong></article>
        </div>
      </section>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="page page--content">
      <section className="hero card about-hero">
        <div>
          <p className="eyebrow">About</p>
          <h1>{aboutProfile.name}</h1>
          <p className="lead">{aboutProfile.school}{aboutProfile.college ? ` ${aboutProfile.college}` : ""} · {aboutProfile.major}</p>
        </div>
        <div className="hero__badge">{aboutProfile.period}</div>
      </section>

      <section className="about-profile-grid">
        <article className="card about-profile-card about-profile-card--wide">
          <p className="eyebrow">Research Interests</p>
          <h2>研究方向</h2>
          <div className="about-focus-list">{aboutProfile.focusAreas.map((item) => <span key={item}>{item}</span>)}</div>
        </article>

        <article className="card about-profile-card">
          <p className="eyebrow">Education</p>
          <h2>教育经历</h2>
          <ul className="about-clean-list">{aboutProfile.education.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>

        <article className="card about-profile-card">
          <p className="eyebrow">Research & Projects</p>
          <h2>科研与项目</h2>
          <ul className="about-clean-list">{aboutProfile.research.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>

        <article className="card about-profile-card about-profile-card--wide">
          <p className="eyebrow">Honors</p>
          <h2>竞赛与荣誉</h2>
          <div className="about-honor-grid">{aboutProfile.honors.map((item) => <span key={item}>{item}</span>)}</div>
        </article>
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
      <section className="hero card"><div><p className="eyebrow">Writing Archive</p><h1>博客</h1><p className="lead">内容由 src/data/blogs 中的 Markdown 文件生成。</p></div></section>
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
        {visible.length === 0 ? <div className="empty-state card"><h2>暂无公开文章</h2><p>在 src/data/blogs 放入 Markdown 后自动显示。</p></div> : null}
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
        <p className="content-source">内容文件：<code>{post.sourcePath}</code></p>
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

function ProjectPage() {
  const [query, setQuery] = useState("");
  const visible = showcaseProjects.filter((project) => [project.title, project.status, project.summary, project.tags.join(" ")].join(" ").toLowerCase().includes(query.toLowerCase().trim()));
  return (
    <main className="page page--content">
      <section className="hero card"><div><p className="eyebrow">Portfolio</p><h1>项目展示</h1><p className="lead">内容由 src/data/showcases 中的 Markdown 文件生成。</p></div></section>
      <section className="filter-bar card"><label className="field field--inline"><span>搜索</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索项目" /></label></section>
      <section className="project-grid">
        {visible.map((project) => <NavLink className="project-panel card" key={project.id} to={`/projects/${project.id}`}><p className="eyebrow">{project.status}</p><h2>{project.title}</h2><p>{project.summary}</p><div className="tag-row">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></NavLink>)}
        {visible.length === 0 ? <div className="empty-state card"><h2>暂无公开项目</h2><p>在 src/data/showcases 放入 Markdown 后自动显示。</p></div> : null}
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
        <div className="article__head"><div><p className="eyebrow">{project.status}</p><h1>{project.title}</h1><p className="lead">{project.summary}</p></div></div>
        <div className="article__sections">{project.sections.map((section) => <section className="article-section" key={section.title}><span>{section.label}</span><h2>{section.title}</h2><Paragraphs text={section.body} /></section>)}</div>
        <div className="tag-row">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
        <p className="content-source">内容文件：<code>{project.sourcePath}</code></p>
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

function App() {
  const [comments, setComments] = usePersistentState<Record<string, CommentItem[]>>(COMMENT_STORAGE_KEY, {});

  return (
    <HashRouter>
      <div className="shell">
        <header className="topbar">
          <NavLink className="brand" to="/"><span>Shawn</span><small>个人主页</small></NavLink>
          <nav className="nav">
            <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/" end>首页</NavLink>
            <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/about">关于</NavLink>
            <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/blog">博客</NavLink>
            <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/projects">项目</NavLink>
            <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/study">学习</NavLink>
            <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/workspace">工作台</NavLink>
            <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/daily">每日记录</NavLink>
            <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/timeline">时间线</NavLink>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
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
        <footer className="footer"><span>Shawn Project Workspace</span><span>Markdown 数据目录 + Git 记录</span></footer>
      </div>
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<React.StrictMode><App /></React.StrictMode>);
