import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DropdownBtn, useToggle } from '@shlinkio/shlink-frontend-kit';
import { Button, Input } from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import { useCallback } from 'react';
import { DropdownItem } from 'reactstrap';
import { Muted } from '../utils/components/Muted';
import type { Domain } from './data';

export interface DomainSelectorProps {
  value?: string;
  onChange: (domain: string) => void;
  domains: Domain[];
}

export const DomainSelector = ({ domains, value, onChange }: DomainSelectorProps) => {
  const { flag: inputDisplayed, setToTrue: showInput, setToFalse: hideInput } = useToggle(false, true);
  const valueIsEmpty = !value;
  const unselectDomainAndHideInput = useCallback(() => {
    onChange('');
    hideInput();
  }, [onChange, hideInput]);
  const unselectDomainAndShowInput = useCallback(() => {
    onChange('');
    showInput();
  }, [onChange, showInput]);

  return inputDisplayed ? (
    <div className="tw:flex">
      <Input
        value={value ?? ''}
        placeholder="Domain"
        onChange={(e) => onChange(e.target.value)}
        className="tw:flex-grow tw:rounded-r-none tw:[&]:border-r-0"
      />
      <Button
        variant="secondary"
        type="button"
        className="tw:rounded-l-none"
        aria-label="Back to domains list"
        title="Existing domains"
        onClick={unselectDomainAndHideInput}
      >
        <FontAwesomeIcon icon={faUndo} />
      </Button>
    </div>
  ) : (
    <DropdownBtn
      text={valueIsEmpty ? 'Domain' : `Domain: ${value}`}
      className={clsx({ 'tw:text-placeholder': valueIsEmpty })}
    >
      {domains.map(({ domain, isDefault }) => (
        <DropdownItem
          key={domain}
          active={(value === domain || isDefault) && valueIsEmpty}
          onClick={() => onChange(domain)}
          className="tw:flex tw:justify-between tw:items-center"
        >
          {domain}
          {isDefault && <Muted>default</Muted>}
        </DropdownItem>
      ))}
      <DropdownItem divider />
      <DropdownItem onClick={unselectDomainAndShowInput}>
        <i>New domain</i>
      </DropdownItem>
    </DropdownBtn>
  );
};
