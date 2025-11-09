import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { DropdownProps } from '@shlinkio/shlink-frontend-kit';
import { Button, Dropdown, Input, useToggle } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import { useCallback } from 'react';
import { Muted } from '../utils/components/Muted';
import type { Domain } from './data';

export type DomainSelectorProps = {
  value?: string;
  onChange: (domain?: string) => void;

  /**
   * List of domains for select mode.
   * The dropdown will be disabled if the list is empty.
   */
  domains: Domain[];

  /**
   * Whether creating new domains should be possible.
   * `creation`: Can select existing domains or create new ones.
   * `selection` can only select existing domains.
   *
   * Defaults to `creation`
   */
  mode?: 'creation' | 'selection';
} & Pick<DropdownProps, 'menuAlignment'>;

export const DomainSelector = ({ domains, value, onChange, mode = 'creation', menuAlignment }: DomainSelectorProps) => {
  const { flag: inputDisplayed, setToTrue: showInput, setToFalse: hideInput } = useToggle();
  const valueIsEmpty = !value;
  const unselectDomainAndHideInput = useCallback(() => {
    onChange();
    hideInput();
  }, [onChange, hideInput]);
  const unselectDomainAndShowInput = useCallback(() => {
    onChange();
    showInput();
  }, [onChange, showInput]);

  return inputDisplayed && mode === 'creation' ? (
    <div className="flex">
      <Input
        value={value ?? ''}
        placeholder="Domain"
        onChange={(e) => onChange(e.target.value)}
        className="flex-grow rounded-r-none [&]:border-r-0"
      />
      <Button
        variant="secondary"
        type="button"
        className="rounded-l-none"
        aria-label="Back to domains list"
        title="Existing domains"
        onClick={unselectDomainAndHideInput}
      >
        <FontAwesomeIcon icon={faUndo} />
      </Button>
    </div>
  ) : (
    <Dropdown
      buttonContent={valueIsEmpty ? 'Domain' : `Domain: ${value}`}
      buttonClassName={clsx('w-full', { 'text-placeholder': valueIsEmpty && mode === 'creation' })}
      menuAlignment={menuAlignment}
      buttonDisabled={!domains.length}
    >
      {domains.map(({ domain, isDefault }) => (
        <Dropdown.Item
          key={domain}
          selected={
            mode === 'selection'
              ? value === domain
              : value === domain || (isDefault && valueIsEmpty)}
          onClick={() => onChange(domain)}
          className="flex justify-between items-center"
        >
          {domain}
          {isDefault && <Muted>default</Muted>}
        </Dropdown.Item>
      ))}
      <Dropdown.Separator />
      {mode === 'creation' ? (
        <Dropdown.Item onClick={unselectDomainAndShowInput}>
          <i>New domain</i>
        </Dropdown.Item>
      ) : (
        <Dropdown.Item onClick={() => onChange()} selected={valueIsEmpty}>
          All domains
        </Dropdown.Item>
      )}
    </Dropdown>
  );
};
