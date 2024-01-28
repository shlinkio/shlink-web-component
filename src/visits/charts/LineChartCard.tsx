import { countBy } from '@shlinkio/data-manipulation';
import { HIGHLIGHTED_COLOR, isDarkThemeEnabled, MAIN_COLOR } from '@shlinkio/shlink-frontend-kit';
import {
  add,
  differenceInDays,
  differenceInHours,
  differenceInMonths,
  differenceInWeeks,
  endOfISOWeek,
  format,
  max,
  min,
  parseISO,
  startOfISOWeek,
} from 'date-fns';
import type { FC } from 'react';
import { Fragment, useCallback, useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from 'reactstrap';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatInternational } from '../../utils/dates/helpers/date';
import { rangeOf } from '../../utils/helpers';
import { useMaxResolution } from '../../utils/helpers/hooks';
import { prettify } from '../../utils/helpers/numbers';
import type { Mandatory, MediaMatcher } from '../../utils/types';
import type { NormalizedVisit, Stats } from '../types';
import { CHART_TOOLTIP_COMMON_PROPS, PREV_COLOR } from './constants';
import { LineChartLegend } from './LineChartLegend';

type ChartPayloadEntry = {
  date: string;
  [key: string]: string | number;
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
  daily: differenceInDays,
  weekly: differenceInWeeks,
  monthly: differenceInMonths,
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
    [() => differenceInDays(now, oldestDate) <= 2, 'hourly'], // Less than 2 days
    [() => differenceInMonths(now, oldestDate) <= 1, 'daily'], // Between 2 days and 1 month
    [() => differenceInMonths(now, oldestDate) <= 6, 'weekly'], // Between 1 and 6 months
  ];

  return conditions.find(([matcher]) => matcher())?.[1] ?? 'monthly';
};

const countVisitsByDatePerGroup = (
  step: Step,
  visitsGroups: Record<string, NormalizedVisit[]>,
) => Object.keys(visitsGroups).reduce<Record<string, Stats>>((countGroups, key) => {
  // eslint-disable-next-line no-param-reassign
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

const datesWithNoGaps = (step: Step, visitsGroups: Record<string, NormalizedVisit[]>): string[] => {
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
  const firstDates = nonEmptyVisitsLists.map((visits) => parseISO(visits[0].date));
  const lastDates = nonEmptyVisitsLists.map((visits) => parseISO(visits[visits.length - 1].date));
  const newerDate = max(lastDates);
  const oldestDate = min(firstDates);
  const size = diffFunc(newerDate, oldestDate) + 1; // Add one, as we need both edges to be included

  return [
    formatter(oldestDate),
    ...rangeOf(size, (num) => formatter(add(oldestDate, duration(num)))),
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

  const typeColorMap: Record<Mandatory<VisitsList['type']>, string> = {
    main: MAIN_COLOR,
    highlighted: HIGHLIGHTED_COLOR,
    previous: PREV_COLOR,
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
    const visitsToHighlight = datasetsByPoint[payload.date] ?? [];
    setSelectedVisits?.(visitsToHighlight === highlightedVisits ? [] : visitsToHighlight);
  }, [datasetsByPoint, highlightedVisits, setSelectedVisits]);

  return setSelectedVisits && {
    cursor: 'pointer',
    onClick: onDotClick as any,
  };
};

export type LineChartCardProps = {
  visitsGroups: Record<string, VisitsList>;
  setSelectedVisits?: (visits: NormalizedVisit[]) => void;

  /** Test seam. For tests, a responsive container cannot be used */
  dimensions?: { width: number; height: number };
  matchMedia?: MediaMatcher;
};

export const LineChartCard: FC<LineChartCardProps> = (
  { visitsGroups, setSelectedVisits, dimensions, matchMedia },
) => {
  const [step, setStep] = useState<Step>(determineInitialStep(visitsGroups));
  const isMobile = useMaxResolution(767, matchMedia ?? window.matchMedia);

  const chartData = useMemo((): ChartPayloadEntry[] => {
    const statsGroups = countVisitsByDatePerGroup(step, visitsGroups);
    const groupNames = Object.keys(statsGroups);

    return datesWithNoGaps(step, visitsGroups).map((date) => ({
      date,
      ...groupNames.reduce<Record<string, number>>((acc, name) => {
        acc[name] = statsGroups[name][date] ?? 0;
        return acc;
      }, {}),
    }));
  }, [step, visitsGroups]);
  const activeDot = useActiveDot(visitsGroups, step, setSelectedVisits);

  const ChartWrapper = dimensions ? Fragment : ResponsiveContainer;
  const wrapperDimensions = useMemo(
    // If dimensions were explicitly provided for the chart, we don't need to set dimensions in the wrapper as well
    () => (dimensions ? {} : { width: '100%', height: isMobile ? 300 : 400 }),
    [dimensions, isMobile],
  );

  return (
    <Card>
      <CardHeader role="heading" aria-level={4}>
        Visits over time
        <div className="float-end">
          <UncontrolledDropdown>
            <DropdownToggle caret color="link" className="btn-sm p-0">
              Group by
            </DropdownToggle>
            <DropdownMenu end>
              {Object.entries(STEPS_MAP).map(([value, menuText]) => (
                <DropdownItem key={value} active={step === value} onClick={() => setStep(value as Step)}>
                  {menuText}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      </CardHeader>
      <CardBody>
        <ChartWrapper {...wrapperDimensions}>
          <LineChart data={chartData} {...dimensions}>
            <XAxis dataKey="date" />
            <YAxis tickFormatter={prettify} />
            <Tooltip formatter={prettify} {...CHART_TOOLTIP_COMMON_PROPS} />
            <CartesianGrid strokeOpacity={isDarkThemeEnabled() ? 0.1 : 0.9} />
            {Object.entries(visitsGroups).map(([dataKey, v]) => v.length > 0 && (
              <Line
                key={dataKey}
                dataKey={dataKey}
                type="monotone"
                stroke={visitsListColor(v)}
                strokeWidth={2}
                activeDot={v.type === 'previous' ? undefined : activeDot}
                strokeDasharray={v.type === 'previous' ? '8 3' : undefined}
              />
            ))}
          </LineChart>
        </ChartWrapper>
        <LineChartLegend visitsGroups={visitsGroups} />
      </CardBody>
    </Card>
  );
};
