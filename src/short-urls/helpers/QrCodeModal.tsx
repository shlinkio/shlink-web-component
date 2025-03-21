import { faFileDownload as downloadIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';
import { useCallback , useRef , useState } from 'react';
import { ExternalLink } from 'react-external-link';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { ColorInput } from '../../utils/components/ColorInput';
import type { QrRef } from '../../utils/components/QrCode';
import { QrCode } from '../../utils/components/QrCode';
import { useFeature } from '../../utils/features';
import type { QrCodeFormat, QrErrorCorrection } from '../../utils/helpers/qrCodes';
import type { ShortUrlModalProps } from '../data';
import { QrDimensionControl } from './qr-codes/QrDimensionControl';
import { QrErrorCorrectionDropdown } from './qr-codes/QrErrorCorrectionDropdown';
import './QrCodeModal.scss';

export const QrCodeModal: FC<ShortUrlModalProps> = ({ shortUrl: { shortUrl, shortCode }, toggle, isOpen }) => {
  // TODO Allow customizing defaults via settings
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(0);
  const [errorCorrection, setErrorCorrection] = useState<QrErrorCorrection>('L');
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

  const qrCodeColorsSupported = useFeature('qrCodeColors');

  const qrCodeRef = useRef<QrRef>(null);
  const downloadQrCode = useCallback(
    (format: QrCodeFormat = 'png') => qrCodeRef.current?.download(`${shortCode}-qr-code`, format),
    [shortCode],
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>
        QR code for <ExternalLink href={shortUrl}>{shortUrl}</ExternalLink>
      </ModalHeader>
      <ModalBody className="d-flex flex-column-reverse flex-lg-row gap-3">
        <div className="flex-grow-1 d-flex align-items-center justify-content-around text-center qr-code-modal__qr-code">
          <QrCode
            ref={qrCodeRef}
            size={size}
            data={shortUrl}
            bgColor={bgColor}
            color={color}
            margin={margin}
            errorCorrection={errorCorrection}
          />
        </div>
        <div className="d-flex flex-column gap-2 qr-code-modal__controls">
          <QrDimensionControl
            name="size"
            value={size}
            onChange={setSize}
            step={10}
            min={50}
            max={1000}
            initial={300}
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

          <div className="mt-auto">
            <Button block color="primary" onClick={() => downloadQrCode()}>
              Download <FontAwesomeIcon icon={downloadIcon} className="ms-1" />
            </Button>
          </div>

        </div>
      </ModalBody>
    </Modal>
  );
};
