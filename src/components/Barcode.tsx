import JsBarcode, { type Options } from 'jsbarcode';
import React, { useEffect, useRef } from 'react';

type Renderer = 'svg' | 'canvas' | 'img';

type JsBarcodeFormat =
  | 'CODE128'
  | 'CODE128A'
  | 'CODE128B'
  | 'CODE128C'
  | 'EAN13'
  | 'EAN8'
  | 'EAN5'
  | 'EAN2'
  | 'UPC'
  | 'UPCE'
  | 'ITF'
  | 'ITF14'
  | 'MSI'
  | 'MSI10'
  | 'MSI11'
  | 'MSI1010'
  | 'MSI1110'
  | 'pharmacode'
  | 'codabar';

type BarCodeOptions = Omit<Partial<Options>, 'format'> & {
  format?: JsBarcodeFormat;
};

interface BarcodeProps {
  value: string;
  text?: string;
  renderer?: Renderer;
  id?: string;
  className?: string;
  options?: BarCodeOptions;
}

const defaultOptions: Required<Pick<Options, 'format'>> & Partial<Options> = {
  format: 'CODE128',
  lineColor: '#000000',
  width: 2,
  height: 100,
  displayValue: true,
  fontSize: 16,
  margin: 10,
};

export const Barcode: React.FC<BarcodeProps> = ({
  value,
  text,
  renderer = 'svg',
  id,
  className,
  options = {},
}) => {
  const renderRef = useRef<SVGSVGElement | HTMLCanvasElement | HTMLImageElement>(null);

  useEffect(() => {
    if (!renderRef.current) return;

    try {
      JsBarcode(renderRef.current, value, {
        ...defaultOptions,
        ...options,
        text: text ?? value,
      });
    } catch (err) {
      console.error('Failed to render barcode:', err);
    }
  }, [value, text, options]);

  switch (renderer) {
    case 'canvas':
      return (
        <canvas
          ref={renderRef as React.RefObject<HTMLCanvasElement>}
          id={id}
          className={className}
        />
      );
    case 'img':
      return (
        <img
          ref={renderRef as React.RefObject<HTMLImageElement>}
          id={id}
          className={className}
          alt={text ?? 'Barcode'}
        />
      );
    case 'svg':
    default:
      return (
        <svg ref={renderRef as React.RefObject<SVGSVGElement>} id={id} className={className} />
      );
  }
};
