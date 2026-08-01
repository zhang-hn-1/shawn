#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
const root = process.cwd();
const id = process.argv[2];
const date = process.argv[3] ?? new Date().toISOString().slice(0, 10);
if (!id) {
  console.error("用法: npm run blog:new -- <article-id> [YYYY-MM-DD]");
  process.exit(2);
}
const file = path.join(root, "src", "data", "blogs", `${id}.md`);
if (fs.existsSync(file)) {
  console.error(`文章已经存在: ${path.relative(root, file)}`);
  process.exit(1);
}
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, `---
id: ${id}
title: 文章标题
category: 项目复盘
date: ${date}
tags: 标签一, 标签二
excerpt: 用一两句话概括文章内容。
---

## 背景 | 问题背景

填写背景。

## 方法 | 实施过程

填写方法与过程。

## 结果 | 结果与复盘

填写结果与复盘。
`, "utf8");
console.log(`已创建: ${path.relative(root, file)}`);
