import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Message, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'reactstrap';
import { DateRangeSelector } from '../../utils/dates/DateRangeSelector';
import type { DateInterval, DateRange } from '../../utils/dates/helpers/dateIntervals';
import { toDateRange } from '../../utils/dates/helpers/dateIntervals';
import { useGoBack } from '../../utils/helpers/hooks';
import { useSetting } from '../../utils/settings';
import { chartColorForIndex } from '../charts/constants';
import { LineChartCard, type VisitsList } from '../charts/LineChartCard';
import { useVisitsQuery } from '../helpers/hooks';
import { VisitsFilterDropdown } from '../helpers/VisitsFilterDropdown';
import { normalizeVisits } from '../services/VisitsParser';
import { toApiParams } from '../types/helpers';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from './reducers/types';

type VisitsComparisonProps = {
  title: ReactNode;
  getVisitsForComparison: (params: LoadVisitsForComparison) => void;
  visitsComparisonInfo: VisitsComparisonInfo;
  colors?: Record<string, string>;
};

// TODO
//      * Display a title
//      * Support date filtering
//      * Support other filters
//      * Handle loading errors
export const VisitsComparison: FC<VisitsComparisonProps> = ({
  title,
  colors,
  getVisitsForComparison,
  visitsComparisonInfo,
}) => {
  const { loading, visitsGroups } = visitsComparisonInfo;
  const goBack = useGoBack();
  const isFirstLoad = useRef(true);
  const normalizedVisitsGroups = useMemo(
    () => Object.keys(visitsGroups).reduce<Record<string, VisitsList>>((acc, key, index) => {
      acc[key] = Object.assign(normalizeVisits(visitsGroups[key]), {
        color: colors?.[key] ?? chartColorForIndex(index),
      });
      return acc;
    }, {}),
    [colors, visitsGroups],
  );

  // State related with visits filtering
  const visitsSettings = useSetting('visits');
  const [{ dateRange, visitsFilter }, updateFiltering] = useVisitsQuery();
  const [activeInterval, setActiveInterval] = useState<DateInterval>();
  const setDates = useCallback(
    ({ startDate: theStartDate, endDate: theEndDate }: DateRange, newDateInterval?: DateInterval) => {
      updateFiltering({
        dateRange: {
          startDate: theStartDate ?? undefined,
          endDate: theEndDate ?? undefined,
        },
      });
      setActiveInterval(newDateInterval);
    },
    [updateFiltering],
  );
  const initialInterval = useRef<DateRange | DateInterval>(
    dateRange ?? visitsSettings?.defaultInterval ?? 'last30Days',
  );
  const resolvedFilter = useMemo(() => ({
    ...visitsFilter,
    excludeBots: visitsFilter.excludeBots ?? visitsSettings?.excludeBots,
  }), [visitsFilter, visitsSettings?.excludeBots]);

  useEffect(() => {
    const resolvedDateRange = !isFirstLoad.current ? dateRange : (dateRange ?? toDateRange(initialInterval.current));
    getVisitsForComparison({
      query: toApiParams({ dateRange: resolvedDateRange, filter: resolvedFilter }),
    });
    isFirstLoad.current = false;
  }, [dateRange, getVisitsForComparison, resolvedFilter]);

  if (loading) {
    return <Message loading />;
  }

  return (
    <>
      <div className="mb-3">
        <SimpleCard bodyClassName="d-flex">
          <Button color="link" size="lg" className="p-0 me-3" onClick={goBack} aria-label="Go back">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Button>
          <h3 className="mb-0 flex-grow-1 text-center">{title}</h3>
        </SimpleCard>
      </div>
      <div className="col-lg-7 col-xl-6 offset-lg-5 offset-xl-6 mb-3">
        <div className="d-md-flex">
          <div className="flex-grow-1">
            <DateRangeSelector
              disabled={loading}
              defaultText="All visits"
              dateRangeOrInterval={activeInterval ?? dateRange ?? initialInterval.current}
              onDatesChange={setDates}
            />
          </div>
          <VisitsFilterDropdown
            className="ms-0 ms-md-2 mt-3 mt-md-0"
            isOrphanVisits={false}
            selected={resolvedFilter}
            onChange={(newVisitsFilter) => updateFiltering({ visitsFilter: newVisitsFilter })}
          />
        </div>
      </div>
      <LineChartCard visitsGroups={normalizedVisitsGroups} />
    </>
  );
};
