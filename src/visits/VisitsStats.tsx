import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import {
  faCalendarAlt,
  faChartPie,
  faGears,
  faList,
  faMapMarkedAlt,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, formatNumber, isDarkThemeEnabled, NavPills, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC, PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { useSetting } from '../settings';
import { ExportBtn } from '../utils/components/ExportBtn';
import { DateRangeSelector } from '../utils/dates/DateRangeSelector';
import type { DateInterval, DateRange } from '../utils/dates/helpers/dateIntervals';
import { toDateRange } from '../utils/dates/helpers/dateIntervals';
import { DoughnutChartCard } from './charts/DoughnutChartCard';
import { LineChartCard } from './charts/LineChartCard';
import { SortableBarChartCard } from './charts/SortableBarChartCard';
import { highlightedVisitsToStats } from './helpers';
import { useVisitsQuery } from './helpers/hooks';
import { OpenMapModalBtn } from './helpers/OpenMapModalBtn';
import { VisitsDropdown } from './helpers/VisitsDropdown';
import { VisitsLoadingFeedback } from './helpers/VisitsLoadingFeedback';
import { VisitsSectionWithFallback } from './helpers/VisitsSectionWithFallback';
import { VisitsStatsOptions } from './helpers/VisitsStatsOptions';
import type { GetVisitsOptions, VisitsDeletion, VisitsInfo } from './reducers/types';
import { normalizeVisits, processStatsFromVisits } from './services/VisitsParser';
import type { HighlightableProps, NormalizedOrphanVisit, NormalizedVisit, VisitsParams } from './types';
import { VisitsTable } from './VisitsTable';

export type VisitsStatsProps = PropsWithChildren<{
  getVisits: (params: VisitsParams, options: GetVisitsOptions) => void;
  visitsInfo: VisitsInfo;
  cancelGetVisits: () => void;
  deletion?: {
    deleteVisits: () => void;
    visitsDeletion: VisitsDeletion;
  };
  exportCsv: (visits: NormalizedVisit[]) => void;
  isOrphanVisits?: boolean;
}>;

type VisitsNavLinkOptions = {
  title: string;
  subPath: string;
  icon: IconDefinition;
  shouldRender?: (props: VisitsStatsProps) => boolean;
};

const sections = {
  byTime: { title: 'By time', subPath: 'by-time', icon: faCalendarAlt },
  byContext: { title: 'By context', subPath: 'by-context', icon: faChartPie },
  byLocation: { title: 'By location', subPath: 'by-location', icon: faMapMarkedAlt },
  list: { title: 'List', subPath: 'list', icon: faList },
  options: { title: 'Options', subPath: 'options', icon: faGears, shouldRender: ({ deletion }) => !!deletion },
} as const satisfies Record<string, VisitsNavLinkOptions>;

Object.freeze(sections);

const PrevVisitsNotice: FC<{ display: boolean }> = ({ display }) => display && (
  <div className="mx-auto w-3/4">
    <SimpleCard>
      <div className="flex gap-2">
        <FontAwesomeIcon icon={faWarning} className="mt-1" />
        <i>Could not calculate previous period because selected one does not have a strictly defined start date.</i>
      </div>
    </SimpleCard>
  </div>
);

export const VisitsStats: FC<VisitsStatsProps> = (props) => {
  const {
    children,
    visitsInfo,
    getVisits,
    cancelGetVisits,
    deletion,
    exportCsv,
    isOrphanVisits = false,
  } = props;
  const { visits, prevVisits, loading, errorData, fallbackInterval } = visitsInfo;
  const [{ dateRange, visitsFilter, loadPrevInterval }, updateQuery] = useVisitsQuery();
  const visitsSettings = useSetting('visits');
  const [activeInterval, setActiveInterval] = useState<DateInterval>();
  const setDates = useCallback(
    ({ startDate: newStartDate, endDate: newEndDate }: DateRange, newDateInterval?: DateInterval) => {
      updateQuery({
        dateRange: {
          startDate: newStartDate ?? undefined,
          endDate: newEndDate ?? undefined,
        },
      });
      setActiveInterval(newDateInterval);
    },
    [updateQuery],
  );
  const [currentFallbackInterval, setCurrentFallbackInterval] = useState<DateInterval>(
    fallbackInterval ?? visitsSettings?.defaultInterval ?? 'last30Days',
  );
  const [highlightedVisits, setHighlightedVisits] = useState<NormalizedVisit[]>([]);
  const [highlightedLabel, setHighlightedLabel] = useState<string | undefined>();
  const isFirstLoad = useRef(true);
  const { search } = useLocation();
  const buildSectionUrl = useCallback((subPath?: string) => (!subPath ? search : `../${subPath}${search}`), [search]);

  const normalizedVisits = useMemo(() => normalizeVisits(visits), [visits]);
  const normalizedPrevVisits = useMemo(() => prevVisits && normalizeVisits(prevVisits), [prevVisits]);
  const { os, browsers, referrers, countries, cities, citiesForMap, visitedUrls } = useMemo(
    () => processStatsFromVisits(normalizedVisits),
    [normalizedVisits],
  );
  const processedPrevStats = useMemo(() => processStatsFromVisits(normalizedPrevVisits ?? []), [normalizedPrevVisits]);
  const visitsGroups = useMemo(
    () => Object.fromEntries([
      ['Visits', Object.assign(normalizedVisits, { type: 'main' as const })],
      normalizedPrevVisits && ['Previous period', Object.assign(normalizedPrevVisits, { type: 'previous' as const })],
      highlightedVisits.length > 0 && [
        highlightedLabel ?? 'Selected',
        Object.assign(highlightedVisits, { type: 'highlighted' as const }),
      ],
    ].filter(Boolean)),
    [highlightedLabel, highlightedVisits, normalizedPrevVisits, normalizedVisits],
  );

  const resolvedFilter = useMemo(() => ({
    ...visitsFilter,
    excludeBots: visitsFilter.excludeBots ?? visitsSettings?.excludeBots,
    loadPrevInterval: loadPrevInterval ?? visitsSettings?.loadPrevInterval,
  }), [loadPrevInterval, visitsFilter, visitsSettings?.excludeBots, visitsSettings?.loadPrevInterval]);
  const mapLocations = useMemo(() => Object.values(citiesForMap), [citiesForMap]);

  const selectedBarRef = useRef<string>(undefined);
  const setSelectedVisits = useCallback((selectedVisits: NormalizedVisit[]) => {
    selectedBarRef.current = undefined;
    setHighlightedVisits(selectedVisits);
  }, []);
  const highlightVisitsForProp = useCallback((prop: HighlightableProps<NormalizedOrphanVisit>, value: string) => {
    const newSelectedBar = `${prop}_${value}`;

    if (selectedBarRef.current === newSelectedBar) {
      setHighlightedVisits([]);
      setHighlightedLabel(undefined);
      selectedBarRef.current = undefined;
    } else {
      setHighlightedVisits((normalizedVisits as NormalizedOrphanVisit[]).filter((visit) => visit[prop] === value));
      setHighlightedLabel(value);
      selectedBarRef.current = newSelectedBar;
    }
  }, [normalizedVisits]);

  useEffect(() => cancelGetVisits, [cancelGetVisits]);
  useEffect(() => {
    const resolvedDateRange = dateRange ?? toDateRange(currentFallbackInterval);
    const { loadPrevInterval: doLoadPrevInterval, ...filter } = resolvedFilter;
    const options: GetVisitsOptions = {
      doIntervalFallback: isFirstLoad.current,
      loadPrevInterval: doLoadPrevInterval,
    };

    getVisits({ dateRange: resolvedDateRange, filter }, options);

    setSelectedVisits([]); // Reset selected visits every time we load visits
    isFirstLoad.current = false;
  }, [currentFallbackInterval, dateRange, getVisits, resolvedFilter, setSelectedVisits]);
  useEffect(() => {
    // As soon as the fallback is loaded, if the initial interval used the settings one, we do fall back
    if (fallbackInterval && currentFallbackInterval === (visitsSettings?.defaultInterval ?? 'last30Days')) {
      setCurrentFallbackInterval(fallbackInterval);
    }
  }, [currentFallbackInterval, fallbackInterval, visitsSettings?.defaultInterval]);

  return (
    <div className="flex flex-col gap-y-4">
      {children}

      <section className="flex flex-col lg:flex-row-reverse gap-4">
        <div className="lg:flex-3 flex flex-col md:flex-row gap-x-2 gap-y-4">
          <div className="grow">
            <DateRangeSelector
              disabled={loading}
              dateRangeOrInterval={activeInterval ?? dateRange ?? currentFallbackInterval}
              defaultText="All visits"
              onDatesChange={setDates}
            />
          </div>
          <VisitsDropdown
            disabled={loading}
            isOrphanVisits={isOrphanVisits}
            withPrevInterval
            selected={resolvedFilter}
            onChange={({ loadPrevInterval: newLoadPrevInterval, ...newVisitsFilter }) => updateQuery({
              visitsFilter: newVisitsFilter,
              loadPrevInterval: newLoadPrevInterval,
            })}
          />
        </div>
        <div className="lg:flex-2 xl:flex-3 flex gap-2">
          {visits.length > 0 && (
            <>
              <ExportBtn
                className="max-lg:w-full"
                amount={normalizedVisits.length}
                onClick={() => exportCsv(normalizedVisits)}
              />
              <Button
                variant="secondary"
                solid={highlightedVisits.length > 0 && !isDarkThemeEnabled()}
                disabled={highlightedVisits.length === 0}
                className="max-lg:w-full"
                onClick={() => setSelectedVisits([])}
              >
                Clear selection {highlightedVisits.length > 0 && <>({formatNumber(highlightedVisits.length)})</>}
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <VisitsLoadingFeedback info={visitsInfo} />
        {!loading && !errorData && (
          <>
            <NavPills fill className="sticky top-(--header-height) z-2">
              {Object.values(sections).map(({ title, icon, subPath, shouldRender }: VisitsNavLinkOptions, index) => (
                !shouldRender || shouldRender(props)
                  ? (
                    <NavPills.Pill key={index} to={buildSectionUrl(subPath)} replace>
                      <FontAwesomeIcon icon={icon} />
                      <span className="ml-2 max-lg:sr-only">{title}</span>
                    </NavPills.Pill>
                  )
                  : undefined
              )).filter(Boolean)}
            </NavPills>

            <Routes>
              <Route
                path={sections.byTime.subPath}
                element={(
                  <VisitsSectionWithFallback showFallback={visits.length === 0}>
                    <div data-testid="line-chart-container">
                      <LineChartCard
                        visitsGroups={visitsGroups}
                        setSelectedVisits={setSelectedVisits}
                        onDateRangeChange={setDates}
                      />
                    </div>
                    <PrevVisitsNotice display={!!resolvedFilter.loadPrevInterval && !prevVisits} />
                  </VisitsSectionWithFallback>
                )}
              />

              <Route
                path={sections.byContext.subPath}
                element={(
                  <VisitsSectionWithFallback showFallback={visits.length === 0}>
                    <div
                      className={clsx(
                        'grid grid-cols-1 gap-4',
                        {
                          'lg:grid-cols-2': isOrphanVisits,
                          'xl:grid-cols-3': !isOrphanVisits,
                        },
                      )}
                    >
                      <DoughnutChartCard title="Operating systems" stats={os} prevStats={processedPrevStats.os} />
                      <DoughnutChartCard title="Browsers" stats={browsers} prevStats={processedPrevStats.browsers} />
                      <SortableBarChartCard
                        title="Referrers"
                        withPagination={false}
                        stats={referrers}
                        prevStats={processedPrevStats.referrers}
                        highlightedStats={highlightedVisitsToStats(highlightedVisits, 'referer')}
                        highlightedLabel={highlightedLabel}
                        sortingItems={{
                          name: 'Referrer name',
                          amount: 'Visits amount',
                        }}
                        onClick={(value) => highlightVisitsForProp('referer', value)}
                      />
                      {isOrphanVisits && (
                        <SortableBarChartCard
                          title="Visited URLs"
                          stats={visitedUrls}
                          prevStats={processedPrevStats.visitedUrls}
                          highlightedStats={highlightedVisitsToStats(highlightedVisits, 'visitedUrl')}
                          highlightedLabel={highlightedLabel}
                          sortingItems={{
                            visitedUrl: 'Visited URL',
                            amount: 'Visits amount',
                          }}
                          onClick={(value) => highlightVisitsForProp('visitedUrl', value)}
                        />
                      )}
                    </div>
                    <PrevVisitsNotice display={!!resolvedFilter.loadPrevInterval && !prevVisits} />
                  </VisitsSectionWithFallback>
                )}
              />

              <Route
                path={sections.byLocation.subPath}
                element={(
                  <VisitsSectionWithFallback showFallback={visits.length === 0}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <SortableBarChartCard
                        title="Countries"
                        stats={countries}
                        prevStats={processedPrevStats.countries}
                        highlightedStats={highlightedVisitsToStats(highlightedVisits, 'country')}
                        highlightedLabel={highlightedLabel}
                        sortingItems={{
                          name: 'Country name',
                          amount: 'Visits amount',
                        }}
                        onClick={(value) => highlightVisitsForProp('country', value)}
                      />
                      <SortableBarChartCard
                        title="Cities"
                        stats={cities}
                        prevStats={processedPrevStats.cities}
                        highlightedStats={highlightedVisitsToStats(highlightedVisits, 'city')}
                        highlightedLabel={highlightedLabel}
                        extraHeaderContent={(activeCities) => mapLocations.length > 0 && (
                          <OpenMapModalBtn modalTitle="Cities" locations={mapLocations} activeCities={activeCities} />
                        )}
                        sortingItems={{
                          name: 'City name',
                          amount: 'Visits amount',
                        }}
                        onClick={(value) => highlightVisitsForProp('city', value)}
                      />
                    </div>
                    <PrevVisitsNotice display={!!resolvedFilter.loadPrevInterval && !prevVisits} />
                  </VisitsSectionWithFallback>
                )}
              />

              <Route
                path={sections.list.subPath}
                element={(
                  <VisitsTable
                    visits={normalizedVisits}
                    selectedVisits={highlightedVisits}
                    setSelectedVisits={setSelectedVisits}
                  />
                )}
              />

              {deletion && (
                <Route
                  path={sections.options.subPath}
                  element={<VisitsStatsOptions {...deletion} />}
                />
              )}

              <Route path="*" element={<Navigate replace to={buildSectionUrl(sections.byTime.subPath)} />} />
            </Routes>
          </>
        )}
      </section>
    </div>
  );
};
