import { faDotCircle as defaultDomainIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Table, Tooltip, useTooltip } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useEffect } from 'react';
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
  <span className="text-gray-500 dark:text-gray-400">
    {!fallback && <small>No redirect</small>}
    {fallback && <>{fallback} <small>(as fallback)</small></>}
  </span>
);
const DefaultDomain: FC = () => {
  const { anchor, tooltip } = useTooltip();
  return (
    <>
      <FontAwesomeIcon
        {...anchor}

        icon={defaultDomainIcon}
        className="text-lm-brand dark:text-dm-brand"
        data-testid="default-domain-icon"
      />
      <Tooltip {...tooltip}>Default domain foo</Tooltip>
    </>
  );
};

export const DomainRow: FC<DomainRowProps> = (
  { domain, editDomainRedirects, checkDomainHealth, defaultRedirects },
) => {
  const { domain: authority, isDefault, redirects, status } = domain;

  useEffect(() => {
    checkDomainHealth(domain.domain);
  }, [checkDomainHealth, domain.domain]);

  return (
    <Table.Row className="relative">
      <Table.Cell columnName="Is default domain:">{isDefault && <DefaultDomain />}</Table.Cell>
      <Table.Cell columnName="Domain:"><b>{authority}</b></Table.Cell>
      <Table.Cell columnName="Base path redirect:">
        {redirects?.baseUrlRedirect ?? <Nr fallback={defaultRedirects?.baseUrlRedirect} />}
      </Table.Cell>
      <Table.Cell columnName="Regular 404 redirect:">
        {redirects?.regular404Redirect ?? <Nr fallback={defaultRedirects?.regular404Redirect} />}
      </Table.Cell>
      <Table.Cell columnName="Invalid short URL redirect:">
        {redirects?.invalidShortUrlRedirect ?? <Nr fallback={defaultRedirects?.invalidShortUrlRedirect} />}
      </Table.Cell>
      <Table.Cell className="lg:text-center max-lg:border-none" columnName="Status:">
        <DomainStatusIcon status={status} />
      </Table.Cell>
      <Table.Cell className="text-right max-lg:absolute max-lg:top-1 max-lg:right-1 max-lg:p-0">
        <DomainDropdown domain={domain} editDomainRedirects={editDomainRedirects} />
      </Table.Cell>
    </Table.Row>
  );
};
