import { DropdownBtn } from '@shlinkio/shlink-frontend-kit';
import { DropdownItem } from 'reactstrap';
import { hasValue } from '../../utils/helpers';
import type { ShortUrlsFilter } from '../data';

interface ShortUrlsFilterDropdownProps {
  onChange: (filters: ShortUrlsFilter) => void;
  supportsDisabledFiltering: boolean;
  selected?: ShortUrlsFilter;
  className?: string;
}

export const ShortUrlsFilterDropdown = (
  { onChange, selected = {}, className, supportsDisabledFiltering }: ShortUrlsFilterDropdownProps,
) => {
  const { excludeBots = false, excludeMaxVisitsReached = false, excludePastValidUntil = false } = selected;
  const onFilterClick = (key: keyof ShortUrlsFilter) => () => onChange({ ...selected, [key]: !selected?.[key] });

  return (
    <DropdownBtn text="Filters" dropdownClassName={className} inline end minWidth={250}>
      <DropdownItem header aria-hidden>Visits:</DropdownItem>
      <DropdownItem active={excludeBots} onClick={onFilterClick('excludeBots')}>Ignore visits from bots</DropdownItem>

      {supportsDisabledFiltering && (
        <>
          <DropdownItem divider tag="hr" />
          <DropdownItem header aria-hidden>Short URLs:</DropdownItem>
          <DropdownItem active={excludeMaxVisitsReached} onClick={onFilterClick('excludeMaxVisitsReached')}>
            Exclude with visits reached
          </DropdownItem>
          <DropdownItem active={excludePastValidUntil} onClick={onFilterClick('excludePastValidUntil')}>
            Exclude enabled in the past
          </DropdownItem>
        </>
      )}

      <DropdownItem divider tag="hr" />
      <DropdownItem
        disabled={!hasValue(selected)}
        onClick={() => onChange({ excludeBots: false, excludeMaxVisitsReached: false, excludePastValidUntil: false })}
      >
        <i>Clear filters</i>
      </DropdownItem>
    </DropdownBtn>
  );
};
