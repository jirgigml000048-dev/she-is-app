// Shared header component for She Is app
// Usage: <div id="app-header" data-back="true"></div>
//   data-back="true" shows back arrow, otherwise shows menu button
(function () {
  const el = document.getElementById('app-header');
  if (!el) return;

  const showBack = el.dataset.back === 'true';
  const leftIcon = showBack
    ? '<a href="index.html" class="hover:opacity-80 transition-opacity active:scale-95 duration-300"><span class="material-symbols-outlined text-primary">arrow_back</span></a>'
    : '<button class="hover:opacity-80 transition-opacity active:scale-95 duration-300"><span class="material-symbols-outlined text-primary">menu</span></button>';

  el.innerHTML = `
<header class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl">
  <div class="flex justify-between items-center px-6 py-4 w-full">
    ${leftIcon}
    <h1 class="font-headline text-2xl tracking-tight text-primary flex items-center gap-2">
      <span class="font-bold">女也</span>
      <span class="text-xs uppercase tracking-[0.2em] font-light opacity-60">She Is</span>
    </h1>
    <div id="headerAuthArea">
      <a href="login.html" id="loginEntryBtn" class="text-xs font-label font-semibold text-primary/70 hover:text-primary tracking-widest uppercase transition-colors hidden">登录</a>
      <a href="map.html" id="userAvatarBtn" class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white border border-outline-variant/15 hidden" style="background:linear-gradient(135deg,#4a3073,#9c3c62);"></a>
    </div>
  </div>
  <div class="bg-surface-container h-[1px] w-full opacity-20"></div>
</header>`;
})();
