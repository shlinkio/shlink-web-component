import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkOrphanVisit, ShlinkVisitsParams } from '../../../src/api-contract';
import { formatIsoDate, parseDate } from '../../../src/utils/dates/helpers/date';
import type { GroupedNewVisits } from '../../../src/visits/helpers';
import { groupNewVisitsByType, toApiParams } from '../../../src/visits/helpers';
import type { CreateVisit, VisitsParams } from '../../../src/visits/types';

describe('visitsTypeHelpers', () => {
  describe('groupNewVisitsByType', () => {
    it.each([
      [[], { orphanVisits: [], nonOrphanVisits: [] }],
      ((): [CreateVisit[], GroupedNewVisits] => {
        const orphanVisits: CreateVisit[] = [
          fromPartial({ visit: fromPartial<ShlinkOrphanVisit>({ visitedUrl: '' }) }),
          fromPartial({ visit: fromPartial<ShlinkOrphanVisit>({ visitedUrl: '' }) }),
        ];
        const nonOrphanVisits: CreateVisit[] = [
          fromPartial({ visit: {} }),
          fromPartial({ visit: {} }),
          fromPartial({ visit: {} }),
          fromPartial({ visit: {} }),
          fromPartial({ visit: {} }),
        ];

        return [
          [...orphanVisits, ...nonOrphanVisits],
          { orphanVisits, nonOrphanVisits },
        ];
      })(),
      ((): [CreateVisit[], GroupedNewVisits] => {
        const orphanVisits: CreateVisit[] = [
          fromPartial({ visit: fromPartial<ShlinkOrphanVisit>({ visitedUrl: '' }) }),
          fromPartial({ visit: fromPartial<ShlinkOrphanVisit>({ visitedUrl: '' }) }),
          fromPartial({ visit: fromPartial<ShlinkOrphanVisit>({ visitedUrl: '' }) }),
        ];

        return [orphanVisits, { orphanVisits, nonOrphanVisits: [] }];
      })(),
      ((): [CreateVisit[], GroupedNewVisits] => {
        const nonOrphanVisits: CreateVisit[] = [
          fromPartial({ visit: {} }),
          fromPartial({ visit: {} }),
          fromPartial({ visit: {} }),
        ];

        return [nonOrphanVisits, { orphanVisits: [], nonOrphanVisits }];
      })(),
    ])('groups new visits as expected', (createdVisits, expectedResult) => {
      expect(groupNewVisitsByType(createdVisits)).toEqual(expectedResult);
    });
  });

  describe('toApiParams', () => {
    it.each([
      [
        {
          filter: { excludeBots: true },
        } satisfies VisitsParams,
        { excludeBots: true } as ShlinkVisitsParams,
      ],
      (() => {
        const endDate = parseDate('2020-05-05', 'yyyy-MM-dd');

        return [
          {
            dateRange: { endDate },
          } satisfies VisitsParams,
          { endDate: formatIsoDate(endDate) } as ShlinkVisitsParams,
        ];
      })(),
      (() => {
        const startDate = parseDate('2020-05-05', 'yyyy-MM-dd');
        const endDate = parseDate('2021-10-30', 'yyyy-MM-dd');

        return [
          {
            dateRange: { startDate, endDate },
            filter: { excludeBots: false },
          } satisfies VisitsParams,
          {
            startDate: formatIsoDate(startDate),
            endDate: formatIsoDate(endDate),
          } as ShlinkVisitsParams,
        ];
      })(),
    ])('converts param as expected', (visitsParams, expectedResult) => {
      expect(toApiParams(visitsParams)).toEqual(expectedResult);
    });
  });
});
