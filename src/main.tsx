import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import "./styles.css";

type Post = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  readTime: string;
  excerpt: string;
  content: string[];
  sections?: BlogSection[];
};

type BlogSection = {
  title: string;
  label: string;
  body: string;
};

type CommentItem = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

type ProjectSection = {
  title: string;
  body: string;
};

type ProjectItem = {
  id: string;
  title: string;
  status: string;
  summary: string;
  tags: string[];
  sections: ProjectSection[];
};

type CommentState = Record<string, CommentItem[]>;

const POSTS_SEED: Post[] = [
  {
    id: "smart-car-review",
    title: "从智能车竞赛里学到的三件事",
    category: "项目复盘",
    tags: ["智能车", "控制", "协作"],
    date: "2026-04-18",
    readTime: "4 min",
    excerpt: "把竞赛经验拆成系统、策略和协同三个层面，会更容易复用到后续项目里。",
    content: [
      "第一件事是系统思维。智能车项目不是单点优化，而是感知、规划、控制和调参的闭环。",
      "第二件事是记录。每次调参、每次失败、每次现场反馈，都应该形成可回看的版本。",
      "第三件事是协作。真正稳定的项目，靠的是团队把任务拆开并保持接口清晰。",
    ],
  },
  {
    id: "portfolio-build",
    title: "个人主页为什么要尽量简洁",
    category: "成长记录",
    tags: ["前端", "设计", "展示"],
    date: "2026-04-22",
    readTime: "3 min",
    excerpt: "主页只承担自我介绍和入口分流，复杂内容应该放到独立页面。",
    content: ["主页不是作品集的全部，它更像门牌。", "重要的是让访问者快速知道你是谁、做过什么、怎么联系你。", "博客、项目经历和主页拆开后，主页负责清晰，专题页负责展开。"],
  },
  {
    id: "study-methods",
    title: "适合学生项目的整理方式",
    category: "学习方法",
    tags: ["复盘", "笔记", "效率"],
    date: "2026-04-27",
    readTime: "5 min",
    excerpt: "把内容分成问题、过程、结果和反思四段，后面整理会轻松很多。",
    content: ["我比较推荐用固定模板整理项目：先写问题背景，再写自己做了什么，接着给出结果，最后写反思。", "标签体系也很重要。比如把智能车、前端、复盘、学习方法作为标签，后面检索和回看都会快很多。", "长期坚持下来，你会发现文章不是在堆数量，而是在建立自己的知识索引。"],
  },
];

const PROJECTS_SEED: ProjectItem[] = [
  {
    id: "smart-car-project",
    title: "智能车竞赛项目详解",
    status: "已完成",
    summary: "围绕嵌入式感知、路径规划、控制协同与现场调参，形成完整项目闭环。",
    tags: ["智能车", "嵌入式", "控制", "竞赛"],
    sections: [
      { title: "项目目标", body: "在竞赛约束下，让车辆稳定识别赛道、完成路径跟踪，并在复杂场景下保持可控和可复现。" },
      { title: "我的工作", body: "主要负责方案拆解、调参记录、效果评估和现场问题排查，把感知与控制链路串成可迭代流程。" },
      { title: "实现方式", body: "通过阶段性实验记录、参数对比和多轮现场验证，逐步稳定核心策略，并把经验沉淀成可复用文档。" },
      { title: "项目收获", body: "最大的收获不是单次结果，而是学会把复杂工程拆成可管理的步骤，再通过复盘持续提升。" },
    ],
  },
  {
    id: "reserved-project",
    title: "第二个项目位",
    status: "预留",
    summary: "这里先保留空位，后续可以继续扩展成完整项目页。",
    tags: ["待补充"],
    sections: [],
  },
];

const EDUCATION = [
  { title: "杭州电子科技大学", meta: "2024 - 至今", text: "自动化学院，本科在读。关注机器视觉、智能系统和工程实践。" },
];

const AWARDS = [
  { title: "全国大学生智能车竞赛一等奖", text: "围绕嵌入式感知、路径规划和现场调参完成项目。" },
  { title: "大一综合测评专业第一", text: "课程表现、项目投入和日常学习共同形成稳定结果。" },
  { title: "校一等奖学金 / 省政府奖学金", text: "持续学习、竞赛和实践阶段的阶段性成果。" },
];

const BLOG_STORAGE_KEY = "shawn-blog-state-v4";
const PROJECT_STORAGE_KEY = "shawn-project-state-v4";
const COMMENT_STORAGE_KEY = "shawn-blog-comments-v4";

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function splitTags(input: string) {
  return input.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean);
}

function splitParagraphs(input: string) {
  return input.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
}

function sectionsFromPost(post: Post): BlogSection[] {
  if (post.sections?.length) return post.sections;
  return post.content.map((body, index) => ({
    title: `章节 ${String(index + 1).padStart(2, "0")}`,
    label: post.tags[index] ?? post.category,
    body,
  }));
}

function readMinutesFromContent(content: string) {
  return `${Math.max(2, Math.ceil(content.trim().length / 180))} min`;
}

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "S";
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function yearProgress(now: Date) {
  const start = new Date(now.getFullYear(), 0, 1).getTime();
  const end = new Date(now.getFullYear() + 1, 0, 1).getTime();
  return Math.min(100, Math.max(0, ((now.getTime() - start) / (end - start)) * 100));
}

function HomePage() {
  const now = useClock();
  const progress = yearProgress(now);
  const timeText = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  const dateText = now.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" });

  return (
    <main className="page page--homeboard">
      <section className="homeboard" aria-label="张航宁的个人主页">
        <div className="homeboard__main glass-panel">
          <div className="profile">
            <div className="profile__avatar" aria-hidden="true">Z</div>
            <div>
              <p className="profile__eyebrow">HELLO, I AM</p>
              <h1>张航宁</h1>
              <p className="profile__from">来自杭州电子科技大学 · 自动化学院</p>
            </div>
          </div>
          <p className="profile__quote">“把机器视觉、工程实践和持续记录，整理成可以被看见的成长轨迹。”</p>
          <div className="contact-strip">
            <a href="mailto:24061733@hdu.edu.cn">24061733@hdu.edu.cn</a>
            <span />
            <a href="tel:15957455889">15957455889</a>
          </div>
          <div className="quick-links">
            <NavLink to="/about">关于</NavLink>
            <NavLink to="/blog">博客</NavLink>
            <NavLink to="/projects">项目</NavLink>
          </div>
        </div>
        <div className="homeboard__side">
          <article className="glass-panel widget widget--time"><span>TIME</span><strong>{timeText}</strong><p>{dateText}</p></article>
          <article className="glass-panel widget"><span>FOCUS</span><strong>机器视觉</strong><p>智能车竞赛 / 工程实现 / 学习复盘</p></article>
          <article className="glass-panel widget"><span>{now.getFullYear()} PROGRESS</span><strong>{progress.toFixed(1)}%</strong><div className="progress-track"><i style={{ width: `${progress}%` }} /></div></article>
          <article className="glass-panel mini-player"><span>NOW</span><strong>Portfolio building</strong><p>把简历、博客和项目收进一个更轻的主页。</p></article>
        </div>
      </section>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="page page--blogspace page--about">
      <section className="blog-index-layout about-layout">
        <div className="about-stack">
          <section className="section">
            <div className="section__head"><div><p className="eyebrow">教育经历</p><h2>学习路径</h2></div><span className="section__index">02</span></div>
            <div className="grid grid--two">{EDUCATION.map((item) => <article className="card info-card" key={item.title}><p className="card-meta">{item.meta}</p><h3>{item.title}</h3><p className="muted">{item.text}</p></article>)}</div>
          </section>
          <section className="section">
            <div className="section__head"><div><p className="eyebrow">获奖内容</p><h2>阶段性成果</h2></div><span className="section__index">03</span></div>
            <div className="grid grid--three">{AWARDS.map((item) => <article className="card award-card" key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
          </section>
          <section className="section">
            <div className="section__head"><div><p className="eyebrow">致谢</p><h2>感谢一路上的支持</h2></div><span className="section__index">04</span></div>
            <article className="card thanks-card"><p>感谢老师、同学、队友和家人给予的帮助与鼓励。后续我会继续把学习、竞赛和项目经历认真沉淀在这里。</p></article>
          </section>
        </div>
        <BlogProfile text="机器视觉 / 自动化 / 智能系统" />
      </section>
    </main>
  );
}

function BlogEditorPage({ setPosts }: { setPosts: React.Dispatch<React.SetStateAction<Post[]>> }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState({ title: "", category: "", tags: "", excerpt: "", content: "", readTime: "3 min" });

  function createPost(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.category.trim() || !draft.excerpt.trim() || !draft.content.trim()) return;
    const nextPost: Post = {
      id: uid(),
      title: draft.title.trim(),
      category: draft.category.trim(),
      tags: splitTags(draft.tags),
      date: new Date().toISOString(),
      readTime: draft.readTime.trim() || readMinutesFromContent(draft.content),
      excerpt: draft.excerpt.trim(),
      content: splitParagraphs(draft.content),
    };
    setPosts((current) => [nextPost, ...current]);
    navigate(`/blog/${nextPost.id}`);
  }

  return (
    <main className="page page--blogspace">
      <section className="editor-shell card">
        <div className="section__head"><div><p className="eyebrow">个人博客</p><h1>写一篇新文章</h1><p className="lead">独立页面只负责编辑，保存后进入文章页。</p></div><NavLink className="button button--ghost" to="/blog">返回列表</NavLink></div>
        <form className="editor-grid" onSubmit={createPost}>
          <label className="field"><span>标题</span><input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="输入文章标题" /></label>
          <label className="field"><span>分类</span><input value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} placeholder="例如：项目复盘" /></label>
          <label className="field"><span>标签</span><input value={draft.tags} onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))} placeholder="用逗号分隔" /></label>
          <label className="field"><span>预计阅读</span><input value={draft.readTime} onChange={(event) => setDraft((current) => ({ ...current, readTime: event.target.value }))} /></label>
          <label className="field editor-grid__full"><span>摘要</span><textarea value={draft.excerpt} onChange={(event) => setDraft((current) => ({ ...current, excerpt: event.target.value }))} /></label>
          <label className="field editor-grid__full"><span>正文</span><textarea value={draft.content} onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))} placeholder="每段之间空一行" /></label>
          <div className="editor-actions editor-grid__full"><button className="button button--solid" type="submit">发布文章</button><button className="button button--ghost" type="button" onClick={() => navigate("/blog")}>取消</button></div>
        </form>
      </section>
    </main>
  );
}

function BlogEditPage({ posts, setPosts }: { posts: Post[]; setPosts: React.Dispatch<React.SetStateAction<Post[]>> }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const post = posts.find((item) => item.id === postId);
  const initialSections = post ? sectionsFromPost(post) : [{ title: "章节 01", label: "笔记", body: "" }];
  const [draft, setDraft] = useState(() => ({
    title: post?.title ?? "",
    category: post?.category ?? "",
    tags: post?.tags.join("，") ?? "",
    excerpt: post?.excerpt ?? "",
    readTime: post?.readTime ?? "3 min",
  }));
  const [sectionsDraft, setSectionsDraft] = useState<BlogSection[]>(initialSections);

  useEffect(() => {
    if (!post) return;
    setDraft({
      title: post.title,
      category: post.category,
      tags: post.tags.join("，"),
      excerpt: post.excerpt,
      readTime: post.readTime,
    });
    setSectionsDraft(sectionsFromPost(post));
  }, [post]);

  if (!post) return <Navigate to="/blog" replace />;
  const activePostId = post.id;

  function updatePost(event: React.FormEvent) {
    event.preventDefault();
    const nextSections = sectionsDraft
      .map((section, index) => ({
        title: section.title.trim() || `章节 ${String(index + 1).padStart(2, "0")}`,
        label: section.label.trim() || draft.category.trim(),
        body: section.body.trim(),
      }))
      .filter((section) => section.body);
    if (!draft.title.trim() || !draft.category.trim() || !draft.excerpt.trim() || nextSections.length === 0) return;
    const contentText = nextSections.map((section) => section.body).join("\n\n");
    setPosts((current) => current.map((item) => item.id === activePostId ? {
      ...item,
      title: draft.title.trim(),
      category: draft.category.trim(),
      tags: splitTags(draft.tags),
      readTime: draft.readTime.trim() || readMinutesFromContent(contentText),
      excerpt: draft.excerpt.trim(),
      content: nextSections.map((section) => section.body),
      sections: nextSections,
    } : item));
    navigate(`/blog/${activePostId}`);
  }

  function updateSection(index: number, field: keyof BlogSection, value: string) {
    setSectionsDraft((current) => current.map((section, sectionIndex) => sectionIndex === index ? { ...section, [field]: value } : section));
  }

  return (
    <main className="page page--blogspace">
      <section className="editor-shell card">
        <div className="section__head"><div><p className="eyebrow">编辑博客</p><h1>编辑章节内容</h1><p className="lead">每个小章节都可以单独设置标题、标签和正文，最终会按章节卡片展示。</p></div><NavLink className="button button--ghost" to={`/blog/${activePostId}`}>返回文章</NavLink></div>
        <form className="editor-grid" onSubmit={updatePost}>
          <label className="field"><span>标题</span><input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
          <label className="field"><span>分类</span><input value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} /></label>
          <label className="field"><span>标签</span><input value={draft.tags} onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))} placeholder="例如：智能车，控制，复盘" /></label>
          <label className="field"><span>预计阅读</span><input value={draft.readTime} onChange={(event) => setDraft((current) => ({ ...current, readTime: event.target.value }))} /></label>
          <label className="field editor-grid__full"><span>摘要</span><textarea value={draft.excerpt} onChange={(event) => setDraft((current) => ({ ...current, excerpt: event.target.value }))} /></label>
          <div className="section-editor editor-grid__full">
            <div className="section-editor__head"><span>小章节</span><button className="button button--ghost button--small" type="button" onClick={() => setSectionsDraft((current) => [...current, { title: `章节 ${String(current.length + 1).padStart(2, "0")}`, label: draft.category || "笔记", body: "" }])}>新增章节</button></div>
            {sectionsDraft.map((section, index) => (
              <article className="section-edit-card" key={index}>
                <label className="field"><span>章节标题</span><input value={section.title} onChange={(event) => updateSection(index, "title", event.target.value)} placeholder={`章节 ${String(index + 1).padStart(2, "0")}`} /></label>
                <label className="field"><span>章节标签</span><input value={section.label} onChange={(event) => updateSection(index, "label", event.target.value)} placeholder="例如：背景 / 方法 / 复盘" /></label>
                <label className="field section-edit-card__body"><span>章节正文</span><textarea value={section.body} onChange={(event) => updateSection(index, "body", event.target.value)} /></label>
                <button className="danger-button" type="button" onClick={() => setSectionsDraft((current) => current.filter((_, sectionIndex) => sectionIndex !== index))}>删除章节</button>
              </article>
            ))}
          </div>
          <div className="editor-actions editor-grid__full"><button className="button button--solid" type="submit">保存修改</button><button className="button button--ghost" type="button" onClick={() => navigate(`/blog/${activePostId}`)}>取消</button></div>
        </form>
      </section>
    </main>
  );
}

function ProjectEditorPage({ setProjects }: { setProjects: React.Dispatch<React.SetStateAction<ProjectItem[]>> }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState({ title: "", status: "自定义", summary: "", tags: "", goal: "", work: "", method: "", gain: "" });

  function createProject(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.summary.trim()) return;
    const nextProject: ProjectItem = {
      id: uid(),
      title: draft.title.trim(),
      status: draft.status.trim() || "自定义",
      summary: draft.summary.trim(),
      tags: splitTags(draft.tags),
      sections: [
        draft.goal.trim() ? { title: "项目目标", body: draft.goal.trim() } : null,
        draft.work.trim() ? { title: "我的工作", body: draft.work.trim() } : null,
        draft.method.trim() ? { title: "实现方式", body: draft.method.trim() } : null,
        draft.gain.trim() ? { title: "项目收获", body: draft.gain.trim() } : null,
      ].filter(Boolean) as ProjectSection[],
    };
    setProjects((current) => [nextProject, ...current]);
    navigate(`/projects/${nextProject.id}`);
  }

  return (
    <main className="page page--blogspace">
      <section className="editor-shell card">
        <div className="section__head"><div><p className="eyebrow">项目经历</p><h1>写一个新项目</h1><p className="lead">保存后进入独立项目详情页。</p></div><NavLink className="button button--ghost" to="/projects">返回列表</NavLink></div>
        <form className="editor-grid" onSubmit={createProject}>
          <label className="field"><span>标题</span><input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
          <label className="field"><span>状态</span><input value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))} /></label>
          <label className="field editor-grid__full"><span>摘要</span><textarea value={draft.summary} onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} /></label>
          <label className="field"><span>标签</span><input value={draft.tags} onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))} /></label>
          <label className="field editor-grid__full"><span>项目目标</span><textarea value={draft.goal} onChange={(event) => setDraft((current) => ({ ...current, goal: event.target.value }))} /></label>
          <label className="field editor-grid__full"><span>我的工作</span><textarea value={draft.work} onChange={(event) => setDraft((current) => ({ ...current, work: event.target.value }))} /></label>
          <label className="field editor-grid__full"><span>实现方式</span><textarea value={draft.method} onChange={(event) => setDraft((current) => ({ ...current, method: event.target.value }))} /></label>
          <label className="field editor-grid__full"><span>项目收获</span><textarea value={draft.gain} onChange={(event) => setDraft((current) => ({ ...current, gain: event.target.value }))} /></label>
          <div className="editor-actions editor-grid__full"><button className="button button--solid" type="submit">保存项目</button><button className="button button--ghost" type="button" onClick={() => navigate("/projects")}>取消</button></div>
        </form>
      </section>
    </main>
  );
}

function BlogPage({ posts }: { posts: Post[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("全部");
  const [tagFilter, setTagFilter] = useState("全部");
  const categories = useMemo(() => ["全部", ...new Set(posts.map((post) => post.category))], [posts]);
  const tags = useMemo(() => ["全部", ...new Set(posts.flatMap((post) => post.tags))], [posts]);
  const visiblePosts = useMemo(() => {
    const query = normalizeText(searchQuery);
    return posts.filter((post) => {
      const categoryMatch = categoryFilter === "全部" || post.category === categoryFilter;
      const tagMatch = tagFilter === "全部" || post.tags.includes(tagFilter);
      const sectionText = sectionsFromPost(post).map((section) => `${section.title} ${section.label} ${section.body}`).join(" ");
      const searchMatch = !query || [post.title, post.category, post.excerpt, post.tags.join(" "), post.content.join(" "), sectionText].join(" ").toLowerCase().includes(query);
      return categoryMatch && tagMatch && searchMatch;
    });
  }, [categoryFilter, posts, searchQuery, tagFilter]);

  return (
    <main className="page page--blogspace">
      <section className="section"><div className="filter-bar card"><label className="field field--inline"><span>搜索</span><input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="搜索标题、分类、标签、摘要或正文" /></label><div className="filter-bar__actions"><NavLink className="button button--solid" to="/blog/new">新建</NavLink></div><div className="filter-group"><span className="filter-label">分类</span><div className="chip-row">{categories.map((category) => <button key={category} type="button" className={categoryFilter === category ? "chip active" : "chip"} onClick={() => setCategoryFilter(category)}>{category}</button>)}</div></div><div className="filter-group"><span className="filter-label">标签</span><div className="chip-row">{tags.map((tag) => <button key={tag} type="button" className={tagFilter === tag ? "chip active" : "chip"} onClick={() => setTagFilter(tag)}>{tag}</button>)}</div></div></div></section>
      <section className="blog-index-layout">
        <div className="blog-list blog-list--index">
          {visiblePosts.map((post) => (
            <NavLink className="blog-card" key={post.id} to={`/blog/${post.id}`}>
              <p className="blog-card__meta">{post.category} / {formatDate(post.date)} / {post.readTime}</p>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="tag-row">{post.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
            </NavLink>
          ))}
          {visiblePosts.length === 0 ? <div className="card empty-state"><span>没有找到符合筛选条件的文章。</span></div> : null}
        </div>
        <BlogProfile />
      </section>
    </main>
  );
}

function BlogPostPage({ posts, setPosts, commentsByPost, setCommentsByPost }: { posts: Post[]; setPosts: React.Dispatch<React.SetStateAction<Post[]>>; commentsByPost: CommentState; setCommentsByPost: React.Dispatch<React.SetStateAction<CommentState>> }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [draftName, setDraftName] = useState("Shawn");
  const [draftContent, setDraftContent] = useState("");
  const post = posts.find((item) => item.id === postId);
  if (!post) return <Navigate to="/blog" replace />;
  const activePostId = post.id;
  const postComments = commentsByPost[activePostId] ?? [];
  const postSections = sectionsFromPost(post);

  function addComment(event: React.FormEvent) {
    event.preventDefault();
    if (!draftContent.trim()) return;
    const nextComment = { id: uid(), name: draftName.trim() || "匿名", content: draftContent.trim(), createdAt: new Date().toISOString() };
    setCommentsByPost((current) => ({ ...current, [activePostId]: [nextComment, ...(current[activePostId] ?? [])] }));
    setDraftContent("");
  }

  function removeComment(commentId: string) {
    setCommentsByPost((current) => ({ ...current, [activePostId]: (current[activePostId] ?? []).filter((comment) => comment.id !== commentId) }));
  }

  function deletePost() {
    setPosts((current) => current.filter((item) => item.id !== activePostId));
    setCommentsByPost((current) => {
      const next = { ...current };
      delete next[activePostId];
      return next;
    });
    navigate("/blog");
  }

  return (
    <main className="page page--blogspace">
      <section className="blog-article-layout">
        <article className="blog-detail card">
          <div className="blog-detail__top"><div><p className="blog-detail__meta">{post.category} / {formatDate(post.date)} / {post.readTime}</p><h2>{post.title}</h2></div><div className="article-actions"><NavLink className="button button--ghost button--small" to={`/blog/${activePostId}/edit`}>编辑文章</NavLink><button className="danger-button" type="button" onClick={deletePost}>删除文章</button></div></div>
          <p className="blog-detail__excerpt">{post.excerpt}</p>
          <div className="blog-detail__body blog-section-list">{postSections.map((section, index) => <section className="blog-section-card" id={`p-${index}`} key={`${section.title}-${index}`}><div className="blog-section-card__top"><span>{section.label}</span><strong>{String(index + 1).padStart(2, "0")}</strong></div><h3>{section.title}</h3><p>{section.body}</p></section>)}</div>
          <div className="tag-row">{post.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
        </article>
        <aside className="blog-article-side"><BlogProfile /><article className="blog-toc card"><h3>目录</h3>{postSections.map((section, index) => <a href={`#p-${index}`} key={`${section.title}-toc`}>{section.title}</a>)}</article></aside>
      </section>
      <section className="comment-panel card">
        <div className="comment-panel__head"><h3>评论区</h3><p>评论会保存在本地浏览器里，可以随时删除。</p></div>
        <form className="comment-form" onSubmit={addComment}><label className="field"><span>昵称</span><input value={draftName} onChange={(event) => setDraftName(event.target.value)} /></label><label className="field"><span>评论</span><textarea value={draftContent} onChange={(event) => setDraftContent(event.target.value)} /></label><div className="post-tools"><button className="button button--solid button--small" type="submit">发布评论</button><button className="button button--ghost button--small" type="button" onClick={() => setDraftContent("")}>清空</button></div></form>
        <div className="comment-list">{postComments.length === 0 ? <div className="empty-state"><span>还没有评论，先写第一条吧。</span></div> : postComments.map((comment) => <article className="comment-card" key={comment.id}><div className="comment-card__avatar">{initials(comment.name)}</div><div className="comment-card__body"><div className="comment-card__head"><strong>{comment.name}</strong><span>{formatDate(comment.createdAt)}</span></div><p>{comment.content}</p></div><div className="comment-card__side"><span className="comment-card__time">{new Date(comment.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span><button className="comment-card__delete" type="button" onClick={() => removeComment(comment.id)}>删除</button></div></article>)}</div>
      </section>
    </main>
  );
}

function ProjectPage({ projects }: { projects: ProjectItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const visibleProjects = useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) return projects;
    return projects.filter((project) => [project.title, project.status, project.summary, project.tags.join(" "), project.sections.map((section) => `${section.title} ${section.body}`).join(" ")].join(" ").toLowerCase().includes(query));
  }, [projects, searchQuery]);

  return (
    <main className="page page--blogspace">
      <section className="section"><div className="filter-bar card"><label className="field field--inline"><span>搜索</span><input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="搜索项目标题、状态、标签或详细内容" /></label><div className="filter-bar__actions"><NavLink className="button button--solid" to="/projects/new">新建</NavLink></div></div></section>
      <section className="blog-index-layout">
        <div className="project-grid project-grid--index">
          {visibleProjects.map((project) => <NavLink className={project.sections.length > 0 ? "project-panel card" : "project-panel card project-panel--empty"} key={project.id} to={`/projects/${project.id}`}><div className="project-panel__head"><div><p className="eyebrow">{project.status}</p><h2>{project.title}</h2></div></div><p className="project-panel__summary">{project.summary}</p><div className="tag-row">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></NavLink>)}
          {visibleProjects.length === 0 ? <div className="card empty-state"><span>没有找到符合搜索条件的项目。</span></div> : null}
        </div>
        <BlogProfile text="机器视觉 / 自动化 / 工程实践" />
      </section>
    </main>
  );
}

function ProjectDetailPage({ projects, setProjects }: { projects: ProjectItem[]; setProjects: React.Dispatch<React.SetStateAction<ProjectItem[]>> }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = projects.find((item) => item.id === projectId);
  if (!project) return <Navigate to="/projects" replace />;
  const activeProjectId = project.id;

  function deleteProject() {
    setProjects((current) => current.filter((item) => item.id !== activeProjectId));
    navigate("/projects");
  }

  return (
    <main className="page page--blogspace">
      <section className="blog-article-layout">
        <article className="project-panel project-panel--detail card" id="top">
          <div className="project-panel__head"><div><p className="eyebrow">{project.status}</p><h2>{project.title}</h2></div><button className="danger-button" type="button" onClick={deleteProject}>删除项目</button></div>
          <p className="project-panel__summary">{project.summary}</p>
          <div className="tag-row">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          {project.sections.length > 0 ? <div className="project-detail-grid project-detail-grid--article">{project.sections.map((section, index) => <div className="project-detail" id={`section-${index}`} key={section.title}><h3>{section.title}</h3><p>{section.body}</p></div>)}</div> : <div className="empty-project"><p>第二个项目内容先预留在这里。</p><p className="muted">后面补充标题、背景、做法和结果后，可以继续扩展成完整项目页。</p></div>}
        </article>
        <aside className="blog-article-side"><BlogProfile text="机器视觉 / 自动化 / 工程实践" /><article className="blog-toc card"><h3>目录</h3>{project.sections.length > 0 ? project.sections.map((section, index) => <a href={`#section-${index}`} key={section.title}>{section.title}</a>) : <a href="#top">预留项目</a>}</article></aside>
      </section>
    </main>
  );
}

function BlogProfile({ text = "分享技术与科技生活" }: { text?: string }) {
  return (
    <aside className="blog-profile card">
      <div className="blog-profile__dial" aria-hidden="true"><span /></div>
      <h3>张航宁</h3>
      <p>{text}</p>
      <div className="blog-profile__links"><a href="mailto:24061733@hdu.edu.cn">邮箱</a><a href="tel:15957455889">电话</a></div>
    </aside>
  );
}

function AppShell({ posts, setPosts, commentsByPost, setCommentsByPost, projects, setProjects }: { posts: Post[]; setPosts: React.Dispatch<React.SetStateAction<Post[]>>; commentsByPost: CommentState; setCommentsByPost: React.Dispatch<React.SetStateAction<CommentState>>; projects: ProjectItem[]; setProjects: React.Dispatch<React.SetStateAction<ProjectItem[]>> }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className={`shell ${isHome ? "shell--home" : ""}`.trim()}>
      <header className="topbar">
        <NavLink className="brand" to="/" end><span className="brand__name">Shawn</span><span className="brand__meta">个人主页</span></NavLink>
        <nav className="nav"><NavLink className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} to="/" end>首页</NavLink><NavLink className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} to="/about">关于</NavLink><NavLink className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} to="/blog">博客</NavLink><NavLink className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} to="/projects">项目</NavLink></nav>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage posts={posts} />} />
        <Route path="/blog/:postId" element={<BlogPostPage posts={posts} setPosts={setPosts} commentsByPost={commentsByPost} setCommentsByPost={setCommentsByPost} />} />
        <Route path="/blog/new" element={<BlogEditorPage setPosts={setPosts} />} />
        <Route path="/blog/:postId/edit" element={<BlogEditPage posts={posts} setPosts={setPosts} />} />
        <Route path="/projects" element={<ProjectPage projects={projects} />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage projects={projects} setProjects={setProjects} />} />
        <Route path="/projects/new" element={<ProjectEditorPage setProjects={setProjects} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  const [posts, setPosts] = useState<Post[]>(() => loadJson(`${BLOG_STORAGE_KEY}:posts`, POSTS_SEED));
  const [commentsByPost, setCommentsByPost] = useState<CommentState>(() => loadJson(COMMENT_STORAGE_KEY, {}));
  const [projects, setProjects] = useState<ProjectItem[]>(() => loadJson(`${PROJECT_STORAGE_KEY}:projects`, PROJECTS_SEED));

  useEffect(() => saveJson(`${BLOG_STORAGE_KEY}:posts`, posts), [posts]);
  useEffect(() => saveJson(COMMENT_STORAGE_KEY, commentsByPost), [commentsByPost]);
  useEffect(() => saveJson(`${PROJECT_STORAGE_KEY}:projects`, projects), [projects]);

  return <HashRouter><AppShell posts={posts} setPosts={setPosts} commentsByPost={commentsByPost} setCommentsByPost={setCommentsByPost} projects={projects} setProjects={setProjects} /></HashRouter>;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<React.StrictMode><App /></React.StrictMode>);
