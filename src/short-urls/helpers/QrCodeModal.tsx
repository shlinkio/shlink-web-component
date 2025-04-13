import { faClone, faImage } from '@fortawesome/free-regular-svg-icons';
import { faCheck, faFileDownload as downloadIcon, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import type { ChangeEvent, FC } from 'react';
import { useCallback , useRef , useState } from 'react';
import { ExternalLink } from 'react-external-link';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { ColorInput } from '../../utils/components/ColorInput';
import type { QrRef } from '../../utils/components/QrCode';
import { QrCode } from '../../utils/components/QrCode';
import { copyToClipboard } from '../../utils/helpers/clipboard';
import type { QrCodeFormat, QrDrawType, QrErrorCorrection } from '../../utils/helpers/qrCodes';
import type { ShortUrlModalProps } from '../data';
import { QrDimensionControl } from './qr-codes/QrDimensionControl';
import { QrErrorCorrectionDropdown } from './qr-codes/QrErrorCorrectionDropdown';
import { QrFormatDropdown } from './qr-codes/QrFormatDropdown';
import './QrCodeModal.scss';

export type QrCodeModalProps = ShortUrlModalProps & {
  qrDrawType?: QrDrawType;
};

export const QrCodeModal: FC<QrCodeModalProps> = (
  { shortUrl: { shortUrl, shortCode }, toggle, isOpen, qrDrawType },
) => {
  // TODO Allow customizing defaults via settings
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(0);
  const [errorCorrection, setErrorCorrection] = useState<QrErrorCorrection>('L');
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [format, setFormat] = useState<QrCodeFormat>('png');
  const [logo, setLogo] = useState<{ url: string; name: string }>();

  const logoInputRef = useRef<HTMLInputElement>(null);
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
    setSize(300);
    setMargin(0);
    setErrorCorrection('L');
    setColor('#000000');
    setBgColor('#ffffff');
    setFormat('png');
    setLogo(undefined);
  }, []);

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
            onChange={setSize}
            step={10}
            min={50}
            max={1000}
          />
          <QrDimensionControl
            name="margin"
            value={margin}
            onChange={setMargin}
            step={1}
            min={0}
            max={100}
          />
          <QrErrorCorrectionDropdown errorCorrection={errorCorrection} onChange={setErrorCorrection} />
          <ColorInput name="color" color={color} onChange={setColor} />
          <ColorInput name="background" color={bgColor} onChange={setBgColor} />

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
            <QrFormatDropdown format={format} onChange={setFormat} />
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
