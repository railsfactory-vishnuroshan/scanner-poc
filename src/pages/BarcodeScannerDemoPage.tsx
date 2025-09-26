import { QrCodeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {Barcode} from '../components/Barcode';
import {BarcodeScanner} from '../components/BarcodeScanner';

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
  const [activeField, setActiveField] = useState<keyof DemoFormData | 'multiple' | null>(null);

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
    } else if (activeField) {
      // Populate single field
      setValue(activeField, scannedText);
    }
    setShowScanner(false);
    setActiveField(null);
  };

  const openScanner = (field: keyof DemoFormData | 'multiple') => {
    setActiveField(field);
    setShowScanner(true);
  };

  const handleFormSubmit = (data: DemoFormData) => {
    console.log('Form submitted:', data);
    alert(`Form submitted with data: ${JSON.stringify(data, null, 2)}`);
    reset();
  };

  return (
    <div className="min-h-screen overflow-auto bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Scanner Demo</h1>
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
                    className={`text-input w-full ${errors.productCode ? 'border-red-500' : ''}`}
                    placeholder="Enter product code"
                  />
                  <button
                    type="button"
                    onClick={() => openScanner('productCode')}
                    className="icon-button"
                  >
                    <QrCodeIcon className="size-5" />
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
                    className={`text-input w-full ${errors.serialNumber ? 'border-red-500' : ''}`}
                    placeholder="Enter serial number"
                  />
                  <button
                    type="button"
                    onClick={() => openScanner('serialNumber')}
                    className="icon-button"
                  >
                    <QrCodeIcon className="size-5" />
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
                    className={`text-input w-full ${errors.location ? 'border-red-500' : ''}`}
                    placeholder="Enter location"
                  />
                  <button
                    type="button"
                    onClick={() => openScanner('location')}
                    className="icon-button"
                  >
                    <QrCodeIcon className="size-5" />
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
                  <QrCodeIcon className="size-4" />
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
            <h2 className="card-header">Test Barcodes</h2>
            <div className="space-y-4">
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
          </div>
        </div>
      </div>

      {/* Scanner Dialog */}
      <Dialog.Root open={showScanner} onOpenChange={setShowScanner}>
        <Dialog.Portal>
          <Dialog.Title className="sr-only">Scan Barcode</Dialog.Title>
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
