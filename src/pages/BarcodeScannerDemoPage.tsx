import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import { QrCodeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import BarcodeScanner from "../components/BarcodeScanner";
import Barcode from "../components/Barcode";

// Form validation schema
const demoFormSchema = z.object({
  productCode: z.string().min(1, "Product code is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  location: z.string().min(1, "Location is required"),
});

type DemoFormData = z.infer<typeof demoFormSchema>;

/**
 * Barcode Scanner POC Demo Page
 * Showcases barcode scanning capabilities for warehouse operations
 */
const BarcodeScannerDemoPage: React.FC = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [activeField, setActiveField] = useState<
    keyof DemoFormData | "multiple" | null
  >(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      productCode: "",
      serialNumber: "",
      quantity: 1,
      location: "",
    },
  });

  // Sample barcodes for testing
  const sampleBarcodes = [
    {
      value: "PROD123",
      label: "Single Field - Product Code",
      description: "Scans into product code field only",
    },
    {
      value: "PROD123|SN456789|5|ZONE-A",
      label: "Multi Field",
      description:
        "Scans into multiple fields: Product|Serial|Quantity|Location",
    },
    {
      value: "SER987654321",
      label: "Single Field - Serial Number",
      description: "Scans into serial number field only",
    },
    {
      value: "LOC-B2-SHELF-3",
      label: "Single Field - Location",
      description: "Scans into location field only",
    },
  ];

  // Handle scan result
  const handleScanResult = (scannedText: string) => {
    if (activeField === "multiple") {
      // Demo: Parse barcode for multiple fields
      // Format: "PROD123|SN456789|5|ZONE-A"
      const parts = scannedText.split("|");
      if (parts.length >= 4) {
        setValue("productCode", parts[0]);
        setValue("serialNumber", parts[1]);
        setValue("quantity", parseInt(parts[2], 10) || 1);
        setValue("location", parts[3]);
      } else {
        // Fallback: Use as product code if format doesn't match
        setValue("productCode", scannedText);
      }
    } else if (activeField) {
      // Populate single field
      if (activeField === "quantity") {
        setValue(activeField, parseInt(scannedText, 10) || 1);
      } else {
        setValue(activeField, scannedText);
      }
    }
    setShowScanner(false);
    setActiveField(null);
  };

  const openScanner = (field: keyof DemoFormData | "multiple") => {
    setActiveField(field);
    setShowScanner(true);
  };

  const handleFormSubmit = (data: DemoFormData) => {
    console.log("Form submitted:", data);
    alert(`Form submitted with data: ${JSON.stringify(data, null, 2)}`);
    reset();
  };

  const handleSampleBarcodeClick = (value: string) => {
    // Auto-populate fields based on sample barcode
    if (value.includes("|")) {
      // Multi-field barcode
      const parts = value.split("|");
      if (parts.length >= 4) {
        setValue("productCode", parts[0]);
        setValue("serialNumber", parts[1]);
        setValue("quantity", parseInt(parts[2], 10) || 1);
        setValue("location", parts[3]);
      }
    } else {
      // Single field - try to determine the field based on content
      if (value.startsWith("PROD")) {
        setValue("productCode", value);
      } else if (value.startsWith("SER")) {
        setValue("serialNumber", value);
      } else if (value.startsWith("LOC")) {
        setValue("location", value);
      } else {
        setValue("productCode", value);
      }
    }
  };

  return (
    <div className="min-h-screen overflow-auto bg-slate-50 p-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Scanner Demo</h1>
          <p className="text-slate-600 mt-1">
            Mobile-friendly barcode scanning POC
          </p>
        </div>

        <div className="space-y-6">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Warehouse Form
            </h2>

            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              {/* Product Code */}
              <div>
                <label
                  htmlFor="productCode"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Product Code <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    {...register("productCode")}
                    className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                      errors.productCode ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="Enter product code"
                  />
                  <button
                    type="button"
                    onClick={() => openScanner("productCode")}
                    className="px-3 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors flex items-center justify-center"
                  >
                    <QrCodeIcon className="h-5 w-5" />
                  </button>
                </div>
                {errors.productCode && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.productCode.message}
                  </p>
                )}
              </div>

              {/* Serial Number */}
              <div>
                <label
                  htmlFor="serialNumber"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    {...register("serialNumber")}
                    className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                      errors.serialNumber
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                    placeholder="Enter serial number"
                  />
                  <button
                    type="button"
                    onClick={() => openScanner("serialNumber")}
                    className="px-3 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors flex items-center justify-center"
                  >
                    <QrCodeIcon className="h-5 w-5" />
                  </button>
                </div>
                {errors.serialNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.serialNumber.message}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Quantity <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    {...register("quantity", { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                      errors.quantity ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="Enter quantity"
                  />
                  <button
                    type="button"
                    onClick={() => openScanner("quantity")}
                    className="px-3 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors flex items-center justify-center"
                  >
                    <QrCodeIcon className="h-5 w-5" />
                  </button>
                </div>
                {errors.quantity && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    {...register("location")}
                    className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                      errors.location ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="Enter location"
                  />
                  <button
                    type="button"
                    onClick={() => openScanner("location")}
                    className="px-3 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors flex items-center justify-center"
                  >
                    <QrCodeIcon className="h-5 w-5" />
                  </button>
                </div>
                {errors.location && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* Multi-field scan button */}
              <div className="rounded-lg border-2 border-dashed border-slate-300 p-4">
                <button
                  type="button"
                  onClick={() => openScanner("multiple")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
                >
                  <QrCodeIcon className="h-4 w-4" />
                  <span>Scan Multi-Field Barcode</span>
                </button>
                <p className="mt-2 text-sm text-slate-500 text-center">
                  Format: Product|Serial|Quantity|Location
                </p>
              </div>
            </form>
          </div>

          {/* Sample Barcodes Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Test Barcodes
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Click on any barcode below to auto-fill form fields
            </p>
            <div className="space-y-4">
              {sampleBarcodes.map((sample, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-lg p-4 cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  onClick={() => handleSampleBarcodeClick(sample.value)}
                >
                  <div className="mb-2">
                    <Barcode
                      value={sample.value}
                      options={{
                        format: "CODE128",
                        width: 1,
                        height: 40,
                        displayValue: false,
                        margin: 5,
                      }}
                    />
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {sample.label}
                  </p>
                  <p className="font-mono text-xs text-slate-500 break-all">
                    {sample.value}
                  </p>
                  <p className="text-xs text-slate-400">{sample.description}</p>
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
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg bg-white shadow-lg z-50">
            <Dialog.Close asChild>
              <button className="absolute top-3 right-3 z-10 rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </Dialog.Close>
            <BarcodeScanner 
              isOpen={showScanner} 
              onScan={handleScanResult}
              formats={['CODE_128', 'CODE_39', 'EAN_13', 'QR_CODE']}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default BarcodeScannerDemoPage;
