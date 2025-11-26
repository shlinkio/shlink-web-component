import { createAction, createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type { ProblemDetailsError } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk,useApiClientFactory  } from '../../store/helpers';

const REDUCER_PREFIX = 'shlink/tagDelete';

export type TagDeletion = {
  status: 'idle' | 'deleting' | 'deleted';
} | {
  status: 'error';
  error?: ProblemDetailsError;
};

const initialState: TagDeletion = {
  status: 'idle',
};

export const tagDeleted = createAction<string>(`${REDUCER_PREFIX}/tagDeleted`);

export const deleteTagThunk = createAsyncThunk(`${REDUCER_PREFIX}/deleteTag`, async (
  { apiClientFactory, tag }: WithApiClient<{ tag: string }>,
): Promise<void> => {
  await apiClientFactory().deleteTags([tag]);
});

export const { reducer: tagDeleteReducer } = createSlice({
  name: REDUCER_PREFIX,
  initialState: initialState as TagDeletion,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(deleteTagThunk.pending, () => ({ status: 'deleting' }));
    builder.addCase(
      deleteTagThunk.rejected,
      (_, { error }) => ({ status: 'error', error: parseApiError(error) }),
    );
    builder.addCase(deleteTagThunk.fulfilled, () => ({ status: 'deleted' }));
  },
});

export const useTagDelete = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const deleteTag = useCallback(
    (tag: string) => dispatch(deleteTagThunk({ tag, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const dispatchTagDeleted = useCallback((tag: string) => dispatch(tagDeleted(tag)), [dispatch]);
  const tagDelete = useAppSelector((state) => state.tagDelete);

  return { tagDelete, deleteTag, tagDeleted: dispatchTagDeleted };
};
