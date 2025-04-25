import { faDotCircle as defaultDomainIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Table } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { useEffect } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import type { ShlinkDomainRedirects } from '../api-contract';
import type { Domain } from './data';
import { DomainDropdown } from './helpers/DomainDropdown';
import { DomainStatusIcon } from './helpers/DomainStatusIcon';
import type { EditDomainRedirects } from './reducers/domainRedirects';

interface DomainRowProps {
  domain: Domain;
  defaultRedirects?: ShlinkDomainRedirects;
  editDomainRedirects: (redirects: EditDomainRedirects) => Promise<void>;
  checkDomainHealth: (domain: string) => void;
}

const Nr: FC<{ fallback?: string | null }> = ({ fallback }) => (
  <span className="tw:text-gray-500">
    {!fallback && <small>No redirect</small>}
    {fallback && <>{fallback} <small>(as fallback)</small></>}
  </span>
);
const DefaultDomain: FC = () => (
  <>
    <FontAwesomeIcon fixedWidth icon={defaultDomainIcon} className="tw:text-brand" id="defaultDomainIcon" />
    <UncontrolledTooltip target="defaultDomainIcon" placement="right">Default domain</UncontrolledTooltip>
  </>
);

export const DomainRow: FC<DomainRowProps> = (
  { domain, editDomainRedirects, checkDomainHealth, defaultRedirects },
) => {
  const { domain: authority, isDefault, redirects, status } = domain;

  useEffect(() => {
    checkDomainHealth(domain.domain);
  }, [checkDomainHealth, domain.domain]);

  return (
    <Table.Row className="tw:max-md:relative">
      <Table.Cell columnName="Is default domain">{isDefault && <DefaultDomain />}</Table.Cell>
      <Table.Cell columnName="Domain"><b>{authority}</b></Table.Cell>
      <Table.Cell columnName="Base path redirect">
        {redirects?.baseUrlRedirect ?? <Nr fallback={defaultRedirects?.baseUrlRedirect} />}
      </Table.Cell>
      <Table.Cell columnName="Regular 404 redirect">
        {redirects?.regular404Redirect ?? <Nr fallback={defaultRedirects?.regular404Redirect} />}
      </Table.Cell>
      <Table.Cell columnName="Invalid short URL redirect">
        {redirects?.invalidShortUrlRedirect ?? <Nr fallback={defaultRedirects?.invalidShortUrlRedirect} />}
      </Table.Cell>
      <Table.Cell className="tw:lg:text-center" columnName="Status">
        <DomainStatusIcon status={status} />
      </Table.Cell>
      <Table.Cell className="tw:text-right tw:max-md:absolute tw:max-md:-top-0.5 tw:max-md:right-0">
        <DomainDropdown domain={domain} editDomainRedirects={editDomainRedirects} />
      </Table.Cell>
    </Table.Row>
  );
};
