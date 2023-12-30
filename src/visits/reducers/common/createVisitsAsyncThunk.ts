import { createAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../container/store';
import type { DateInterval } from '../../../utils/dates/helpers/dateIntervals';
import { dateToMatchingInterval } from '../../../utils/dates/helpers/dateIntervals';
import { createAsyncThunk } from '../../../utils/redux';
import type { LoadVisits, VisitsLoaded } from '../types';
import type { LastVisitLoader, VisitsLoader } from './createLoadVisits';
import { createLoadVisits } from './createLoadVisits';

interface VisitsAsyncThunkOptions<T extends LoadVisits = LoadVisits, R extends VisitsLoaded = VisitsLoaded> {
  typePrefix: string;
  createLoaders: (params: T) => [VisitsLoader, LastVisitLoader];
  getExtraFulfilledPayload: (params: T) => Partial<R>;
  shouldCancel: (getState: () => RootState) => boolean;
}

export const createVisitsAsyncThunk = <T extends LoadVisits = LoadVisits, R extends VisitsLoaded = VisitsLoaded>(
  { typePrefix, createLoaders, getExtraFulfilledPayload, shouldCancel }: VisitsAsyncThunkOptions<T, R>,
) => {
  const progressChanged = createAction<number>(`${typePrefix}/progressChanged`);
  const fallbackToInterval = createAction<DateInterval>(`${typePrefix}/fallbackToInterval`);

  const asyncThunk = createAsyncThunk(typePrefix, async (params: T, { getState, dispatch }): Promise<Partial<R>> => {
    const [visitsLoader, lastVisitLoader] = createLoaders(params);
    const loadVisits = createLoadVisits(
      visitsLoader,
      () => shouldCancel(getState),
      (progress) => dispatch(progressChanged(progress)),
    );
    const [visits, lastVisit] = await Promise.all([loadVisits(), lastVisitLoader(params.query?.excludeBots)]);

    if (!visits.length && lastVisit) {
      dispatch(fallbackToInterval(dateToMatchingInterval(lastVisit.date)));
    }

    return { ...getExtraFulfilledPayload(params), visits };
  });

  // Enhance the async thunk with extra actions
  return Object.assign(asyncThunk, { progressChanged, fallbackToInterval });
};
