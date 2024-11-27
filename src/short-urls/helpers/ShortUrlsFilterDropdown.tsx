import { DropdownBtn } from '@shlinkio/shlink-frontend-kit';
import { useCallback } from 'react';
import { DropdownItem } from 'reactstrap';
import type { Domain } from '../../domains/data';
import { DEFAULT_DOMAIN } from '../../domains/data';
import { useFeature } from '../../utils/features';
import type { ShortUrlsFilter } from '../data';

interface ShortUrlsFilterDropdownProps {
  onChange: (filters: ShortUrlsFilter) => void;
  selected?: ShortUrlsFilter;
  className?: string;
  /**
   * List of domains supported by the Shlink server.
   * It is `undefined` while the domains are being loaded.
   */
  domains?: Domain[];
}

export const ShortUrlsFilterDropdown = (
  { onChange, selected = {}, className, domains }: ShortUrlsFilterDropdownProps,
) => {
  const supportsDisabledFiltering = useFeature('filterDisabledUrls');
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
    <DropdownBtn text="Filters" dropdownClassName={className} end minWidth={250}>
      <DropdownItem header aria-hidden>Visits:</DropdownItem>
      <DropdownItem active={excludeBots} onClick={() => toggleFilter('excludeBots')}>
        Ignore visits from bots
      </DropdownItem>

      {supportsDisabledFiltering && (
        <>
          <DropdownItem divider tag="hr" />
          <DropdownItem header aria-hidden>Short URLs:</DropdownItem>
          <DropdownItem active={excludeMaxVisitsReached} onClick={() => toggleFilter('excludeMaxVisitsReached')}>
            Exclude with visits reached
          </DropdownItem>
          <DropdownItem active={excludePastValidUntil} onClick={() => toggleFilter('excludePastValidUntil')}>
            Exclude enabled in the past
          </DropdownItem>
        </>
      )}

      {supportsFilterByDomain && (
        <>
          <DropdownItem divider tag="hr"/>
          <DropdownItem header aria-hidden>Domain: {!domains && <i>loading...</i>}</DropdownItem>
          {domains?.map((d) => {
            const value = d.isDefault ? DEFAULT_DOMAIN : d.domain;
            const isSelected = domain === value;

            return (
              <DropdownItem
                key={d.domain}
                active={isSelected}
                onClick={() => partialUpdate({ domain: isSelected ? undefined : value })}
              >
                {d.domain}
              </DropdownItem>
            );
          })}
        </>
      )}

      <DropdownItem divider tag="hr" />
      <DropdownItem
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
        className="fst-italic"
      >
        Reset to defaults
      </DropdownItem>
    </DropdownBtn>
  );
};
