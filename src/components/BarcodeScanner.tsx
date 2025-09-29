import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useCallback, useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
  onScan: (text: string) => void;
  isOpen: boolean;
}

/**
 * Barcode Scanner Component - CODE_128 Only
 * 
 * Optimizations:
 * - CODE_128 format only for improved performance
 * - Low resolution stream (640x480) for faster processing
 * - Prefers back camera for better scanning
 * - Proper ZXing cleanup to prevent memory leaks
 */
export function BarcodeScanner({ onScan, isOpen }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopFunctionRef = useRef<{ stop: () => void } | null>(null);
  const isStopping = useRef(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

  const stopScanning = useCallback(() => {
    isStopping.current = true;

    // Stop ZXing decoder first
    if (stopFunctionRef.current) {
      try {
        stopFunctionRef.current.stop();
        stopFunctionRef.current = null;
      } catch {
        // Silently handle any cleanup errors
      }
    }

    // Stop video stream using stored reference
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    // Also check video element for any remaining streams
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }

    // Clear the video element safely
    if (videoRef.current) {
      const videoElement = videoRef.current;
      
      try {
        videoElement.pause();
      } catch {
        // Silently handle pause errors during cleanup
      }
      
      videoElement.srcObject = null;
      videoElement.removeAttribute('src');
      videoElement.load();
    }

    // Clear the code reader
    if (codeReader.current) {
      codeReader.current = null;
    }

    setIsScanning(false);
    setError(null);
  }, []);
  const startScanning = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      setError(null);
      setIsScanning(true);
      isStopping.current = false;

      codeReader.current = new BrowserMultiFormatReader();

      // Aggressive performance optimizations for CODE_128 only
      const hints = new Map();
      hints.set('POSSIBLE_FORMATS', ['CODE_128']);
      hints.set('TRY_HARDER', false);
      hints.set('PURE_BARCODE', false);
      hints.set('ASSUME_CODE_39_CHECK_DIGIT', false);
      hints.set('ASSUME_GS1', false);
      
      // Apply performance hints
      codeReader.current.setHints(hints);

      // Get available cameras with performance preference
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      setAvailableCameras(videoInputDevices);

      // Performance-optimized camera selection
      let deviceId = undefined;
      if (videoInputDevices.length > 0) {
        if (videoInputDevices[currentCameraIndex]) {
          deviceId = videoInputDevices[currentCameraIndex].deviceId;
        } else {
          // Prefer back/environment camera for better barcode scanning performance
          const backCamera = videoInputDevices.find(
            (device) =>
              device.label.toLowerCase().includes('back') ||
              device.label.toLowerCase().includes('environment') ||
              device.label.toLowerCase().includes('rear')
          );
          if (backCamera) {
            deviceId = backCamera.deviceId;
            const backCameraIndex = videoInputDevices.indexOf(backCamera);
            setCurrentCameraIndex(backCameraIndex);
          } else {
            deviceId = videoInputDevices[0].deviceId;
            setCurrentCameraIndex(0);
          }
        }
      }

      // Create optimized MediaStream with low resolution for maximum performance
      const videoConstraints = {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        width: { ideal: 640, max: 800 },
        height: { ideal: 480, max: 600 },
        frameRate: { ideal: 15, max: 20 },
        focusMode: 'continuous',
        exposureMode: 'continuous',
        whiteBalanceMode: 'continuous',
        facingMode: deviceId ? undefined : 'environment'
      };

      // Create manual MediaStream for full control
      const optimizedStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      // Store stream immediately for cleanup
      streamRef.current = optimizedStream;
      
      // Assign to video element with safe play handling
      if (videoRef.current) {
        const videoElement = videoRef.current;
        videoElement.srcObject = optimizedStream;
        
        try {
          if (videoElement.isConnected && document.contains(videoElement)) {
            const playPromise = videoElement.play();
            
            if (playPromise !== undefined) {
              await playPromise.catch(error => {
                if (error.name === 'AbortError' || error.name === 'NotAllowedError') {
                  return;
                }
                throw error;
              });
            }
          } else {
            // Clean up the stream since we can't use it
            optimizedStream.getTracks().forEach(track => track.stop());
            return;
          }
        } catch (playError) {
          console.error('Video play error:', playError);
          throw playError;
        }
      }

      if (codeReader.current && videoRef.current) {
        const controls = await codeReader.current.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (isStopping.current) {
              return;
            }

            if (result) {
              onScan(result.getText());
              stopScanning();
            }
          }
        );
        
        stopFunctionRef.current = controls;
      }
    } catch (err) {
      console.error('Scanner start error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start camera');
      setIsScanning(false);
    }
  }, [onScan, stopScanning, currentCameraIndex]);

  // Switch to next available camera
  const switchCamera = useCallback(async () => {
    if (availableCameras.length <= 1) return;

    setIsSwitchingCamera(true);
    stopScanning();

    const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
    setCurrentCameraIndex(nextIndex);

    setTimeout(() => {
      setIsSwitchingCamera(false);
    }, 500);
  }, [availableCameras.length, currentCameraIndex, stopScanning]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, stopScanning]);

  // Component unmount cleanup to prevent video play interruption errors
  useEffect(() => {
    // Capture refs at effect setup time to avoid stale closure issues
    const videoElement = videoRef.current;
    const currentStream = streamRef.current;
    const currentStopFunction = stopFunctionRef.current;
    
    return () => {
      // Emergency cleanup when component unmounts
      
      // Stop ZXing decoder first
      if (currentStopFunction) {
        try {
          currentStopFunction.stop();
        } catch {
          // Silently handle cleanup errors
        }
      }
      
      if (videoElement) {
        if (videoElement.srcObject) {
          try {
            videoElement.pause();
            videoElement.srcObject = null;
          } catch {
            // Silently handle cleanup errors
          }
        }
      }
      
      // Stop any remaining tracks
      if (currentStream) {
        currentStream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch {
            // Silently handle cleanup errors
          }
        });
      }
    };
  }, []); // Empty dependency array - runs only on unmount

  // Auto-start scanning when opened
  useEffect(() => {
    if (isOpen && !isScanning && !error) {
      startScanning();
    }
  }, [isOpen, isScanning, error, startScanning]);

  if (!isOpen) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4">
        <h3 className="text-lg font-semibold text-gray-900">Scan Barcode</h3>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          CODE_128 Only
        </div>
      </div>

      {/* Camera View */}
      <div className="bg-white">
        {error ? (
          <div className="p-6">
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button
              onClick={startScanning}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              className="h-64 w-full rounded-lg bg-gray-900 object-cover"
              playsInline
              muted
              autoPlay
              preload="none"
              width="640"
              height="480"
              style={{ 
                maxWidth: '640px',
                maxHeight: '480px',
                objectFit: 'cover'
              }}
            />
            {/* Camera Switch Button */}
            {availableCameras.length > 1 && isScanning && (
              <button
                onClick={switchCamera}
                disabled={isSwitchingCamera}
                className="absolute right-3 bottom-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 disabled:opacity-50"
                title={`Switch Camera (${currentCameraIndex + 1}/${availableCameras.length})`}
              >
                <ArrowPathIcon className={`size-5 ${isSwitchingCamera ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white p-4">
        <p className="text-center text-sm text-gray-600">
          {isSwitchingCamera
            ? 'Switching camera...'
            : isScanning
              ? 'Wait for detection'
              : 'Camera starting...'}
        </p>
        {isScanning && !isSwitchingCamera && (
          <div className="mt-1 text-center">
            <p className="text-xs text-gray-500">
              Optimized for CODE_128 barcodes
            </p>
            <p className="text-xs text-gray-400">
              Barcode will auto-fill form fields when detected
            </p>
          </div>
        )}
        {availableCameras.length > 1 && (
          <p className="mt-1 text-center text-xs text-gray-400">
            Camera {currentCameraIndex + 1} of {availableCameras.length}
            {availableCameras[currentCameraIndex]?.label &&
              ` • ${availableCameras[currentCameraIndex].label.split('(')[0].trim()}`}
          </p>
        )}
      </div>
    </div>
  );
}
