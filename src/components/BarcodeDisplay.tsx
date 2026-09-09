import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeDisplayProps {
  value: string;
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  format = 'CODE128',
  width = 2,
  height = 80,
  displayValue = true,
  className = '',
  onClick,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          displayValue,
          fontOptions: 'bold',
          font: 'monospace',
          fontSize: 14,
          textMargin: 6,
          margin: 10,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch (err) {
        console.error('Barcode generation error:', err);
      }
    }
  }, [value, format, width, height, displayValue]);

  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center justify-center bg-white p-2 rounded-xl border border-slate-200 shadow-xs ${onClick ? 'cursor-pointer hover:border-emerald-500 hover:shadow-sm active:scale-[0.99] transition-all' : ''} ${className}`}
    >
      <svg ref={svgRef} className="max-w-full h-auto" />
    </div>
  );
};
