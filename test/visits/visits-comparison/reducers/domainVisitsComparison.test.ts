import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient, ShlinkVisit } from '../../../../src/api-contract';
import { rangeOf } from '../../../../src/utils/helpers';
import {
  domainVisitsComparisonReducerCreator,
  getDomainVisitsForComparison as getDomainVisitsForComparisonCreator,
} from '../../../../src/visits/visits-comparison/reducers/domainVisitsComparison';
import { problemDetailsError } from '../../../__mocks__/ProblemDetailsError.mock';

describe('domainVisitsComparisonReducer', () => {
  const getDomainVisitsCall = vi.fn();
  const buildShlinkApiClientMock = () => fromPartial<ShlinkApiClient>({ getDomainVisits: getDomainVisitsCall });
  const getDomainVisitsForComparison = getDomainVisitsForComparisonCreator(buildShlinkApiClientMock);
  const { reducer, cancelGetVisits: cancelGetDomainVisitsForComparison } = domainVisitsComparisonReducerCreator(
    getDomainVisitsForComparison,
  );

  describe('reducer', () => {
    it('returns loading when pending', () => {
      const action = getDomainVisitsForComparison.pending('', { domains: [] }, undefined);
      const { loading } = reducer(fromPartial({ loading: false }), action);

      expect(loading).toEqual(true);
    });

    it('returns cancelLoad when load is cancelled', () => {
      const { cancelLoad } = reducer(fromPartial({ cancelLoad: false }), cancelGetDomainVisitsForComparison());
      expect(cancelLoad).toEqual(true);
    });

    it('stops loading and returns error when rejected', () => {
      const { loading, errorData } = reducer(
        fromPartial({ loading: true, errorData: null }),
        getDomainVisitsForComparison.rejected(problemDetailsError, '', { domains: [] }, undefined, undefined),
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
        getDomainVisitsForComparison.fulfilled(
          { visitsGroups: actionVisits },
          '',
          { domains: ['foo', 'bar'] },
          undefined,
        ),
      );

      expect(loading).toEqual(false);
      expect(errorData).toBeNull();
      expect(visitsGroups).toEqual(actionVisits);
    });

    it('returns new progress when progress changes', () => {
      const { progress } = reducer(undefined, getDomainVisitsForComparison.progressChanged(85));
      expect(progress).toEqual(85);
    });
  });

  describe('getDomainVisitsForComparison', () => {
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({
      domainVisitsComparison: { cancelLoad: false },
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
      const domains = Object.keys(visitsGroups);

      getDomainVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getDomainVisitsForComparison({ domains, query })(dispatch, getState, {});

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visitsGroups, query },
      }));
      expect(getDomainVisitsCall).toHaveBeenCalledTimes(domains.length);
      expect(getDomainVisitsCall).toHaveBeenNthCalledWith(1, 'foo', expect.anything());
      expect(getDomainVisitsCall).toHaveBeenNthCalledWith(2, 'bar', expect.anything());
      expect(getDomainVisitsCall).toHaveBeenNthCalledWith(3, 'baz', expect.anything());
    });
  });
});
