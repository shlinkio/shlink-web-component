import { faFileDownload as downloadIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import { ExternalLink } from 'react-external-link';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { CopyToClipboardIcon } from '../../utils/components/CopyToClipboardIcon';
import { useFeature } from '../../utils/features';
import type { QrCodeFormat, QrErrorCorrection } from '../../utils/helpers/qrCodes';
import { buildQrCodeUrl } from '../../utils/helpers/qrCodes';
import type { ImageDownloader } from '../../utils/services/ImageDownloader';
import type { ShortUrlModalProps } from '../data';
import { QrColorControl } from './qr-codes/QrColorControl';
import { QrDimensionControl } from './qr-codes/QrDimensionControl';
import { QrErrorCorrectionDropdown } from './qr-codes/QrErrorCorrectionDropdown';
import { QrFormatDropdown } from './qr-codes/QrFormatDropdown';
import './QrCodeModal.scss';

type QrCodeModalDeps = {
  ImageDownloader: ImageDownloader
};

const QrCodeModal: FCWithDeps<ShortUrlModalProps, QrCodeModalDeps> = (
  { shortUrl: { shortUrl, shortCode }, toggle, isOpen },
) => {
  const { ImageDownloader: imageDownloader } = useDependencies(QrCodeModal);
  const [size, setSize] = useState<number>();
  const [margin, setMargin] = useState<number>();
  const [format, setFormat] = useState<QrCodeFormat>();
  const [errorCorrection, setErrorCorrection] = useState<QrErrorCorrection>();
  const [color, setColor] = useState<string>();
  const [bgColor, setBgColor] = useState<string>();

  const qrCodeColorsSupported = useFeature('qrCodeColors');

  const qrCodeUrl = useMemo(
    () => buildQrCodeUrl(shortUrl, { size, format, margin, errorCorrection, color, bgColor }),
    [shortUrl, size, format, margin, errorCorrection, color, bgColor],
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>
        QR code for <ExternalLink href={shortUrl}>{shortUrl}</ExternalLink>
      </ModalHeader>
      <ModalBody className="d-flex flex-column-reverse flex-lg-row gap-3">
        <div className="flex-grow-1 d-flex align-items-center justify-content-around text-center">
          <img src={qrCodeUrl} alt="QR code" className="shadow" style={{ maxWidth: '100%' }} />
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
          <QrFormatDropdown format={format} onChange={setFormat}/>
          <QrErrorCorrectionDropdown errorCorrection={errorCorrection} onChange={setErrorCorrection}/>

          {qrCodeColorsSupported && (
            <>
              <QrColorControl name="color" initialColor="#000000" color={color} onChange={setColor}/>
              <QrColorControl name="background" initialColor="#ffffff" color={bgColor} onChange={setBgColor}/>
            </>
          )}

          <div className="mt-auto">
            <Button
              block
              color="primary"
              onClick={() => {
                imageDownloader.saveImage(qrCodeUrl, `${shortCode}-qr-code.${format ?? 'png'}`).catch(() => {
                });
              }}
            >
              Download <FontAwesomeIcon icon={downloadIcon} className="ms-1"/>
            </Button>
          </div>
        </div>
      </ModalBody>
      <ModalFooter
        className="sticky-bottom justify-content-around"
        style={{ backgroundColor: 'var(--primary-color)', zIndex: '1' }}
      >
        <div className="text-center">
          <ExternalLink href={qrCodeUrl}/>
          <CopyToClipboardIcon text={qrCodeUrl}/>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export const QrCodeModalFactory = componentFactory(QrCodeModal, ['ImageDownloader']);
