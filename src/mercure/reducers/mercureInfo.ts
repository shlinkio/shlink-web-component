import { createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type { ShlinkMercureInfo } from '../../api-contract';
import type { Settings } from '../../settings';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk, useApiClientFactory } from '../../store/helpers';

const REDUCER_PREFIX = 'shlink/mercure';

export type MercureInfo = {
  status: 'loading' | 'error';
} | (ShlinkMercureInfo & {
  status: 'loaded';
});

const initialState: MercureInfo = {
  status: 'loading',
};

export const loadMercureInfo = createAsyncThunk(
  `${REDUCER_PREFIX}/loadMercureInfo`,
  ({ apiClientFactory, ...settings }: WithApiClient<Partial<Settings>>): Promise<ShlinkMercureInfo> => {
    if (settings.realTimeUpdates && !settings.realTimeUpdates.enabled) {
      throw new Error('Real time updates not enabled');
    }

    return apiClientFactory().mercureInfo();
  },
);

const { reducer } = createSlice({
  name: REDUCER_PREFIX,
  initialState: initialState as MercureInfo,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadMercureInfo.pending, () => initialState);
    builder.addCase(loadMercureInfo.rejected, () => ({ status: 'error' }));
    builder.addCase(loadMercureInfo.fulfilled, (_, { payload }) => ({ ...payload, status: 'loaded' }));
  },
});

export const mercureInfoReducer = reducer;

export const useMercureInfo = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const dispatchLoadMercureInfo = useCallback(
    (settings?: Settings) => dispatch(loadMercureInfo({ ...settings, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const mercureInfo = useAppSelector((state) => state.mercureInfo);

  return { mercureInfo, loadMercureInfo: dispatchLoadMercureInfo };
};
