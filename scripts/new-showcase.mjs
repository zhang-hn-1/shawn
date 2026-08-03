#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
const root = process.cwd();
const id = process.argv[2];
if (!id) {
  console.error("用法: npm run showcase:new -- <project-id>");
  process.exit(2);
}
const file = path.join(root, "src", "data", "showcases", `${id}.md`);
if (fs.existsSync(file)) {
  console.error(`展示项目已经存在: ${path.relative(root, file)}`);
  process.exit(1);
}
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, `---
id: ${id}
title: 项目名称
status: 进行中
tags: 自动化, 工程实践
summary: 用一两句话概括项目。
---

## Project | 项目目标

填写项目目标。

## Project | 我的工作

填写个人负责内容。

## Project | 实现方式

填写系统方案和实现过程。

## Project | 项目结果

填写可验证的结果和成果。
`, "utf8");
console.log(`已创建: ${path.relative(root, file)}`);
