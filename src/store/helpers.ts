import type { AsyncThunkPayloadCreator } from '@reduxjs/toolkit';
import { createAsyncThunk as baseCreateAsyncThunk } from '@reduxjs/toolkit';
import type { ShlinkApiClient } from '../api-contract';
import { useDependencies } from '../container/context';
import type { RootState } from './index';

type ShlinkAsyncThunkConfig = {
  state: RootState;
  serializedErrorType: any;
};

type ShlinkPayloadCreator<Returned, ThunkArg> = AsyncThunkPayloadCreator<Returned, ThunkArg, ShlinkAsyncThunkConfig>;

export const createAsyncThunk = <Returned, ThunkArg = void>(
  typePrefix: string,
  payloadCreator: ShlinkPayloadCreator<Returned, ThunkArg>,
) => baseCreateAsyncThunk(typePrefix, payloadCreator, { serializeError: (e) => e });

export type WithApiClient<T> = T & { apiClientFactory: () => ShlinkApiClient };

/**
 * Alias for useDependencies<[() => ShlinkApiClient]>('apiClientFactory')[0], to avoid duplicating this logic in every
 * redux hook that needs access to the API client
 */
export const useApiClientFactory = () => {
  const [apiClientFactory] = useDependencies<[() => ShlinkApiClient]>('apiClientFactory');
  return apiClientFactory;
};
