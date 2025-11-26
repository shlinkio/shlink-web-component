import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient } from '../../../src/api-contract';
import {
  deleteTagThunk as deleteTag,
  tagDeleted,
  tagDeleteReducer as reducer,
} from '../../../src/tags/reducers/tagDelete';

describe('tagDeleteReducer', () => {
  const deleteTagsCall = vi.fn();
  const apiClientFactory = () => fromPartial<ShlinkApiClient>({ deleteTags: deleteTagsCall });

  describe('reducer', () => {
    it('returns loading on DELETE_TAG_START', () => {
      expect(reducer(undefined, deleteTag.pending('', { tag: '', apiClientFactory }))).toEqual({ status: 'deleting' });
    });

    it('returns error on DELETE_TAG_ERROR', () => {
      expect(reducer(undefined, deleteTag.rejected(null, '', { tag: '', apiClientFactory }))).toEqual({
        status: 'error',
      });
    });

    it('returns tag names on DELETE_TAG', () => {
      expect(reducer(undefined, deleteTag.fulfilled(undefined, '', { tag: '', apiClientFactory }))).toEqual({
        status: 'deleted',
      });
    });
  });

  describe('tagDeleted', () => {
    it('returns action based on provided params', () => {
      expect(tagDeleted('foo').payload).toEqual('foo');
    });
  });

  describe('deleteTag', () => {
    const dispatch = vi.fn();

    it('calls API on success', async () => {
      const tag = 'foo';
      deleteTagsCall.mockResolvedValue(undefined);

      await deleteTag({ tag, apiClientFactory })(dispatch, vi.fn(), {});

      expect(deleteTagsCall).toHaveBeenCalledOnce();
      expect(deleteTagsCall).toHaveBeenNthCalledWith(1, [tag]);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({ payload: undefined }));
    });
  });
});
