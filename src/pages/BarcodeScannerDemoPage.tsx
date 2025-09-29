import { XMarkIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {Barcode} from '../components/Barcode';
import {BarcodeScanner} from '../components/BarcodeScanner';
import { ScanBarcodeIcon } from 'lucide-react';

// Form validation schema
const demoFormSchema = z.object({
  productCode: z.string().min(1, 'Product code is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  location: z.string().min(1, 'Location is required'),
  
});

type DemoFormData = z.infer<typeof demoFormSchema>;

/**
 * Barcode Scanner POC Demo Page
 * Showcases barcode scanning capabilities for warehouse operations
 */
export function BarcodeScannerDemoPage() {

  const [showScanner, setShowScanner] = useState(false);
  const [activeField, setActiveField] = useState<keyof DemoFormData | 'multiple' | 'bottom-menu' | null>(null);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [showTestBarcodes, setShowTestBarcodes] = useState(false);

  // Form field references for focus management
  const productCodeRef = useRef<HTMLInputElement>(null);
  const serialNumberRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  
  const fieldRefs = useMemo(() => ({
    productCode: productCodeRef,
    serialNumber: serialNumberRef,
    location: locationRef,
  }), []);

  const fieldOrder: (keyof DemoFormData)[] = ['productCode', 'serialNumber', 'location'];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      productCode: '',
      serialNumber: '',
      location: '',
    },
  });

  // Focus management functions
  const focusNextField = () => {
    const nextIndex = (currentFocusIndex + 1) % fieldOrder.length;
    const nextField = fieldOrder[nextIndex];
    fieldRefs[nextField].current?.focus();
    setCurrentFocusIndex(nextIndex);
  };

  const getCurrentFocusedField = (): keyof DemoFormData => {
    return fieldOrder[currentFocusIndex];
  };

  // Focus first field on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      productCodeRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Sample barcodes for testing
  const sampleBarcodes = [
    {
      value: 'PROD123',
      label: 'Single Field - Product Code',
      description: 'Scans into product code field only',
    },
    {
      value: 'PROD123|SN456789|5|ZONE-A',
      label: 'Multi Field',
      description: 'Scans into multiple fields: Product|Serial|Quantity|Location',
    },
    {
      value: 'SER987654321',
      label: 'Single Field - Serial Number',
      description: 'Scans into serial number field only',
    },
    {
      value: 'LOC-B2-SHELF-3',
      label: 'Single Field - Location',
      description: 'Scans into location field only',
    },
  ];

  // Handle scan result
  const handleScanResult = (scannedText: string) => {
    if (activeField === 'multiple') {
      // Demo: Parse barcode for multiple fields
      // Format: "PROD123|SN456789|5|ZONE-A"
      const parts = scannedText.split('|');
      if (parts.length >= 4) {
        setValue('productCode', parts[0]);
        setValue('serialNumber', parts[1]);
        
        setValue('location', parts[3]);
      } else {
        // Fallback: Use as product code if format doesn't match
        setValue('productCode', scannedText);
      }
    } else if (activeField === 'bottom-menu') {
      // Handle bottom menu scan - fill focused field and move to next
      const currentField = getCurrentFocusedField();
      setValue(currentField, scannedText);
      focusNextField();
    } else if (activeField) {
      // Populate single field
      setValue(activeField, scannedText);
    }
    setShowScanner(false);
    setActiveField(null);
  };

  const openScanner = (field: keyof DemoFormData | 'multiple' | 'bottom-menu') => {
    setActiveField(field);
    setShowScanner(true);
  };

  const handleFormSubmit = (data: DemoFormData) => {
    console.log('Form submitted:', data);
    alert(`Form submitted with data: ${JSON.stringify(data, null, 2)}`);
    reset();
  };

  return (
    <div className="min-h-screen overflow-auto bg-gray-50 p-3 pb-20 sm:p-4">
      <div className="mx-auto max-w-md sm:max-w-2xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Scanner Demo</h1>
        </div>

        <div className="space-y-6">
          {/* Form Section */}
          <div className="card">
            <h2 className="card-header">Warehouse Form</h2>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Product Code */}
              <div>
                <label htmlFor="productCode" className="label">
                  Product Code <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    {...register('productCode')}
                    ref={productCodeRef}
                    className={`text-input w-full ${errors.productCode ? 'border-red-500' : ''}`}
                    placeholder="Enter product code"
                  />
                  <button
                    type="button"
                    onClick={() => openScanner('productCode')}
                    className="icon-button"
                  >
                    <ScanBarcodeIcon className="size-5" />
                  </button>
                </div>
                <div className="mt-1 h-1">
                  {errors.productCode && (
                    <p className="text-sm text-red-500">{errors.productCode.message}</p>
                  )}
                </div>
              </div>

              {/* Serial Number */}
              <div>
                <label htmlFor="serialNumber" className="label">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    {...register('serialNumber')}
                    ref={serialNumberRef}
                    className={`text-input w-full ${errors.serialNumber ? 'border-red-500' : ''}`}
                    placeholder="Enter serial number"
                  />
                  <button
                    type="button"
                    onClick={() => openScanner('serialNumber')}
                    className="icon-button"
                  >
                    <ScanBarcodeIcon className="size-5" />
                  </button>
                </div>
                <div className="mt-1 h-1">
                  {errors.serialNumber && (
                    <p className="text-sm text-red-500">{errors.serialNumber.message}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="label">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    {...register('location')}
                    ref={locationRef}
                    className={`text-input w-full ${errors.location ? 'border-red-500' : ''}`}
                    placeholder="Enter location"
                  />
                  <button
                    type="button"
                    onClick={() => openScanner('location')}
                    className="icon-button"
                  >
                    <ScanBarcodeIcon className="size-5" />
                  </button>
                </div>
                <div className="mt-1 h-1">
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location.message}</p>
                  )}
                </div>
              </div>
              {/* Multi-field scan button */}
              <div className="rounded border border-dashed border-gray-300 p-4">
                <button
                  type="button"
                  onClick={() => openScanner('multiple')}
                  className="btn-secondary flex w-full items-center justify-center gap-2"
                >
                  <ScanBarcodeIcon className="size-4" />
                  <span>Scan Multi-Field Barcode</span>
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  Format: Product|Serial|Quantity|Location
                </p>
              </div>
            </form>
          </div>

          {/* Sample Barcodes Section */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="card-header mb-0">Test Barcodes</h2>
              <button
                type="button"
                onClick={() => setShowTestBarcodes(!showTestBarcodes)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showTestBarcodes ? 'Hide' : 'Show'}
              </button>
            </div>
            {showTestBarcodes && (
              <div className="mt-4 space-y-4">
                {sampleBarcodes.map((sample, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="mb-2">
                      <Barcode
                        value={sample.value}
                        options={{
                          format: 'CODE128',
                          width: 1,
                          height: 40,
                          displayValue: false,
                          margin: 5,
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{sample.label}</p>
                    <p className="font-mono text-xs text-gray-500">{sample.value}</p>
                    <p className="text-xs text-gray-400">{sample.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Menu Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 safe-area-pb">
        <div className="flex justify-center px-6 py-4">
          <button
            type="button"
            onClick={() => openScanner('bottom-menu')}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
          >
            <ScanBarcodeIcon className="size-8" />
          </button>
        </div>
      </div>

      {/* Scanner Dialog */}
      <Dialog.Root open={showScanner} onOpenChange={setShowScanner}>
        <Dialog.Portal>
          <Dialog.Title className="sr-only">Scan Barcode</Dialog.Title>
          <Dialog.Description className="sr-only">
            Use your device camera to scan a barcode and automatically fill the form field
          </Dialog.Description>
          <Dialog.Overlay className="bg-opacity-50 fixed inset-0 bg-black" />
          <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded bg-white shadow-lg">
            <Dialog.Close asChild>
              <button className="absolute top-3 right-3 rounded p-1 text-gray-400 hover:text-gray-600">
                <XMarkIcon className="size-4" />
              </button>
            </Dialog.Close>
            <BarcodeScanner isOpen={showScanner} onScan={handleScanResult} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
