# Markdown 数据目录使用说明

网站的展示内容全部从 `src/data` 下的 Markdown 文件读取。除学习题库外，日常维护不需要修改 TypeScript、CSS 或 JSON。

## 目录

```text
src/data/
├── about/
│   └── profile.md
├── blogs/
│   └── article-id.md
├── showcases/
│   └── project-id.md
└── projects/
    ├── workspace.md
    └── project-id/
        ├── project.md
        └── daily/
            └── YYYY-MM-DD.md
```

## 内容与页面对应关系

| Markdown 位置 | 页面 |
|---|---|
| `src/data/about/profile.md` | 关于 |
| `src/data/blogs/*.md` | 博客列表与文章详情 |
| `src/data/showcases/*.md` | 对外项目展示 |
| `src/data/projects/workspace.md` | 工作台标题与当前重点 |
| `src/data/projects/*/project.md` | 工作台分类、项目卡片和项目详情 |
| `src/data/projects/*/daily/*.md` | 每日记录、进度曲线和时间线 |

## 项目进度计算

每篇项目日报中的 `progress` 表示当天结束时项目总体完成度。网站将同一项目的日报按日期排序并自动生成：

- 当前进度
- 进度折线图
- 最近七日变化
- 当前阶段
- 阻塞日报数量
- 里程碑状态
- 每日记录与时间线

进度不按照日报数量自动增加。

## 新增内容命令

```bash
npm run project:new -- project-id "项目名称" 论文
npm run log:new -- project-id 2026-07-22
npm run blog:new -- article-id 2026-07-22
npm run showcase:new -- showcase-id
```

也可以直接复制 `docs/templates` 中的模板并手工放到对应目录。

## 更新网站

新增或修改 Markdown 后：

```bash
npm run dev
```

开发服务器已经运行时，修改已有文件通常会自动刷新。新建文件后如未立即出现，重启一次开发服务器。

提交到 GitHub 后，GitHub Pages 工作流会重新构建网站。
