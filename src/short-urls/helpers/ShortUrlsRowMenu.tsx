import {
  faArrowsSplitUpAndLeft as rulesIcon,
  faChartLine as lineChartIcon,
  faChartPie as pieChartIcon,
  faEdit as editIcon,
  faMinusCircle as deleteIcon,
  faQrcode as qrIcon,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RowDropdown, useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useCallback } from 'react';
import type { ShlinkShortUrl } from '../../api-contract';
import { isErrorAction } from '../../api-contract/utils';
import { useSetting } from '../../settings';
import { useRoutesPrefix } from '../../utils/routesPrefix';
import { useVisitsComparisonContext } from '../../visits/visits-comparison/VisitsComparisonContext';
import { useUrlDeletion } from '../reducers/shortUrlDeletion';
import { DeleteShortUrlModal } from './DeleteShortUrlModal';
import { shortUrlToQuery } from './index';
import { QrCodeModal } from './QrCodeModal';
import type { LinkSuffix } from './ShortUrlDetailLink';
import { buildUrl } from './ShortUrlDetailLink';

export type ShortUrlsRowMenuProps = {
  shortUrl: ShlinkShortUrl;
};

export const ShortUrlsRowMenu: FC<ShortUrlsRowMenuProps> = ({ shortUrl }) => {
  const { flag: isQrModalOpen, setToTrue: openQrCodeModal, setToFalse: closeQrCodeModal } = useToggle();
  const { flag: isDeleteModalOpen, setToTrue: openDeleteModal, setToFalse: closeDeleteModal } = useToggle();
  const visitsComparison = useVisitsComparisonContext();
  const { confirmDeletions = true } = useSetting('shortUrlsList', {});

  const { deleteShortUrl, shortUrlDeleted } = useUrlDeletion();
  const doDeleteShortUrl = useCallback(async () => {
    const result = await deleteShortUrl(shortUrl);
    if (!isErrorAction(result)) {
      shortUrlDeleted(shortUrl);
    }
  }, [deleteShortUrl, shortUrl, shortUrlDeleted]);

  const routePrefix = useRoutesPrefix();
  const buildUrlDetailLink = useCallback(
    (suffix: LinkSuffix) => buildUrl(routePrefix, shortUrl, suffix),
    [routePrefix, shortUrl],
  );

  return (
    <>
      <RowDropdown menuAlignment="right">
        <RowDropdown.Item to={buildUrlDetailLink('visits')} className="gap-1.5">
          <FontAwesomeIcon icon={pieChartIcon} /> Visit stats
        </RowDropdown.Item>
        {visitsComparison && (
          <>
            <RowDropdown.Item
              className="gap-1.5"
              disabled={!visitsComparison.canAddItemWithName(shortUrl.shortUrl)}
              onClick={() => visitsComparison.addItemToCompare({
                name: shortUrl.shortUrl,
                query: shortUrlToQuery(shortUrl),
              })}
            >
              <FontAwesomeIcon icon={lineChartIcon} /> Compare visits
            </RowDropdown.Item>

            <RowDropdown.Separator />
          </>
        )}

        <RowDropdown.Item to={buildUrlDetailLink('edit')} className="gap-1.5">
          <FontAwesomeIcon icon={editIcon} /> Edit short URL
        </RowDropdown.Item>

        <RowDropdown.Item to={buildUrlDetailLink('redirect-rules')} className="gap-1.5">
          <FontAwesomeIcon icon={rulesIcon} /> Manage redirect rules
        </RowDropdown.Item>

        <RowDropdown.Item onClick={openQrCodeModal} className="gap-1.5">
          <FontAwesomeIcon icon={qrIcon} /> QR code
        </RowDropdown.Item>

        <RowDropdown.Separator />

        <RowDropdown.Item
          className="[&]:text-danger gap-1.5"
          onClick={confirmDeletions ? openDeleteModal : doDeleteShortUrl}
        >
          <FontAwesomeIcon icon={deleteIcon} /> Delete short URL
        </RowDropdown.Item>
      </RowDropdown>

      <QrCodeModal shortUrl={shortUrl} isOpen={isQrModalOpen} onClose={closeQrCodeModal} />
      <DeleteShortUrlModal shortUrl={shortUrl} isOpen={isDeleteModalOpen} onClose={closeDeleteModal} />
    </>
  );
};
