import { createAction, createSlice } from '@reduxjs/toolkit';
import type { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { useCallback } from 'react';
import type { ProblemDetailsError, ShlinkRenaming } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { useDependencies } from '../../container/context';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk } from '../../store/helpers';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';

const REDUCER_PREFIX = 'shlink/tagEdit';

export type TagEdition = {
  status: 'idle' | 'editing';
} | {
  status: 'error';
  error?: ProblemDetailsError;
} | (ShlinkRenaming & {
  status: 'edited';
});

export type EditTag = ShlinkRenaming & {
  color: string;
};

const initialState: TagEdition = {
  status: 'idle',
};

export const tagEdited = createAction<EditTag>(`${REDUCER_PREFIX}/tagEdited`);

type EditTagOptions = WithApiClient<EditTag> & {
  colorGenerator: ColorGenerator;
};

export const editTagThunk = createAsyncThunk(
  `${REDUCER_PREFIX}/editTag`,
  async ({ oldName, newName, color, apiClientFactory, colorGenerator }: EditTagOptions): Promise<EditTag> => {
    await apiClientFactory().editTag({ oldName, newName });
    colorGenerator.setColorForKey(newName, color);

    return { oldName, newName, color };
  },
);

export const { reducer: tagEditReducer } = createSlice({
  name: REDUCER_PREFIX,
  initialState: initialState as TagEdition,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(editTagThunk.pending, () => ({ status: 'editing' }));
    builder.addCase(editTagThunk.rejected, (_, { error }) => ({ status: 'error', error: parseApiError(error) }));
    builder.addCase(editTagThunk.fulfilled, (_, { payload }) => {
      const { oldName, newName } = payload;
      return { status: 'edited', oldName, newName };
    });
  },
});

export const useTagEdit = () => {
  const dispatch = useAppDispatch();
  const [apiClientFactory, colorGenerator] = useDependencies<[() => ShlinkApiClient, ColorGenerator]>(
    'apiClientFactory',
    'ColorGenerator',
  );
  const editTag = useCallback(
    (data: EditTag) => dispatch(editTagThunk({ ...data, apiClientFactory, colorGenerator })),
    [apiClientFactory, colorGenerator, dispatch],
  );
  const dispatchTagEdited = useCallback((data: EditTag) => dispatch(tagEdited(data)), [dispatch]);
  const tagEdit = useAppSelector((state) => state.tagEdit);

  return { tagEdit, editTag, tagEdited: dispatchTagEdited };
};
