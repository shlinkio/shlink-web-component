import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient } from '../../../src/api-contract';
import { loadMercureInfo, mercureInfoReducer as reducer } from '../../../src/mercure/reducers/mercureInfo';
import type { Settings } from '../../../src/settings';
import type { WithApiClient } from '../../../src/store/helpers';

describe('mercureInfoReducer', () => {
  const mercureInfo = {
    mercureHubUrl: 'https://example.com/.well-known/mercure',
    token: 'abc.123.def',
  };
  const getMercureInfo = vi.fn();
  const apiClientFactory = () => fromPartial<ShlinkApiClient>({ mercureInfo: getMercureInfo });

  describe('reducer', () => {
    it('returns loading on GET_MERCURE_INFO_START', () => {
      expect(reducer(undefined, loadMercureInfo.pending('', { apiClientFactory }))).toEqual({
        loading: true,
        error: false,
      });
    });

    it('returns error on GET_MERCURE_INFO_ERROR', () => {
      expect(reducer(undefined, loadMercureInfo.rejected(null, '', { apiClientFactory }))).toEqual({
        loading: false,
        error: true,
      });
    });

    it('returns mercure info on GET_MERCURE_INFO', () => {
      expect(reducer(undefined, loadMercureInfo.fulfilled(mercureInfo, '', { apiClientFactory }))).toEqual(
        expect.objectContaining({ ...mercureInfo, loading: false, error: false }),
      );
    });
  });

  describe('loadMercureInfo', () => {
    const dispatch = vi.fn();
    const createSettings = (enabled: boolean): WithApiClient<Settings> => fromPartial({
      apiClientFactory,
      realTimeUpdates: { enabled },
    });

    it('dispatches error when real time updates are disabled', async () => {
      getMercureInfo.mockResolvedValue(mercureInfo);
      const settings = createSettings(false);

      await loadMercureInfo(settings)(dispatch, vi.fn(), {});

      expect(getMercureInfo).not.toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        error: new Error('Real time updates not enabled'),
      }));
    });

    it('calls API on success', async () => {
      getMercureInfo.mockResolvedValue(mercureInfo);
      const settings = createSettings(true);

      await loadMercureInfo(settings)(dispatch, vi.fn(), {});

      expect(getMercureInfo).toHaveBeenCalledOnce();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({ payload: mercureInfo }));
    });
  });
});
