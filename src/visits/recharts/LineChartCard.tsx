import { countBy } from '@shlinkio/data-manipulation';
import {
  HIGHLIGHTED_COLOR,
  isDarkThemeEnabled,
  MAIN_COLOR,
} from '@shlinkio/shlink-frontend-kit';
import {
  add,
  differenceInDays,
  differenceInHours,
  differenceInMonths,
  differenceInWeeks,
  endOfISOWeek,
  format, parseISO,
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
import { prettify } from '../../utils/helpers/numbers';
import type { NormalizedVisit, Stats } from '../types';
import { CHART_TOOLTIP_STYLES } from './constants';

type ChartPayloadEntry = {
  date: string;
  amount: number;
  highlightedAmount: number;
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
  // TODO Fix formatInternational return type
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  daily: (date) => formatInternational(date)!,
  weekly(date) {
    // TODO Fix formatInternational return type
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const firstWeekDay = formatInternational(startOfISOWeek(date))!;
    // TODO Fix formatInternational return type
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lastWeekDay = formatInternational(endOfISOWeek(date))!;

    return `${firstWeekDay} - ${lastWeekDay}`;
  },
  monthly: (date) => format(date, 'yyyy-MM'),
};

const determineInitialStep = (oldestVisitDate: string): Step => {
  const now = new Date();
  const oldestDate = parseISO(oldestVisitDate);
  const conditions: [() => boolean, Step][] = [
    [() => differenceInDays(now, oldestDate) <= 2, 'hourly'], // Less than 2 days
    [() => differenceInMonths(now, oldestDate) <= 1, 'daily'], // Between 2 days and 1 month
    [() => differenceInMonths(now, oldestDate) <= 6, 'weekly'], // Between 1 and 6 months
  ];

  return conditions.find(([matcher]) => matcher())?.[1] ?? 'monthly';
};

const countVisitsByDate = (step: Step, visits: NormalizedVisit[]): Stats => countBy(
  visits,
  (visit) => STEP_TO_DATE_FORMAT[step](parseISO(visit.date)),
);

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

const baseStatsWithNoGaps = (step: Step, visits: NormalizedVisit[]): Stats => {
  // We assume the list of visits is ordered, so the first and last visit should have the bigger and smaller dates
  const firstVisit = visits[0];
  const lastVisit = visits[visits.length - 1];

  if (!firstVisit || !lastVisit) {
    return {};
  }

  const diffFunc = STEP_TO_DIFF_FUNC_MAP[step];
  const formatter = STEP_TO_DATE_FORMAT[step];
  const duration = STEP_TO_DURATION_MAP[step];
  const newerDate = parseISO(firstVisit.date);
  const oldestDate = parseISO(lastVisit.date);
  const size = diffFunc(newerDate, oldestDate);

  const labels = [
    formatter(oldestDate),
    ...rangeOf(size, (num) => formatter(add(oldestDate, duration(num)))),
  ];

  return labels.reduce<Stats>((stats, label) => {
    // eslint-disable-next-line no-param-reassign
    stats[label] = 0;
    return stats;
  }, {});
};

type VisitsLineOptions = {
  color: string;
  dataKey: string;
  onDotClick: any;
};

// Using a function instead of an actual component because lines do not get render in that case. Need to investigate
const renderLine = ({ onDotClick, dataKey, color }: VisitsLineOptions) => (
  <Line
    type="monotone"
    dataKey={dataKey}
    stroke={color}
    strokeWidth={3}
    activeDot={{
      cursor: 'pointer',
      onClick: onDotClick,
    }}
  />
);

export type LineChartCardProps = {
  title: string;
  highlightedLabel?: string;
  visits: NormalizedVisit[];
  highlightedVisits: NormalizedVisit[];
  setSelectedVisits?: (visits: NormalizedVisit[]) => void;

  /** Test seam. For tests, a responsive container cannot be used */
  dimensions?: { width: number; height: number };
};

export const LineChartCard: FC<LineChartCardProps> = (
  { visits, title, highlightedVisits, highlightedLabel = 'Selected', setSelectedVisits, dimensions },
) => {
  const [step, setStep] = useState<Step>(
    visits.length > 0 ? determineInitialStep(visits[visits.length - 1].date) : 'monthly',
  );

  const chartData = useMemo((): ChartPayloadEntry[] => {
    const mainVisitsStats = countVisitsByDate(step, [...visits].reverse());
    const highlightedVisitsStats = countVisitsByDate(step, [...highlightedVisits].reverse());
    const baseStats = { ...baseStatsWithNoGaps(step, visits), ...mainVisitsStats };

    return Object.entries(baseStats).map(([date, amount]) => ({
      date,
      amount,
      highlightedAmount: highlightedVisitsStats[date] ?? 0,
    }));
  }, [step, visits, highlightedVisits]);

  // Save a map of step/date and all visits which belong to it, to use it when we need to highlight one
  const datasetsByPoint = useMemo(() => visitsToDatasetGroups(step, visits), [step, visits]);

  const onDotClick = useCallback((_: any, { payload }: { payload: ChartPayloadEntry }) => {
    const visitsToHighlight = datasetsByPoint[payload.date] ?? [];
    setSelectedVisits?.(visitsToHighlight === highlightedVisits ? [] : visitsToHighlight);
  }, [datasetsByPoint, highlightedVisits, setSelectedVisits]);

  const ChartWrapper = dimensions ? Fragment : ResponsiveContainer;
  const wrapperDimensions = dimensions ? {} : { width: '100%', height: 400 /* TODO Set 300 in mobile devices */ };

  return (
    <Card>
      <CardHeader role="heading" aria-level={4}>
        {title}
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
            <YAxis dataKey="amount" tickFormatter={prettify} />
            <Tooltip
              formatter={(value: number, name) => [prettify(value), name === 'amount' ? 'Visits' : highlightedLabel]}
              contentStyle={CHART_TOOLTIP_STYLES}
            />
            <CartesianGrid strokeOpacity={isDarkThemeEnabled() ? 0.1 : 0.9} />
            {renderLine({ color: MAIN_COLOR, dataKey: 'amount', onDotClick })}
            {highlightedVisits.length > 0 && renderLine({ color: HIGHLIGHTED_COLOR, dataKey: 'highlightedAmount', onDotClick })}
          </LineChart>
        </ChartWrapper>
      </CardBody>
    </Card>
  );
};
