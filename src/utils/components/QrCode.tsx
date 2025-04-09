import type { DrawType } from 'qr-code-styling';
import QRCodeStyling from 'qr-code-styling';
import { forwardRef, useCallback , useEffect , useImperativeHandle , useRef } from 'react';
import type { QrCodeFormat, QrCodeOptions } from '../helpers/qrCodes';

export type QrCodeProps = Omit<QrCodeOptions, 'format'> & {
  data: string;
  drawType?: DrawType;
};

export type QrRef = {
  download: (name: string, format?: QrCodeFormat) => void;
};

export const QrCode = forwardRef<QrRef, QrCodeProps>(({
  data,
  color = '#000000',
  bgColor = '#ffffff',
  margin = 0,
  errorCorrection = 'L',
  size = 300,
  drawType = 'canvas',
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef(new QRCodeStyling());
  const download = useCallback(
    (name: string, format: QrCodeFormat = 'png') => qrCodeRef.current.download({ name, extension: format }),
    [],
  );

  // Expose the download method via provided ref
  useImperativeHandle(ref, () => ({ download }), [download]);

  useEffect(() => {
    const element = containerRef.current!;
    qrCodeRef.current.append(element);
  }, []);

  useEffect(() => {
    qrCodeRef.current.update({
      type: drawType,
      data,
      width: size + margin,
      height: size + margin,
      margin,
      dotsOptions: { color },
      backgroundOptions: { color: bgColor },
      qrOptions: { errorCorrectionLevel: errorCorrection },
    });
  }, [bgColor, color, data, drawType, errorCorrection, margin, size]);

  return <div ref={containerRef} />;
});
