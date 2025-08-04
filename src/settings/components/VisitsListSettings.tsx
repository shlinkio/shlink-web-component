import { mergeDeepRight } from '@shlinkio/data-manipulation';
import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { Muted } from '../../utils/components/Muted';
import { humanFriendlyJoin } from '../../utils/helpers';
import type { VisitsColumn } from '../index';
import { defaultVisitsListColumns , useSetting } from '../index';
import type { VisitsListSettings as VisitsListSettingsConfig } from '../types';
import { LabelledToggle } from './fe-kit/LabelledToggle';

export type VisitsListSettingsProps = {
  onChange: (settings: VisitsListSettingsConfig) => void;
};

export const visitsListColumns = {
  potentialBot: 'Potential bot',
  date: 'Date',
  country: 'Country',
  region: 'Region',
  city: 'City',
  browser: 'Browser',
  os: 'OS',
  userAgent: 'User agent',
  referer: 'Referrer',
  visitedUrl: 'Visited URL',
} as const satisfies Record<VisitsColumn, string>;

// Columns that exclude other columns
const columnsExclusion: Partial<Record<VisitsColumn, VisitsColumn[]>> = {
  browser: ['userAgent'],
  os: ['userAgent'],
  userAgent: ['browser', 'os'],
} as const;

Object.freeze(columnsExclusion);

export const VisitsListSettings: FC<VisitsListSettingsProps> = ({ onChange }) => {
  const visitsListSettings = useSetting('visitsList');
  const columns = useMemo(
    () => mergeDeepRight(
      defaultVisitsListColumns,
      visitsListSettings?.columns ?? {},
    ) as typeof defaultVisitsListColumns,
    [visitsListSettings?.columns],
  );
  const toggleColumn = useCallback((column: VisitsColumn, show: boolean) => {
    const newColumns = {
      ...columns,
      [column]: show,
    };

    // If the column is being shown, hide all columns it excludes
    if (show) {
      columnsExclusion[column]?.forEach((excludedColumn) => {
        newColumns[excludedColumn] = false;
      });
    }

    onChange({ columns: newColumns });
  }, [columns, onChange]);

  return (
    <SimpleCard title="Visits list">
      <p className="mb-2">Columns to show in visits table:</p>
      <ul className="flex flex-col gap-y-1">
        {(Object.entries(visitsListColumns) as [VisitsColumn, string][]).map(([column, name]) => (
          <li key={column}>
            <LabelledToggle checked={columns[column]} onChange={(show) => toggleColumn(column, show)}>
              <span className="inline-flex gap-2">
                {name}
                {columnsExclusion[column] && (
                  <Muted>
                    (excludes {humanFriendlyJoin(columnsExclusion[column].map((col) => visitsListColumns[col]))})
                  </Muted>
                )}
              </span>
            </LabelledToggle>
          </li>
        ))}
      </ul>
    </SimpleCard>
  );
};
