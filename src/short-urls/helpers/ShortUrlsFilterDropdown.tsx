import { Dropdown } from '@shlinkio/shlink-frontend-kit';
import { useCallback } from 'react';
import type { Domain } from '../../domains/data';
import { DEFAULT_DOMAIN } from '../../domains/data';
import { useFeature } from '../../utils/features';
import type { ShortUrlsFilter } from '../data';

interface ShortUrlsFilterDropdownProps {
  onChange: (filters: ShortUrlsFilter) => void;
  selected?: ShortUrlsFilter;

  /**
   * List of domains supported by the Shlink server.
   * It is `undefined` while the domains are being loaded.
   */
  domains?: Domain[];
}

export const ShortUrlsFilterDropdown = ({ onChange, selected = {}, domains }: ShortUrlsFilterDropdownProps) => {
  const supportsFilterByDomain = useFeature('filterShortUrlsByDomain');
  const { excludeBots = false, excludeMaxVisitsReached = false, excludePastValidUntil = false, domain } = selected;

  const partialUpdate = useCallback(
    (update: Partial<ShortUrlsFilter>) => onChange({ ...selected, ...update }),
    [onChange, selected],
  );
  const toggleFilter = useCallback(
    (key: keyof ShortUrlsFilter) => partialUpdate({ [key]: !selected?.[key] }),
    [partialUpdate, selected],
  );

  return (
    <Dropdown buttonContent="Filters" buttonClassName="w-full" menuAlignment="right">
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

      {supportsFilterByDomain && (
        <>
          <Dropdown.Separator />
          <Dropdown.Title>Domain: {!domains && <i>loading...</i>}</Dropdown.Title>
          {domains?.map((d) => {
            const value = d.isDefault ? DEFAULT_DOMAIN : d.domain;
            const isSelected = domain === value;

            return (
              <Dropdown.Item
                key={d.domain}
                selected={isSelected}
                onClick={() => partialUpdate({ domain: isSelected ? undefined : value })}
              >
                {d.domain}
              </Dropdown.Item>
            );
          })}
        </>
      )}

      <Dropdown.Separator />
      <Dropdown.Item
        disabled={
          selected.excludeBots === undefined
          && selected.excludeMaxVisitsReached === undefined
          && selected.excludePastValidUntil === undefined
          && selected.domain === undefined
        }
        onClick={() => onChange({
          excludeBots: undefined,
          excludeMaxVisitsReached: undefined,
          excludePastValidUntil: undefined,
          domain: undefined,
        })}
        className="italic"
      >
        Reset to defaults
      </Dropdown.Item>
    </Dropdown>
  );
};
