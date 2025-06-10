import { Dropdown } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { ComponentProps } from 'react';
import { useCallback } from 'react';
import type { ShlinkOrphanVisitType } from '../../api-contract';
import type { VisitsFilter } from '../types';

export type DropdownOptions = VisitsFilter & { loadPrevInterval?: boolean };

interface VisitsDropdownProps {
  onChange: (selected: DropdownOptions) => void;
  selected?: DropdownOptions;
  isOrphanVisits?: boolean;
  withPrevInterval?: boolean;
  disabled?: boolean;
}

export const VisitsDropdown = ({
  onChange,
  selected = {},
  isOrphanVisits = false,
  withPrevInterval = false,
  disabled,
}: VisitsDropdownProps) => {
  const { orphanVisitsType, excludeBots = false, loadPrevInterval = false } = selected;
  const propsForOrphanVisitsTypeItem = (type: ShlinkOrphanVisitType): ComponentProps<typeof Dropdown.Item> => ({
    selected: orphanVisitsType === type,
    onClick: () => onChange({ ...selected, orphanVisitsType: type === orphanVisitsType ? undefined : type }),
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
    <Dropdown buttonDisabled={disabled} buttonContent="More" buttonClassName="tw:w-full" menuAlignment="right">
      {withPrevInterval && (
        <>
          <Dropdown.Item selected={loadPrevInterval} onClick={onPrevIntervalClick}>
            Compare with previous period
          </Dropdown.Item>
          <Dropdown.Separator />
        </>
      )}

      <Dropdown.Title>Bots:</Dropdown.Title>
      <Dropdown.Item selected={excludeBots} onClick={onBotsClick}>Exclude potential bots</Dropdown.Item>

      {isOrphanVisits && (
        <>
          <Dropdown.Separator />
          <Dropdown.Title>Orphan visits type:</Dropdown.Title>
          <Dropdown.Item {...propsForOrphanVisitsTypeItem('base_url')}>Base URL</Dropdown.Item>
          <Dropdown.Item {...propsForOrphanVisitsTypeItem('invalid_short_url')}>Invalid short URL</Dropdown.Item>
          <Dropdown.Item {...propsForOrphanVisitsTypeItem('regular_404')}>Regular 404</Dropdown.Item>
        </>
      )}

      <Dropdown.Separator />
      <Dropdown.Item
        disabled={
          selected.excludeBots === undefined
          && selected.loadPrevInterval === undefined
          && selected.orphanVisitsType === undefined
        }
        onClick={() => onChange({ excludeBots: undefined, loadPrevInterval: undefined, orphanVisitsType: undefined })}
      >
        <i>Reset to defaults</i>
      </Dropdown.Item>
    </Dropdown>
  );
};
