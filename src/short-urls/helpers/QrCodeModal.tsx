import { faClone, faImage } from '@fortawesome/free-regular-svg-icons';
import { faCheck, faFileDownload as downloadIcon, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import type { DrawType } from 'qr-code-styling';
import type { ChangeEvent, FC } from 'react';
import { useCallback , useRef , useState } from 'react';
import { ExternalLink } from 'react-external-link';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
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
import './QrCodeModal.scss';

export type QrCodeModalProps = ShortUrlModalProps & {
  qrDrawType?: DrawType;
};

export const QrCodeModal: FC<QrCodeModalProps> = (
  { shortUrl: { shortUrl, shortCode }, toggle, isOpen, qrDrawType },
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
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg" onClosed={resetOptions}>
      <ModalHeader toggle={toggle}>
        QR code for <ExternalLink href={shortUrl}>{shortUrl}</ExternalLink>
      </ModalHeader>
      <ModalBody className="d-flex flex-column-reverse flex-lg-row gap-3">
        <div className="flex-grow-1 d-flex align-items-center justify-content-around qr-code-modal__qr-code">
          <div className="d-flex flex-column gap-1 align-items-center" data-testid="qr-code-container">
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
            <div className="text-center fst-italic">Preview ({size + margin}x{size + margin})</div>
          </div>
        </div>
        <div className="d-flex flex-column gap-2 qr-code-modal__controls">
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
              <Button
                outline
                className="d-flex align-items-center gap-1"
                onClick={() => logoInputRef.current?.click()}
              >
                <FontAwesomeIcon icon={faImage} />
                Select logo
              </Button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                aria-hidden
                tabIndex={-1}
                className="d-none"
                onChange={onSelectLogo}
                data-testid="logo-input"
              />
            </>
          )}
          {logo && (
            <Button
              outline
              className="d-flex align-items-center gap-1"
              onClick={() => setLogo(undefined)}
            >
              <FontAwesomeIcon icon={faXmark} />
              <div className="text-truncate">Clear logo ({logo.name})</div>
            </Button>
          )}

          <div className="my-auto">
            <hr className="my-2" />
          </div>

          <div className="d-flex flex-column gap-2">
            <QrFormatDropdown format={format} onChange={(format) => setQrOption({ format })} />
            <div className="d-flex align-items-center gap-2">
              <Button outline color="primary" onClick={copy} aria-label="Copy data URI" title="Copy data URI">
                <FontAwesomeIcon icon={copied ? faCheck : faClone} fixedWidth />
              </Button>
              <Button color="primary" onClick={downloadQrCode} className="flex-grow-1">
                Download <FontAwesomeIcon icon={downloadIcon} className="ms-1" />
              </Button>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
