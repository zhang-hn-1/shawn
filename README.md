# Shawn Markdown Project Workspace

一个由 Markdown 文件驱动的个人主页、项目工作台、每日项目日报和项目进度可视化网站。

网站的主要内容统一保存在 `src/data` 目录中。后续维护项目、日报、博客、公开项目展示和个人信息时，不需要修改 TypeScript、CSS 或 JSON，只需要新增或修改对应的 Markdown 文件，然后提交到 GitHub。

## 私人电影回忆页

当前项目还包含一个不出现在主导航中的情侣回忆页面：

```text
/#/our-film
```

它是一部可滚动观看的私人电影，包含片头、序幕、初识、聊天、地点、普通日子、视频占位、长信、现在和未完待续片尾。进入前需要依次输入两组生日密码。密码只用于纪念体验，不是安全认证；静态前端中的密码最终都会随代码发送到浏览器，真正部署时建议同时使用 GitHub Pages / Cloudflare / Vercel 的访问保护。

### 启动与构建

```bash
npm install
npm run dev
npm run build
```

### 回忆内容在哪里修改

| 内容 | 修改文件或目录 |
| --- | --- |
| 全站标题、开始日期、密码、音乐开关 | `src/data/site-config.ts` |
| 照片、地点、日期、说明 | `src/data/memories.ts` |
| 重要聊天句子 | `src/data/chats.ts` |
| 长信正文 | `src/data/letter.ts` |
| 章节标题与导航 | `src/data/chapters.ts` |
| 照片文件 | `public/images/cover/`、`first-meeting/`、`places/`、`ordinary/`、`current/` |
| 视频文件 | `public/videos/`，再在 `src/data/memories.ts` 填写 `src` |
| 音频文件 | `public/audio/our-story.mp3`，默认不自动播放 |

替换照片时，只需要把新图片放入对应目录，再修改 `memories.ts` 的 `src`、`alt`、日期、地点和说明。页面支持横向、竖向和方形照片，并会延迟加载非首屏图片。点击照片可以进入全屏查看，支持关闭、上一张、下一张、方向键和 ESC。

### 密码配置

复制 `.env.example` 为 `.env.local`，然后修改：

```text
VITE_MEMORY_PASSWORD_ONE=0722
VITE_MEMORY_PASSWORD_TWO=0627
```

如果没有 `.env.local`，页面会使用 `src/data/site-config.ts` 中的默认值。不要把 `.env.local` 提交到 Git。由于这是纯前端密码门，请勿把它当作保护敏感资料的真正认证系统。

### 图片、视频和音乐建议

- 首屏建议使用 2.39:1 或横向大图，推荐宽度 1600px 以上。
- 竖图建议长边 1400px 左右，上传前优先压缩为 WebP 或 AVIF。
- 视频默认静音、不会自动播放；移动端建议控制在 20MB 以内。
- 音频必须由用户主动点击右上角 `SOUND OFF` 后播放，浏览器不会被声音打扰。
- 目前没有接入评论、广告、统计或第三方公开内容。

### 隐私与部署

页面已经添加 `noindex, nofollow, noarchive`，但这只能降低搜索引擎收录概率，不能阻止知道地址的人访问。部署私人照片前，建议使用部署平台的密码保护、团队访问控制或反向代理认证；不要把包含身份证号、手机号或精确住址的文件名放入 `public`。

网站沿用当前项目的 Vite + React 架构，可直接部署到 GitHub Pages、Vercel、Netlify 或静态文件服务器。部署前运行 `npm run build`，将 `dist/` 作为发布目录。

---

## 一、主要功能

网站包含以下页面：

- 首页
- 关于
- 博客
- 公开项目展示
- 学习
- 工作台
- 每日记录
- 项目时间线

项目工作台支持：

- 竞赛、论文、专利、学习四级分类
- 项目列表和项目详情
- 当前阶段与项目状态
- 项目总体进度
- 项目进度折线图
- 最近七日进度变化
- 项目里程碑
- 问题与阻塞项
- GitHub 仓库入口
- 本地目录记录
- 每日项目记录
- 明日计划和明日提示词
- 全部项目时间线

---

## 二、技术栈

- React 18
- TypeScript
- Vite
- React Router
- Markdown 内容驱动
- GitHub Pages 自动部署

---

## 三、项目目录

```text
shawn-project-management/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docs/
│   ├── MARKDOWN_DATA_GUIDE.md
│   └── templates/
│       ├── ABOUT_TEMPLATE.md
│       ├── BLOG_TEMPLATE.md
│       ├── SHOWCASE_TEMPLATE.md
│       ├── PROJECT_CONFIG_TEMPLATE.md
│       └── DAILY_LOG_TEMPLATE.md
├── scripts/
│   ├── new-project.mjs
│   ├── new-daily-log.mjs
│   ├── new-blog.mjs
│   └── new-showcase.mjs
├── src/
│   ├── data/
│   │   ├── about/
│   │   │   └── profile.md
│   │   ├── blogs/
│   │   │   └── *.md
│   │   ├── showcases/
│   │   │   └── *.md
│   │   └── projects/
│   │       ├── workspace.md
│   │       └── <project-id>/
│   │           ├── project.md
│   │           └── daily/
│   │               └── YYYY-MM-DD.md
│   ├── main.tsx
│   ├── project-management.tsx
│   ├── markdown-data.ts
│   ├── styles.css
│   └── project-management.css
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 四、安装与运行

### 1. 环境要求

建议使用：

```text
Node.js 20 LTS 或 22 LTS
npm 10.x
```

查看当前版本：

```powershell
node -v
npm -v
```

### 2. Windows PowerShell

```powershell
cd D:\shawn_web

npm config set registry https://registry.npmjs.org

npm ci --no-audit --no-fund --progress=false

npm run dev
```

启动后访问：

```text
http://localhost:5173
```

### 3. 普通安装

如果当前目录没有 `package-lock.json`，使用：

```powershell
npm install --no-audit --no-fund
npm run dev
```

### 4. 生产构建

```powershell
npm run build
npm run preview
```

生产文件位于：

```text
dist/
```

---

## 五、Markdown 数据目录

网站内容与 Markdown 文件的对应关系如下。

| Markdown 位置 | 对应功能 |
|---|---|
| `src/data/about/profile.md` | 关于页面 |
| `src/data/blogs/*.md` | 博客列表和博客详情 |
| `src/data/showcases/*.md` | 对外项目展示 |
| `src/data/projects/workspace.md` | 工作台标题、说明和当前重点 |
| `src/data/projects/<project-id>/project.md` | 项目分类、规划、仓库和里程碑 |
| `src/data/projects/<project-id>/daily/*.md` | 每日记录、进度曲线和时间线 |

新增或修改 Markdown 后，开发服务器通常会自动刷新。新建文件没有立即出现时，停止开发服务器并重新执行：

```powershell
npm run dev
```

---

## 六、工作台总配置

文件位置：

```text
src/data/projects/workspace.md
```

示例：

```markdown
---
title: 工作台
subtitle: 个人项目进度、每日记录与长期规划
focus: 完成当前重点项目的阶段性任务
---

# 工作台

用于统一管理竞赛、论文、专利和学习项目。
```

---

## 七、项目配置

每个项目对应一个独立目录：

```text
src/data/projects/<project-id>/
```

目录中必须包含：

```text
project.md
daily/
```

项目配置文件路径：

```text
src/data/projects/<project-id>/project.md
```

完整示例：

```markdown
---
id: rotunbot-sru
name: Rotunbot SRU
category: 论文
status: 进行中
priority: P0
startDate: 2026-07-19
targetDate: 2026-09-30
currentPhase: SRU 接入与训练验证
summary: 将 SRU 时序模块接入四足机器人强化学习框架并完成实验验证。
nextAction: 完成 SRU 训练入口的端到端冒烟测试。
localPath: D:/projects/rotunbot-sru
repositories:
  - name: sru_rotunbot_study
    url: https://github.com/example/sru_rotunbot_study
  - name: legged_gym
    url: https://github.com/example/legged_gym
attention:
  - 必须先导入 isaacgym，再导入 torch
  - 不提交虚拟环境、日志和模型检查点
issues:
  - 需要确认训练入口是否加载 ActorCriticSRULH
milestones:
  - id: M1
    name: 环境搭建
    status: 已完成
  - id: M2
    name: SRU 核心验证
    status: 已完成
  - id: M3
    name: 框架接入
    status: 进行中
  - id: M4
    name: 正式训练
    status: 未开始
---

# Rotunbot SRU

## 项目目标

完成 SRU 模块在强化学习训练框架中的接入、训练、验证和实验整理。

## 总体规划

1. 环境搭建
2. SRU 核心测试
3. Actor-Critic 接入
4. 冒烟训练
5. 正式训练
6. 对比实验
7. 结果整理
```

### 项目分类

目前支持：

```text
竞赛
论文
专利
学习
```

项目会按照 `category` 字段自动进入对应分类。

### 项目状态

建议使用：

```text
规划中
进行中
阻塞
暂停
已完成
已归档
```

### 项目优先级

建议使用：

```text
P0
P1
P2
P3
```

---

## 八、每日项目日报

每个项目每天对应一篇独立 Markdown。

文件位置：

```text
src/data/projects/<project-id>/daily/YYYY-MM-DD.md
```

例如：

```text
src/data/projects/rotunbot-sru/daily/2026-07-22.md
```

完整模板：

```markdown
---
projectId: rotunbot-sru
date: 2026-07-22
title: 完成 SRU 首次训练冒烟测试
stage: 冒烟训练
status: 进行中
progress: 52
workHours: 6
blocked: false
milestone: M3
milestoneStatus: 进行中
---

# Rotunbot SRU 日报

## 今日完成

- 完成训练入口配置检查
- 验证 ActorCriticSRULH 可以被正确实例化
- 完成 64 环境、2 次迭代冒烟测试

## 验证结果

- CUDA 基线：PASS
- SRU 导入：PASS
- 前向传播：PASS
- 反向传播：PASS
- 训练冒烟测试：PASS

## 问题与阻塞

- 正式训练的显存占用尚未评估
- 需要检查长序列训练稳定性

## 今日决策

- 继续保留三个独立仓库
- 使用父工作区统一管理
- 正式训练前先完成小规模稳定性测试

## 明日计划

- 增加训练环境数量
- 检查 GPU 显存占用
- 保存完整训练日志
- 更新项目里程碑状态

## 明日首要任务

完成 SRU 中等规模训练稳定性测试。

## 明日提示词

请根据当前项目阶段、今日完成、问题与阻塞、明日计划和明日首要任务，生成明日工作的执行顺序、验收标准、风险检查点、终端命令检查项和结束时需要记录的内容。

## 补充记录

- 训练日志路径：logs/rotunbot-sru/
- 当前分支：sru-integration
```

---

## 九、项目进度可视化规则

日报 Front Matter 中的：

```yaml
progress: 52
```

表示当天结束时整个项目的总体完成度。

网站会将同一项目的日报按日期排序，并自动生成：

- 当前完成度
- 项目进度条
- 项目进度折线图
- 最近七日进度增量
- 当前项目阶段
- 阶段变化历史
- 累计日报数量
- 阻塞日报数量
- 里程碑状态
- 项目时间线

### 进度填写原则

进度不能按照日报数量自动增加，也不能因为工作时间长就直接增加。

建议按里程碑验收情况填写：

```text
0 到 10：项目规划和资料准备
10 到 25：环境与基础工作
25 到 45：核心模块实现
45 到 65：系统接入和初步验证
65 到 80：正式实验和修正
80 到 95：结果整理和文档
95 到 100：最终检查、提交和归档
```

例如：

```text
昨天完成度：45
今天完成核心接入并通过冒烟测试
今天完成度：52
```

不建议为了让曲线好看而虚增进度。

### 阻塞状态

```yaml
blocked: true
```

表示当天项目存在无法继续推进的阻塞项。

```yaml
blocked: false
```

表示当天没有实质性阻塞。

---

## 十、明日提示词

每篇日报都可以填写：

```markdown
## 明日提示词
```

该内容会在每日记录页面中显示为独立提示框，并支持复制。

推荐格式：

```markdown
## 明日提示词

你是一名熟悉当前项目技术栈的项目执行助手。请根据以下内容带领我完成明日工作：

1. 当前阶段
2. 当前完成度
3. 今日完成
4. 当前问题与阻塞
5. 明日计划
6. 明日首要任务

请输出：

1. 明日任务执行顺序
2. 每项任务的验收标准
3. 需要检查的文件、日志或命令
4. 可能出现的风险
5. 出现问题时的排查顺序
6. 明日结束后应记录的项目日报内容
```

如果日报中没有手工填写明日提示词，网站会根据当前日报内容自动生成基础提示词。

---

## 十一、博客

博客文件位置：

```text
src/data/blogs/*.md
```

示例：

```markdown
---
id: sru-project-review
title: Rotunbot SRU 项目阶段复盘
category: 项目复盘
date: 2026-07-22
tags:
  - SRU
  - 强化学习
  - 四足机器人
excerpt: 记录 SRU 模块从核心验证到强化学习框架接入的过程。
---

# Rotunbot SRU 项目阶段复盘

## 项目背景

介绍项目来源、目标和要解决的问题。

## 核心工作

说明已经完成的技术工作。

## 验证结果

列出关键实验、测试和结果。

## 问题与反思

记录项目过程中出现的问题及后续改进方向。
```

一个 Markdown 文件对应一篇博客。

删除博客时，删除对应 Markdown 文件即可。

---

## 十二、公开项目展示

公开项目文件位置：

```text
src/data/showcases/*.md
```

示例：

```markdown
---
id: smart-car-project
title: 全国大学生智能车竞赛项目
status: 已完成
summary: 围绕感知、路径规划、控制与现场调试完成智能车系统开发。
tags:
  - 智能车
  - 控制
  - 机器视觉
  - 嵌入式
---

# 全国大学生智能车竞赛项目

## 项目背景

说明竞赛背景和任务目标。

## 我的工作

说明个人承担的核心工作。

## 技术方案

介绍系统结构、算法与工程实现。

## 项目结果

列出奖项、性能结果和最终成果。

## 项目收获

总结项目经验和能力提升。
```

公开项目展示用于对外展示成果，不等同于工作台中的内部项目管理记录。

---

## 十三、关于页面

关于页面文件位置：

```text
src/data/about/profile.md
```

示例：

```markdown
---
name: 张航宁
school: 杭州电子科技大学
college: 自动化学院
major: 自动化（新工科实验班）
enrollment: 2024.09 至今
focus:
  - 控制
  - 强化学习
  - 机器人
  - 雷达信号处理
  - 工程实践
email: 24061733@hdu.edu.cn
---

# 张航宁

杭州电子科技大学自动化学院自动化专业本科生，主要关注控制、强化学习、机器人、雷达信号处理与工程实践。

## 教育经历

- 2024.09 至今，杭州电子科技大学，自动化（新工科实验班）

## 研究与项目方向

- 控制系统与强化学习
- 机器人感知、规划与控制
- 雷达信号处理与目标识别
- 智能系统工程实现

## 代表性经历

- 大一学年专业综合测评第一
- 第一作者国际会议论文一篇
- 主持国家级大学生创新训练项目
- 全国大学生智能车竞赛全国一等奖
- 浙江省大学生数学建模竞赛二等奖
- 华为 HCIA-AI-solution 工程师认证
```

关于页面用于对外展示，内容应精炼、正式，不写项目管理方法或解释性废话。

---

## 十四、常用命令

### 新建项目

```powershell
npm run project:new -- project-id "项目名称" 论文
```

例如：

```powershell
npm run project:new -- radar-detection "雷达目标检测" 论文
```

自动生成：

```text
src/data/projects/radar-detection/project.md
src/data/projects/radar-detection/daily/
```

### 新建日报

```powershell
npm run log:new -- project-id 2026-07-22
```

例如：

```powershell
npm run log:new -- rotunbot-sru 2026-07-22
```

不填写日期时，默认使用当天日期：

```powershell
npm run log:new -- rotunbot-sru
```

### 新建博客

```powershell
npm run blog:new -- article-id 2026-07-22
```

例如：

```powershell
npm run blog:new -- sru-project-review 2026-07-22
```

### 新建公开项目展示

```powershell
npm run showcase:new -- showcase-id
```

例如：

```powershell
npm run showcase:new -- smart-car-project
```

---

## 十五、每日使用流程

### 开始工作前

1. 打开工作台
2. 查看当前项目阶段和进度
3. 查看昨天的明日计划
4. 确定今日首要任务
5. 检查是否存在阻塞项

### 完成工作后

1. 在对应项目的 `daily` 目录中新建当日日报
2. 填写今日完成
3. 填写验证结果
4. 记录问题与阻塞
5. 记录关键决策
6. 填写项目总体进度
7. 填写明日计划
8. 填写明日首要任务
9. 填写明日提示词
10. 提交到 GitHub

推荐 Git 提交流程：

```powershell
git pull --rebase

git add src/data

git commit -m "docs(log): add project records for 2026-07-22"

git push
```

---

## 十六、Git 提交规范

推荐使用明确的 Commit 信息。

```text
docs(log): add daily record for 2026-07-22
docs(project): update radar paper roadmap
docs(blog): add SRU project review
docs(showcase): add smart car project
feat(workspace): improve progress visualization
fix(markdown): correct daily log parser
style(workspace): adjust project card layout
```

不建议使用：

```text
xigai
cc
test
可用版本
```

---

## 十七、GitHub Pages 部署

项目已经包含 GitHub Actions 工作流：

```text
.github/workflows/deploy.yml
```

将代码推送到 GitHub 的 `main` 分支后，会自动执行：

1. 安装依赖
2. 构建项目
3. 上传 `dist`
4. 部署到 GitHub Pages

首次部署时，在 GitHub 仓库中进入：

```text
Settings → Pages → Source → GitHub Actions
```

然后推送代码：

```powershell
git add .
git commit -m "feat: add markdown project workspace"
git push
```

---

## 十八、公开内容安全

如果仓库是公开仓库，所有 Markdown 都应视为公开内容。

不要提交：

- 账号和密码
- API Token
- SSH 私钥
- 云服务器密码
- 未公开专利核心细节
- 未发表论文的保密数据
- 合作者隐私信息
- 未脱敏的实验数据
- 本地敏感路径

建议公开仓库只保存可公开内容，敏感记录放入私人仓库。

---

## 十九、常见问题

### 1. `vite` 不是内部或外部命令

原因是依赖没有安装成功。

执行：

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm ci --no-audit --no-fund --progress=false
npm run dev
```

### 2. `npm ci` 提示找不到 `package-lock.json`

确认当前目录是否同时存在：

```text
package.json
package-lock.json
src
```

执行：

```powershell
Get-ChildItem package.json, package-lock.json
```

如果锁文件确实不存在，执行：

```powershell
npm install --no-audit --no-fund
npm run dev
```

### 3. npm 下载超时

确认 npm 源：

```powershell
npm config get registry
```

设置为官方源：

```powershell
npm config set registry https://registry.npmjs.org
```

或者使用国内镜像：

```powershell
npm config set registry https://registry.npmmirror.com
```

### 4. 新建 Markdown 后页面没有出现

停止开发服务器：

```text
Ctrl + C
```

重新启动：

```powershell
npm run dev
```

### 5. 项目没有出现在对应分类

检查 `project.md` 中：

```yaml
category: 论文
```

分类必须是：

```text
竞赛
论文
专利
学习
```

### 6. 项目进度图没有变化

检查日报 Front Matter 是否包含：

```yaml
projectId: rotunbot-sru
date: 2026-07-22
progress: 52
```

同时确认：

- `projectId` 与项目目录和 `project.md` 中的 ID 一致
- 日期格式为 `YYYY-MM-DD`
- `progress` 是 0 到 100 的数字

### 7. Markdown 格式错误

Front Matter 必须使用三条短横线包围：

```markdown
---
title: 示例
---
```

缩进列表时使用两个空格：

```yaml
repositories:
  - name: example
    url: https://github.com/example/example
```

---

## 二十、维护原则

1. 项目长期规划写在 `project.md`
2. 每天实际进展写在独立日报中
3. 项目进度以当天结束时的真实状态为准
4. 问题、决策和阻塞必须长期保留
5. 明日计划必须能够直接转化成执行任务
6. 公开展示与内部项目管理分开
7. 所有重要变化通过 Git Commit 留下历史

---

## 二十一、模板文件

可直接复制以下模板：

```text
docs/templates/ABOUT_TEMPLATE.md
docs/templates/BLOG_TEMPLATE.md
docs/templates/SHOWCASE_TEMPLATE.md
docs/templates/PROJECT_CONFIG_TEMPLATE.md
docs/templates/DAILY_LOG_TEMPLATE.md
```

也可以使用 `npm run project:new`、`npm run log:new`、`npm run blog:new` 和 `npm run showcase:new` 自动创建。
