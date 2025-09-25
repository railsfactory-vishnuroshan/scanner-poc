import { useState, useCallback, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerState {
  isScanning: boolean;
  hasPermission: boolean | null;
  error: string | null;
  lastResult: string | null;
  cameras: MediaDeviceInfo[];
  selectedCameraId: string | null;
}

interface BarcodeScannerControls {
  startScanning: (
    deviceId?: string,
    videoElement?: HTMLVideoElement
  ) => Promise<void>;
  stopScanning: () => void;
  resetScanner: () => void;
  switchCamera: (deviceId: string) => Promise<void>;
  getCameras: () => Promise<void>;
}

interface UseBarcodeScanner
  extends BarcodeScannerState,
    BarcodeScannerControls {}

export const useBarcodeScanner = (
  onResult?: (result: string) => void
): UseBarcodeScanner => {
  const [state, setState] = useState<BarcodeScannerState>({
    isScanning: false,
    hasPermission: null,
    error: null,
    lastResult: null,
    cameras: [],
    selectedCameraId: null,
  });

  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Initialize the barcode reader
  const initializeReader = useCallback(() => {
    if (!readerRef.current) {
      readerRef.current = new BrowserMultiFormatReader();
    }
    return readerRef.current;
  }, []);

  // Get available cameras
  const getCameras = useCallback(async () => {
    try {
      initializeReader();
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();

      setState((prev) => ({
        ...prev,
        cameras: devices,
        selectedCameraId: devices.length > 0 ? devices[0].deviceId : null,
      }));
    } catch (error) {
      console.error("Error getting cameras:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to access cameras",
        hasPermission: false,
      }));
    }
  }, [initializeReader]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
      controlsRef.current = null;
    }

    setState((prev) => ({ ...prev, isScanning: false }));
  }, []);

  // Start scanning
  const startScanning = useCallback(
    async (deviceId?: string, videoElement?: HTMLVideoElement) => {
      try {
        setState((prev) => ({ ...prev, isScanning: true, error: null }));

        const reader = initializeReader();

        // Request camera permission first
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: deviceId ? undefined : "environment",
              deviceId: deviceId ? { exact: deviceId } : undefined,
            },
          });

          // Stop the test stream immediately - we just needed to check permissions
          stream.getTracks().forEach((track) => track.stop());

          setState((prev) => ({ ...prev, hasPermission: true }));
        } catch (error) {
          console.log(error);
          setState((prev) => ({
            ...prev,
            hasPermission: false,
            error: "Camera permission denied",
            isScanning: false,
          }));
          return;
        }

        // Get cameras if not already loaded
        if (state.cameras.length === 0) {
          await getCameras();
        }

        const targetDeviceId = deviceId || state.selectedCameraId;
        const targetVideoElement = videoElement || videoElementRef.current;

        if (!targetVideoElement) {
          throw new Error("Video element not found");
        }

        videoElementRef.current = targetVideoElement;

        // Start continuous scanning
        const controls = await reader.decodeFromVideoDevice(
          targetDeviceId || undefined,
          targetVideoElement,
          (result, error) => {
            if (result) {
              const text = result.getText();
              setState((prev) => ({ ...prev, lastResult: text }));
              onResult?.(text);

              // Stop scanning after getting result (single scan mode)
              stopScanning();
            }

            if (error && error.name !== "NotFoundException") {
              console.error("Scanning error:", error);
              setState((prev) => ({ ...prev, error: error.message }));
            }
          }
        );

        controlsRef.current = controls;
        setState((prev) => ({
          ...prev,
          selectedCameraId: targetDeviceId,
          isScanning: true,
        }));
      } catch (error: unknown) {
        console.error("Error starting scanner:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Failed to start scanner",
          isScanning: false,
        }));
      }
    },
    [
      initializeReader,
      state.cameras.length,
      state.selectedCameraId,
      getCameras,
      onResult,
      stopScanning,
    ]
  );

  // Switch camera
  const switchCamera = useCallback(
    async (deviceId: string) => {
      const wasScanning = state.isScanning;

      if (wasScanning) {
        stopScanning();
      }

      setState((prev) => ({ ...prev, selectedCameraId: deviceId }));

      if (wasScanning && videoElementRef.current) {
        // Restart scanning with new camera after a short delay
        setTimeout(() => {
          startScanning(deviceId, videoElementRef.current!);
        }, 100);
      }
    },
    [state.isScanning, stopScanning, startScanning]
  );

  // Reset scanner state
  const resetScanner = useCallback(() => {
    stopScanning();
    setState({
      isScanning: false,
      hasPermission: null,
      error: null,
      lastResult: null,
      cameras: [],
      selectedCameraId: null,
    });

    // Clear the reader reference
    readerRef.current = null;
  }, [stopScanning]);

  return {
    ...state,
    startScanning,
    stopScanning,
    resetScanner,
    switchCamera,
    getCameras,
  };
};
