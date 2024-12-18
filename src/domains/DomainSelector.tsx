import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DropdownBtn, useToggle } from '@shlinkio/shlink-frontend-kit';
import { useCallback } from 'react';
import type { InputProps } from 'reactstrap';
import { Button, DropdownItem, Input, InputGroup, UncontrolledTooltip } from 'reactstrap';
import type { Domain } from './data';
import './DomainSelector.scss';

export interface DomainSelectorProps extends Omit<InputProps, 'onChange'> {
  value?: string;
  onChange: (domain: string) => void;
  domains: Domain[];
}

export const DomainSelector = ({ domains, value, onChange }: DomainSelectorProps) => {
  const [inputDisplayed,, showInput, hideInput] = useToggle();
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
    <InputGroup>
      <Input
        value={value ?? ''}
        placeholder="Domain"
        onChange={(e) => onChange(e.target.value)}
      />
      <Button
        id="backToDropdown"
        outline
        type="button"
        className="domains-dropdown__back-btn"
        aria-label="Back to domains list"
        onClick={unselectDomainAndHideInput}
      >
        <FontAwesomeIcon icon={faUndo} />
      </Button>
      <UncontrolledTooltip target="backToDropdown" placement="left" trigger="hover">
        Existing domains
      </UncontrolledTooltip>
    </InputGroup>
  ) : (
    <DropdownBtn
      text={valueIsEmpty ? 'Domain' : `Domain: ${value}`}
      className={!valueIsEmpty ? 'domains-dropdown__toggle-btn--active' : 'domains-dropdown__toggle-btn'}
    >
      {domains.map(({ domain, isDefault }) => (
        <DropdownItem
          key={domain}
          active={(value === domain || isDefault) && valueIsEmpty}
          onClick={() => onChange(domain)}
          className="d-flex justify-content-between align-items-center"
        >
          {domain}
          {isDefault && <span className="text-muted">default</span>}
        </DropdownItem>
      ))}
      <DropdownItem divider />
      <DropdownItem onClick={unselectDomainAndShowInput}>
        <i>New domain</i>
      </DropdownItem>
    </DropdownBtn>
  );
};
