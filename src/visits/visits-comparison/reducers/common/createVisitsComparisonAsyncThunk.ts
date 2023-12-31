import { createAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../../container/store';
import { createAsyncThunk } from '../../../../utils/redux';
import type { VisitsLoader } from '../../../reducers/common';
import type { LoadVisitsForComparison, VisitsForComparisonLoaded } from '../types';
import { createLoadVisitsForComparison } from './createLoadVisitsForComparison';

interface VisitsComparisonAsyncThunkOptions {
  typePrefix: string;
  createLoaders: (params: LoadVisitsForComparison) => Record<string, VisitsLoader>;
  shouldCancel: (getState: () => RootState) => boolean;
}

export const createVisitsComparisonAsyncThunk = (
  { typePrefix, createLoaders, shouldCancel }: VisitsComparisonAsyncThunkOptions,
) => {
  const progressChanged = createAction<number>(`${typePrefix}/progressChanged`);
  const asyncThunk = createAsyncThunk(
    typePrefix,
    async (params: LoadVisitsForComparison, { getState, dispatch }): Promise<VisitsForComparisonLoaded> => {
      const visitsLoaders = createLoaders(params);
      const loadVisits = createLoadVisitsForComparison({
        visitsLoaders,
        shouldCancel: () => shouldCancel(getState),
        progressChanged: (progress) => dispatch(progressChanged(progress)),
      });
      const visitsGroups = await loadVisits();

      return { visitsGroups };
    },
  );

  return Object.assign(asyncThunk, { progressChanged });
};
