import { createAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../container/store';
import type { DateInterval } from '../../../utils/dates/helpers/dateIntervals';
import { dateToMatchingInterval } from '../../../utils/dates/helpers/dateIntervals';
import { createAsyncThunk } from '../../../utils/redux';
import type { LoadVisits, VisitsLoaded } from '../types';
import type { LastVisitLoader, VisitsLoader } from './createLoadVisits';
import { createLoadVisits } from './createLoadVisits';

interface VisitsAsyncThunkOptions<T extends LoadVisits = LoadVisits> {
  typePrefix: string;
  createLoaders: (params: T) => [VisitsLoader, LastVisitLoader];
  shouldCancel: (getState: () => RootState) => boolean;
}

export const createVisitsAsyncThunk = <T extends LoadVisits = LoadVisits>(
  { typePrefix, createLoaders, shouldCancel }: VisitsAsyncThunkOptions<T>,
) => {
  const progressChanged = createAction<number>(`${typePrefix}/progressChanged`);
  const fallbackToInterval = createAction<DateInterval>(`${typePrefix}/fallbackToInterval`);

  const asyncThunk = createAsyncThunk(typePrefix, async (param: T, { getState, dispatch }): Promise<VisitsLoaded> => {
    const [visitsLoader, lastVisitLoader] = createLoaders(param);
    const loadVisits = createLoadVisits({
      visitsLoader,
      shouldCancel: () => shouldCancel(getState),
      progressChanged: (progress) => dispatch(progressChanged(progress)),
    });
    const [visits, lastVisit] = await Promise.all([loadVisits(), lastVisitLoader(param.params.filter?.excludeBots)]);

    if (!visits.length && lastVisit) {
      dispatch(fallbackToInterval(dateToMatchingInterval(lastVisit.date)));
    }

    return { ...param, visits };
  });

  // Enhance the async thunk with extra actions
  return Object.assign(asyncThunk, { progressChanged, fallbackToInterval });
};
