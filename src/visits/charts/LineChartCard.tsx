import {
  faDownLeftAndUpRightToCenter as collapseIcon,
  faUpRightAndDownLeftFromCenter as expandIcon,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { countBy } from '@shlinkio/data-manipulation';
import { HIGHLIGHTED_COLOR, isDarkThemeEnabled, MAIN_COLOR, useToggle } from '@shlinkio/shlink-frontend-kit';
import { Card, formatNumber, LinkButton } from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import type { Duration } from 'date-fns';
import {
  add,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInHours,
  endOfISOWeek,
  format,
  max,
  min,
  parseISO,
  startOfISOWeek,
} from 'date-fns';
import type { FC } from 'react';
import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { CartesianGrid, Line, LineChart, ReferenceArea, Tooltip, XAxis, YAxis } from 'recharts';
import type { CategoricalChartState } from 'recharts/types/chart/types';
import { formatInternational } from '../../utils/dates/helpers/date';
import type { StrictDateRange } from '../../utils/dates/helpers/dateIntervals';
import { rangeOf } from '../../utils/helpers';
import { useKeyDown, useMaxResolution } from '../../utils/helpers/hooks';
import type { MediaMatcher } from '../../utils/types';
import type { NormalizedVisit, Stats } from '../types';
import { useChartDimensions } from './ChartDimensionsContext';
import { CHART_TOOLTIP_COMMON_PROPS, prevColor } from './constants';
import { LineChartLegend } from './LineChartLegend';

type ChartPayloadEntry = {
  formattedDate: string;
  date: Date;
};

const STEPS_MAP = {
  monthly: 'Month',
  weekly: 'Week',
  daily: 'Day',
  hourly: 'Hour',
} as const satisfies Record<string, string>;

type Step = keyof typeof STEPS_MAP;

const STEP_TO_DURATION_MAP: Record<Step, (amount: number) => Duration> = {
  hourly: (hours: number) => ({ hours }),
  daily: (days: number) => ({ days }),
  weekly: (weeks: number) => ({ weeks }),
  monthly: (months: number) => ({ months }),
};

const STEP_TO_DIFF_FUNC_MAP: Record<Step, (dateLeft: Date, dateRight: Date) => number> = {
  hourly: differenceInHours,
  daily: differenceInCalendarDays,
  weekly: differenceInCalendarWeeks,
  monthly: differenceInCalendarMonths,
};

const STEP_TO_DATE_FORMAT: Record<Step, (date: Date) => string> = {
  hourly: (date) => format(date, 'yyyy-MM-dd HH:00'),
  daily: (date) => formatInternational(date)!,
  weekly(date) {
    const firstWeekDay = formatInternational(startOfISOWeek(date))!;
    const lastWeekDay = formatInternational(endOfISOWeek(date))!;

    return `${firstWeekDay} - ${lastWeekDay}`;
  },
  monthly: (date) => format(date, 'yyyy-MM'),
};

const determineInitialStep = (visitsGroups: Record<string, NormalizedVisit[]>): Step => {
  const nonEmptyVisitsLists = Object.values(visitsGroups).filter((visits) => visits.length > 0);
  if (nonEmptyVisitsLists.length === 0) {
    return 'monthly';
  }

  const now = new Date();
  const lastDates = nonEmptyVisitsLists.map((visits) => parseISO(visits[visits.length - 1].date));
  const oldestDate = max(lastDates);
  const conditions: [() => boolean, Step][] = [
    [() => differenceInCalendarDays(now, oldestDate) <= 2, 'hourly'], // Less than 2 days
    [() => differenceInCalendarMonths(now, oldestDate) <= 1, 'daily'], // Between 2 days and 1 month
    [() => differenceInCalendarMonths(now, oldestDate) <= 6, 'weekly'], // Between 1 and 6 months
  ];

  return conditions.find(([matcher]) => matcher())?.[1] ?? 'monthly';
};

const countVisitsByDatePerGroup = (
  step: Step,
  visitsGroups: Record<string, NormalizedVisit[]>,
) => Object.keys(visitsGroups).reduce<Record<string, Stats>>((countGroups, key) => {

  countGroups[key] = countBy(
    visitsGroups[key],
    (visit) => STEP_TO_DATE_FORMAT[step](parseISO(visit.date)),
  );
  return countGroups;
}, {});

const visitsToDatasetGroups = (step: Step, visits: NormalizedVisit[]): Record<string, NormalizedVisit[]> =>
  visits.reduce<Record<string, NormalizedVisit[]>>(
    (acc, visit) => {
      const key = STEP_TO_DATE_FORMAT[step](parseISO(visit.date));

      acc[key] = acc[key] ?? [];
      acc[key].push(visit);

      return acc;
    },
    {},
  );

const datesWithNoGaps = (step: Step, visitsGroups: Record<string, NormalizedVisit[]>): ChartPayloadEntry[] => {
  const nonEmptyVisitsLists = Object.values(visitsGroups)
    .filter((visits) => visits.length > 0)
    .map((visits) => [...visits].reverse());
  if (nonEmptyVisitsLists.length === 0) {
    return [];
  }

  const diffFunc = STEP_TO_DIFF_FUNC_MAP[step];
  const formatter = STEP_TO_DATE_FORMAT[step];
  const duration = STEP_TO_DURATION_MAP[step];

  // We assume the list of visits is ordered, so the first and last visit should have the bigger and smaller dates
  const flatVisitsList = nonEmptyVisitsLists.flat();
  const startDate = parseISO(flatVisitsList[0].date);
  const endDate = parseISO(flatVisitsList[flatVisitsList.length - 1].date);
  const extraDots = diffFunc(endDate, startDate) || 1; // Ensure the chart never shows just one dot

  return [
    { formattedDate: formatter(startDate), date: startDate },
    ...rangeOf(extraDots, (num) => {
      const date = add(startDate, duration(num));
      return {
        formattedDate: formatter(date),
        date,
      };
    }),
  ];
};

export type VisitsList = NormalizedVisit[] & {
  type?: 'main' | 'highlighted' | 'previous';
  color?: string;
};

export const visitsListColor = (v: VisitsList) => {
  if (v.color) {
    return v.color;
  }

  const typeColorMap: Record<NonNullable<VisitsList['type']>, string> = {
    main: MAIN_COLOR,
    highlighted: HIGHLIGHTED_COLOR,
    previous: prevColor(),
  };
  return v.type ? typeColorMap[v.type] : MAIN_COLOR;
};

const useVisitsWithType = (visitsGroups: Record<string, VisitsList>, type: VisitsList['type']) => useMemo(
  () => Object.values(visitsGroups).find((g) => g.type === type) ?? [],
  [visitsGroups, type],
);

const useActiveDot = (
  visitsGroups: Record<string, VisitsList>,
  step: Step,
  setSelectedVisits?: (visits: NormalizedVisit[]) => void,
) => {
  const mainVisits = useVisitsWithType(visitsGroups, 'main');
  const highlightedVisits = useVisitsWithType(visitsGroups, 'highlighted');

  // Save a map of step/date and all visits which belong to it, to use it when we need to highlight one
  const datasetsByPoint = useMemo(
    () => (setSelectedVisits ? visitsToDatasetGroups(step, mainVisits) : {}),
    [setSelectedVisits, step, mainVisits],
  );
  const onDotClick = useCallback((_: any, { payload }: { payload: ChartPayloadEntry }) => {
    const visitsToHighlight = datasetsByPoint[payload.formattedDate] ?? [];
    setSelectedVisits?.(visitsToHighlight === highlightedVisits ? [] : visitsToHighlight);
  }, [datasetsByPoint, highlightedVisits, setSelectedVisits]);

  return setSelectedVisits && {
    cursor: 'pointer',
    onClick: onDotClick as any,
  };
};

const payloadFromChartEvent = (e: CategoricalChartState) =>
  e.activePayload?.[0]?.payload as ChartPayloadEntry | undefined;

export type LineChartCardProps = {
  visitsGroups: Record<string, VisitsList>;
  setSelectedVisits?: (visits: NormalizedVisit[]) => void;

  /** Invoked when a date range is selected in the chart */
  onDateRangeChange: (dateRange: StrictDateRange) => void;

  /** Test seam. For tests, a responsive container cannot be used */
  matchMedia?: MediaMatcher;
};

export const LineChartCard: FC<LineChartCardProps> = (
  { visitsGroups, setSelectedVisits, matchMedia, onDateRangeChange },
) => {
  const [step, setStep] = useState<Step>(determineInitialStep(visitsGroups));
  const isMobile = useMaxResolution(767, matchMedia ?? window.matchMedia);

  const chartData = useMemo((): ChartPayloadEntry[] => {
    const statsGroups = countVisitsByDatePerGroup(step, visitsGroups);
    const groupNames = Object.keys(statsGroups);

    return datesWithNoGaps(step, visitsGroups).map(({ formattedDate, date }) => ({
      date,
      formattedDate,
      ...groupNames.reduce<Record<string, number>>((acc, name) => {
        acc[name] = statsGroups[name][formattedDate] ?? 0;
        return acc;
      }, {}),
    }));
  }, [step, visitsGroups]);
  const activeDot = useActiveDot(visitsGroups, step, setSelectedVisits);

  const { flag: isExpanded, toggle: toggleExpanded, setToFalse: setNotExpanded } = useToggle(false, true);
  const bodyId = useId();
  const legendRef = useRef<HTMLUListElement>(null);
  const [wrapperHeight, setWrapperHeight] = useState(isMobile ? 300 : 400);

  useLayoutEffect(() => {
    if (!isExpanded) {
      setWrapperHeight(isMobile ? 300 : 400);
      return () => {};
    }

    const observer = new ResizeObserver(() => {
      const windowHeight = window.innerHeight;
      const { height: legendHeight } = legendRef.current!.getBoundingClientRect();

      // 32 is the body's padding, 16 is the legend's top margin, 50 is the header's height
      const offset = 32 + 16 + 50;

      setWrapperHeight(windowHeight - legendHeight - offset);
    });
    observer.observe(legendRef.current!);

    return () => observer.disconnect();
  }, [isExpanded, isMobile, legendRef]);

  useKeyDown('Escape', setNotExpanded, isExpanded);

  const { ChartWrapper, dimensions, wrapperDimensions } = useChartDimensions(wrapperHeight);

  // References the items being selected via drag'n'drop
  const [selectionStart, setSelectionStart] = useState<ChartPayloadEntry>();
  const [selectionEnd, setSelectionEnd] = useState<ChartPayloadEntry>();
  const resetSelection = useCallback(() => {
    setSelectionStart(undefined);
    setSelectionEnd(undefined);
  }, []);
  const resolveSelectionStart = useCallback((e: CategoricalChartState, mouseEvent: MouseEvent) => {
    const payload = payloadFromChartEvent(e);
    if (mouseEvent.button === 0 && payload) {
      setSelectionStart(payload);
    }
  }, []);
  const resolveSelectionEnd = useCallback((e: CategoricalChartState) => {
    const payload = payloadFromChartEvent(e);
    if (selectionStart && payload) {
      setSelectionEnd(payload);
    }
  }, [selectionStart]);
  const updateDateRange = useCallback(() => {
    if (!selectionStart || !selectionEnd) {
      return;
    }

    // Resolve min and max dates, in case selection was done from right to left
    const dates = [selectionStart.date, selectionEnd.date];
    const startDate = min(dates);
    const endDate = max(dates);

    resetSelection();
    onDateRangeChange({ startDate, endDate });
  }, [onDateRangeChange, resetSelection, selectionEnd, selectionStart]);

  const { flag: groupByMenuOpen, toggle: toggleGroupByMenu } = useToggle(false, true);

  return (
    <Card
      className={clsx({ 'tw:fixed tw:top-0 tw:bottom-0 tw:left-0 tw:right-0 tw:z-1030': isExpanded })}
      data-testid="line-chart-card"
    >
      <Card.Header role="heading" aria-level={4} className="tw:flex tw:justify-between tw:items-center">
        Visits over time
        <div className="tw:flex tw:content-center tw:gap-1">
          <LinkButton
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            aria-expanded={isExpanded}
            aria-controls={bodyId}
            size="sm"
            onClick={toggleExpanded}
          >
            <FontAwesomeIcon icon={isExpanded ? collapseIcon : expandIcon} />
          </LinkButton>
          <Dropdown isOpen={groupByMenuOpen} toggle={toggleGroupByMenu} className="tw:flex tw:items-center">
            <DropdownToggle caret color="link" className="tw:text-sm tw:p-0">
              Group by
            </DropdownToggle>
            <DropdownMenu end>
              {groupByMenuOpen && Object.entries(STEPS_MAP).map(([value, menuText]) => (
                <DropdownItem key={value} active={step === value} onClick={() => setStep(value as Step)}>
                  {menuText}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </Card.Header>
      <Card.Body id={bodyId}>
        <ChartWrapper {...wrapperDimensions}>
          <LineChart
            className="tw:select-none"
            data={chartData}
            {...dimensions}
            onMouseDown={resolveSelectionStart}
            onMouseMove={resolveSelectionEnd}
            onMouseUp={updateDateRange}
          >
            <XAxis dataKey="formattedDate" />
            <YAxis tickFormatter={formatNumber} yAxisId="1" />
            <Tooltip formatter={formatNumber} {...CHART_TOOLTIP_COMMON_PROPS} />
            <CartesianGrid strokeOpacity={isDarkThemeEnabled() ? 0.1 : 0.9} />
            {Object.entries(visitsGroups).map(([dataKey, v]) => v.length > 0 && (
              <Line
                yAxisId="1"
                key={dataKey}
                dataKey={dataKey}
                type="monotone"
                stroke={visitsListColor(v)}
                strokeWidth={2}
                activeDot={v.type === 'previous' ? undefined : activeDot}
                strokeDasharray={v.type === 'previous' ? '8 3' : undefined}
              />
            ))}

            {selectionStart && selectionEnd && (
              <ReferenceArea yAxisId="1" x1={selectionStart.formattedDate} x2={selectionEnd.formattedDate} />
            )}
          </LineChart>
        </ChartWrapper>
        <LineChartLegend visitsGroups={visitsGroups} ref={legendRef} />
      </Card.Body>
    </Card>
  );
};
