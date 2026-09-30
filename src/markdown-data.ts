export type FrontMatterValue = string | number | boolean;

export type MarkdownDocument = {
  path: string;
  metadata: Record<string, FrontMatterValue>;
  body: string;
};

export type AboutProfile = {
  name: string;
  school: string;
  college: string;
  major: string;
  period: string;
  lead: string;
  highlights: { value: string; label: string }[];
  focusAreas: string[];
  education: string[];
  research: string[];
  honors: string[];
};

export type ContentSection = {
  title: string;
  label: string;
  body: string;
};

export type BlogPost = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  excerpt: string;
  sections: ContentSection[];
  sourcePath: string;
};

export type ShowcaseProject = {
  id: string;
  title: string;
  status: string;
  category: string;
  highlight: string;
  role: string;
  advisor: string;
  period: string;
  order: number;
  summary: string;
  tags: string[];
  sections: ContentSection[];
  sourcePath: string;
};

export function parseMarkdownDocument(path: string, raw: string): MarkdownDocument {
  const normalized = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    return { path, metadata: {}, body: normalized.trim() };
  }
  return {
    path,
    metadata: parseFrontMatter(match[1]),
    body: match[2].trim(),
  };
}

export function parseFrontMatter(block: string) {
  const values: Record<string, FrontMatterValue> = {};
  block.split("\n").forEach((line) => {
    if (!line.trim() || line.trim().startsWith("#")) return;
    const separator = line.indexOf(":");
    if (separator < 0) return;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    if (!key) return;
    if (/^-?\d+(\.\d+)?$/.test(rawValue)) values[key] = Number(rawValue);
    else if (/^(true|false)$/i.test(rawValue)) values[key] = rawValue.toLowerCase() === "true";
    else values[key] = stripQuotes(rawValue);
  });
  return values;
}

export function sectionContent(body: string, ...titles: string[]) {
  const sections = splitLevelTwoSections(body);
  for (const title of titles) {
    const value = sections.get(title);
    if (value !== undefined) return value;
  }
  return "";
}

export function listFromSection(body: string, ...titles: string[]) {
  const content = sectionContent(body, ...titles);
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*+]\s+/.test(line))
    .map((line) => line.replace(/^[-*+]\s+/, "").trim())
    .filter(Boolean);
}

export function textFromSection(body: string, ...titles: string[]) {
  const content = sectionContent(body, ...titles);
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !/^[-*+]\s+/.test(line))
    .join(" ")
    .trim();
}

export function splitLevelTwoSections(body: string) {
  const map = new Map<string, string>();
  const matches = [...body.matchAll(/^##\s+(.+)$/gm)];
  matches.forEach((match, index) => {
    const title = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? body.length;
    map.set(title, body.slice(start, end).trim());
  });
  return map;
}

export function contentSections(body: string, fallbackLabel: string): ContentSection[] {
  const sections = splitLevelTwoSections(body);
  return [...sections.entries()].map(([rawTitle, content]) => {
    const [left, ...rest] = rawTitle.split("|").map((item) => item.trim());
    const hasLabel = rest.length > 0;
    return {
      label: hasLabel ? left : fallbackLabel,
      title: hasLabel ? rest.join(" | ") : left,
      body: normalizeSectionBody(content),
    };
  });
}

export function parseTags(value: unknown) {
  return String(value ?? "")
    .split(/[,，|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSectionBody(content: string) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*+]\s+/, "• "))
    .join("\n");
}

function stripQuotes(value: string) {
  return value.replace(/^['"]|['"]$/g, "");
}

const aboutModules = import.meta.glob<string>("./data/about/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const blogModules = import.meta.glob<string>("./data/blogs/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const showcaseModules = import.meta.glob<string>("./data/showcases/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const aboutProfile = loadAboutProfile();
export const blogPosts = loadBlogPosts();
export const showcaseProjects = loadShowcaseProjects();

function loadAboutProfile(): AboutProfile {
  const entry = Object.entries(aboutModules).sort(([a], [b]) => a.localeCompare(b))[0];
  if (!entry) {
    return {
      name: "张航宁",
      school: "杭州电子科技大学",
      college: "自动化学院",
      major: "自动化",
      period: "2024.09 — 至今",
      lead: "主要关注控制、强化学习、机器人、雷达信号处理与工程实践。",
      highlights: [],
      focusAreas: [],
      education: [],
      research: [],
      honors: [],
    };
  }
  const doc = parseMarkdownDocument(entry[0], entry[1]);
  return {
    name: String(doc.metadata.name ?? "张航宁"),
    school: String(doc.metadata.school ?? "杭州电子科技大学"),
    college: String(doc.metadata.college ?? "自动化学院"),
    major: String(doc.metadata.major ?? "自动化"),
    period: String(doc.metadata.period ?? "2024.09 — 至今"),
    lead: String(doc.metadata.lead ?? "主要关注控制、强化学习、机器人、雷达信号处理与工程实践。"),
    highlights: listFromSection(doc.body, "亮点").map((item) => {
      const [value, ...label] = item.split("|").map((part) => part.trim());
      return { value, label: label.join(" | ") };
    }),
    focusAreas: listFromSection(doc.body, "研究方向"),
    education: listFromSection(doc.body, "教育经历"),
    research: listFromSection(doc.body, "科研与项目"),
    honors: listFromSection(doc.body, "竞赛与荣誉"),
  };
}

function loadBlogPosts(): BlogPost[] {
  return Object.entries(blogModules)
    .map(([path, raw]) => {
      const doc = parseMarkdownDocument(path, raw);
      const id = String(doc.metadata.id ?? path.split("/").at(-1)?.replace(/\.md$/, "") ?? "");
      if (!id || !doc.metadata.title) return null;
      const category = String(doc.metadata.category ?? "项目记录");
      return {
        id,
        title: String(doc.metadata.title),
        category,
        tags: parseTags(doc.metadata.tags),
        date: String(doc.metadata.date ?? ""),
        excerpt: String(doc.metadata.excerpt ?? textFromSection(doc.body, "摘要") ?? ""),
        sections: contentSections(doc.body, category).filter((section) => section.title !== "摘要"),
        sourcePath: path.replace(/^\.\//, "src/"),
      } satisfies BlogPost;
    })
    .filter((item): item is BlogPost => Boolean(item))
    .sort((left, right) => right.date.localeCompare(left.date));
}

function loadShowcaseProjects(): ShowcaseProject[] {
  return Object.entries(showcaseModules)
    .map(([path, raw]) => {
      const doc = parseMarkdownDocument(path, raw);
      const id = String(doc.metadata.id ?? path.split("/").at(-1)?.replace(/\.md$/, "") ?? "");
      if (!id || !doc.metadata.title) return null;
      const status = String(doc.metadata.status ?? "进行中");
      return {
        id,
        title: String(doc.metadata.title),
        status,
        category: String(doc.metadata.category ?? ""),
        highlight: String(doc.metadata.highlight ?? ""),
        role: String(doc.metadata.role ?? ""),
        advisor: String(doc.metadata.advisor ?? ""),
        period: String(doc.metadata.period ?? ""),
        order: Number(doc.metadata.order ?? 999),
        summary: String(doc.metadata.summary ?? textFromSection(doc.body, "项目摘要") ?? ""),
        tags: parseTags(doc.metadata.tags),
        sections: contentSections(doc.body, "Project").filter((section) => section.title !== "项目摘要"),
        sourcePath: path.replace(/^\.\//, "src/"),
      } satisfies ShowcaseProject;
    })
    .filter((item): item is ShowcaseProject => Boolean(item))
    .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title, "zh-CN"));
}
