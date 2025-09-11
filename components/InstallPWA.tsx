import React, { useState, useEffect } from 'react';
import { InstallIcon, ShareIcon, AddToHomeScreenIcon } from './Icons';

// Extend the Window interface to include the onbeforeinstallprompt event
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Check if the app is already installed and running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return; // No need to set up listeners if already installed
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOSDevice) {
        setIsIos(true);
        setShowInstallButton(true);
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
        setShowIosInstructions(true);
        return;
    }
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
        setShowInstallButton(false); // Hide button after successful install
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      setDeferredPrompt(null);
    }
  };

  // Don't show the button if the app is already installed or not installable
  if (isStandalone || !showInstallButton) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        aria-label="Instalar aplicación"
        className="flex items-center gap-2 justify-center bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-md"
      >
        <InstallIcon className="h-5 w-5 flex-shrink-0" />
        <span>{isIos ? 'Añadir a Inicio' : 'Instalar Aplicación'}</span>
      </button>

      {showIosInstructions && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" 
          onClick={() => setShowIosInstructions(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm text-center p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Instalar en tu iPhone</h3>
            <div className="text-left space-y-4 text-gray-600 dark:text-gray-300">
                <p>Para añadir esta aplicación a tu pantalla de inicio, sigue estos 2 pasos:</p>
                <div className="flex items-center gap-4 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex-shrink-0 bg-gray-200 dark:bg-gray-900/50 p-2 rounded-lg">
                    <ShareIcon className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">Paso 1: Abrir menú Compartir</p>
                    <p className="text-sm">Pulsa el botón de <strong>Compartir</strong> en la barra de tu navegador.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex-shrink-0 bg-gray-200 dark:bg-gray-900/50 p-2 rounded-lg">
                    <AddToHomeScreenIcon className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">Paso 2: Añadir a inicio</p>
                    <p className="text-sm">Busca y selecciona la opción <strong>"Añadir a pantalla de inicio"</strong>.</p>
                    </div>
                </div>
            </div>
            <button
                onClick={() => setShowIosInstructions(false)}
                className="mt-6 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
                Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWA;