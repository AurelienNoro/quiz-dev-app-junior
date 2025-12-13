const themeFilter = document.getElementById('themeFilter');
const leaderboardList = document.getElementById('leaderboardList');

let allScores = [];

// Affichage
function displayLeaderboard(scores, theme) {
  leaderboardList.innerHTML = '';

  let filtered = scores;
  if (theme && theme !== 'all') {
    filtered = scores.filter(s => s.theme === theme);
  }

  if (filtered.length === 0) {
    leaderboardList.innerHTML = '<div>Aucun score pour ce thème.</div>';
    return;
  }

  // tri local (au cas où)
  filtered.sort((a, b) => (b.score - a.score) || (b.total - a.total));

  filtered.forEach(s => {
    const row = document.createElement('div');
    row.className = 'leaderboard-row';

    row.innerHTML = `
      <div class="lb-col name">
        <strong>${escapeHtml(s.name || 'Anonyme')}</strong>
        <span>${new Date(s.date).toLocaleString()}</span>
      </div>
      <div class="lb-col score">
        ${s.score} / ${s.total}
      </div>
      <div class="lb-col theme">
        ${(s.theme || '').trim().toUpperCase()}
      </div>
    `;

    leaderboardList.appendChild(row);
  });
}

function refreshThemeOptions(scores) {
  const themes = Array.from(new Set(scores.map(s => (s.theme || '').trim()).filter(Boolean))).sort();

  themeFilter.innerHTML =
    `<option value="all">Tous</option>` +
    themes.map(t => `<option value="${escapeAttr(t)}">${escapeHtml(t)}</option>`).join('');
}

// Chargement global Firestore
async function loadLeaderboardGlobal() {
  if (!window.db) {
    leaderboardList.innerHTML = '<div>Firebase non chargé.</div>';
    return;
  }

  // Top 100 par score (tu peux augmenter)
  const snap = await window.db
    .collection('scores')
    .orderBy('score', 'desc')
    .limit(100)
    .get();

  allScores = snap.docs.map(d => d.data());

  refreshThemeOptions(allScores);
  displayLeaderboard(allScores, themeFilter.value);
}

themeFilter.addEventListener('change', () => {
  displayLeaderboard(allScores, themeFilter.value);
});

// petites protections XSS
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[s]));
}
function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

// GO
loadLeaderboardGlobal().catch(err => {
  console.error(err);
  leaderboardList.innerHTML = '<div>Erreur de chargement du leaderboard.</div>';
});




