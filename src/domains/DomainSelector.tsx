import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, Input,useToggle  } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import { useCallback } from 'react';
import { Muted } from '../utils/components/Muted';
import type { Domain } from './data';

export interface DomainSelectorProps {
  value?: string;
  onChange: (domain: string) => void;
  domains: Domain[];
}

export const DomainSelector = ({ domains, value, onChange }: DomainSelectorProps) => {
  const { flag: inputDisplayed, setToTrue: showInput, setToFalse: hideInput } = useToggle();
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
      buttonClassName={clsx('w-full', { 'text-placeholder': valueIsEmpty })}
    >
      {domains.map(({ domain, isDefault }) => (
        <Dropdown.Item
          key={domain}
          selected={(value === domain || isDefault) && valueIsEmpty}
          onClick={() => onChange(domain)}
          className="flex justify-between items-center"
        >
          {domain}
          {isDefault && <Muted>default</Muted>}
        </Dropdown.Item>
      ))}
      <Dropdown.Separator />
      <Dropdown.Item onClick={unselectDomainAndShowInput}>
        <i>New domain</i>
      </Dropdown.Item>
    </Dropdown>
  );
};
