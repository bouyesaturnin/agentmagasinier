// frontend/src/registerSW.js
// Enregistrement du Service Worker

export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(reg => console.log('Service Worker enregistré:', reg.scope))
        .catch(err => console.log('Erreur Service Worker:', err))
    })
  }
}

export function unregisterSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => reg.unregister())
  }
}
