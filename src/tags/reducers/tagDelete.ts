import { createAction, createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type { ProblemDetailsError } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk,useApiClientFactory  } from '../../store/helpers';

const REDUCER_PREFIX = 'shlink/tagDelete';

export interface TagDeletion {
  // TODO Replace all flags with `status: 'idle' | 'deleting' | 'deleted' | 'error'`
  deleting: boolean;
  deleted: boolean;
  error: boolean;
  errorData?: ProblemDetailsError;
}

const initialState: TagDeletion = {
  deleting: false,
  deleted: false,
  error: false,
};

export const tagDeleted = createAction<string>(`${REDUCER_PREFIX}/tagDeleted`);

export const deleteTagThunk = createAsyncThunk(`${REDUCER_PREFIX}/deleteTag`, async (
  { apiClientFactory, tag}: WithApiClient<{ tag: string }>,
): Promise<void> => {
  await apiClientFactory().deleteTags([tag]);
});

export const { reducer: tagDeleteReducer } = createSlice({
  name: REDUCER_PREFIX,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(deleteTagThunk.pending, () => ({ deleting: true, deleted: false, error: false }));
    builder.addCase(
      deleteTagThunk.rejected,
      (_, { error }) => ({ deleting: false, deleted: false, error: true, errorData: parseApiError(error) }),
    );
    builder.addCase(deleteTagThunk.fulfilled, () => ({ deleting: false, deleted: true, error: false }));
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
