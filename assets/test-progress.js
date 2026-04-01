// Test progress auto-save utility for She Is app
// Usage: SheTestProgress.save(testId, { ans, cur })
//        SheTestProgress.load(testId)  → { ans, cur, savedAt } or null
//        SheTestProgress.clear(testId)
(function () {
  const PREFIX = 'she_progress_';

  function save(testId, state) {
    if (!testId) return;
    try {
      localStorage.setItem(PREFIX + testId, JSON.stringify({
        ...state,
        savedAt: Date.now()
      }));
    } catch (e) {}
  }

  function load(testId) {
    if (!testId) return null;
    try {
      return JSON.parse(localStorage.getItem(PREFIX + testId) || 'null');
    } catch (e) {
      return null;
    }
  }

  function clear(testId) {
    if (!testId) return;
    try {
      localStorage.removeItem(PREFIX + testId);
    } catch (e) {}
  }

  window.SheTestProgress = { save, load, clear };
})();
