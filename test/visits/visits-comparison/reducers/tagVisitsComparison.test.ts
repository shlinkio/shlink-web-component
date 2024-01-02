import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient, ShlinkVisit } from '../../../../src/api-contract';
import { rangeOf } from '../../../../src/utils/helpers';
import {
  getTagVisitsForComparison as getTagVisitsForComparisonCreator,
  tagVisitsComparisonReducerCreator,
} from '../../../../src/visits/visits-comparison/reducers/tagVisitsComparison';
import { problemDetailsError } from '../../../__mocks__/ProblemDetailsError.mock';

describe('tagVisitsComparisonReducer', () => {
  const getTagVisitsCall = vi.fn();
  const buildShlinkApiClientMock = () => fromPartial<ShlinkApiClient>({ getTagVisits: getTagVisitsCall });
  const getTagVisitsForComparison = getTagVisitsForComparisonCreator(buildShlinkApiClientMock);
  const { reducer, cancelGetVisits: cancelGetTagVisitsForComparison } = tagVisitsComparisonReducerCreator(
    getTagVisitsForComparison,
  );

  describe('reducer', () => {
    it('returns loading when pending', () => {
      const action = getTagVisitsForComparison.pending('', { tags: [] }, undefined);
      const { loading } = reducer(fromPartial({ loading: false }), action);

      expect(loading).toEqual(true);
    });

    it('returns cancelLoad when load is cancelled', () => {
      const { cancelLoad } = reducer(fromPartial({ cancelLoad: false }), cancelGetTagVisitsForComparison());
      expect(cancelLoad).toEqual(true);
    });

    it('stops loading and returns error when rejected', () => {
      const { loading, errorData } = reducer(
        fromPartial({ loading: true, errorData: null }),
        getTagVisitsForComparison.rejected(problemDetailsError, '', { tags: [] }, undefined, undefined),
      );

      expect(loading).toEqual(false);
      expect(errorData).toEqual(problemDetailsError);
    });

    it('returns visits groups when fulfilled', () => {
      const actionVisits: Record<string, ShlinkVisit[]> = {
        foo: [fromPartial({}), fromPartial({})],
        bar: [fromPartial({}), fromPartial({})],
      };
      const { loading, errorData, visitsGroups } = reducer(
        fromPartial({ loading: true, errorData: null }),
        getTagVisitsForComparison.fulfilled({ visitsGroups: actionVisits }, '', { tags: ['foo', 'bar'] }, undefined),
      );

      expect(loading).toEqual(false);
      expect(errorData).toBeNull();
      expect(visitsGroups).toEqual(actionVisits);
    });

    it('returns new progress when progress changes', () => {
      const { progress } = reducer(undefined, getTagVisitsForComparison.progressChanged(85));
      expect(progress).toEqual(85);
    });
  });

  describe('getTagVisitsForComparison', () => {
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({
      tagVisitsComparison: { cancelLoad: false },
    });
    const visitsMocks = rangeOf(2, () => fromPartial<ShlinkVisit>({}));

    it.each([
      [undefined],
      [{}],
    ])('dispatches start and success when promise is resolved', async (query) => {
      const visitsGroups = {
        foo: visitsMocks,
        bar: visitsMocks,
        baz: visitsMocks,
      };
      const tags = Object.keys(visitsGroups);

      getTagVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getTagVisitsForComparison({ tags, query })(dispatch, getState, {});

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visitsGroups },
      }));
      expect(getTagVisitsCall).toHaveBeenCalledTimes(tags.length);
      expect(getTagVisitsCall).toHaveBeenNthCalledWith(1, 'foo', expect.anything());
      expect(getTagVisitsCall).toHaveBeenNthCalledWith(2, 'bar', expect.anything());
      expect(getTagVisitsCall).toHaveBeenNthCalledWith(3, 'baz', expect.anything());
    });
  });
});
