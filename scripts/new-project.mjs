#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const id = process.argv[2];
const name = process.argv[3];
const category = process.argv[4] ?? "论文";
if (!id || !name) {
  console.error('用法: npm run project:new -- <project-id> "项目名称" [竞赛|论文|专利|学习]');
  process.exit(2);
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
  console.error("project-id 只能使用小写字母、数字和连字符。");
  process.exit(2);
}
if (!["竞赛", "论文", "专利", "学习"].includes(category)) {
  console.error("分类只能是竞赛、论文、专利或学习。");
  process.exit(2);
}
const directory = path.join(root, "src", "data", "projects", id);
const filePath = path.join(directory, "project.md");
if (fs.existsSync(filePath)) {
  console.error(`项目已经存在: ${path.relative(root, filePath)}`);
  process.exit(1);
}
fs.mkdirSync(path.join(directory, "daily"), { recursive: true });
fs.writeFileSync(path.join(directory, "daily", ".gitkeep"), "", "utf8");
fs.writeFileSync(filePath, `---
id: ${id}
name: ${name}
shortName: ${name}
category: ${category}
status: 规划中
priority: P1
initialProgress: 0
repository: 
repositoryLabel: 打开 GitHub
localPath: 待补充
targetDate: 
---

## 项目简介

填写项目目标和范围。

## 注意事项

- 填写需要长期保留的注意事项。

## 里程碑

### M1 | 项目规划 | 未开始

明确目标、范围、任务拆分和验收标准。

### M2 | 核心实施 | 未开始

完成核心工作并保留可验证结果。

### M3 | 总结归档 | 未开始

完成结果整理、文档和归档。

## 当前问题

暂无。
`, "utf8");
console.log(`已创建: ${path.relative(root, filePath)}`);
