import {
  faArrowsSplitUpAndLeft as rulesIcon,
  faChartLine as lineChartIcon,
  faChartPie as pieChartIcon,
  faEdit as editIcon,
  faMinusCircle as deleteIcon,
  faQrcode as qrIcon,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RowDropdownBtn, useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useCallback } from 'react';
import { DropdownItem } from 'reactstrap';
import type { ShlinkShortUrl } from '../../api-contract';
import { isErrorAction } from '../../api-contract/utils';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { useSetting } from '../../settings';
import { useFeature } from '../../utils/features';
import { useVisitsComparisonContext } from '../../visits/visits-comparison/VisitsComparisonContext';
import type { ShortUrlIdentifier, ShortUrlModalProps } from '../data';
import type { DeleteShortUrlModalProps } from './DeleteShortUrlModal';
import { shortUrlToQuery } from './index';
import { ShortUrlDetailLink } from './ShortUrlDetailLink';

type ShortUrlsRowMenuProps = {
  shortUrl: ShlinkShortUrl;
};

type ShortUrlsRowMenuConnectProps = ShortUrlsRowMenuProps & {
  deleteShortUrl: (shortUrl: ShortUrlIdentifier) => Promise<void>;
  shortUrlDeleted: (shortUrl: ShortUrlIdentifier) => void;
};

type ShortUrlsRowMenuDeps = {
  DeleteShortUrlModal: FC<DeleteShortUrlModalProps>;
  QrCodeModal: FC<ShortUrlModalProps>;
};

const ShortUrlsRowMenu: FCWithDeps<ShortUrlsRowMenuConnectProps, ShortUrlsRowMenuDeps> = (
  { shortUrl, deleteShortUrl, shortUrlDeleted },
) => {
  const { DeleteShortUrlModal, QrCodeModal } = useDependencies(ShortUrlsRowMenu);
  const [isQrModalOpen,, openQrCodeModal, closeQrCodeModal] = useToggle();
  const [isDeleteModalOpen,, openDeleteModal, closeDeleteModal] = useToggle();
  const visitsComparison = useVisitsComparisonContext();
  const redirectRulesAreSupported = useFeature('shortUrlRedirectRules');
  const { confirmDeletions } = useSetting('shortUrlsList', { confirmDeletions: true });
  const doDeleteShortUrl = useCallback(async () => {
    const result = await deleteShortUrl(shortUrl);
    if (!isErrorAction(result)) {
      shortUrlDeleted(shortUrl);
    }
  }, [deleteShortUrl, shortUrl, shortUrlDeleted]);

  return (
    <RowDropdownBtn minWidth={redirectRulesAreSupported ? 220 : 190}>
      <DropdownItem tag={ShortUrlDetailLink} shortUrl={shortUrl} suffix="visits" asLink>
        <FontAwesomeIcon icon={pieChartIcon} fixedWidth /> Visit stats
      </DropdownItem>
      {visitsComparison && (
        <>
          <DropdownItem
            disabled={!visitsComparison.canAddItemWithName(shortUrl.shortUrl)}
            onClick={() => visitsComparison.addItemToCompare({
              name: shortUrl.shortUrl,
              query: shortUrlToQuery(shortUrl),
            })}
          >
            <FontAwesomeIcon icon={lineChartIcon} fixedWidth /> Compare visits
          </DropdownItem>

          <DropdownItem divider tag="hr" />
        </>
      )}

      <DropdownItem tag={ShortUrlDetailLink} shortUrl={shortUrl} suffix="edit" asLink>
        <FontAwesomeIcon icon={editIcon} fixedWidth /> Edit short URL
      </DropdownItem>

      {redirectRulesAreSupported && (
        <DropdownItem tag={ShortUrlDetailLink} shortUrl={shortUrl} suffix="redirect-rules" asLink>
          <FontAwesomeIcon icon={rulesIcon} fixedWidth /> Manage redirect rules
        </DropdownItem>
      )}

      <DropdownItem onClick={openQrCodeModal}>
        <FontAwesomeIcon icon={qrIcon} fixedWidth /> QR code
      </DropdownItem>
      <QrCodeModal shortUrl={shortUrl} isOpen={isQrModalOpen} toggle={closeQrCodeModal} />

      <DropdownItem divider tag="hr" />

      <DropdownItem className="dropdown-item--danger" onClick={confirmDeletions ? openDeleteModal : doDeleteShortUrl}>
        <FontAwesomeIcon icon={deleteIcon} fixedWidth /> Delete short URL
      </DropdownItem>
      <DeleteShortUrlModal
        shortUrl={shortUrl}
        deleteShortUrl={deleteShortUrl}
        shortUrlDeleted={shortUrlDeleted}
        isOpen={isDeleteModalOpen}
        toggle={closeDeleteModal}
      />
    </RowDropdownBtn>
  );
};

export type ShortUrlsRowMenuType = FC<ShortUrlsRowMenuProps>;

export const ShortUrlsRowMenuFactory = componentFactory(ShortUrlsRowMenu, ['DeleteShortUrlModal', 'QrCodeModal']);
