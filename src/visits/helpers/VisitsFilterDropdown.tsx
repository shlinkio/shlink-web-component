import { DropdownBtn } from '@shlinkio/shlink-frontend-kit';
import { useCallback } from 'react';
import type { DropdownItemProps } from 'reactstrap';
import { DropdownItem } from 'reactstrap';
import type { ShlinkOrphanVisitType } from '../../api-contract';
import { hasValue } from '../../utils/helpers';
import type { VisitsFilter } from '../types';

interface VisitsFilterDropdownProps {
  onChange: (filters: VisitsFilter) => void;
  selected?: VisitsFilter;
  className?: string;
  isOrphanVisits?: boolean;
}

export const VisitsFilterDropdown = (
  { onChange, selected = {}, className, isOrphanVisits = false }: VisitsFilterDropdownProps,
) => {
  const { orphanVisitsType, excludeBots = false } = selected;
  const propsForOrphanVisitsTypeItem = (type: ShlinkOrphanVisitType): DropdownItemProps => ({
    active: orphanVisitsType === type,
    onClick: () => onChange({ ...selected, orphanVisitsType: type === selected?.orphanVisitsType ? undefined : type }),
  });
  const onBotsClick = useCallback(
    () => onChange({ ...selected, excludeBots: !selected?.excludeBots }),
    [onChange, selected],
  );

  return (
    <DropdownBtn text="Filters" dropdownClassName={className} end minWidth={250}>
      <DropdownItem header aria-hidden>Bots:</DropdownItem>
      <DropdownItem active={excludeBots} onClick={onBotsClick}>Exclude potential bots</DropdownItem>

      {isOrphanVisits && (
        <>
          <DropdownItem divider tag="hr" />
          <DropdownItem header aria-hidden>Orphan visits type:</DropdownItem>
          <DropdownItem {...propsForOrphanVisitsTypeItem('base_url')}>Base URL</DropdownItem>
          <DropdownItem {...propsForOrphanVisitsTypeItem('invalid_short_url')}>Invalid short URL</DropdownItem>
          <DropdownItem {...propsForOrphanVisitsTypeItem('regular_404')}>Regular 404</DropdownItem>
        </>
      )}

      <DropdownItem divider tag="hr" />
      <DropdownItem
        disabled={!hasValue(selected)}
        onClick={() => onChange({ excludeBots: false, orphanVisitsType: undefined })}
      >
        <i>Clear filters</i>
      </DropdownItem>
    </DropdownBtn>
  );
};
