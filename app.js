const DATA_FILES = [
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
  currentSession = { title, questions: qs, index: 0, submitted: false, selected: [], answers: {}, mode: title === '模拟考试' ? 'exam' : 'practice', startedAt: new Date().toISOString() };
  renderPractice();
  showPage('practice');
}
function renderPractice() {
  const root = $('#view-practice');
  const s = currentSession;
  if (!s) { root.innerHTML = `<div class="empty">请先选择章节或随机刷题。</div>`; return; }
  const q = s.questions[s.index];
  const currentAnswer = s.answers?.[q.id];
  if (currentAnswer && !s.submitted) { s.selected = currentAnswer.userAnswer || []; }
  const selected = new Set(s.selected || []);
  const submitted = s.submitted || Boolean(currentAnswer);
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
          ${s.mode === 'exam' ? '<button class="btn green" id="finish-exam">完成考试</button>' : ''}
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
    const answerRecord = { userAnswer: [...currentSession.selected], correct: ok, time: new Date().toISOString() };
    state.answered[q.id] = answerRecord;
    currentSession.answers[q.id] = answerRecord;
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
  $('#prev-q').onclick = () => { currentSession.index--; currentSession.submitted = false; currentSession.selected = currentSession.answers[currentSession.questions[currentSession.index].id]?.userAnswer || []; renderPractice(); };
  $('#next-q').onclick = () => { currentSession.index++; currentSession.submitted = false; currentSession.selected = currentSession.answers[currentSession.questions[currentSession.index].id]?.userAnswer || []; renderPractice(); };
  $('#toggle-fav').onclick = () => {
    if (isFavorite(q.id)) state.favorites = state.favorites.filter(id => id !== q.id);
    else state.favorites.push(q.id);
    saveStore(); renderPractice();
  };

  const finishBtn = $('#finish-exam');
  if (finishBtn) finishBtn.onclick = () => renderExamResult();
  $all('[data-go-index]').forEach(b => b.onclick = () => { currentSession.index = Number(b.dataset.goIndex); currentSession.submitted = false; currentSession.selected = currentSession.answers[currentSession.questions[currentSession.index].id]?.userAnswer || []; renderPractice(); });
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


function renderExamResult() {
  if (!currentSession || currentSession.mode !== 'exam') return;
  const qs = currentSession.questions;
  const records = qs.map(q => currentSession.answers[q.id]);
  const answered = records.filter(Boolean).length;
  const correct = records.filter(r => r?.correct).length;
  const wrong = answered - correct;
  const rate = answered ? Math.round(correct / answered * 100) : 0;
  const byType = ['单选题', '多选题', '判断题'].map(type => {
    const typeQs = qs.filter(q => q.type === type);
    const typeRecords = typeQs.map(q => currentSession.answers[q.id]);
    const done = typeRecords.filter(Boolean).length;
    const ok = typeRecords.filter(r => r?.correct).length;
    return { type, total: typeQs.length, done, ok, rate: done ? Math.round(ok / done * 100) : 0 };
  });
  const wrongQs = qs.filter(q => currentSession.answers[q.id] && !currentSession.answers[q.id].correct);
  $('#view-exam').innerHTML = `
    <div class="page-title"><div><h2>考试结果</h2><p>本次试卷共 ${qs.length} 题，已答 ${answered} 题。</p></div><button class="btn secondary" id="new-exam">重新生成试卷</button></div>
    <div class="grid grid-4">
      ${statCard('总题数', qs.length)}
      ${statCard('已答题', answered)}
      ${statCard('正确题数', correct)}
      ${statCard('正确率', rate + '%')}
    </div>
    <div style="height:18px"></div>
    <div class="card">
      <h3>题型统计</h3>
      <table class="table"><thead><tr><th>题型</th><th>抽题数</th><th>已答</th><th>正确</th><th>正确率</th></tr></thead><tbody>
        ${byType.map(r => `<tr><td>${r.type}</td><td>${r.total}</td><td>${r.done}</td><td>${r.ok}</td><td>${r.rate}%</td></tr>`).join('')}
      </tbody></table>
    </div>
    <div style="height:18px"></div>
    <div class="card">
      <h3>本次错题</h3>
      ${wrongQs.length ? `<div class="list">${wrongQs.map(q => `<div class="list-item"><div><span class="badge">${q.type}</span> <span class="badge green">${q.chapter}</span> 第 ${q.number} 题</div><div class="preview">${esc(q.stem.slice(0, 120))}${q.stem.length > 120 ? '……' : ''}</div></div>`).join('')}</div>` : '<div class="empty">本次没有错题。</div>'}
    </div>`;
  showPage('exam');
  $('#new-exam').onclick = renderExam;
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
