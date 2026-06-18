# 政治题库在线刷题系统 MVP

这是一个可直接交付使用的纯前端刷题系统。

## 文件说明

```text
index.html          主页面
style.css           页面样式
app.js              刷题逻辑
data/
  single_choice.json    单选题数据
  multiple_choice.json  多选题数据
  true_false.json       判断题数据
  all_questions.json    全量题库
  chapters.json         章节统计
  conversion_report.json 转换检查报告
scripts/
  md_to_json.py         Markdown 转 JSON 脚本备份
```

## 使用方法

### 方法一：本地直接打开

双击 `index.html`。如果浏览器因为安全策略无法读取本地 JSON，请使用方法二。

### 方法二：本地启动静态服务

在本目录运行：

```bash
python -m http.server 8000
```

然后浏览器打开：

```text
http://localhost:8000
```

## 当前题库统计

- 总题数：969
- 单选题：398
- 多选题：292
- 判断题：279

## 功能

- 首页统计
- 章节练习
- 随机刷题
- 单选、多选、判断自动判题
- 错题本
- 收藏题
- 搜索题目
- 模拟考试入口
- 本地 localStorage 保存刷题记录

## 注意

刷题记录保存在当前浏览器的 localStorage 中。换电脑或清除浏览器缓存后，记录会丢失。
