import React, { useMemo, useState } from "react";
import {
  listFromSection,
  parseFrontMatter,
  parseMarkdownDocument,
  sectionContent,
  textFromSection,
} from "./markdown-data";
import "./project-management.css";

type MilestoneStatus = "未开始" | "进行中" | "有风险" | "已完成";
type ProjectStatus = "规划中" | "进行中" | "阻塞" | "暂停" | "已完成";
type ProjectCategory = "竞赛" | "论文" | "专利" | "学习";

type RoadmapItem = {
  id: string;
  title: string;
  status: MilestoneStatus;
  description: string;
  date?: string;
};

type ProjectIssue = {
  title: string;
  status: "待处理" | "处理中" | "已解决";
  note: string;
};

type ManagedProject = {
  id: string;
  name: string;
  shortName: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: string;
  summary: string;
  initialProgress: number;
  repository: string;
  repositoryLabel: string;
  localPath: string;
  targetDate: string;
  attention: string[];
  roadmap: RoadmapItem[];
  issues: ProjectIssue[];
  sourcePath: string;
};

type ParsedSections = {
  completed: string[];
  results: string[];
  issues: string[];
  decisions: string[];
  tomorrow: string[];
  nextFocus: string;
  tomorrowPrompt: string;
  notes: string[];
};

type ProjectDailyLog = ParsedSections & {
  sourcePath: string;
  projectId: string;
  date: string;
  title: string;
  stage: string;
  status: ProjectStatus;
  progress: number;
  workHours: number;
  blocked: boolean;
  milestone: string;
  milestoneStatus: MilestoneStatus;
};

type ProgressPoint = {
  date: string;
  progress: number;
};

const workspaceModules = import.meta.glob<string>("./data/projects/workspace.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const projectModules = import.meta.glob<string>("./data/projects/*/project.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const markdownModules = import.meta.glob<string>("./data/projects/*/daily/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const workspace = loadWorkspace();
const projects = Object.entries(projectModules)
  .map(([path, raw]) => parseManagedProject(path, raw))
  .filter((project): project is ManagedProject => Boolean(project))
  .sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));

const dailyLogs = Object.entries(markdownModules)
  .map(([path, raw]) => parseProjectDailyLog(path, raw))
  .filter((log): log is ProjectDailyLog => Boolean(log))
  .sort((left, right) => right.date.localeCompare(left.date));

function loadWorkspace() {
  const entry = Object.entries(workspaceModules)[0];
  if (!entry) {
    return {
      name: "工作台",
      description: "项目进度与每日记录",
      currentFocus: "通过 Markdown 持续维护项目状态",
      updatedAt: "",
    };
  }
  const doc = parseMarkdownDocument(entry[0], entry[1]);
  return {
    name: String(doc.metadata.name ?? "工作台"),
    description: String(doc.metadata.description ?? "项目进度与每日记录"),
    currentFocus: String(doc.metadata.currentFocus ?? "通过 Markdown 持续维护项目状态"),
    updatedAt: String(doc.metadata.updatedAt ?? ""),
  };
}

function parseManagedProject(path: string, raw: string): ManagedProject | null {
  const doc = parseMarkdownDocument(path, raw);
  const idFromPath = path.match(/projects\/([^/]+)\/project\.md$/)?.[1] ?? "";
  const id = String(doc.metadata.id ?? idFromPath);
  const name = String(doc.metadata.name ?? "");
  if (!id || !name) {
    console.warn(`项目配置缺少 id 或 name: ${path}`);
    return null;
  }
  return {
    id,
    name,
    shortName: String(doc.metadata.shortName ?? name),
    category: normalizeProjectCategory(doc.metadata.category),
    status: normalizeProjectStatus(doc.metadata.status),
    priority: String(doc.metadata.priority ?? "P1"),
    summary: textFromSection(doc.body, "项目简介", "项目摘要") || "项目简介待补充。",
    initialProgress: clampNumber(doc.metadata.initialProgress, 0, 100),
    repository: String(doc.metadata.repository ?? ""),
    repositoryLabel: String(doc.metadata.repositoryLabel ?? "打开 GitHub"),
    localPath: String(doc.metadata.localPath ?? "待补充"),
    targetDate: String(doc.metadata.targetDate ?? ""),
    attention: listFromSection(doc.body, "注意事项"),
    roadmap: parseRoadmap(sectionContent(doc.body, "里程碑")),
    issues: parseIssues(sectionContent(doc.body, "当前问题", "问题")),
    sourcePath: path.replace(/^\.\//, "src/"),
  };
}

function parseRoadmap(content: string): RoadmapItem[] {
  return parseLevelThreeBlocks(content).map(({ title, body }) => {
    const [id = "M?", milestoneTitle = "未命名里程碑", status = "未开始", date = ""] = title.split("|").map((item) => item.trim());
    return {
      id,
      title: milestoneTitle,
      status: normalizeMilestoneStatus(status),
      description: body.replace(/^[-*+]\s+/gm, "").replace(/\n+/g, " ").trim(),
      ...(date ? { date } : {}),
    };
  });
}

function parseIssues(content: string): ProjectIssue[] {
  return parseLevelThreeBlocks(content).map(({ title, body }) => {
    const [issueTitle = "未命名问题", rawStatus = "待处理"] = title.split("|").map((item) => item.trim());
    const status = ["待处理", "处理中", "已解决"].includes(rawStatus) ? rawStatus as ProjectIssue["status"] : "待处理";
    return {
      title: issueTitle,
      status,
      note: body.replace(/^[-*+]\s+/gm, "").replace(/\n+/g, " ").trim(),
    };
  });
}

function parseLevelThreeBlocks(content: string) {
  const matches = [...content.matchAll(/^###\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? content.length;
    return { title: match[1].trim(), body: content.slice(start, end).trim() };
  });
}

function normalizeProjectCategory(value: unknown): ProjectCategory {
  const category = String(value ?? "论文") as ProjectCategory;
  return ["竞赛", "论文", "专利", "学习"].includes(category) ? category : "论文";
}

function parseProjectDailyLog(path: string, raw: string): ProjectDailyLog | null {
  const normalized = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    console.warn(`项目日报缺少 Front Matter: ${path}`);
    return null;
  }

  const metadata = parseFrontMatter(match[1]);
  const projectIdFromPath = path.match(/projects\/([^/]+)\/daily\//)?.[1] ?? "";
  const projectId = String(metadata.projectId ?? projectIdFromPath);
  const date = String(metadata.date ?? path.match(/(\d{4}-\d{2}-\d{2})\.md$/)?.[1] ?? "");
  if (!projectId || !date) {
    console.warn(`项目日报缺少 projectId 或 date: ${path}`);
    return null;
  }

  const sections = parseMarkdownSections(match[2]);
  return {
    sourcePath: path.replace(/^\.\//, "src/"),
    projectId,
    date,
    title: String(metadata.title ?? `${date} 项目日报`),
    stage: String(metadata.stage ?? "阶段待补充"),
    status: normalizeProjectStatus(metadata.status),
    progress: clampNumber(metadata.progress, 0, 100),
    workHours: clampNumber(metadata.workHours, 0, 24),
    blocked: parseBoolean(metadata.blocked),
    milestone: String(metadata.milestone ?? ""),
    milestoneStatus: normalizeMilestoneStatus(metadata.milestoneStatus),
    ...sections,
  };
}

function parseMarkdownSections(body: string): ParsedSections {
  const sectionMap = new Map<string, string>();
  const matches = [...body.matchAll(/^##\s+(.+)$/gm)];
  matches.forEach((match, index) => {
    const title = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? body.length;
    sectionMap.set(title, body.slice(start, end).trim());
  });

  const list = (...titles: string[]) => {
    const content = titles.map((title) => sectionMap.get(title)).find(Boolean) ?? "";
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^[-*+]\s+/.test(line))
      .map((line) => line.replace(/^[-*+]\s+/, "").trim())
      .filter(Boolean);
  };

  const text = (...titles: string[]) => {
    const content = titles.map((title) => sectionMap.get(title)).find(Boolean) ?? "";
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .join(" ")
      .trim();
  };

  return {
    completed: list("今日完成", "完成事项"),
    results: list("验证结果", "测试与结果", "测试结果"),
    issues: list("问题与阻塞", "发现的问题", "当前问题"),
    decisions: list("今日决策", "技术决策"),
    tomorrow: list("明日计划", "下一步计划"),
    nextFocus: text("明日首要任务", "下一步重点") || "待补充",
    tomorrowPrompt: text("明日提示词", "下一日提示词"),
    notes: list("补充记录", "备注"),
  };
}

function normalizeProjectStatus(value: unknown): ProjectStatus {
  const status = String(value ?? "进行中") as ProjectStatus;
  return ["规划中", "进行中", "阻塞", "暂停", "已完成"].includes(status) ? status : "进行中";
}

function normalizeMilestoneStatus(value: unknown): MilestoneStatus {
  const status = String(value ?? "进行中") as MilestoneStatus;
  return ["未开始", "进行中", "有风险", "已完成"].includes(status) ? status : "进行中";
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  return ["true", "yes", "1", "是"].includes(String(value).toLowerCase());
}

function clampNumber(value: unknown, minimum: number, maximum: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return minimum;
  return Math.min(maximum, Math.max(minimum, number));
}

function formatDate(date: string) {
  if (!date) return "待定";
  const value = new Date(`${date}T00:00:00`);
  if (Number.isNaN(value.getTime())) return "待定";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function statusClass(status: string) {
  if (["已完成", "已解决"].includes(status)) return "is-done";
  if (["阻塞", "有风险", "待处理"].includes(status)) return "is-risk";
  if (["进行中", "处理中"].includes(status)) return "is-active";
  return "is-muted";
}

function logsForProject(projectId: string) {
  return dailyLogs.filter((log) => log.projectId === projectId).sort((left, right) => left.date.localeCompare(right.date));
}

function latestLogForProject(projectId: string) {
  return logsForProject(projectId).at(-1);
}

function currentProgress(project: ManagedProject) {
  return latestLogForProject(project.id)?.progress ?? project.initialProgress ?? 0;
}

function currentStatus(project: ManagedProject) {
  return latestLogForProject(project.id)?.status ?? project.status;
}

function progressDelta(logs: ProjectDailyLog[], days = 7) {
  if (logs.length < 2) return 0;
  const latest = logs.at(-1)!;
  const latestTime = new Date(`${latest.date}T00:00:00`).getTime();
  const threshold = latestTime - days * 24 * 60 * 60 * 1000;
  const baseline = logs.find((log) => new Date(`${log.date}T00:00:00`).getTime() >= threshold) ?? logs[0];
  return latest.progress - baseline.progress;
}

function effectiveRoadmap(project: ManagedProject, logs: ProjectDailyLog[]) {
  return project.roadmap.map((item) => {
    const update = [...logs].reverse().find((log) => log.milestone === item.id);
    return update ? { ...item, status: update.milestoneStatus, date: update.date } : item;
  });
}

function MetricCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <article className="pm-metric card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

function ProjectRepository({ project }: { project: ManagedProject }) {
  if (!project.repository) return <span className="pm-repo pm-repo--empty">仓库待补充</span>;
  return (
    <a className="pm-repo" href={project.repository} target="_blank" rel="noreferrer">
      {project.repositoryLabel || "打开 GitHub"}
    </a>
  );
}

function ProgressSparkline({ points }: { points: ProgressPoint[] }) {
  const width = 150;
  const height = 48;
  if (points.length === 0) return <div className="pm-sparkline pm-sparkline--empty">暂无曲线</div>;
  const coordinates = chartCoordinates(points, width, height, 5);
  return (
    <svg className="pm-sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="项目进度趋势">
      <polyline points={coordinates.map((point) => `${point.x},${point.y}`).join(" ")} />
      {coordinates.map((point, index) => <circle cx={point.x} cy={point.y} r="2.5" key={`${point.x}-${index}`} />)}
    </svg>
  );
}

function ProgressChart({ logs, projectName }: { logs: ProjectDailyLog[]; projectName: string }) {
  const width = 760;
  const height = 280;
  const padding = 34;
  const points = logs.map((log) => ({ date: log.date, progress: log.progress }));
  const coordinates = chartCoordinates(points, width, height, padding);
  const gridValues = [0, 25, 50, 75, 100];

  return (
    <section className="pm-chart-card">
      <div className="pm-chart-card__head">
        <div><p className="eyebrow">Progress Curve</p><h3>项目进度曲线</h3></div>
        <span>{logs.length} 个有效日报点</span>
      </div>
      {points.length > 0 ? (
        <div className="pm-chart-scroll">
          <svg className="pm-progress-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${projectName} 项目进度曲线`}>
            {gridValues.map((value) => {
              const y = height - padding - (value / 100) * (height - padding * 2);
              return <g key={value}><line x1={padding} x2={width - padding} y1={y} y2={y} /><text x="4" y={y + 4}>{value}%</text></g>;
            })}
            <polyline className="pm-progress-chart__line" points={coordinates.map((point) => `${point.x},${point.y}`).join(" ")} />
            {coordinates.map((point, index) => (
              <g key={`${point.x}-${index}`}>
                <circle className="pm-progress-chart__point" cx={point.x} cy={point.y} r="5" />
                <text className="pm-progress-chart__value" x={point.x} y={point.y - 12} textAnchor="middle">{points[index].progress}%</text>
                <text className="pm-progress-chart__date" x={point.x} y={height - 8} textAnchor="middle">{points[index].date.slice(5)}</text>
              </g>
            ))}
          </svg>
        </div>
      ) : <div className="pm-empty"><p>该项目还没有 Markdown 日报，因此暂时无法生成进度曲线。</p></div>}
    </section>
  );
}

function chartCoordinates(points: ProgressPoint[], width: number, height: number, padding: number) {
  if (points.length === 0) return [];
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  return points.map((point, index) => ({
    x: points.length === 1 ? width / 2 : padding + (index / (points.length - 1)) * usableWidth,
    y: height - padding - (point.progress / 100) * usableHeight,
  }));
}

function ProjectDetail({ project }: { project: ManagedProject }) {
  const logs = logsForProject(project.id);
  const latest = logs.at(-1);
  const progress = latest?.progress ?? project.initialProgress;
  const status = latest?.status ?? project.status;
  const roadmap = effectiveRoadmap(project, logs);
  const blockedDays = logs.filter((log) => log.blocked).length;
  const delta = progressDelta(logs);

  return (
    <section className="pm-detail card" aria-label={`${project.name} 项目详情`}>
      <div className="pm-detail__head">
        <div>
          <p className="eyebrow">{project.category} / {project.priority}</p>
          <h2>{project.name}</h2>
          <p className="pm-lead">{project.summary}</p>
        </div>
        <div className="pm-detail__meta">
          <span className={`pm-status ${statusClass(status)}`}>{status}</span>
          <ProjectRepository project={project} />
        </div>
      </div>

      <div className="pm-detail__grid pm-detail__grid--four">
        <article className="pm-info-block"><span>当前进度</span><strong>{progress}%</strong></article>
        <article className="pm-info-block"><span>近 7 日变化</span><strong>{delta >= 0 ? "+" : ""}{delta}%</strong></article>
        <article className="pm-info-block"><span>累计日报</span><strong>{logs.length} 篇</strong></article>
        <article className="pm-info-block"><span>阻塞日报</span><strong>{blockedDays} 天</strong></article>
        <article className="pm-info-block"><span>当前阶段</span><strong>{latest?.stage ?? "尚未通过日报登记"}</strong></article>
        <article className="pm-info-block"><span>目标日期</span><strong>{formatDate(project.targetDate)}</strong></article>
        <article className="pm-info-block pm-info-block--wide"><span>下一步行动</span><strong>{latest?.nextFocus ?? "请在最新日报的明日首要任务中填写"}</strong></article>
      </div>

      <div className="pm-progress" aria-label={`项目进度 ${progress}%`}>
        <div className="pm-progress__label"><span>最新项目进度</span><strong>{progress}%</strong></div>
        <div className="pm-progress__track"><i style={{ width: `${progress}%` }} /></div>
      </div>

      <ProgressChart logs={logs} projectName={project.name} />

      <div className="pm-section-grid">
        <section>
          <div className="pm-subhead"><p className="eyebrow">Roadmap</p><h3>里程碑状态</h3></div>
          <div className="pm-roadmap">
            {roadmap.map((item) => (
              <article className="pm-roadmap__item" key={item.id}>
                <span className={`pm-roadmap__dot ${statusClass(item.status)}`} />
                <div>
                  <div className="pm-roadmap__title"><strong>{item.id} · {item.title}</strong><span className={`pm-status ${statusClass(item.status)}`}>{item.status}</span></div>
                  <p>{item.description}</p>
                  {item.date ? <small>最近状态更新 {formatDate(item.date)}</small> : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="pm-subhead"><p className="eyebrow">Daily State</p><h3>阶段变化记录</h3></div>
          <div className="pm-stage-list">
            {[...logs].reverse().slice(0, 8).map((log) => (
              <article className="pm-stage-item" key={log.sourcePath}>
                <div><strong>{log.stage}</strong><span>{formatDate(log.date)} · {log.workHours} 小时</span></div>
                <div><b>{log.progress}%</b><span className={`pm-status ${log.blocked ? "is-risk" : statusClass(log.status)}`}>{log.blocked ? "有阻塞" : log.status}</span></div>
              </article>
            ))}
            {logs.length === 0 ? <p className="muted">创建第一篇项目日报后会自动出现阶段记录。</p> : null}
          </div>

          <div className="pm-subhead pm-subhead--spaced"><p className="eyebrow">Issues</p><h3>当前问题</h3></div>
          {project.issues.length > 0 ? <div className="pm-stage-list">{project.issues.map((issue) => (
            <article className="pm-stage-item" key={issue.title}>
              <div><strong>{issue.title}</strong><span>{issue.note || "说明待补充"}</span></div>
              <span className={`pm-status ${statusClass(issue.status)}`}>{issue.status}</span>
            </article>
          ))}</div> : <p className="muted">暂无登记问题。</p>}

          <div className="pm-subhead pm-subhead--spaced"><p className="eyebrow">Attention</p><h3>注意事项</h3></div>
          {project.attention.length > 0 ? <ol className="pm-list">{project.attention.map((item) => <li key={item}>{item}</li>)}</ol> : <p className="muted">暂无注意事项。</p>}
        </section>
      </div>

      <footer className="pm-detail__footer">
        <span>本地路径</span><code>{project.localPath || "待补充"}</code>
        <span>最新日报 {latest ? formatDate(latest.date) : "暂无"}</span>
        <span>配置文件</span><code>{project.sourcePath}</code>
      </footer>
    </section>
  );
}

export function WorkspacePage() {
  const categories: { id: ProjectCategory; label: string; note: string }[] = [
    { id: "竞赛", label: "竞赛", note: "方案、实现、联调与提交" },
    { id: "论文", label: "论文", note: "研究、实验、写作与投稿" },
    { id: "专利", label: "专利", note: "交底、申请文件与审查" },
    { id: "学习", label: "学习", note: "计划、练习、测试与复盘" },
  ];
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const selectedProject = projects.find((project) => project.id === selectedProjectId);
  const activeProjects = projects.filter((project) => currentStatus(project) === "进行中").length;
  const blockedProjects = projects.filter((project) => currentStatus(project) === "阻塞" || latestLogForProject(project.id)?.blocked).length;
  const averageProgress = projects.length === 0 ? 0 : Math.round(projects.reduce((sum, project) => sum + currentProgress(project), 0) / projects.length);
  const latestDate = dailyLogs[0]?.date;
  const categoryProjects = selectedCategory ? projects.filter((project) => project.category === selectedCategory) : [];

  function openCategory(category: ProjectCategory) {
    setSelectedCategory(category);
    setSelectedProjectId("");
  }

  function backToCategories() {
    setSelectedCategory(null);
    setSelectedProjectId("");
  }

  function backToProjects() {
    setSelectedProjectId("");
  }

  return (
    <main className="page page--blogspace pm-page">
      <section className="pm-hero card">
        <div><p className="eyebrow">Project Workspace</p><h1>{workspace.name}</h1><p className="pm-lead">{workspace.description}</p></div>
        <div className="pm-hero__focus"><span>当前重点</span><strong>{workspace.currentFocus}</strong><small>{latestDate ? `最近日报 ${formatDate(latestDate)}` : "尚无项目日报"}</small></div>
      </section>

      <section className="pm-metrics">
        <MetricCard label="项目总数" value={projects.length} note="竞赛、论文、专利与学习" />
        <MetricCard label="进行中" value={activeProjects} note="取自项目最新日报" />
        <MetricCard label="存在阻塞" value={blockedProjects} note="最新日报标记 blocked" />
        <MetricCard label="平均进度" value={`${averageProgress}%`} note="按各项目最新进度计算" />
      </section>

      {!selectedCategory ? (
        <section className="section">
          <div className="section__head"><div><p className="eyebrow">Categories</p><h2>项目进度总览</h2></div><span className="section__index">01</span></div>
          <div className="pm-category-grid">
            {categories.map((category) => {
              const items = projects.filter((project) => project.category === category.id);
              const progress = items.length === 0 ? 0 : Math.round(items.reduce((sum, project) => sum + currentProgress(project), 0) / items.length);
              const logs = items.flatMap((project) => logsForProject(project.id));
              return (
                <button className="pm-category-card card" type="button" key={category.id} onClick={() => openCategory(category.id)}>
                  <div className="pm-category-card__top"><span>{String(items.length).padStart(2, "0")} 个项目</span><strong>{progress}%</strong></div>
                  <h3>{category.label}</h3>
                  <p>{category.note}</p>
                  <div className="pm-progress__track"><i style={{ width: `${progress}%` }} /></div>
                  <small>{logs.length} 篇项目日报</small>
                </button>
              );
            })}
          </div>
        </section>
      ) : selectedProject ? (
        <section className="pm-workspace-level">
          <div className="pm-breadcrumb card"><button type="button" onClick={backToCategories}>项目总览</button><span>/</span><button type="button" onClick={backToProjects}>{selectedCategory}</button><span>/</span><strong>{selectedProject.name}</strong></div>
          <ProjectDetail project={selectedProject} />
        </section>
      ) : (
        <section className="section pm-workspace-level">
          <div className="pm-breadcrumb card"><button type="button" onClick={backToCategories}>项目总览</button><span>/</span><strong>{selectedCategory}</strong></div>
          <div className="section__head"><div><p className="eyebrow">{selectedCategory}</p><h2>{selectedCategory}项目</h2></div><span className="section__index">02</span></div>
          <div className="pm-project-grid">
            {categoryProjects.map((project) => {
              const logs = logsForProject(project.id);
              const latest = logs.at(-1);
              const progress = latest?.progress ?? project.initialProgress;
              const status = latest?.status ?? project.status;
              return (
                <article className="pm-project-card card" key={project.id}>
                  <button type="button" onClick={() => setSelectedProjectId(project.id)}>
                    <div className="pm-project-card__top"><span className={`pm-status ${latest?.blocked ? "is-risk" : statusClass(status)}`}>{latest?.blocked ? "有阻塞" : status}</span><strong>{progress}%</strong></div>
                    <h3>{project.name}</h3>
                    <p>{project.summary}</p>
                    <ProgressSparkline points={logs.map((log) => ({ date: log.date, progress: log.progress }))} />
                    <div className="pm-progress__track"><i style={{ width: `${progress}%` }} /></div>
                    <small>{latest?.nextFocus ?? "创建第一篇 Markdown 日报"}</small>
                  </button>
                  <ProjectRepository project={project} />
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

function LogSection({ title, items, emptyText }: { title: string; items: string[]; emptyText: string }) {
  return <section className="pm-log-section"><h4>{title}</h4>{items.length > 0 ? <ol className="pm-list">{items.map((item) => <li key={item}>{item}</li>)}</ol> : <p className="muted">{emptyText}</p>}</section>;
}

function TomorrowPromptBox({ entry, projectName }: { entry: ProjectDailyLog; projectName: string }) {
  const [copied, setCopied] = useState(false);
  const prompt = entry.tomorrowPrompt || [
    `我明天需要继续推进项目：${projectName}。`,
    `当前阶段：${entry.stage}，当前进度：${entry.progress}%。`,
    `今天完成：${entry.completed.join("；") || "暂无"}。`,
    `当前问题：${entry.issues.join("；") || "暂无"}。`,
    `明日计划：${entry.tomorrow.join("；") || "待补充"}。`,
    `明日首要任务：${entry.nextFocus}。`,
    "请根据以上信息，给出明日工作的执行顺序、验收标准、风险检查点和结束时应记录的内容。",
  ].join("\n");

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="pm-tomorrow-prompt">
      <div className="pm-tomorrow-prompt__head"><div><span>明日提示词</span><strong>用于开启下一天的项目对话</strong></div><button type="button" onClick={copyPrompt}>{copied ? "已复制" : "复制"}</button></div>
      <textarea readOnly value={prompt} aria-label="明日提示词" />
    </section>
  );
}

export function DailyLogPage() {
  const dates = [...new Set(dailyLogs.map((log) => log.date))].sort((left, right) => right.localeCompare(left));
  const [selectedDate, setSelectedDate] = useState(dates[0] ?? "");
  const selectedLogs = dailyLogs.filter((log) => log.date === selectedDate);
  const projectMap = useMemo(() => new Map(projects.map((project) => [project.id, project])), []);
  const totalHours = selectedLogs.reduce((sum, log) => sum + log.workHours, 0);

  if (!selectedDate) {
    return <main className="page pm-page"><section className="card pm-empty"><h1>每日记录</h1><p>请在 src/data/projects/项目ID/daily 中增加第一篇 Markdown 日报。</p></section></main>;
  }

  return (
    <main className="page page--blogspace pm-page daily-log-page">
      <section className="pm-hero card">
        <div><p className="eyebrow">Daily Project Report</p><h1>每日项目日报</h1><p className="pm-lead">同一天的不同项目分别保存在独立 Markdown 文件中，页面按日期自动汇总。</p></div>
        <div className="pm-hero__focus"><span>当前日期</span><strong>{formatDate(selectedDate)}</strong><small>{selectedLogs.length} 个项目 · {totalHours} 小时</small></div>
      </section>

      <section className="pm-log-layout">
        <aside className="pm-log-index card">
          <p className="eyebrow">Archive</p><h3>日报日期</h3>
          <div className="pm-log-index__list">
            {dates.map((date) => {
              const dateLogs = dailyLogs.filter((log) => log.date === date);
              return <button className={date === selectedDate ? "is-active" : ""} type="button" key={date} onClick={() => setSelectedDate(date)}><strong>{formatDate(date)}</strong><span>{dateLogs.length} 个项目日报</span></button>;
            })}
          </div>
        </aside>

        <div className="pm-log-content">
          {selectedLogs.map((entry) => {
            const project = projectMap.get(entry.projectId);
            return (
              <article className="pm-log-card card" key={entry.sourcePath}>
                <div className="pm-log-card__head">
                  <div><p className="eyebrow">{entry.stage} / {entry.progress}%</p><h3>{project?.name ?? entry.projectId}</h3><p>{entry.title}</p></div>
                  <div className="pm-log-card__actions"><span className={`pm-status ${entry.blocked ? "is-risk" : statusClass(entry.status)}`}>{entry.blocked ? "有阻塞" : entry.status}</span>{project ? <ProjectRepository project={project} /> : null}</div>
                </div>
                <div className="pm-log-meta"><span>工作时长 {entry.workHours} 小时</span><span>里程碑 {entry.milestone || "未指定"}</span><code>{entry.sourcePath}</code></div>
                <div className="pm-log-card__grid">
                  <LogSection title="今日完成" items={entry.completed} emptyText="没有完成项" />
                  <LogSection title="验证结果" items={entry.results} emptyText="没有验证结果" />
                  <LogSection title="问题与阻塞" items={entry.issues} emptyText="没有新增问题" />
                  <LogSection title="今日决策" items={entry.decisions} emptyText="没有新增决策" />
                  <LogSection title="明日计划" items={entry.tomorrow} emptyText="尚未填写明日计划" />
                  <section className="pm-next-focus"><span>明日首要任务</span><strong>{entry.nextFocus}</strong></section>
                </div>
                <TomorrowPromptBox entry={entry} projectName={project?.name ?? entry.projectId} />
                {entry.notes.length > 0 ? <div className="pm-log-notes"><strong>补充记录</strong><ol className="pm-list">{entry.notes.map((note) => <li key={note}>{note}</li>)}</ol></div> : null}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

type TimelineEvent = {
  id: string;
  date: string;
  type: "项目日报" | "里程碑";
  title: string;
  description: string;
  projectName: string;
  progress?: number;
};

export function TimelinePage() {
  const projectMap = useMemo(() => new Map(projects.map((project) => [project.id, project])), []);
  const events = useMemo<TimelineEvent[]>(() => {
    const logEvents = dailyLogs.map((log) => ({
      id: log.sourcePath,
      date: log.date,
      type: "项目日报" as const,
      title: log.title,
      description: log.completed[0] ?? log.nextFocus,
      projectName: projectMap.get(log.projectId)?.name ?? log.projectId,
      progress: log.progress,
    }));
    const milestoneEvents = projects.flatMap((project) => project.roadmap.filter((milestone) => milestone.date).map((milestone) => ({
      id: `milestone-${project.id}-${milestone.id}-${milestone.date}`,
      date: milestone.date as string,
      type: "里程碑" as const,
      title: `${milestone.id} · ${milestone.title}`,
      description: milestone.description,
      projectName: project.name,
    })));
    return [...logEvents, ...milestoneEvents].sort((left, right) => right.date.localeCompare(left.date));
  }, [projectMap]);

  return (
    <main className="page page--blogspace pm-page">
      <section className="pm-hero card">
        <div><p className="eyebrow">Project Timeline</p><h1>项目时间线</h1><p className="pm-lead">每个 Markdown 日报都是一个项目时间点，进度和阶段变化可以完整追溯。</p></div>
        <div className="pm-hero__focus"><span>累计日报</span><strong>{dailyLogs.length}</strong><small>{new Set(dailyLogs.map((log) => log.date)).size} 个工作日</small></div>
      </section>

      <section className="pm-timeline card">
        {events.length > 0 ? events.map((event) => (
          <article className="pm-timeline__item" key={event.id}>
            <div className="pm-timeline__date"><strong>{formatDate(event.date)}</strong><span>{event.type}</span></div>
            <span className="pm-timeline__dot" />
            <div className="pm-timeline__content"><p className="eyebrow">{event.projectName}{event.progress === undefined ? "" : ` / ${event.progress}%`}</p><h3>{event.title}</h3><p>{event.description}</p></div>
          </article>
        )) : <div className="pm-empty"><p>暂无时间线事件。</p></div>}
      </section>
    </main>
  );
}
