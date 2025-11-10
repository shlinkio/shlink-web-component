import { Dropdown } from '@shlinkio/shlink-frontend-kit';
import { useCallback } from 'react';

export type ShortUrlsFilter = {
  excludeBots?: boolean;
  excludeMaxVisitsReached?: boolean;
  excludePastValidUntil?: boolean;
};

export type ShortUrlsFilterDropdownProps = {
  onChange: (filters: ShortUrlsFilter) => void;
  selected?: ShortUrlsFilter;
};

export const ShortUrlsFilterDropdown = ({ onChange, selected = {} }: ShortUrlsFilterDropdownProps) => {
  const { excludeBots = false, excludeMaxVisitsReached = false, excludePastValidUntil = false } = selected;
  const amount = Number(excludeBots) + Number(excludeMaxVisitsReached) + Number(excludePastValidUntil);

  const partialUpdate = useCallback(
    (update: Partial<ShortUrlsFilter>) => onChange({ ...selected, ...update }),
    [onChange, selected],
  );
  const toggleFilter = useCallback(
    (key: keyof ShortUrlsFilter) => partialUpdate({ [key]: !selected?.[key] }),
    [partialUpdate, selected],
  );

  return (
    <Dropdown
      buttonContent={<span>More{amount > 0 ? <b> ({amount})</b> : ''}</span>}
      buttonClassName="w-full"
      menuAlignment="right"
    >
      <Dropdown.Title>Visits:</Dropdown.Title>
      <Dropdown.Item selected={excludeBots} onClick={() => toggleFilter('excludeBots')}>
        Ignore visits from bots
      </Dropdown.Item>

      <Dropdown.Separator />
      <Dropdown.Title>Short URLs:</Dropdown.Title>
      <Dropdown.Item selected={excludeMaxVisitsReached} onClick={() => toggleFilter('excludeMaxVisitsReached')}>
        Exclude with visits reached
      </Dropdown.Item>
      <Dropdown.Item selected={excludePastValidUntil} onClick={() => toggleFilter('excludePastValidUntil')}>
        Exclude enabled in the past
      </Dropdown.Item>

      <Dropdown.Separator />
      <Dropdown.Item
        disabled={
          selected.excludeBots === undefined
          && selected.excludeMaxVisitsReached === undefined
          && selected.excludePastValidUntil === undefined
        }
        onClick={() => onChange({
          excludeBots: undefined,
          excludeMaxVisitsReached: undefined,
          excludePastValidUntil: undefined,
        })}
        className="italic"
      >
        Reset to defaults
      </Dropdown.Item>
    </Dropdown>
  );
};
