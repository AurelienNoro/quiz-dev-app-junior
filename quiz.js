// ==== DB / Quiz ====
const DB_KEY = 'cg_qbank_v1';
const LB_KEY = 'cg_leaderboard_v1';
const SEED = [];

function loadDB() {
  return JSON.parse(localStorage.getItem(DB_KEY) || JSON.stringify(SEED));
}

// ==== DOM ====
const themeSelect = document.getElementById('themeSelect');
const startBtn = document.getElementById('startBtn');
const quizArea = document.getElementById('quizArea');
const questionBox = document.getElementById('questionBox');
const choicesBox = document.getElementById('choicesBox');
const progress = document.getElementById('progress');
const themeLabel = document.getElementById('themeLabel');
const timerBox = document.getElementById('timerBox');
const nextBtn = document.getElementById('nextBtn');
const scoreBox = document.getElementById('scoreBox');
const resultArea = document.getElementById('resultArea');
const resultSummary = document.getElementById('resultSummary');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const playerName = document.getElementById('playerName');
const explanationBox = document.getElementById('explanationBox');
const recapBox = document.getElementById('recapBox');

// ==== State ====
let QDB = loadDB();
let QUESTIONS = [];
let currentIndex = 0;
let score = 0;
let timer = null;
let selectedIndex = null;

// ==== Init thèmes ====
function refreshThemes() {
  const themes = [...new Set(QDB.map(q => q.theme))];
  themeSelect.innerHTML =
    '<option value="all">Tous</option>' +
    themes.map(t => `<option value="${t}">${t}</option>`).join('');
}
refreshThemes();

// ==== Start quiz ====
startBtn.addEventListener('click', () => {
  const theme = themeSelect.value;
  const pool = theme === 'all'
    ? QDB.slice()
    : QDB.filter(q => q.theme === theme);

  if (pool.length === 0) {
    alert('Aucune question disponible.');
    return;
  }

  QUESTIONS = shuffle(pool).slice(0, 3
 );
  currentIndex = 0;
  score = 0;

  quizArea.style.display = 'block';
  resultArea.style.display = 'none';

  updateQuestion();
});

// ==== Question ====
function updateQuestion() {
  stopTimer();

  if (currentIndex >= QUESTIONS.length) {
    endQuiz();
    return;
  }

  const q = QUESTIONS[currentIndex];

  progress.textContent = `Question ${currentIndex + 1} / ${QUESTIONS.length}`;
  themeLabel.textContent = `Thème: ${q.theme}`;
  questionBox.textContent = q.question;
  explanationBox.textContent = '';
  choicesBox.innerHTML = '';

  selectedIndex = null;

  q.options.forEach((opt, i) => {
    const div = document.createElement('div');
    div.className = 'choice';
    div.textContent = opt;
    div.style.pointerEvents = 'auto';
    div.onclick = () => selectChoice(i);
    choicesBox.appendChild(div);
  });

  scoreBox.textContent = score;
  startTimer(20);
}

// ==== Choix ====
function selectChoice(i) {
  if (selectedIndex !== null) return;

  selectedIndex = i;
  QUESTIONS[currentIndex].chosen = i;
  const q = QUESTIONS[currentIndex];

  Array.from(choicesBox.children).forEach((el, idx) => {
    el.classList.remove('correct', 'wrong');
    if (idx === q.answer) el.classList.add('correct');
    if (idx === i && idx !== q.answer) el.classList.add('wrong');
    el.style.pointerEvents = 'none';
  });

  if (i === q.answer) score++;
  scoreBox.textContent = score;
  explanationBox.textContent = q.explanation || '';
  stopTimer();
}

// ==== Suivant ====
nextBtn.addEventListener('click', () => {
  if (selectedIndex === null) {
    alert('Choisis une réponse ou attends la fin du temps.');
    return;
  }
  currentIndex++;
  updateQuestion();
});

// ==== Fin quiz + recap tableau ====
function endQuiz() {
  stopTimer();
  quizArea.style.display = 'none';
  resultArea.style.display = 'block';

  const correct = QUESTIONS.filter(q => q.chosen === q.answer).length;
  resultSummary.textContent =
    `Score: ${score}/${QUESTIONS.length} — Correctes: ${correct}`;

  let html = `
    <table class="recap-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Question</th>
          <th>Ta réponse</th>
          <th>Bonne réponse</th>
          <th>Résultat</th>
        </tr>
      </thead>
      <tbody>
  `;

  QUESTIONS.forEach((q, i) => {
    const ok = q.chosen === q.answer;
    html += `
      <tr class="${ok ? 'good' : 'bad'}">
        <td>${i + 1}</td>
        <td>${q.question}</td>
        <td>${q.options[q.chosen] ?? 'Aucune'}</td>
        <td>${q.options[q.answer]}</td>
        <td>${ok ? '✔ Correct' : '✖ Faux'}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  recapBox.innerHTML = html;
}

// ==== Timer ====
function startTimer(sec) {
  stopTimer();
  let t = sec;
  timerBox.textContent = `${t}s`;

  timer = setInterval(() => {
    t--;
    timerBox.textContent = `${t}s`;

    if (t <= 0) {
      stopTimer();

      if (selectedIndex === null) {
        const q = QUESTIONS[currentIndex];
        selectedIndex = -1;

        Array.from(choicesBox.children).forEach((el, idx) => {
          el.classList.remove('correct', 'wrong');
          el.style.pointerEvents = 'none';
          if (idx === q.answer) el.classList.add('wrong');
        });

        explanationBox.innerHTML = `
  <div class="timeout-title">⏱ Temps écoulé</div>
  <div class="timeout-explanation">
    ${q.explanation || 'Aucune explication disponible.'}
  </div>
`;

      }
    }
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

// ==== Utils ====
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ==== Save score ====
saveScoreBtn.addEventListener('click', () => {
  const name = (playerName.value || 'Anonyme').trim();
  if (!name) {
    alert('Entrez un pseudo.');
    return;
  }

  const lb = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
  const theme = themeSelect.value === 'all' ? 'Tous' : themeSelect.value;

  lb.push({
    name,
    score,
    total: QUESTIONS.length,
    date: new Date().toISOString(),
    themes: theme
  });

  localStorage.setItem(LB_KEY, JSON.stringify(lb));
  alert('Score enregistré !');
});
