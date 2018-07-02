/**
 * Install Service worker
 */
(_ => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');

          console.log('[ServiceWorker Registration] SW registered!');

          const result = await reg.sync.register('restaurants-reviews-sync');

          console.log('[ServiceWorker Registration] SW Sync registered!');
        } catch (e) {
          if (e) {
            console.error('[ServiceWorker Registration] Error:', e);
          } else {
            console.error('[ServiceWorker Registration] Uknown Error');
          }
        }
        // navigator.serviceWorker.register('/sw.js').then(reg => {
        //   return reg.sync.register('restaurants-reviews-sync');
        // }).catch(e => console.error(e));
      });
    }
})();