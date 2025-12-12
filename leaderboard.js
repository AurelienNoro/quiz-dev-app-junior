const LB_KEY = 'cg_leaderboard_v1';
const themeFilter = document.getElementById('themeFilter');
const leaderboardList = document.getElementById('leaderboardList');

function loadLeaderboard() {
  const lb = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
  const themes = ['Tous', ...new Set(lb.map(s => s.themes))];
  themeFilter.innerHTML = themes.map(t => `<option value="${t}">${t}</option>`).join('');
  displayLeaderboard(lb, themeFilter.value);
}

function displayLeaderboard(lb, theme) {
  leaderboardList.innerHTML = '';
  let filtered = lb;
  if(theme !== 'Tous') filtered = lb.filter(s => s.themes === theme);

  if(filtered.length === 0) {
    leaderboardList.innerHTML = '<div>Aucun score pour ce thème.</div>';
    return;
  }

  filtered.sort((a,b) => b.score - a.score);

filtered.forEach(s => {
  const row = document.createElement('div');
  row.className = 'leaderboard-row';

  const themeClean = Array.isArray(s.themes)
    ? s.themes.join(', ')
    : (s.themes || '').trim().toUpperCase();

  row.innerHTML = `
    <div class="lb-col name">
      <strong>${s.name}</strong>
      <span>${new Date(s.date).toLocaleString()}</span>
    </div>

    <div class="lb-col score">
      ${s.score} / ${s.total}
    </div>

    <div class="lb-col theme">
      ${themeClean}
    </div>
  `;

  leaderboardList.appendChild(row);
});

}

themeFilter.addEventListener('change', ()=> {
  const lb = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
  displayLeaderboard(lb, themeFilter.value);
});

loadLeaderboard();
