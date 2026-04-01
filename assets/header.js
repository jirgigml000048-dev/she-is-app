// Shared header component for She Is app
// Usage: <div id="app-header" data-back="true"></div>
//   data-back="true" shows back arrow, otherwise shows menu button
(function () {
  const el = document.getElementById('app-header');
  if (!el) return;

  const showBack = el.dataset.back === 'true';
  const leftIcon = showBack
    ? '<a href="index.html" class="flex items-center justify-center min-h-[44px] min-w-[44px] hover:opacity-80 transition-opacity active:scale-95 duration-300"><span class="material-symbols-outlined text-primary">arrow_back</span></a>'
    : '<button class="flex items-center justify-center min-h-[44px] min-w-[44px] hover:opacity-80 transition-opacity active:scale-95 duration-300"><span class="material-symbols-outlined text-primary">menu</span></button>';

  el.innerHTML = `
<header class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl">
  <div class="flex justify-between items-center px-6 py-4 w-full">
    ${leftIcon}
    <h1 class="font-headline text-2xl tracking-tight text-primary flex items-center gap-2">
      <span class="font-bold">女也</span>
      <span class="text-xs uppercase tracking-[0.2em] font-light opacity-60">She Is</span>
    </h1>
    <div class="flex items-center gap-2">
      <button id="darkModeToggle" aria-label="Toggle dark mode" class="flex items-center justify-center min-h-[44px] min-w-[44px] hover:opacity-80 transition-opacity active:scale-95 duration-300">
        <span class="material-symbols-outlined text-primary" id="darkModeIcon">dark_mode</span>
      </button>
      <div id="headerAuthArea" class="flex items-center">
        <a href="login.html" id="loginEntryBtn" class="text-xs font-label font-semibold text-primary/70 hover:text-primary tracking-widest uppercase transition-colors hidden">登录</a>
        <a href="map.html" id="userAvatarBtn" class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white border border-outline-variant/15 hidden" style="background:linear-gradient(135deg,#4a3073,#9c3c62);"></a>
      </div>
    </div>
  </div>
  <div class="bg-surface-container h-[1px] w-full opacity-20"></div>
</header>`;

  // Dark mode toggle logic
  const html = document.documentElement;
  const icon = document.getElementById('darkModeIcon');

  function applyTheme(dark) {
    if (dark) {
      html.classList.add('dark');
      if (icon) icon.textContent = 'light_mode';
    } else {
      html.classList.remove('dark');
      if (icon) icon.textContent = 'dark_mode';
    }
  }

  // Init from localStorage (or system preference)
  const stored = localStorage.getItem('she-dark-mode');
  const prefersDark = stored !== null
    ? stored === 'true'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark);

  document.getElementById('darkModeToggle').addEventListener('click', () => {
    const isDark = html.classList.contains('dark');
    applyTheme(!isDark);
    localStorage.setItem('she-dark-mode', String(!isDark));
  });
})();
