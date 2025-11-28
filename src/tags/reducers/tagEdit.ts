import { createAction, createSlice } from '@reduxjs/toolkit';
import type { ProblemDetailsError, ShlinkApiClient } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { createAsyncThunk } from '../../store/helpers';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';

const REDUCER_PREFIX = 'shlink/tagEdit';

export type TagEdition = {
  status: 'idle' | 'editing';
} | {
  status: 'error';
  error?: ProblemDetailsError;
} | {
  status: 'edited';
  oldName: string;
  newName: string;
};

export interface EditTag {
  oldName: string;
  newName: string;
  color: string;
}

const initialState: TagEdition = {
  status: 'idle',
};

export const tagEdited = createAction<EditTag>(`${REDUCER_PREFIX}/tagEdited`);

export const editTag = (
  apiClientFactory: () => ShlinkApiClient,
  colorGenerator: ColorGenerator,
) => createAsyncThunk(
  `${REDUCER_PREFIX}/editTag`,
  async ({ oldName, newName, color }: EditTag): Promise<EditTag> => {
    await apiClientFactory().editTag({ oldName, newName });
    colorGenerator.setColorForKey(newName, color);

    return { oldName, newName, color };
  },
);

export const tagEditReducerCreator = (editTagThunk: ReturnType<typeof editTag>) => createSlice({
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
