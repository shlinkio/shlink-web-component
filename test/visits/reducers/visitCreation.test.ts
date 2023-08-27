import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkShortUrl, ShlinkVisit } from '../../../src/api-contract';
import { createNewVisits } from '../../../src/visits/reducers/visitCreation';

describe('visitCreationReducer', () => {
  describe('createNewVisits', () => {
    const shortUrl = fromPartial<ShlinkShortUrl>({});
    const visit = fromPartial<ShlinkVisit>({});

    it('just returns the action with proper type', () => {
      const { payload } = createNewVisits([{ shortUrl, visit }]);
      expect(payload).toEqual({ createdVisits: [{ shortUrl, visit }] });
    });
  });
});
