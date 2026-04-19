import React, { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPromptEvent(e);
      // Update UI to notify the user app can be installed
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Listen for app install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) {
      return;
    }
    
    // Show the install prompt
    installPromptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstallable(false);
      } else {
        console.log('User dismissed the install prompt');
      }
      // Clear the saved prompt since it can't be used again
      setInstallPromptEvent(null);
    });
  };

  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center">
        <div className="mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Install Chat App</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Add to your home screen for easier access</p>
        </div>
        <button
          onClick={handleInstallClick}
          className="ml-4 px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Install
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt; 