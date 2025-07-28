import {
  faChartLine as lineChartIcon,
  faChartPie as pieChartIcon,
  faEdit as editIcon,
  faList as listIcon,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RowDropdown,useToggle  } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useFeature } from '../../utils/features';
import { useRoutesPrefix } from '../../utils/routesPrefix';
import { useVisitsComparisonContext } from '../../visits/visits-comparison/VisitsComparisonContext';
import type { Domain } from '../data';
import { DEFAULT_DOMAIN } from '../data';
import type { EditDomainRedirects } from '../reducers/domainRedirects';
import { EditDomainRedirectsModal } from './EditDomainRedirectsModal';

interface DomainDropdownProps {
  domain: Domain;
  editDomainRedirects: (redirects: EditDomainRedirects) => Promise<void>;
}

export const DomainDropdown: FC<DomainDropdownProps> = ({ domain, editDomainRedirects }) => {
  const { flag: isModalOpen, setToTrue: openModal, setToFalse: closeModal } = useToggle();
  const routesPrefix = useRoutesPrefix();
  const visitsComparison = useVisitsComparisonContext();
  const canFilterShortUrlsByDomain = useFeature('filterShortUrlsByDomain');

  return (
    <>
      <RowDropdown menuAlignment="right">
        <RowDropdown.Item
          className="gap-1.5"
          to={`${routesPrefix}/domain/${domain.domain}${domain.isDefault ? `_${DEFAULT_DOMAIN}` : ''}/visits`}
        >
          <FontAwesomeIcon icon={pieChartIcon} /> Visit stats
        </RowDropdown.Item>
        <RowDropdown.Item
          className="gap-1.5"
          disabled={!visitsComparison || !visitsComparison.canAddItemWithName(domain.domain)}
          onClick={() => visitsComparison?.addItemToCompare({
            name: domain.domain,
            query: domain.domain,
          })}
        >
          <FontAwesomeIcon icon={lineChartIcon} /> Compare visits
        </RowDropdown.Item>

        {canFilterShortUrlsByDomain && (
          <RowDropdown.Item
            className="gap-1.5"
            to={`${routesPrefix}/list-short-urls/1?domain=${domain.isDefault ? DEFAULT_DOMAIN : domain.domain}`}
          >
            <FontAwesomeIcon icon={listIcon} /> Short URLs
          </RowDropdown.Item>
        )}

        <RowDropdown.Separator />
        <RowDropdown.Item onClick={openModal} className="gap-1.5">
          <FontAwesomeIcon icon={editIcon} /> Edit redirects
        </RowDropdown.Item>
      </RowDropdown>

      <EditDomainRedirectsModal
        domain={domain}
        isOpen={isModalOpen}
        onClose={closeModal}
        editDomainRedirects={editDomainRedirects}
      />
    </>
  );
};
