import { createAsyncThunk as baseCreateAsyncThunk } from '@reduxjs/toolkit';
import type { ShlinkApiClient } from '../api-contract';
import { useDependencies } from '../container/context';
import type { RootState } from './index';

type ShlinkAsyncThunkConfig = {
  state: RootState;
  serializedErrorType: any;
};

export const createAsyncThunk = baseCreateAsyncThunk.withTypes<ShlinkAsyncThunkConfig>();

baseCreateAsyncThunk.withTypes<ShlinkAsyncThunkConfig>();

export type WithApiClient<T> = T & { apiClientFactory: () => ShlinkApiClient };

/**
 * Alias for useDependencies<[() => ShlinkApiClient]>('apiClientFactory')[0], to avoid duplicating this logic in every
 * redux hook that needs access to the API client
 */
export const useApiClientFactory = () => {
  const [apiClientFactory] = useDependencies<[() => ShlinkApiClient]>('apiClientFactory');
  return apiClientFactory;
};
