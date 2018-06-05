/**
 * Install Service worker
 */
(_ => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', _ => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
          return reg.sync.register('firstSync');
        }).catch(e => console.error(e));
      });
    }
})();