// يُنفَّذ قبل رسم الصفحة لتفادي وميض السمة الخاطئة. ملف خارجي لأن سياسة CSP تمنع النصوص المضمّنة.
(function () {
  try {
    var pref = localStorage.getItem('sijilli-theme') || 'system';
    var dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch {
    document.documentElement.dataset.theme = 'light';
  }
})();
