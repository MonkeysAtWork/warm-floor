import 'bootstrap/dist/css/bootstrap.css';

if ('serviceWorker' in navigator) {
  if (navigator.serviceWorker.controller) {
    console.log('[PWA Builder] active service worker found, no need to register');
  } else {
    // Register the service worker
    navigator.serviceWorker
      .register('sw.js')
      .then((reg) => {
        console.log(`[PWA Builder] Service worker has been registered for scope: ${reg.scope}`);
      }).catch((error) => {
        console.log(`Registration failed with ${error}`);
      });
  }
}
