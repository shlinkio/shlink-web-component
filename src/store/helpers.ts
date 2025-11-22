import type { AsyncThunkPayloadCreator } from '@reduxjs/toolkit';
import { createAsyncThunk as baseCreateAsyncThunk } from '@reduxjs/toolkit';
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
