import { faFileDownload as downloadIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import { ExternalLink } from 'react-external-link';
import { Button, FormGroup, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { CopyToClipboardIcon } from '../../utils/components/CopyToClipboardIcon';
import type { QrCodeFormat, QrErrorCorrection } from '../../utils/helpers/qrCodes';
import { buildQrCodeUrl } from '../../utils/helpers/qrCodes';
import type { ImageDownloader } from '../../utils/services/ImageDownloader';
import type { ShortUrlModalProps } from '../data';
import { QrCodeDimensionControl } from './qr-codes/QrCodeDimensionControl';
import { QrErrorCorrectionDropdown } from './qr-codes/QrErrorCorrectionDropdown';
import { QrFormatDropdown } from './qr-codes/QrFormatDropdown';

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
  const qrCodeUrl = useMemo(
    () => buildQrCodeUrl(shortUrl, { size, format, margin, errorCorrection }),
    [shortUrl, size, format, margin, errorCorrection],
  );
  const [modalSize, setModalSize] = useState<'lg' | 'xl'>();

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size={modalSize}>
      <ModalHeader toggle={toggle}>
        QR code for <ExternalLink href={shortUrl}>{shortUrl}</ExternalLink>
      </ModalHeader>
      <ModalBody>
        <Row>
          <QrCodeDimensionControl
            className="col-sm-6"
            name="size"
            value={size}
            step={10}
            min={50}
            max={1000}
            initial={300}
            onChange={setSize}
          />
          <QrCodeDimensionControl
            className="col-sm-6"
            name="margin"
            value={margin}
            step={1}
            min={0}
            max={100}
            onChange={setMargin}
          />
          <FormGroup className="d-grid col-sm-6">
            <QrFormatDropdown format={format} setFormat={setFormat} />
          </FormGroup>
          <FormGroup className="col-sm-6">
            <QrErrorCorrectionDropdown errorCorrection={errorCorrection} setErrorCorrection={setErrorCorrection} />
          </FormGroup>
        </Row>
        <div className="text-center">
          <div className="mb-3">
            <ExternalLink href={qrCodeUrl} />
            <CopyToClipboardIcon text={qrCodeUrl} />
          </div>
          <img
            ref={(image) => {
              if (!image) {
                return;
              }

              image.addEventListener('load', () => {
                const { naturalWidth } = image;

                if (naturalWidth < 500) {
                  setModalSize(undefined);
                } else {
                  setModalSize(naturalWidth < 800 ? 'lg' : 'xl');
                }
              });
            }}
            src={qrCodeUrl}
            alt="QR code"
            className="shadow-lg"
            style={{ maxWidth: '100%' }}
          />
          <div className="mt-3">
            <Button
              block
              color="primary"
              onClick={() => {
                imageDownloader.saveImage(qrCodeUrl, `${shortCode}-qr-code.${format}`).catch(() => {});
              }}
            >
              Download <FontAwesomeIcon icon={downloadIcon} className="ms-1" />
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export const QrCodeModalFactory = componentFactory(QrCodeModal, ['ImageDownloader']);
