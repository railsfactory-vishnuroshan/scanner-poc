import React, { useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeOptions {
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  text?: string;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  textPosition?: "bottom" | "top";
  textMargin?: number;
  fontFamily?: string;
  background?: string;
  foreground?: string;
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

interface BarcodeProps {
  value: string;
  text?: string;
  renderer?: "svg" | "canvas" | "img";
  id?: string;
  className?: string;
  options?: BarcodeOptions;
}

const Barcode: React.FC<BarcodeProps> = ({
  value,
  text,
  renderer = "svg",
  id,
  className,
  options = {},
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let currentRef: HTMLElement | SVGSVGElement | null = null;

    if (renderer === "canvas" && canvasRef.current) {
      currentRef = canvasRef.current;
    } else if (renderer === "img" && imgRef.current) {
      currentRef = imgRef.current;
    } else if (renderer === "svg" && svgRef.current) {
      currentRef = svgRef.current;
    }

    if (!currentRef || !value) return;

    try {
      // Default options
      const defaultOptions: BarcodeOptions = {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 20,
        textAlign: "center",
        textPosition: "bottom",
        textMargin: 2,
        fontFamily: "monospace",
        background: "#ffffff",
        foreground: "#000000",
        margin: 10,
        ...options,
      };

      // If text prop is provided, use it; otherwise use the display value from options
      if (text !== undefined) {
        defaultOptions.text = text;
      }

      JsBarcode(currentRef, value, defaultOptions);
    } catch (error) {
      console.error("Error generating barcode:", error);
    }
  }, [value, text, options, renderer]);

  // Render based on the specified renderer type
  if (renderer === "canvas") {
    return <canvas ref={canvasRef} id={id} className={className} />;
  } else if (renderer === "img") {
    return <img ref={imgRef} id={id} className={className} alt="Barcode" />;
  } else {
    // Default to SVG
    return <svg ref={svgRef} id={id} className={className} />;
  }
};

export default Barcode;
