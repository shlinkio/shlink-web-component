import { createAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../../container/store';
import { createAsyncThunk } from '../../../../utils/redux';
import type { VisitsLoader } from '../../../reducers/common';
import type { LoadVisitsForComparison, VisitsForComparisonLoaded } from '../types';
import { createLoadVisitsForComparison } from './createLoadVisitsForComparison';

interface VisitsComparisonAsyncThunkOptions<CreateLoadersParam extends LoadVisitsForComparison> {
  typePrefix: string;
  createLoaders: (options: CreateLoadersParam) => Record<string, VisitsLoader>;
  shouldCancel: (getState: () => RootState) => boolean;
}

export const createVisitsComparisonAsyncThunk = <CreateLoadersParam extends LoadVisitsForComparison>(
  { typePrefix, createLoaders, shouldCancel }: VisitsComparisonAsyncThunkOptions<CreateLoadersParam>,
) => {
  const progressChanged = createAction<number>(`${typePrefix}/progressChanged`);
  const asyncThunk = createAsyncThunk(
    typePrefix,
    async (options: CreateLoadersParam, { getState, dispatch }): Promise<VisitsForComparisonLoaded> => {
      const visitsLoaders = createLoaders(options);
      const loadVisits = createLoadVisitsForComparison({
        visitsLoaders,
        shouldCancel: () => shouldCancel(getState),
        progressChanged: (progress) => dispatch(progressChanged(progress)),
      });
      const visitsGroups = await loadVisits();

      return { visitsGroups, query: options.query };
    },
  );

  return Object.assign(asyncThunk, { progressChanged });
};
