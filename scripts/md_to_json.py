from pathlib import Path
import re, json, shutil, zipfile, html
from datetime import datetime

BASE = Path('/mnt/data/politics_md')
OUT = Path('/mnt/data/politics_quiz_mvp')
DATA = OUT / 'data'
SCRIPTS = OUT / 'scripts'
if OUT.exists():
    shutil.rmtree(OUT)
DATA.mkdir(parents=True, exist_ok=True)
SCRIPTS.mkdir(parents=True, exist_ok=True)

TYPE_MAP = {
    '单选题': 'single',
    '多选题': 'multiple',
    '判断题': 'true_false'
}

def split_options(question_text: str):
    """Split stem and options from a Chinese multiple-choice question block."""
    q = question_text.strip()
    # Find option markers at line starts: A、 B. C． etc. Use multiline.
    matches = list(re.finditer(r'(?m)^([A-Z])\s*[、\.．]\s*', q))
    if not matches:
        return q, []
    stem = q[:matches[0].start()].strip()
    options = []
    for i, m in enumerate(matches):
        key = m.group(1)
        start = m.end()
        end = matches[i+1].start() if i+1 < len(matches) else len(q)
        text = q[start:end].strip()
        # collapse accidental excessive whitespace but keep normal Chinese punctuation
        text = re.sub(r'\s+', ' ', text).strip()
        options.append({'key': key, 'text': text})
    return stem, options

def normalize_answer(ans: str, qtype: str):
    ans = ans.strip().replace('，', '').replace(',', '').replace('、', '').replace(' ', '')
    if qtype == '判断题':
        if ans in ('对', '正确', 'A'):
            return ['A'], '对'
        if ans in ('错', '错误', 'B'):
            return ['B'], '错'
        return [ans], ans
    # ABCD -> [A,B,C,D]
    return list(ans), ans

def parse_md_file(path: Path):
    text = path.read_text(encoding='utf-8')
    chapter = path.stem
    questions = []
    pattern = re.compile(r'^###\s+(\d+)\.\s*(单选题|多选题|判断题)\s*$', re.M)
    matches = list(pattern.finditer(text))
    for idx, m in enumerate(matches):
        block_start = m.start()
        block_end = matches[idx+1].start() if idx+1 < len(matches) else len(text)
        block = text[block_start:block_end]
        head_num = int(m.group(1))
        head_type = m.group(2)
        type_m = re.search(r'\*\*题型：\*\*\s*(\S+)', block)
        num_m = re.search(r'\*\*题号：\*\*\s*(\d+)', block)
        q_m = re.search(r'\*\*题目：\*\*\s*(.*?)\s*\*\*答案：\*\*', block, re.S)
        a_m = re.search(r'\*\*答案：\*\*\s*([^\n\r]+)', block)
        if not (q_m and a_m):
            print('WARN: failed parse', path.name, head_num)
            continue
        qtype = type_m.group(1).strip() if type_m else head_type
        number = int(num_m.group(1)) if num_m else head_num
        raw_question = q_m.group(1).strip()
        raw_answer = a_m.group(1).strip()
        if qtype == '判断题':
            stem = re.sub(r'\s+', ' ', raw_question).strip()
            options = [{'key': 'A', 'text': '对'}, {'key': 'B', 'text': '错'}]
        else:
            stem, options = split_options(raw_question)
            stem = re.sub(r'\s+', ' ', stem).strip()
        answer, answer_text = normalize_answer(raw_answer, qtype)
        q = {
            'id': f'{chapter}-{number:03d}',
            'chapter': f'第{chapter}章',
            'chapter_index': int(chapter),
            'number': number,
            'type': qtype,
            'type_key': TYPE_MAP.get(qtype, qtype),
            'stem': stem,
            'options': options,
            'answer': answer,
            'answer_text': answer_text,
            'source_file': path.name
        }
        questions.append(q)
    return questions

files = sorted(BASE.glob('[0-9]*.md'), key=lambda p: int(p.stem))
all_questions = []
for p in files:
    all_questions.extend(parse_md_file(p))

single = [q for q in all_questions if q['type'] == '单选题']
multiple = [q for q in all_questions if q['type'] == '多选题']
true_false = [q for q in all_questions if q['type'] == '判断题']

# Basic checks
problems = []
for q in all_questions:
    if q['type'] in ('单选题', '多选题') and not q['options']:
        problems.append({'id': q['id'], 'issue': 'choice question has no options'})
    opt_keys = {o['key'] for o in q['options']}
    for a in q['answer']:
        if a not in opt_keys:
            problems.append({'id': q['id'], 'issue': f'answer {a} not in options {sorted(opt_keys)}'})

for name, data in [
    ('single_choice.json', single),
    ('multiple_choice.json', multiple),
    ('true_false.json', true_false),
    ('all_questions.json', all_questions),
]:
    (DATA / name).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

chapters = []
for ci in sorted({q['chapter_index'] for q in all_questions}):
    qs = [q for q in all_questions if q['chapter_index'] == ci]
    chapters.append({
        'chapter': f'第{ci}章',
        'chapter_index': ci,
        'total': len(qs),
        'single_choice': len([q for q in qs if q['type'] == '单选题']),
        'multiple_choice': len([q for q in qs if q['type'] == '多选题']),
        'true_false': len([q for q in qs if q['type'] == '判断题']),
    })
(DATA / 'chapters.json').write_text(json.dumps(chapters, ensure_ascii=False, indent=2), encoding='utf-8')

report = {
    'generated_at': datetime.now().isoformat(timespec='seconds'),
    'total': len(all_questions),
    'single_choice': len(single),
    'multiple_choice': len(multiple),
    'true_false': len(true_false),
    'chapters': chapters,
    'problems': problems,
}
(DATA / 'conversion_report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')

# Frontend files
(OUT / 'index.html').write_text(r'''<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>政治题库在线刷题系统</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">政</div>
        <div>
          <h1>政治刷题通</h1>
          <p>章节练习 · 错题强化 · 模拟考试</p>
        </div>
      </div>
      <nav class="nav">
        <button class="nav-btn active" data-page="home">首页</button>
        <button class="nav-btn" data-page="chapters">章节练习</button>
        <button class="nav-btn" data-page="random">随机刷题</button>
        <button class="nav-btn" data-page="exam">模拟考试</button>
        <button class="nav-btn" data-page="wrong">错题本</button>
        <button class="nav-btn" data-page="favorite">收藏题</button>
        <button class="nav-btn" data-page="search">搜索题目</button>
      </nav>
      <div class="side-tip">
        <strong>本地保存</strong>
        <span>刷题记录保存在当前浏览器，不依赖服务器。</span>
      </div>
    </aside>

    <main class="main">
      <section id="view-home" class="view active"></section>
      <section id="view-chapters" class="view"></section>
      <section id="view-practice" class="view"></section>
      <section id="view-random" class="view"></section>
      <section id="view-exam" class="view"></section>
      <section id="view-wrong" class="view"></section>
      <section id="view-favorite" class="view"></section>
      <section id="view-search" class="view"></section>
    </main>
  </div>

  <script src="app.js"></script>
</body>
</html>
''', encoding='utf-8')

(OUT / 'style.css').write_text(r''':root {
  --bg: #f5f7fb;
  --card: #ffffff;
  --text: #1f2937;
  --muted: #6b7280;
  --border: #e5e7eb;
  --primary: #2563eb;
  --primary-soft: #e8f0ff;
  --green: #16a34a;
  --green-soft: #eaf7ee;
  --red: #dc2626;
  --red-soft: #fff1f1;
  --orange: #f59e0b;
  --shadow: 0 12px 30px rgba(15, 23, 42, .08);
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif;
}
button, input, select { font: inherit; }
button { cursor: pointer; }
.app-shell { min-height: 100vh; display: grid; grid-template-columns: 280px 1fr; }
.sidebar {
  background: #0f172a;
  color: #fff;
  padding: 24px;
  position: sticky;
  top: 0;
  height: 100vh;
}
.brand { display: flex; gap: 12px; align-items: center; margin-bottom: 28px; }
.brand-mark {
  width: 48px; height: 48px; border-radius: 16px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, #2563eb, #14b8a6);
  font-size: 24px; font-weight: 800;
}
.brand h1 { margin: 0; font-size: 21px; }
.brand p { margin: 4px 0 0; font-size: 12px; color: #cbd5e1; }
.nav { display: grid; gap: 8px; }
.nav-btn {
  width: 100%; border: 0; border-radius: 12px;
  padding: 12px 14px; text-align: left;
  background: transparent; color: #cbd5e1;
}
.nav-btn:hover, .nav-btn.active { background: rgba(255,255,255,.12); color: #fff; }
.side-tip {
  margin-top: 26px; border: 1px solid rgba(255,255,255,.14);
  border-radius: 16px; padding: 14px; color: #cbd5e1;
  display: grid; gap: 6px; font-size: 13px;
}
.main { padding: 28px; max-width: 1180px; width: 100%; }
.view { display: none; }
.view.active { display: block; }
.page-title { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 20px; }
.page-title h2 { margin: 0; font-size: 28px; }
.page-title p { margin: 8px 0 0; color: var(--muted); }
.grid { display: grid; gap: 16px; }
.grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 18px; padding: 18px; box-shadow: var(--shadow);
}
.stat-card .label { color: var(--muted); font-size: 13px; }
.stat-card .value { font-size: 30px; font-weight: 800; margin-top: 8px; }
.action-card { display: flex; flex-direction: column; gap: 10px; min-height: 135px; }
.action-card h3 { margin: 0; }
.action-card p { color: var(--muted); margin: 0; line-height: 1.6; }
.btn {
  border: 0; border-radius: 12px; padding: 10px 14px;
  background: var(--primary); color: #fff; font-weight: 650;
}
.btn.secondary { background: var(--primary-soft); color: var(--primary); }
.btn.ghost { background: #f3f4f6; color: var(--text); }
.btn.danger { background: var(--red-soft); color: var(--red); }
.btn.green { background: var(--green-soft); color: var(--green); }
.btn:disabled { opacity: .55; cursor: not-allowed; }
.btn-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.chapter-card { display: grid; gap: 12px; }
.chapter-meta { color: var(--muted); font-size: 14px; line-height: 1.7; }
.progress { height: 8px; background: #eef2f7; border-radius: 99px; overflow: hidden; }
.progress > span { display: block; height: 100%; background: var(--primary); width: 0%; }
.question-layout { display: grid; grid-template-columns: 1fr 230px; gap: 18px; }
.question-header { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
.badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 5px 10px; font-size: 12px; font-weight: 700; background: var(--primary-soft); color: var(--primary); }
.badge.green { background: var(--green-soft); color: var(--green); }
.badge.red { background: var(--red-soft); color: var(--red); }
.stem { font-size: 19px; line-height: 1.8; white-space: pre-wrap; }
.options { display: grid; gap: 10px; margin: 18px 0; }
.option {
  border: 1px solid var(--border); border-radius: 14px; padding: 13px 14px;
  display: flex; gap: 10px; align-items: flex-start;
  background: #fff;
}
.option.selected { border-color: var(--primary); background: var(--primary-soft); }
.option.correct { border-color: var(--green); background: var(--green-soft); }
.option.wrong { border-color: var(--red); background: var(--red-soft); }
.option input { margin-top: 4px; }
.option-key { font-weight: 800; min-width: 22px; }
.result-panel { margin-top: 14px; border-radius: 14px; padding: 14px; border: 1px solid var(--border); background: #f8fafc; }
.result-panel.correct { background: var(--green-soft); border-color: #bbf7d0; }
.result-panel.wrong { background: var(--red-soft); border-color: #fecaca; }
.side-card { position: sticky; top: 20px; display: grid; gap: 12px; align-self: start; }
.number-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 7px; max-height: 360px; overflow: auto; }
.num-btn { border: 1px solid var(--border); border-radius: 9px; background: #fff; padding: 8px 0; color: var(--muted); }
.num-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.num-btn.done { border-color: var(--green); color: var(--green); }
.num-btn.wrong { border-color: var(--red); color: var(--red); }
.form-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.form-row select, .form-row input {
  border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; background: #fff;
}
.list { display: grid; gap: 12px; }
.list-item { display: grid; gap: 8px; }
.preview { color: var(--muted); line-height: 1.6; }
.empty { text-align: center; color: var(--muted); padding: 42px 20px; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { text-align: left; padding: 10px; border-bottom: 1px solid var(--border); }
.table th { color: var(--muted); font-size: 13px; }
@media (max-width: 900px) {
  .app-shell { grid-template-columns: 1fr; }
  .sidebar { height: auto; position: static; }
  .nav { grid-template-columns: repeat(2, 1fr); }
  .main { padding: 16px; }
  .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
  .question-layout { grid-template-columns: 1fr; }
  .side-card { position: static; }
}
''', encoding='utf-8')

(OUT / 'app.js').write_text(r'''const DATA_FILES = [
  'data/single_choice.json',
  'data/multiple_choice.json',
  'data/true_false.json'
];

const STORE_KEY = 'politics_quiz_mvp_v1';
let questions = [];
let chapters = [];
let state = loadStore();
let currentSession = null;

function loadStore() {
  const empty = { answered: {}, wrong: {}, favorites: [], exams: [] };
  try { return { ...empty, ...(JSON.parse(localStorage.getItem(STORE_KEY)) || {}) }; }
  catch { return empty; }
}
function saveStore() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function $(sel) { return document.querySelector(sel); }
function $all(sel) { return [...document.querySelectorAll(sel)]; }
function esc(str) { return String(str ?? '').replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s])); }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function answerText(ans) { return Array.isArray(ans) ? ans.join('') : String(ans || ''); }
function normalizeAnswer(arr) { return [...(arr || [])].sort().join(''); }
function isCorrect(user, correct) { return normalizeAnswer(user) === normalizeAnswer(correct); }
function getAnswered(qid) { return state.answered[qid]; }
function isFavorite(qid) { return state.favorites.includes(qid); }
function formatTypeKey(type) {
  return type === '单选题' ? 'single' : type === '多选题' ? 'multiple' : 'true_false';
}
function calcStats() {
  const answeredIds = Object.keys(state.answered);
  const correctCount = answeredIds.filter(id => state.answered[id]?.correct).length;
  return {
    total: questions.length,
    answered: answeredIds.length,
    correct: correctCount,
    rate: answeredIds.length ? Math.round(correctCount / answeredIds.length * 100) : 0,
    wrong: Object.keys(state.wrong).length,
    favorite: state.favorites.length
  };
}

async function init() {
  const data = await Promise.all(DATA_FILES.map(f => fetch(f).then(r => r.json())));
  questions = data.flat().sort((a, b) => a.chapter_index - b.chapter_index || a.number - b.number);
  chapters = [...new Set(questions.map(q => q.chapter_index))].map(ci => {
    const qs = questions.filter(q => q.chapter_index === ci);
    return {
      chapter_index: ci,
      chapter: `第${ci}章`,
      total: qs.length,
      single: qs.filter(q => q.type === '单选题').length,
      multiple: qs.filter(q => q.type === '多选题').length,
      tf: qs.filter(q => q.type === '判断题').length
    };
  });
  bindNav();
  renderHome();
  renderChapters();
  renderRandom();
  renderExam();
  renderWrong();
  renderFavorite();
  renderSearch();
}

function bindNav() {
  $all('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });
}
function showPage(page) {
  $all('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  $all('.view').forEach(v => v.classList.remove('active'));
  const target = $(`#view-${page}`);
  if (target) target.classList.add('active');
  if (page === 'home') renderHome();
  if (page === 'chapters') renderChapters();
  if (page === 'wrong') renderWrong();
  if (page === 'favorite') renderFavorite();
  if (page === 'search') renderSearch();
}

function renderHome() {
  const s = calcStats();
  $('#view-home').innerHTML = `
    <div class="page-title">
      <div><h2>政治题库在线刷题系统</h2><p>当前题库共 ${s.total} 道题，支持章节练习、随机刷题、错题本和模拟考试。</p></div>
    </div>
    <div class="grid grid-4">
      ${statCard('总题数', s.total)}
      ${statCard('已刷题', s.answered)}
      ${statCard('正确率', s.rate + '%')}
      ${statCard('错题数', s.wrong)}
    </div>
    <div style="height:18px"></div>
    <div class="grid grid-3">
      ${actionCard('章节练习', '按 17 个章节顺序刷题，适合系统复习。', 'chapters')}
      ${actionCard('随机刷题', '从全部题库中按题型随机抽题，适合碎片复习。', 'random')}
      ${actionCard('模拟考试', '自定义题量并生成考试结果统计。', 'exam')}
      ${actionCard('错题本', '答错的题会自动进入错题本。', 'wrong')}
      ${actionCard('收藏题', '手动收藏重点题，考前集中查看。', 'favorite')}
      ${actionCard('搜索题目', '按关键词快速查找题干或选项。', 'search')}
    </div>
  `;
  $all('[data-jump]').forEach(btn => btn.onclick = () => showPage(btn.dataset.jump));
}
function statCard(label, value) { return `<div class="card stat-card"><div class="label">${label}</div><div class="value">${value}</div></div>`; }
function actionCard(title, text, page) { return `<div class="card action-card"><h3>${title}</h3><p>${text}</p><div style="margin-top:auto"><button class="btn secondary" data-jump="${page}">进入</button></div></div>`; }

function renderChapters() {
  $('#view-chapters').innerHTML = `
    <div class="page-title"><div><h2>章节练习</h2><p>每个原始 Markdown 文档对应一个章节。</p></div></div>
    <div class="grid grid-2">
      ${chapters.map(c => {
        const ids = questions.filter(q => q.chapter_index === c.chapter_index).map(q => q.id);
        const done = ids.filter(id => state.answered[id]).length;
        const correct = ids.filter(id => state.answered[id]?.correct).length;
        const rate = done ? Math.round(correct / done * 100) : 0;
        return `<div class="card chapter-card">
          <h3>${c.chapter}</h3>
          <div class="chapter-meta">共 ${c.total} 题｜单选 ${c.single}｜多选 ${c.multiple}｜判断 ${c.tf}<br>已完成 ${done} 题｜正确率 ${rate}%</div>
          <div class="progress"><span style="width:${Math.round(done / c.total * 100)}%"></span></div>
          <div class="btn-row"><button class="btn" data-start-chapter="${c.chapter_index}">开始练习</button><button class="btn ghost" data-start-chapter="${c.chapter_index}" data-only-wrong="1">只练本章错题</button></div>
        </div>`;
      }).join('')}
    </div>
  `;
  $all('[data-start-chapter]').forEach(btn => {
    btn.onclick = () => {
      const ci = Number(btn.dataset.startChapter);
      let qs = questions.filter(q => q.chapter_index === ci);
      if (btn.dataset.onlyWrong) qs = qs.filter(q => state.wrong[q.id]);
      startPractice(qs, `${ci}章练习`);
    };
  });
}

function startPractice(qs, title = '练习') {
  if (!qs.length) { alert('当前范围没有可练习题目。'); return; }
  currentSession = { title, questions: qs, index: 0, submitted: false, selected: [] };
  renderPractice();
  showPage('practice');
}
function renderPractice() {
  const root = $('#view-practice');
  const s = currentSession;
  if (!s) { root.innerHTML = `<div class="empty">请先选择章节或随机刷题。</div>`; return; }
  const q = s.questions[s.index];
  const selected = new Set(s.selected || []);
  const submitted = s.submitted;
  const answered = getAnswered(q.id);
  const progress = Math.round((s.index + 1) / s.questions.length * 100);
  root.innerHTML = `
    <div class="page-title"><div><h2>${esc(s.title)}</h2><p>${s.index + 1} / ${s.questions.length}</p></div></div>
    <div class="question-layout">
      <div class="card">
        <div class="progress"><span style="width:${progress}%"></span></div>
        <div style="height:16px"></div>
        <div class="question-header">
          <span class="badge">${q.type}</span>
          <span class="badge green">${q.chapter}</span>
          <span class="badge">第 ${q.number} 题</span>
          ${state.wrong[q.id] ? '<span class="badge red">错题</span>' : ''}
        </div>
        <div class="stem">${esc(q.stem)}</div>
        <div class="options">
          ${q.options.map(o => optionHtml(q, o, selected, submitted)).join('')}
        </div>
        <div class="btn-row">
          <button class="btn" id="submit-answer" ${submitted ? 'disabled' : ''}>提交答案</button>
          <button class="btn secondary" id="prev-q" ${s.index === 0 ? 'disabled' : ''}>上一题</button>
          <button class="btn secondary" id="next-q" ${s.index === s.questions.length - 1 ? 'disabled' : ''}>下一题</button>
          <button class="btn ghost" id="toggle-fav">${isFavorite(q.id) ? '取消收藏' : '收藏本题'}</button>
        </div>
        ${submitted ? resultHtml(q, s.selected) : ''}
      </div>
      <div class="card side-card">
        <strong>题号导航</strong>
        <div class="number-grid">
          ${s.questions.map((qq, i) => {
            const a = state.answered[qq.id];
            const cls = ['num-btn', i === s.index ? 'active' : '', a ? 'done' : '', a && !a.correct ? 'wrong' : ''].join(' ');
            return `<button class="${cls}" data-go-index="${i}">${i+1}</button>`;
          }).join('')}
        </div>
        <div class="chapter-meta">绿色边框表示已答，红色边框表示最近一次答错。</div>
      </div>
    </div>`;
  bindPracticeEvents(q);
}
function optionHtml(q, o, selected, submitted) {
  let cls = 'option';
  if (selected.has(o.key)) cls += ' selected';
  if (submitted && q.answer.includes(o.key)) cls += ' correct';
  if (submitted && selected.has(o.key) && !q.answer.includes(o.key)) cls += ' wrong';
  const inputType = q.type === '多选题' ? 'checkbox' : 'radio';
  return `<label class="${cls}">
    <input type="${inputType}" name="option" value="${o.key}" ${selected.has(o.key) ? 'checked' : ''} ${submitted ? 'disabled' : ''}>
    <span class="option-key">${o.key}.</span><span>${esc(o.text)}</span>
  </label>`;
}
function resultHtml(q, userAnswer) {
  const ok = isCorrect(userAnswer, q.answer);
  return `<div class="result-panel ${ok ? 'correct' : 'wrong'}">
    <strong>${ok ? '回答正确' : '回答错误'}</strong><br>
    你的答案：${answerText(userAnswer) || '未选择'}<br>
    正确答案：${q.type === '判断题' ? q.answer_text : answerText(q.answer)}
  </div>`;
}
function bindPracticeEvents(q) {
  $all('input[name="option"]').forEach(input => {
    input.onchange = () => {
      if (q.type === '多选题') {
        currentSession.selected = $all('input[name="option"]:checked').map(i => i.value);
      } else {
        currentSession.selected = [input.value];
      }
      renderPractice();
    };
  });
  $('#submit-answer').onclick = () => {
    if (!currentSession.selected.length) { alert('请先选择答案。'); return; }
    const ok = isCorrect(currentSession.selected, q.answer);
    state.answered[q.id] = { userAnswer: currentSession.selected, correct: ok, time: new Date().toISOString() };
    if (!ok) {
      const old = state.wrong[q.id] || { wrongCount: 0, correctAgain: 0 };
      state.wrong[q.id] = { ...old, wrongCount: old.wrongCount + 1, correctAgain: 0, lastUserAnswer: currentSession.selected, lastWrongTime: new Date().toISOString() };
    } else if (state.wrong[q.id]) {
      const old = state.wrong[q.id];
      old.correctAgain = (old.correctAgain || 0) + 1;
      if (old.correctAgain >= 2) delete state.wrong[q.id];
      else state.wrong[q.id] = old;
    }
    currentSession.submitted = true;
    saveStore();
    renderPractice();
  };
  $('#prev-q').onclick = () => { currentSession.index--; currentSession.submitted = false; currentSession.selected = []; renderPractice(); };
  $('#next-q').onclick = () => { currentSession.index++; currentSession.submitted = false; currentSession.selected = []; renderPractice(); };
  $('#toggle-fav').onclick = () => {
    if (isFavorite(q.id)) state.favorites = state.favorites.filter(id => id !== q.id);
    else state.favorites.push(q.id);
    saveStore(); renderPractice();
  };
  $all('[data-go-index]').forEach(b => b.onclick = () => { currentSession.index = Number(b.dataset.goIndex); currentSession.submitted = false; currentSession.selected = []; renderPractice(); });
}

function renderRandom() {
  $('#view-random').innerHTML = `
    <div class="page-title"><div><h2>随机刷题</h2><p>按题型和题量随机抽题。</p></div></div>
    <div class="card">
      <div class="form-row">
        <select id="random-type"><option value="all">全部题型</option><option value="单选题">单选题</option><option value="多选题">多选题</option><option value="判断题">判断题</option></select>
        <select id="random-chapter"><option value="all">全部章节</option>${chapters.map(c => `<option value="${c.chapter_index}">${c.chapter}</option>`).join('')}</select>
        <input id="random-count" type="number" min="1" value="20" style="width:120px" />
        <button class="btn" id="start-random">开始随机练习</button>
      </div>
    </div>`;
  $('#start-random').onclick = () => {
    const type = $('#random-type').value;
    const chapter = $('#random-chapter').value;
    const count = Math.max(1, Number($('#random-count').value || 20));
    let qs = questions;
    if (type !== 'all') qs = qs.filter(q => q.type === type);
    if (chapter !== 'all') qs = qs.filter(q => q.chapter_index === Number(chapter));
    startPractice(shuffle(qs).slice(0, count), '随机刷题');
  };
}

function renderExam() {
  $('#view-exam').innerHTML = `
    <div class="page-title"><div><h2>模拟考试</h2><p>随机抽取单选、多选、判断题，提交后生成统计结果。</p></div></div>
    <div class="card">
      <div class="form-row">
        <select id="exam-chapter"><option value="all">全部章节</option>${chapters.map(c => `<option value="${c.chapter_index}">${c.chapter}</option>`).join('')}</select>
        <label>单选 <input id="exam-single" type="number" min="0" value="20" style="width:80px"></label>
        <label>多选 <input id="exam-multiple" type="number" min="0" value="10" style="width:80px"></label>
        <label>判断 <input id="exam-tf" type="number" min="0" value="10" style="width:80px"></label>
        <button class="btn" id="start-exam">生成试卷</button>
      </div>
      <div id="exam-area" style="margin-top:18px"></div>
    </div>`;
  $('#start-exam').onclick = buildExam;
}
function buildExam() {
  const chapter = $('#exam-chapter').value;
  let pool = questions;
  if (chapter !== 'all') pool = pool.filter(q => q.chapter_index === Number(chapter));
  const qs = [
    ...shuffle(pool.filter(q => q.type === '单选题')).slice(0, Number($('#exam-single').value || 0)),
    ...shuffle(pool.filter(q => q.type === '多选题')).slice(0, Number($('#exam-multiple').value || 0)),
    ...shuffle(pool.filter(q => q.type === '判断题')).slice(0, Number($('#exam-tf').value || 0)),
  ];
  if (!qs.length) { alert('请至少抽取 1 道题。'); return; }
  currentSession = { title: '模拟考试', questions: qs, index: 0, submitted: false, selected: [] };
  startPractice(qs, '模拟考试');
}

function renderWrong() {
  const ids = Object.keys(state.wrong);
  const qs = ids.map(id => questions.find(q => q.id === id)).filter(Boolean);
  renderQuestionList('#view-wrong', '错题本', '答错的题会自动加入。错题连续答对两次后自动移出。', qs, true);
}
function renderFavorite() {
  const qs = state.favorites.map(id => questions.find(q => q.id === id)).filter(Boolean);
  renderQuestionList('#view-favorite', '收藏题', '手动收藏的重点题目。', qs, false, true);
}
function renderQuestionList(rootSel, title, desc, qs, wrongMode=false, favMode=false) {
  $(rootSel).innerHTML = `
    <div class="page-title"><div><h2>${title}</h2><p>${desc}</p></div>${qs.length ? `<button class="btn" id="practice-list">开始练习</button>` : ''}</div>
    ${qs.length ? `<div class="list">${qs.map(q => `<div class="card list-item">
      <div><span class="badge">${q.type}</span> <span class="badge green">${q.chapter}</span> <strong>第 ${q.number} 题</strong></div>
      <div class="preview">${esc(q.stem.slice(0, 120))}${q.stem.length > 120 ? '……' : ''}</div>
      ${wrongMode ? `<div class="chapter-meta">错误次数：${state.wrong[q.id]?.wrongCount || 1}</div>` : ''}
      <div class="btn-row"><button class="btn secondary" data-practice-one="${q.id}">练这一题</button>${wrongMode ? `<button class="btn danger" data-remove-wrong="${q.id}">移出错题本</button>` : ''}${favMode ? `<button class="btn danger" data-remove-fav="${q.id}">取消收藏</button>` : ''}</div>
    </div>`).join('')}</div>` : `<div class="card empty">暂无题目。</div>`}`;
  const practiceBtn = $('#practice-list');
  if (practiceBtn) practiceBtn.onclick = () => startPractice(qs, title);
  $all('[data-practice-one]').forEach(b => b.onclick = () => startPractice([questions.find(q => q.id === b.dataset.practiceOne)], '单题练习'));
  $all('[data-remove-wrong]').forEach(b => b.onclick = () => { delete state.wrong[b.dataset.removeWrong]; saveStore(); renderWrong(); });
  $all('[data-remove-fav]').forEach(b => b.onclick = () => { state.favorites = state.favorites.filter(id => id !== b.dataset.removeFav); saveStore(); renderFavorite(); });
}

function renderSearch() {
  $('#view-search').innerHTML = `
    <div class="page-title"><div><h2>搜索题目</h2><p>支持搜索题干、选项、答案。</p></div></div>
    <div class="card">
      <div class="form-row"><input id="search-key" placeholder="输入关键词" style="min-width:260px"><button class="btn" id="do-search">搜索</button></div>
      <div id="search-results" style="margin-top:18px"></div>
    </div>`;
  $('#do-search').onclick = () => {
    const key = $('#search-key').value.trim();
    if (!key) return;
    const result = questions.filter(q => {
      const text = [q.stem, q.answer_text, ...q.options.map(o => o.text)].join('\n');
      return text.includes(key);
    }).slice(0, 100);
    $('#search-results').innerHTML = result.length ? `<div class="list">${result.map(q => `<div class="card list-item">
      <div><span class="badge">${q.type}</span> <span class="badge green">${q.chapter}</span> <strong>第 ${q.number} 题</strong></div>
      <div class="preview">${esc(q.stem.slice(0, 160))}${q.stem.length > 160 ? '……' : ''}</div>
      <button class="btn secondary" data-practice-one="${q.id}">练这一题</button>
    </div>`).join('')}</div>` : `<div class="empty">没有找到匹配题目。</div>`;
    $all('[data-practice-one]').forEach(b => b.onclick = () => startPractice([questions.find(q => q.id === b.dataset.practiceOne)], '搜索结果练习'));
  };
}

init();
''', encoding='utf-8')

(OUT / 'README.md').write_text(f'''# 政治题库在线刷题系统 MVP

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

- 总题数：{len(all_questions)}
- 单选题：{len(single)}
- 多选题：{len(multiple)}
- 判断题：{len(true_false)}

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
''', encoding='utf-8')

# put parser backup
(Path('/mnt/data/build_politics_quiz.py')).write_text(Path('/mnt/data/build_politics_quiz.py').read_text(encoding='utf-8'), encoding='utf-8')
(SCRIPTS / 'md_to_json.py').write_text(Path('/mnt/data/build_politics_quiz.py').read_text(encoding='utf-8'), encoding='utf-8')

# zip the MVP
zip_path = Path('/mnt/data/政治刷题系统_MVP.zip')
if zip_path.exists(): zip_path.unlink()
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for p in OUT.rglob('*'):
        z.write(p, p.relative_to(OUT.parent))

# also zip json only
json_zip = Path('/mnt/data/政治题库_JSON.zip')
if json_zip.exists(): json_zip.unlink()
with zipfile.ZipFile(json_zip, 'w', zipfile.ZIP_DEFLATED) as z:
    for name in ['single_choice.json','multiple_choice.json','true_false.json','all_questions.json','chapters.json','conversion_report.json']:
        z.write(DATA / name, Path('politics_json') / name)

print(json.dumps(report, ensure_ascii=False, indent=2))
print('OUT', OUT)
print('ZIP', zip_path)
print('JSONZIP', json_zip)
