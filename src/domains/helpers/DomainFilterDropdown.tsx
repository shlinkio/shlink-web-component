import { Dropdown } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { Muted } from '../../utils/components/Muted';
import type { Domain } from '../data';
import { DEFAULT_DOMAIN } from '../data';

export type DomainFilterDropdownProps = {
  value?: string;
  onChange: (domain?: string) => void;

  /**
   * List of available domains.
   * The dropdown will be disabled if the list is empty.
   */
  domains: Domain[];
};

export const DomainFilterDropdown: FC<DomainFilterDropdownProps> = ({ domains, value, onChange }) => {
  const valueIsEmpty= !value;
  const prettyValue = value === DEFAULT_DOMAIN ? domains.find(({ isDefault }) => isDefault)?.domain : value;

  return (
    <Dropdown
      buttonContent={valueIsEmpty ? 'All domains' : <span>Domain: <b>{prettyValue}</b></span>}
      buttonClassName="w-full"
      menuAlignment="right"
      buttonDisabled={!domains.length}
    >
      <Dropdown.Item onClick={() => onChange()} selected={valueIsEmpty}>
        All domains
      </Dropdown.Item>
      <Dropdown.Separator />
      {domains.map(({ domain, isDefault }) => (
        <Dropdown.Item
          key={domain}
          selected={isDefault ? value === DEFAULT_DOMAIN : value === domain}
          onClick={() => onChange(isDefault ? DEFAULT_DOMAIN : domain)}
          className="flex justify-between items-center"
        >
          {domain}
          {isDefault && <Muted>default</Muted>}
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
};
