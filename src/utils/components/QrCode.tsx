import type { DrawType } from 'qr-code-styling';
import QRCodeStyling from 'qr-code-styling';
import { forwardRef, useCallback , useEffect , useImperativeHandle , useRef } from 'react';
import type { QrCodeFormat, QrCodeOptions } from '../helpers/qrCodes';

export type QrCodeProps = Omit<QrCodeOptions, 'format'> & {
  data: string;
  drawType?: DrawType;
};

export type QrRef = {
  download: (name: string, format: QrCodeFormat) => void;
  getDataUri: (format: QrCodeFormat) => Promise<string>;
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
    (name: string, format: QrCodeFormat) => qrCodeRef.current.download({ name, extension: format }),
    [],
  );
  const getDataUri = useCallback((format: QrCodeFormat) => new Promise<string>((resolve, reject) => {
    const rawDataPromise = qrCodeRef.current.getRawData(format);
    const reader = new FileReader();

    reader.onload = () => {
      const { result } = reader;
      if (result) {
        resolve(result.toString());
      }
    };
    reader.onerror = reject;

    rawDataPromise.then((blob) => {
      if (blob instanceof Blob) {
        reader.readAsDataURL(blob);
      } else {
        reject(new Error('QR code image blob not available'));
      }
    });
  }), []);

  // Expose the download method via provided ref
  useImperativeHandle(ref, () => ({ download, getDataUri }), [download, getDataUri]);

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
