// Must be loaded early in <head> to avoid flash of wrong theme
(function () {
  var stored = localStorage.getItem('she-dark-mode');
  var dark = stored !== null
    ? stored === 'true'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.classList.add('dark');
})();
