import {
  faChartLine as lineChartIcon,
  faChartPie as pieChartIcon,
  faEdit as editIcon,
  faList as listIcon,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RowDropdownBtn, useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { DropdownItem } from 'reactstrap';
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
  const [isModalOpen, toggleModal] = useToggle();
  const routesPrefix = useRoutesPrefix();
  const visitsComparison = useVisitsComparisonContext();
  const canFilterShortUrlsByDomain = useFeature('filterShortUrlsByDomain');

  return (
    <RowDropdownBtn>
      <DropdownItem
        tag={Link}
        to={`${routesPrefix}/domain/${domain.domain}${domain.isDefault ? `_${DEFAULT_DOMAIN}` : ''}/visits`}
      >
        <FontAwesomeIcon icon={pieChartIcon} fixedWidth /> Visit stats
      </DropdownItem>
      <DropdownItem
        disabled={!visitsComparison || !visitsComparison.canAddItemWithName(domain.domain)}
        onClick={() => visitsComparison?.addItemToCompare({
          name: domain.domain,
          query: domain.domain,
        })}
      >
        <FontAwesomeIcon icon={lineChartIcon} fixedWidth /> Compare visits
      </DropdownItem>

      {canFilterShortUrlsByDomain && (
        <DropdownItem
          tag={Link}
          to={`${routesPrefix}/list-short-urls/1?domain=${domain.isDefault ? DEFAULT_DOMAIN : domain.domain}`}
        >
          <FontAwesomeIcon icon={listIcon} fixedWidth /> Short URLs
        </DropdownItem>
      )}

      <DropdownItem divider tag="hr" />
      <DropdownItem onClick={toggleModal}>
        <FontAwesomeIcon icon={editIcon} fixedWidth /> Edit redirects
      </DropdownItem>

      <EditDomainRedirectsModal
        domain={domain}
        isOpen={isModalOpen}
        toggle={toggleModal}
        editDomainRedirects={editDomainRedirects}
      />
    </RowDropdownBtn>
  );
};
