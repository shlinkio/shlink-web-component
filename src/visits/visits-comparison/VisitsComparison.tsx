import { SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSetting } from '../../settings';
import { GoBackButton } from '../../utils/components/GoBackButton';
import { DateRangeSelector } from '../../utils/dates/DateRangeSelector';
import type { DateInterval, DateRange } from '../../utils/dates/helpers/dateIntervals';
import { toDateRange } from '../../utils/dates/helpers/dateIntervals';
import { chartColorForIndex } from '../charts/constants';
import { LineChartCard, type VisitsList } from '../charts/LineChartCard';
import { useVisitsQuery } from '../helpers/hooks';
import { VisitsDropdown } from '../helpers/VisitsDropdown';
import { VisitsLoadingFeedback } from '../helpers/VisitsLoadingFeedback';
import { VisitsSectionWithFallback } from '../helpers/VisitsSectionWithFallback';
import { normalizeVisits } from '../services/VisitsParser';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from './reducers/types';

type VisitsComparisonProps = {
  title: ReactNode;
  getVisitsForComparison: (params: LoadVisitsForComparison) => void;
  visitsComparisonInfo: VisitsComparisonInfo;
  cancelGetVisitsComparison: () => void;
  colors?: Record<string, string>;
};

export const VisitsComparison: FC<VisitsComparisonProps> = ({
  title,
  colors,
  getVisitsForComparison,
  visitsComparisonInfo,
  cancelGetVisitsComparison,
}) => {
  const { loading, visitsGroups } = visitsComparisonInfo;
  const visitsSettings = useSetting('visits');
  const normalizedVisitsGroups = useMemo(
    () => Object.keys(visitsGroups).reduce<Record<string, VisitsList>>((acc, key, index) => {
      acc[key] = Object.assign(normalizeVisits(visitsGroups[key]), {
        color: colors?.[key] ?? chartColorForIndex(index),
      });
      return acc;
    }, {}),
    [colors, visitsGroups],
  );
  const showFallback = useMemo(() => Object.values(visitsGroups).every((group) => group.length === 0), [visitsGroups]);

  // State related with visits filtering
  const [{ dateRange, visitsFilter }, updateQuery] = useVisitsQuery();
  const [activeInterval, setActiveInterval] = useState<DateInterval>();
  const setDates = useCallback(
    ({ startDate: theStartDate, endDate: theEndDate }: DateRange, newDateInterval?: DateInterval) => {
      updateQuery({
        dateRange: {
          startDate: theStartDate ?? undefined,
          endDate: theEndDate ?? undefined,
        },
      });
      setActiveInterval(newDateInterval);
    },
    [updateQuery],
  );
  const [initialInterval] = useState(() => dateRange ?? visitsSettings?.defaultInterval ?? 'last30Days');
  const resolvedFilter = useMemo(() => ({
    ...visitsFilter,
    excludeBots: visitsFilter.excludeBots ?? visitsSettings?.excludeBots,
  }), [visitsFilter, visitsSettings?.excludeBots]);

  useEffect(() => {
    const resolvedDateRange = dateRange ?? toDateRange(initialInterval);
    getVisitsForComparison({
      params: { dateRange: resolvedDateRange, filter: resolvedFilter },
    });

    return cancelGetVisitsComparison;
  }, [cancelGetVisitsComparison, dateRange, getVisitsForComparison, initialInterval, resolvedFilter]);

  return (
    <div className="tw:flex tw:flex-col tw:gap-4">
      <SimpleCard bodyClassName="tw:flex tw:items-center">
        <GoBackButton />
        <h3 className="tw:grow tw:text-center">{title}</h3>
      </SimpleCard>

      <div className="tw:flex tw:flex-col tw:lg:flex-row-reverse tw:gap-4">
        <div className="tw:lg:flex-3 tw:flex tw:flex-col tw:md:flex-row tw:gap-x-2 tw:gap-y-4">
          <div className="tw:grow">
            <DateRangeSelector
              disabled={loading}
              defaultText="All visits"
              dateRangeOrInterval={activeInterval ?? dateRange ?? initialInterval}
              onDatesChange={setDates}
            />
          </div>
          <VisitsDropdown
            disabled={loading}
            selected={resolvedFilter}
            onChange={({ orphanVisitsType, excludeBots }) => updateQuery({
              visitsFilter: { orphanVisitsType, excludeBots },
            })}
          />
        </div>
        <div className="tw:hidden tw:lg:block tw:lg:flex-2 tw:xl:flex-3" />
      </div>

      <VisitsLoadingFeedback info={visitsComparisonInfo} />
      {!loading && (
        <VisitsSectionWithFallback showFallback={showFallback}>
          <LineChartCard visitsGroups={normalizedVisitsGroups} onDateRangeChange={setDates} />
        </VisitsSectionWithFallback>
      )}
    </div>
  );
};
