import { faClone } from '@fortawesome/free-regular-svg-icons';
import { faCheck, faFileDownload as downloadIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useCallback , useRef , useState } from 'react';
import { ExternalLink } from 'react-external-link';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { ColorInput } from '../../utils/components/ColorInput';
import type { QrRef } from '../../utils/components/QrCode';
import { QrCode } from '../../utils/components/QrCode';
import { useFeature } from '../../utils/features';
import { copyToClipboard } from '../../utils/helpers/clipboard';
import type { QrCodeFormat, QrErrorCorrection } from '../../utils/helpers/qrCodes';
import type { ShortUrlModalProps } from '../data';
import { QrDimensionControl } from './qr-codes/QrDimensionControl';
import { QrErrorCorrectionDropdown } from './qr-codes/QrErrorCorrectionDropdown';
import { QrFormatDropdown } from './qr-codes/QrFormatDropdown';
import './QrCodeModal.scss';

export const QrCodeModal: FC<ShortUrlModalProps> = ({ shortUrl: { shortUrl, shortCode }, toggle, isOpen }) => {
  // TODO Allow customizing defaults via settings
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(0);
  const [errorCorrection, setErrorCorrection] = useState<QrErrorCorrection>('L');
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [format, setFormat] = useState<QrCodeFormat>('png');

  const qrCodeColorsSupported = useFeature('qrCodeColors');

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

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>
        QR code for <ExternalLink href={shortUrl}>{shortUrl}</ExternalLink>
      </ModalHeader>
      <ModalBody className="d-flex flex-column-reverse flex-lg-row gap-3">
        <div className="flex-grow-1 d-flex align-items-center justify-content-around qr-code-modal__qr-code">
          <div className="d-flex flex-column gap-1">
            <QrCode
              ref={qrCodeRef}
              data={shortUrl}
              size={size}
              margin={margin}
              errorCorrection={errorCorrection}
              color={color}
              bgColor={bgColor}
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

          {qrCodeColorsSupported && (
            <>
              <ColorInput name="color" color={color} onChange={setColor} />
              <ColorInput name="background" color={bgColor} onChange={setBgColor} />
            </>
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
