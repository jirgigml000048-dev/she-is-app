(function () {
  const PREFIX = 'she_result_';

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function saveResult(payload) {
    if (!payload || !payload.moduleId) return;
    try {
      const record = {
        moduleId: payload.moduleId,
        moduleName: payload.moduleName || payload.moduleId,
        completedAt: payload.completedAt || new Date().toISOString(),
        summary: payload.summary || '',
        score: payload.score || {},
        topDimension: payload.topDimension || ''
      };
      localStorage.setItem(PREFIX + payload.moduleId, JSON.stringify(record));
    } catch (error) {
      console.warn('Failed to save profile result:', error);
    }
  }

  function readAllResults() {
    const items = [];
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(PREFIX)) continue;
        try {
          const parsed = JSON.parse(localStorage.getItem(key));
          if (parsed && parsed.moduleId) items.push(parsed);
        } catch (error) {
          console.warn('Invalid stored result:', key, error);
        }
      }
    } catch (error) {
      console.warn('Failed to read profile results:', error);
    }
    return items.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
  }

  function hasResults() {
    return readAllResults().length > 0;
  }

  function normalizeToFive(value, inputMax) {
    if (typeof value !== 'number' || Number.isNaN(value)) return null;
    return clamp((value / inputMax) * 5, 0, 5);
  }

  window.SheProfileStore = {
    PREFIX,
    clamp,
    saveResult,
    readAllResults,
    hasResults,
    normalizeToFive
  };
})();
