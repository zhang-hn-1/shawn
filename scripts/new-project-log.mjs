#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const projectId = process.argv[2];
const date = process.argv[3] ?? new Date().toISOString().slice(0, 10);

if (!projectId) {
  console.error("用法: npm run log:new -- <project-id> [YYYY-MM-DD]");
  process.exit(2);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error("日期必须使用 YYYY-MM-DD 格式。");
  process.exit(2);
}

const projectPath = path.join(root, "src", "data", "projects", projectId, "project.md");
if (!fs.existsSync(projectPath)) {
  const projectsRoot = path.join(root, "src", "data", "projects");
  const available = fs.existsSync(projectsRoot)
    ? fs.readdirSync(projectsRoot, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name)
    : [];
  console.error(`项目不存在: ${projectId}`);
  console.error(`可用项目: ${available.join(", ") || "无"}`);
  process.exit(1);
}

const projectRaw = fs.readFileSync(projectPath, "utf8");
const metadata = Object.fromEntries(
  (projectRaw.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? "")
    .split("\n")
    .map((line) => {
      const index = line.indexOf(":");
      return index < 0 ? null : [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    })
    .filter(Boolean),
);
const milestone = projectRaw.match(/^###\s+([^|\n]+)\s*\|[^\n]+\|\s*(?!已完成)([^|\n]+)/m)?.[1]?.trim() ?? "M1";
const name = metadata.name || projectId;
const status = metadata.status || "进行中";
const progress = metadata.initialProgress || "0";

const directory = path.join(root, "src", "data", "projects", projectId, "daily");
const filePath = path.join(directory, `${date}.md`);
if (fs.existsSync(filePath)) {
  console.error(`日报已经存在: ${path.relative(root, filePath)}`);
  process.exit(1);
}

fs.mkdirSync(directory, { recursive: true });
const content = `---
projectId: ${projectId}
date: ${date}
title: 今日工作标题
stage: 当前项目阶段
status: ${status}
progress: ${progress}
workHours: 0
blocked: false
milestone: ${milestone}
milestoneStatus: 进行中
---

# ${name}日报

## 今日完成
- 

## 验证结果
- 

## 问题与阻塞
- 无

## 今日决策
- 

## 明日计划
- 

## 明日首要任务

## 明日提示词

请根据今日完成、当前问题、明日计划和明日首要任务，生成明日工作的执行顺序、验收标准、风险检查点和结束时应记录的内容。

## 补充记录
- 
`;

fs.writeFileSync(filePath, content, "utf8");
console.log(`已创建: ${path.relative(root, filePath)}`);
