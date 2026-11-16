
const byId = (id) => document.getElementById(id);
let screen = 'menu';
const portrait = window.matchMedia('(orientation: portrait)');

function render() {
  byId('menu').hidden = screen !== 'menu';
  byId('arena').hidden = screen === 'menu';
  byId('pause-screen').hidden = screen !== 'paused';
  // Prevent keyboard focus reaching controls covered by the rotation overlay.
  byId('menu').inert = portrait.matches || screen !== 'menu';
  byId('arena').inert = portrait.matches || screen !== 'arena';
  byId('pause-screen').inert = portrait.matches || screen !== 'paused';
}
function navigate(next, focusId) {
  screen = next;
  render();
  if (!portrait.matches && focusId) byId(focusId).focus();
}
byId('play').addEventListener('click', () => navigate('arena', 'pause'));
byId('pause').addEventListener('click', () => navigate('paused', 'resume'));
byId('resume').addEventListener('click', () => navigate('arena', 'pause'));
byId('back').addEventListener('click', () => navigate('menu', 'play'));
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || portrait.matches) return;
  if (screen === 'arena') navigate('paused', 'resume');
  else if (screen === 'paused') navigate('arena', 'pause');
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && screen === 'arena') navigate('paused');
});
portrait.addEventListener('change', () => {
  if (portrait.matches && screen === 'arena') screen = 'paused';
  render();
});
byId('fullscreen').hidden = !document.documentElement.requestFullscreen;
byId('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    byId('status').textContent = 'Полноэкранный режим недоступен. Можно продолжить в браузере.';
  }
});
document.addEventListener('fullscreenchange', () => {
  byId('fullscreen').textContent = document.fullscreenElement ? 'ВЫЙТИ ИЗ ПОЛНОГО ЭКРАНА ↙' : 'НА ВЕСЬ ЭКРАН ↗';
});
render();
