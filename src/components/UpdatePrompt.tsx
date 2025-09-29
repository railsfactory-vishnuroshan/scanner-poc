import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowPrompt(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setNeedRefresh(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <ArrowPathIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">
              App Update Available
            </h3>
            <p className="text-sm text-blue-100 mt-1">
              A new version of the scanner is available. Update now for the latest features and improvements.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleUpdate}
                className="bg-white text-blue-600 px-3 py-1.5 text-sm rounded hover:bg-blue-50 transition-colors"
              >
                Update Now
              </button>
              <button
                onClick={handleDismiss}
                className="text-blue-100 px-3 py-1.5 text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-blue-200 hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}