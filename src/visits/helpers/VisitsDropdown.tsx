import { DropdownBtn } from '@shlinkio/shlink-frontend-kit';
import { useCallback } from 'react';
import type { DropdownItemProps } from 'reactstrap';
import { DropdownItem } from 'reactstrap';
import type { ShlinkOrphanVisitType } from '../../api-contract';
import type { VisitsFilter } from '../types';

export type DropdownOptions = VisitsFilter & { loadPrevInterval?: boolean };

interface VisitsDropdownProps {
  onChange: (selected: DropdownOptions) => void;
  selected?: DropdownOptions;
  className?: string;
  isOrphanVisits?: boolean;
  withPrevInterval?: boolean;
  disabled?: boolean;
}

export const VisitsDropdown = ({
  onChange,
  selected = {},
  className,
  isOrphanVisits = false,
  withPrevInterval = false,
  disabled,
}: VisitsDropdownProps) => {
  const { orphanVisitsType, excludeBots = false, loadPrevInterval = false } = selected;
  const propsForOrphanVisitsTypeItem = (type: ShlinkOrphanVisitType): DropdownItemProps => ({
    active: orphanVisitsType === type,
    onClick: () => onChange({ orphanVisitsType: type === orphanVisitsType ? undefined : type }),
  });
  const onBotsClick = useCallback(
    () => onChange({ ...selected, excludeBots: !excludeBots }),
    [excludeBots, onChange, selected],
  );
  const onPrevIntervalClick = useCallback(
    () => onChange({ ...selected, loadPrevInterval: !loadPrevInterval }),
    [loadPrevInterval, onChange, selected],
  );

  return (
    <DropdownBtn disabled={disabled} text="More" dropdownClassName={className} end minWidth={250}>
      {withPrevInterval && (
        <>
          <DropdownItem active={loadPrevInterval} onClick={onPrevIntervalClick}>
            Compare with previous period
          </DropdownItem>
          <DropdownItem divider tag="hr" />
        </>
      )}

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
        disabled={
          selected.excludeBots === undefined
          && selected.loadPrevInterval === undefined
          && selected.orphanVisitsType === undefined
        }
        onClick={() => onChange({ excludeBots: undefined, loadPrevInterval: undefined, orphanVisitsType: undefined })}
      >
        <i>Reset to defaults</i>
      </DropdownItem>
    </DropdownBtn>
  );
};
