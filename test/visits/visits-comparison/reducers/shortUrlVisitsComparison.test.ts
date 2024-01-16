import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient, ShlinkVisit } from '../../../../src/api-contract';
import { queryToShortUrl } from '../../../../src/short-urls/helpers';
import { rangeOf } from '../../../../src/utils/helpers';
import {
  getShortUrlVisitsForComparison as getShortUrlVisitsForComparisonCreator,
  shortUrlVisitsComparisonReducerCreator,
} from '../../../../src/visits/visits-comparison/reducers/shortUrlVisitsComparison';
import { problemDetailsError } from '../../../__mocks__/ProblemDetailsError.mock';

describe('shortUrlVisitsComparisonReducer', () => {
  const getShortUrlVisitsCall = vi.fn();
  const buildShlinkApiClientMock = () => fromPartial<ShlinkApiClient>({ getShortUrlVisits: getShortUrlVisitsCall });
  const getShortUrlVisitsForComparison = getShortUrlVisitsForComparisonCreator(buildShlinkApiClientMock);
  const { reducer, cancelGetVisits: cancelGetShortUrlVisitsForComparison } = shortUrlVisitsComparisonReducerCreator(
    getShortUrlVisitsForComparison,
  );

  describe('reducer', () => {
    it('returns loading when pending', () => {
      const action = getShortUrlVisitsForComparison.pending('', { shortUrls: [] }, undefined);
      const { loading } = reducer(fromPartial({ loading: false }), action);

      expect(loading).toEqual(true);
    });

    it('returns cancelLoad when load is cancelled', () => {
      const { cancelLoad } = reducer(fromPartial({ cancelLoad: false }), cancelGetShortUrlVisitsForComparison());
      expect(cancelLoad).toEqual(true);
    });

    it('stops loading and returns error when rejected', () => {
      const { loading, errorData } = reducer(
        fromPartial({ loading: true, errorData: null }),
        getShortUrlVisitsForComparison.rejected(problemDetailsError, '', { shortUrls: [] }, undefined, undefined),
      );

      expect(loading).toEqual(false);
      expect(errorData).toEqual(problemDetailsError);
    });

    it('returns visits groups when fulfilled', () => {
      const actionVisits: Record<string, ShlinkVisit[]> = {
        DEFAULT__foo: [fromPartial({}), fromPartial({})],
        's.test__bar': [fromPartial({}), fromPartial({})],
      };
      const { loading, errorData, visitsGroups } = reducer(
        fromPartial({ loading: true, errorData: null }),
        getShortUrlVisitsForComparison.fulfilled(
          { visitsGroups: actionVisits },
          '',
          { shortUrls: [{ shortCode: 'foo' }, { shortCode: 'bar', domain: 's.test' }] },
          undefined,
        ),
      );

      expect(loading).toEqual(false);
      expect(errorData).toBeNull();
      expect(visitsGroups).toEqual(actionVisits);
    });

    it('returns new progress when progress changes', () => {
      const { progress } = reducer(undefined, getShortUrlVisitsForComparison.progressChanged(85));
      expect(progress).toEqual(85);
    });
  });

  describe('getShortUrlVisitsForComparison', () => {
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({
      shortUrlVisitsComparison: { cancelLoad: false },
    });
    const visitsMocks = rangeOf(2, () => fromPartial<ShlinkVisit>({}));

    it.each([
      [undefined],
      [{}],
    ])('dispatches start and success when promise is resolved', async (query) => {
      const visitsGroups = {
        DEFAULT__foo: visitsMocks,
        DEFAULT__bar: visitsMocks,
        DEFAULT__baz: visitsMocks,
      };
      const shortUrls = Object.keys(visitsGroups).map(queryToShortUrl);

      getShortUrlVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getShortUrlVisitsForComparison({ shortUrls, query })(dispatch, getState, {});

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visitsGroups, query },
      }));
      expect(getShortUrlVisitsCall).toHaveBeenCalledTimes(shortUrls.length);
      expect(getShortUrlVisitsCall).toHaveBeenNthCalledWith(1, 'foo', expect.anything());
      expect(getShortUrlVisitsCall).toHaveBeenNthCalledWith(2, 'bar', expect.anything());
      expect(getShortUrlVisitsCall).toHaveBeenNthCalledWith(3, 'baz', expect.anything());
    });
  });
});
