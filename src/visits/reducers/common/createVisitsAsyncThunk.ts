import { createAction } from '@reduxjs/toolkit';
import { addDays } from 'date-fns';
import type { RootState } from '../../../container/store';
import { formatIsoDate, parseISO } from '../../../utils/dates/helpers/date';
import type { DateInterval } from '../../../utils/dates/helpers/dateIntervals';
import { dateRangeDaysDiff, dateToMatchingInterval } from '../../../utils/dates/helpers/dateIntervals';
import { createAsyncThunk } from '../../../utils/redux';
import { isMandatoryStartDateRangeParams, paramsForPrevDateRange, toApiParams } from '../../helpers';
import type { LoadVisits, VisitsLoaded } from '../types';
import type { Loaders } from './createLoadVisits';
import { createLoadVisits, DEFAULT_BATCH_SIZE } from './createLoadVisits';

interface VisitsAsyncThunkOptions<T extends LoadVisits = LoadVisits> {
  typePrefix: string;
  createLoaders: (params: T) => Loaders;
  shouldCancel: (getState: () => RootState) => boolean;
}

export const createVisitsAsyncThunk = <T extends LoadVisits = LoadVisits>(
  { typePrefix, createLoaders, shouldCancel }: VisitsAsyncThunkOptions<T>,
) => {
  const progressChanged = createAction<number>(`${typePrefix}/progressChanged`);
  const fallbackToInterval = createAction<DateInterval>(`${typePrefix}/fallbackToInterval`);

  const asyncThunk = createAsyncThunk(typePrefix, async (param: T, { getState, dispatch }): Promise<VisitsLoaded> => {
    const { params, options } = param;
    const { visitsLoader, lastVisitLoader } = createLoaders(param);
    const daysInDateRange = dateRangeDaysDiff(params.dateRange);
    const query = toApiParams(params);
    const queryForPrevVisits = options.loadPrevInterval && isMandatoryStartDateRangeParams(params)
      ? toApiParams(paramsForPrevDateRange(params))
      : undefined;
    const batchSize = DEFAULT_BATCH_SIZE / (queryForPrevVisits ? 2 : 1);

    const progresses = queryForPrevVisits ? { main: 0, prev: 0 } : { main: 0 };
    const computeProgress = (key: keyof typeof progresses, progress: number) => {
      progresses[key] = progress;

      const values = Object.values(progresses);
      const sum = values.reduce((a, b) => a + b, 0);

      dispatch(progressChanged(sum / values.length));
    };

    const loadVisits = createLoadVisits({
      visitsLoader,
      shouldCancel: () => shouldCancel(getState),
      progressChanged: (progress) => computeProgress('main', progress),
      batchSize,
    });
    const [visits, lastVisit, prevVisits] = await Promise.all([
      loadVisits(query),
      lastVisitLoader(params.filter?.excludeBots),
      queryForPrevVisits ? loadVisits(queryForPrevVisits).then((v) => v.map((visit) => {
        if (daysInDateRange === undefined) {
          return visit;
        }

        // Move date from every visit to the corresponding one in active range
        const { date, ...rest } = visit;
        const dateObj = addDays(parseISO(date), daysInDateRange);
        return { ...rest, date: formatIsoDate(dateObj)! }; // FIXME Fix formatIsoDate return type
      })) : Promise.resolve(undefined),
    ]);

    if (!visits.length && lastVisit) {
      dispatch(fallbackToInterval(dateToMatchingInterval(lastVisit.date)));
    }

    return { ...param, visits, prevVisits };
  });

  // Enhance the async thunk with extra actions
  return Object.assign(asyncThunk, { progressChanged, fallbackToInterval });
};
