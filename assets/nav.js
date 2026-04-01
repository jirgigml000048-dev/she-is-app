// Shared bottom navigation component for She Is app
// Usage: <div id="app-nav"></div>
(function () {
  const el = document.getElementById('app-nav');
  if (!el) return;

  const tabs = [
    { href: 'index.html', icon: 'home', label: 'Home' },
    { href: 'stories.html', icon: 'auto_stories', label: 'Stories' },
    { href: 'map.html', icon: 'hub', label: 'Map' },
    { href: 'mailbox.html', icon: 'mail', label: 'Letters' },
    { href: 'profile.html', icon: 'person', label: 'Me' },
  ];

  // Determine active tab from current URL
  const path = location.pathname.replace(/^\//, '').split('?')[0];
  function isActive(href) {
    if (href === 'index.html') return path === '' || path === '/' || path === 'index.html';
    return path === href || path.endsWith('/' + href);
  }

  const links = tabs.map(tab => {
    const active = isActive(tab.href);
    const cls = active
      ? 'flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-primary relative after:content-[\'\'] after:absolute after:-bottom-1 after:w-1 after:h-1 after:bg-secondary after:rounded-full'
      : 'flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-primary-container/40 hover:text-primary transition-colors';
    const iconStyle = active ? "font-variation-settings: 'FILL' 1;" : '';
    return `<a class="${cls}" href="${tab.href}">
      <span class="material-symbols-outlined" style="${iconStyle}">${tab.icon}</span>
      <span class="font-label text-[9px] uppercase tracking-widest font-bold mt-1">${tab.label}</span>
    </a>`;
  }).join('\n');

  el.innerHTML = `
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center pt-4 pb-8 px-4 bg-white/60 backdrop-blur-2xl rounded-t-[2.5rem] z-50 shadow-[0_-8px_32px_rgba(28,28,26,0.04)]">
  ${links}
</nav>`;
})();
