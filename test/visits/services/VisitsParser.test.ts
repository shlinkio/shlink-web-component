import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkOrphanVisit, ShlinkVisit } from '../../../src/api-contract';
import { normalizeVisits, processStatsFromVisits } from '../../../src/visits/services/VisitsParser';
import type { VisitsStats } from '../../../src/visits/types';

describe('VisitsParser', () => {
  const visits: ShlinkVisit[] = [
    fromPartial({
      userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
      referer: 'https://google.com',
      potentialBot: false,
      visitLocation: {
        countryName: 'Spain',
        cityName: 'Zaragoza',
        latitude: 123.45,
        longitude: -543.21,
      },
    }),
    fromPartial({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0',
      referer: 'https://google.com',
      potentialBot: false,
      visitLocation: {
        countryName: 'United States',
        cityName: 'New York',
        latitude: 1029,
        longitude: 6758,
      },
    }),
    fromPartial({
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
      potentialBot: false,
      visitedUrl: 'foo',
      visitLocation: {
        countryName: 'Spain',
        cityName: '',
      },
    }),
    fromPartial({
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
      referer: 'https://m.facebook.com',
      potentialBot: false,
      visitedUrl: 'foo',
      visitLocation: {
        countryName: 'Spain',
        cityName: 'Zaragoza',
        latitude: 123.45,
        longitude: -543.21,
      },
    }),
    fromPartial({
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 OPR/38.0.2220.41',
      potentialBot: true,
    }),
  ];
  const orphanVisits: ShlinkOrphanVisit[] = [
    fromPartial({
      type: 'base_url',
      visitedUrl: 'foo',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0',
      referer: 'https://google.com',
      potentialBot: false,
      visitLocation: {
        countryName: 'United States',
        cityName: 'New York',
        latitude: 1029,
        longitude: 6758,
      },
    }),
    fromPartial({
      type: 'regular_404',
      visitedUrl: 'bar',
      potentialBot: true,
    }),
    fromPartial({
      type: 'invalid_short_url',
      visitedUrl: 'bar',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
      referer: 'https://m.facebook.com',
      visitLocation: {
        countryName: 'Spain',
        cityName: 'Zaragoza',
        latitude: 123.45,
        longitude: -543.21,
      },
      potentialBot: false,
    }),
  ];

  describe('processStatsFromVisits', () => {
    let stats: VisitsStats;

    beforeAll(() => {
      stats = processStatsFromVisits(normalizeVisits(visits));
    });

    it('properly parses OS stats', () => {
      const { os } = stats;

      expect(os).toEqual({
        Linux: 3,
        Windows: 1,
        macOS: 1,
      });
    });

    it('properly parses browser stats', () => {
      const { browsers } = stats;

      expect(browsers).toEqual({
        Firefox: 2,
        Chrome: 2,
        Opera: 1,
      });
    });

    it('properly parses referrer stats', () => {
      const { referrers } = stats;

      expect(referrers).toEqual({
        Direct: 2,
        'google.com': 2,
        'm.facebook.com': 1,
      });
    });

    it('properly parses countries stats', () => {
      const { countries } = stats;

      expect(countries).toEqual({
        Spain: 3,
        'United States': 1,
        Unknown: 1,
      });
    });

    it('properly parses cities stats', () => {
      const { cities } = stats;

      expect(cities).toEqual({
        Zaragoza: 2,
        'New York': 1,
        Unknown: 2,
      });
    });

    it('properly parses cities stats with lat and long', () => {
      const { citiesForMap } = stats;
      const zaragozaLat = 123.45;
      const zaragozaLong = -543.21;
      const newYorkLat = 1029;
      const newYorkLong = 6758;

      expect(citiesForMap).toEqual({
        Zaragoza: {
          cityName: 'Zaragoza',
          count: 2,
          latLong: [zaragozaLat, zaragozaLong],
        },
        'New York': {
          cityName: 'New York',
          count: 1,
          latLong: [newYorkLat, newYorkLong],
        },
      });
    });

    it('properly parses visited URL stats', () => {
      const { visitedUrls } = processStatsFromVisits(normalizeVisits(orphanVisits));

      expect(visitedUrls).toEqual({
        foo: 1,
        bar: 2,
      });
    });
  });

  describe('normalizeVisits', () => {
    it('properly parses the list of visits', () => {
      expect(normalizeVisits(visits)).toEqual([
        {
          userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
          browser: 'Firefox',
          os: 'Windows',
          referer: 'google.com',
          country: 'Spain',
          city: 'Zaragoza',
          date: undefined,
          latitude: 123.45,
          longitude: -543.21,
          potentialBot: false,
        },
        {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0',
          browser: 'Firefox',
          os: 'macOS',
          referer: 'google.com',
          country: 'United States',
          city: 'New York',
          date: undefined,
          latitude: 1029,
          longitude: 6758,
          potentialBot: false,
        },
        {
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
          browser: 'Chrome',
          os: 'Linux',
          referer: 'Direct',
          country: 'Spain',
          city: 'Unknown',
          date: undefined,
          latitude: undefined,
          longitude: undefined,
          potentialBot: false,
          visitedUrl: 'foo',
        },
        {
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
          browser: 'Chrome',
          os: 'Linux',
          referer: 'm.facebook.com',
          country: 'Spain',
          city: 'Zaragoza',
          date: undefined,
          latitude: 123.45,
          longitude: -543.21,
          potentialBot: false,
          visitedUrl: 'foo',
        },
        {
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 OPR/38.0.2220.41',
          browser: 'Opera',
          os: 'Linux',
          referer: 'Direct',
          country: 'Unknown',
          city: 'Unknown',
          date: undefined,
          latitude: undefined,
          longitude: undefined,
          potentialBot: true,
        },
      ]);
    });

    it('properly parses the list of orphan visits', () => {
      expect(normalizeVisits(orphanVisits)).toEqual([
        {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0',
          browser: 'Firefox',
          os: 'macOS',
          referer: 'google.com',
          country: 'United States',
          city: 'New York',
          date: undefined,
          latitude: 1029,
          longitude: 6758,
          type: 'base_url',
          visitedUrl: 'foo',
          potentialBot: false,
        },
        {
          userAgent: undefined,
          type: 'regular_404',
          visitedUrl: 'bar',
          browser: 'Others',
          city: 'Unknown',
          country: 'Unknown',
          date: undefined,
          latitude: undefined,
          longitude: undefined,
          os: 'Others',
          referer: 'Direct',
          potentialBot: true,
        },
        {
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
          browser: 'Chrome',
          os: 'Linux',
          referer: 'm.facebook.com',
          country: 'Spain',
          city: 'Zaragoza',
          date: undefined,
          latitude: 123.45,
          longitude: -543.21,
          type: 'invalid_short_url',
          visitedUrl: 'bar',
          potentialBot: false,
        },
      ]);
    });
  });
});
