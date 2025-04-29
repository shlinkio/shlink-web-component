import { faClone, faImage } from '@fortawesome/free-regular-svg-icons';
import { faCheck, faFileDownload as downloadIcon, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import { Button, CardModal } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { DrawType } from 'qr-code-styling';
import type { ChangeEvent, FC } from 'react';
import { useCallback, useRef, useState } from 'react';
import type { QrCodeSettings } from '../../settings';
import { defaultQrCodeSettings, useSetting } from '../../settings';
import { ColorInput } from '../../utils/components/ColorInput';
import type { QrRef } from '../../utils/components/QrCode';
import { QrCode } from '../../utils/components/QrCode';
import { copyToClipboard } from '../../utils/helpers/clipboard';
import type { ShortUrlModalProps } from '../data';
import { QrDimensionControl } from './qr-codes/QrDimensionControl';
import { QrErrorCorrectionDropdown } from './qr-codes/QrErrorCorrectionDropdown';
import { QrFormatDropdown } from './qr-codes/QrFormatDropdown';

export type QrCodeModalProps = ShortUrlModalProps & {
  qrDrawType?: DrawType;
};

export const QrCodeModal: FC<QrCodeModalProps> = (
  { shortUrl: { shortUrl, shortCode }, onClose, isOpen, qrDrawType },
) => {
  const initialQrSettings = useSetting('qrCodes', defaultQrCodeSettings);
  const [{ size, margin, color, bgColor, errorCorrection, format }, setQrCodeOptions] = useState(initialQrSettings);
  const setQrOption = useCallback(
    (newOptions: Partial<QrCodeSettings>) => setQrCodeOptions((prev) => ({ ...prev, ...newOptions })),
    [],
  );

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<{ url: string; name: string }>();
  const onSelectLogo = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo({
        url: URL.createObjectURL(new Blob([file], { type: file.type })),
        name: file.name,
      });
    }
  }, []);

  const qrCodeRef = useRef<QrRef>(null);
  const downloadQrCode = useCallback(
    () => qrCodeRef.current?.download(`${shortCode}-qr-code`, format),
    [format, shortCode],
  );
  const [copied, toggleCopied] = useTimeoutToggle();
  const copy = useCallback(() => {
    const uri = qrCodeRef.current?.getDataUri(format) ?? '';
    return copyToClipboard({ text: uri, onCopy: toggleCopied });
  }, [format, toggleCopied]);

  const resetOptions = useCallback(() => {
    setQrCodeOptions(initialQrSettings);
    setLogo(undefined);
  }, [initialQrSettings]);

  return (
    // TODO Use a link for the header's shortURL as soon as title can be a ReactNode
    <CardModal open={isOpen} onClose={onClose} title={`QR code for ${shortUrl}`} size="lg" onClosed={resetOptions}>
      <div className="tw:flex tw:flex-col-reverse tw:lg:flex-row tw:gap-4">
        <div className="tw:grow tw:flex tw:items-center tw:justify-around">
          <div className="tw:flex tw:flex-col tw:gap-1 tw:items-center" data-testid="qr-code-container">
            <QrCode
              ref={qrCodeRef}
              data={shortUrl}
              size={size}
              margin={margin}
              errorCorrection={errorCorrection}
              color={color}
              bgColor={bgColor}
              logo={logo?.url}
              drawType={qrDrawType}
            />
            <div className="tw:italic">Preview ({size + margin}x{size + margin})</div>
          </div>
        </div>
        <div className="tw:flex tw:flex-col tw:gap-2 tw:lg:w-64">
          <QrDimensionControl
            name="size"
            value={size}
            onChange={(size) => setQrOption({ size })}
            step={10}
            min={50}
            max={1000}
          />
          <QrDimensionControl
            name="margin"
            value={margin}
            onChange={(margin) => setQrOption({ margin })}
            step={1}
            min={0}
            max={100}
          />
          <QrErrorCorrectionDropdown
            errorCorrection={errorCorrection}
            onChange={(errorCorrection) => setQrOption({ errorCorrection })}
          />
          <ColorInput name="color" color={color} onChange={(color) => setQrOption({ color })} />
          <ColorInput name="background" color={bgColor} onChange={(bgColor) => setQrOption({ bgColor })} />

          {!logo && (
            <>
              <Button variant="secondary" onClick={() => logoInputRef.current?.click()}>
                <FontAwesomeIcon icon={faImage} />
                Select logo
              </Button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                aria-hidden
                tabIndex={-1}
                className="tw:hidden"
                onChange={onSelectLogo}
                data-testid="logo-input"
              />
            </>
          )}
          {logo && (
            <Button variant="secondary" onClick={() => setLogo(undefined)}>
              <FontAwesomeIcon icon={faXmark} />
              <div className="tw:truncate">Clear logo ({logo.name})</div>
            </Button>
          )}

          <div className="tw:my-auto">
            <hr className="tw:my-2" />
          </div>

          <div className="tw:flex tw:flex-col tw:gap-2">
            <QrFormatDropdown format={format} onChange={(format) => setQrOption({ format })} />
            <div className="tw:flex tw:items-center tw:gap-2">
              <Button onClick={copy} aria-label="Copy data URI" title="Copy data URI" className="tw:h-full">
                <FontAwesomeIcon icon={copied ? faCheck : faClone} fixedWidth />
              </Button>
              <Button solid onClick={downloadQrCode} className="tw:grow">
                Download <FontAwesomeIcon icon={downloadIcon} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CardModal>
  );
};
