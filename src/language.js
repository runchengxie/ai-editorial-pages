// Navigation works without storage or JavaScript. Remember only an explicit language selection.
try {
  document.querySelector('[data-language]')?.addEventListener('click', event => {
    localStorage.setItem('ai-editorial-locale', event.currentTarget.dataset.language);
  });
  const filename = location.pathname.split('/').pop();
  if ((!filename || filename === 'index.html') && localStorage.getItem('ai-editorial-locale') === 'zh-CN') {
    location.replace(new URL('zh-CN.html', location.href));
  }
} catch { /* Storage may be disabled; explicit links still work. */ }
