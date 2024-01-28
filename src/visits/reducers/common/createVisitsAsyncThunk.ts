import { createAction } from '@reduxjs/toolkit';
import { addDays } from 'date-fns';
import type { RootState } from '../../../container/store';
import { formatIsoDate, parseISO } from '../../../utils/dates/helpers/date';
import type { DateInterval } from '../../../utils/dates/helpers/dateIntervals';
import { dateRangeDaysDiff, dateToMatchingInterval } from '../../../utils/dates/helpers/dateIntervals';
import { createAsyncThunk } from '../../../utils/redux';
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
    const { visitsLoader, lastVisitLoader, prevVisitsLoader } = createLoaders(param);
    const batchSize = DEFAULT_BATCH_SIZE / (prevVisitsLoader ? 2 : 1);
    const daysInDateRange = dateRangeDaysDiff(param.params.dateRange);

    const progresses = prevVisitsLoader ? { main: 0, prev: 0 } : { main: 0 };
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
    const loadPrevVisits = prevVisitsLoader && createLoadVisits({
      visitsLoader: prevVisitsLoader,
      shouldCancel: () => shouldCancel(getState),
      progressChanged: (progress) => computeProgress('prev', progress),
      batchSize,
    });
    const [visits, lastVisit, prevVisits] = await Promise.all([
      loadVisits(),
      lastVisitLoader(param.params.filter?.excludeBots),
      loadPrevVisits?.().then((v) => v.map((visit) => {
        if (daysInDateRange === undefined) {
          return visit;
        }

        // Move date from every visit to the corresponding one in active range
        const { date, ...rest } = visit;
        const dateObj = addDays(parseISO(date), daysInDateRange);
        return { ...rest, date: formatIsoDate(dateObj)! }; // FIXME Fix formatIsoDate return type
      })) ?? Promise.resolve(undefined),
    ]);

    if (!visits.length && lastVisit) {
      dispatch(fallbackToInterval(dateToMatchingInterval(lastVisit.date)));
    }

    return { ...param, visits, prevVisits };
  });

  // Enhance the async thunk with extra actions
  return Object.assign(asyncThunk, { progressChanged, fallbackToInterval });
};
