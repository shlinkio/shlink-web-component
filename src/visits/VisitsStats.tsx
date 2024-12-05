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
import { NavPillItem, NavPills, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC, PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { Button, Row } from 'reactstrap';
import { useSetting } from '../settings';
import { ExportBtn } from '../utils/components/ExportBtn';
import { DateRangeSelector } from '../utils/dates/DateRangeSelector';
import type { DateInterval, DateRange } from '../utils/dates/helpers/dateIntervals';
import { toDateRange } from '../utils/dates/helpers/dateIntervals';
import { prettify } from '../utils/helpers/numbers';
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
  <div className="mt-3 mx-auto w-75">
    <SimpleCard>
      <div className="d-flex gap-2">
        <FontAwesomeIcon icon={faWarning} className="mt-1" />
        <i>Could not calculate previous period because selected one does not have a strictly defined start date.</i>
      </div>
    </SimpleCard>
  </div>
);

let selectedBar: string | undefined;

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

  const setSelectedVisits = useCallback((selectedVisits: NormalizedVisit[]) => {
    selectedBar = undefined;
    setHighlightedVisits(selectedVisits);
  }, []);
  const highlightVisitsForProp = useCallback((prop: HighlightableProps<NormalizedOrphanVisit>, value: string) => {
    const newSelectedBar = `${prop}_${value}`;

    if (selectedBar === newSelectedBar) {
      setHighlightedVisits([]);
      setHighlightedLabel(undefined);
      selectedBar = undefined;
    } else {
      setHighlightedVisits((normalizedVisits as NormalizedOrphanVisit[]).filter((visit) => visit[prop] === value));
      setHighlightedLabel(value);
      selectedBar = newSelectedBar;
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
    <>
      {children}

      <section className="mt-3">
        <div className="row flex-md-row-reverse">
          <div className="col-lg-7 col-xl-6">
            <div className="d-md-flex">
              <div className="flex-grow-1">
                <DateRangeSelector
                  disabled={loading}
                  dateRangeOrInterval={activeInterval ?? dateRange ?? currentFallbackInterval}
                  defaultText="All visits"
                  onDatesChange={setDates}
                />
              </div>
              <VisitsDropdown
                disabled={loading}
                className="ms-0 ms-md-2 mt-3 mt-md-0"
                isOrphanVisits={isOrphanVisits}
                withPrevInterval
                selected={resolvedFilter}
                onChange={({ loadPrevInterval: newLoadPrevInterval, ...newVisitsFilter }) => updateQuery({
                  visitsFilter: newVisitsFilter,
                  loadPrevInterval: newLoadPrevInterval,
                })}
              />
            </div>
          </div>
          {visits.length > 0 && (
            <div className="col-lg-5 col-xl-6 mt-3 mt-lg-0">
              <div className="d-flex">
                <ExportBtn
                  className="btn-md-block"
                  amount={normalizedVisits.length}
                  onClick={() => exportCsv(normalizedVisits)}
                />
                <Button
                  outline
                  disabled={highlightedVisits.length === 0}
                  className="btn-md-block ms-2"
                  onClick={() => setSelectedVisits([])}
                >
                  Clear selection {highlightedVisits.length > 0 && <>({prettify(highlightedVisits.length)})</>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-3">
        <VisitsLoadingFeedback info={visitsInfo} />
        {!loading && !errorData && (
          <>
            <NavPills fill>
              {Object.values(sections).map(({ title, icon, subPath, shouldRender }: VisitsNavLinkOptions, index) => (
                !shouldRender || shouldRender(props)
                  ? (
                    <NavPillItem key={index} to={buildSectionUrl(subPath)} replace>
                      <FontAwesomeIcon icon={icon} />
                      <span className="ms-2 d-none d-lg-inline">{title}</span>
                    </NavPillItem>
                  )
                  : undefined
              )).filter(Boolean)}
            </NavPills>
            <Row>
              <Routes>
                <Route
                  path={sections.byTime.subPath}
                  element={(
                    <VisitsSectionWithFallback showFallback={visits.length === 0}>
                      <div className="col-12 mt-3" data-testid="line-chart-container">
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
                      <div className={clsx('mt-3 col-lg-6', { 'col-xl-4': !isOrphanVisits })}>
                        <DoughnutChartCard title="Operating systems" stats={os} prevStats={processedPrevStats.os} />
                      </div>
                      <div className={clsx('mt-3 col-lg-6', { 'col-xl-4': !isOrphanVisits })}>
                        <DoughnutChartCard title="Browsers" stats={browsers} prevStats={processedPrevStats.browsers} />
                      </div>
                      <div className={clsx('mt-3', { 'col-xl-4': !isOrphanVisits, 'col-lg-6': isOrphanVisits })}>
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
                      </div>
                      {isOrphanVisits && (
                        <div className="mt-3 col-lg-6">
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
                        </div>
                      )}
                      <div className="col-12">
                        <PrevVisitsNotice display={!!resolvedFilter.loadPrevInterval && !prevVisits} />
                      </div>
                    </VisitsSectionWithFallback>
                  )}
                />

                <Route
                  path={sections.byLocation.subPath}
                  element={(
                    <VisitsSectionWithFallback showFallback={visits.length === 0}>
                      <div className="col-lg-6 mt-3">
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
                      </div>
                      <div className="col-lg-6 mt-3">
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
                      <div className="col-12">
                        <PrevVisitsNotice display={!!resolvedFilter.loadPrevInterval && !prevVisits} />
                      </div>
                    </VisitsSectionWithFallback>
                  )}
                />

                <Route
                  path={sections.list.subPath}
                  element={(
                    <div className="col-12">
                      <VisitsTable
                        visits={normalizedVisits}
                        selectedVisits={highlightedVisits}
                        setSelectedVisits={setSelectedVisits}
                      />
                    </div>
                  )}
                />

                {deletion && (
                  <Route
                    path={sections.options.subPath}
                    element={(
                      <div className="col-12 mt-3">
                        <VisitsStatsOptions {...deletion} />
                      </div>
                    )}
                  />
                )}

                <Route path="*" element={<Navigate replace to={buildSectionUrl(sections.byTime.subPath)} />} />
              </Routes>
            </Row>
          </>
        )}
      </section>
    </>
  );
};
