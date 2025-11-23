import { createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type { ShlinkMercureInfo } from '../../api-contract';
import type { Settings } from '../../settings';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk, useApiClientFactory } from '../../store/helpers';

const REDUCER_PREFIX = 'shlink/mercure';

export type MercureInfo = Partial<ShlinkMercureInfo> & {
  interval?: number;
  loading: boolean;
  error: boolean;
};

const initialState: MercureInfo = {
  loading: true,
  error: false,
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
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadMercureInfo.pending, (state) => ({ ...state, loading: true, error: false }));
    builder.addCase(loadMercureInfo.rejected, (state) => ({ ...state, loading: false, error: true }));
    builder.addCase(loadMercureInfo.fulfilled, (_, { payload }) => ({ ...payload, loading: false, error: false }));
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
