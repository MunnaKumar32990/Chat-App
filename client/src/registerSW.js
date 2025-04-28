import { Workbox } from 'workbox-window';

export function registerSW() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js');

    wb.addEventListener('installed', event => {
      if (event.isUpdate) {
        // New service worker is available, show a notification 
        // or perform some action
        console.log('New content is available! Refresh to update.');
      }
    });

    wb.addEventListener('waiting', () => {
      // New service worker is waiting to activate,
      // you could show a message to ask user to refresh
      console.log('New version is ready, please refresh to update!');
    });

    wb.addEventListener('redundant', () => {
      console.warn('Service worker became redundant!');
    });

    wb.addEventListener('error', (event) => {
      console.error('Service worker registration failed:', event.error);
    });

    // Register the service worker after the window load event
    window.addEventListener('load', () => {
      wb.register()
        .then(registration => {
          console.log('Service worker registered successfully:', registration);
        })
        .catch(error => {
          console.error('Service worker registration failed:', error);
        });
    });
  } else {
    console.warn('Service workers are not supported in this browser');
  }
}

// Function to check if the app is being used in PWA mode
export function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone || // iOS Safari
         document.referrer.includes('android-app://');
}

// Function to check if the app can be installed
export function canInstallPWA() {
  return 'BeforeInstallPromptEvent' in window || 
         'onbeforeinstallprompt' in window;
} 