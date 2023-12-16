import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkShortUrl } from '../../../src/api-contract';
import {
  queryToShortUrl,
  shortUrlDataFromShortUrl,
  shortUrlToQuery,
  urlDecodeShortCode,
  urlEncodeShortCode,
} from '../../../src/short-urls/helpers';
import { DEFAULT_DOMAIN } from '../../../src/visits/reducers/domainVisits';

describe('helpers', () => {
  describe('shortUrlDataFromShortUrl', () => {
    it.each([
      [undefined, { validateUrls: true }, { longUrl: '', validateUrl: true }],
      [undefined, undefined, { longUrl: '', validateUrl: false }],
      [
        fromPartial<ShlinkShortUrl>({ meta: {} }),
        { validateUrls: false },
        {
          longUrl: undefined,
          tags: undefined,
          title: undefined,
          domain: undefined,
          validSince: undefined,
          validUntil: undefined,
          maxVisits: undefined,
          validateUrl: false,
        },
      ],
    ])('returns expected data', (shortUrl, settings, expectedInitialState) => {
      expect(shortUrlDataFromShortUrl(shortUrl, settings)).toEqual(expectedInitialState);
    });
  });

  describe('urlEncodeShortCode', () => {
    it.each([
      ['foo', 'foo'],
      ['foo/bar', 'foo__bar'],
      ['foo/bar/baz', 'foo__bar__baz'],
    ])('parses shortCode as expected', (shortCode, result) => {
      expect(urlEncodeShortCode(shortCode)).toEqual(result);
    });
  });

  describe('urlDecodeShortCode', () => {
    it.each([
      ['foo', 'foo'],
      ['foo__bar', 'foo/bar'],
      ['foo__bar__baz', 'foo/bar/baz'],
    ])('parses shortCode as expected', (shortCode, result) => {
      expect(urlDecodeShortCode(shortCode)).toEqual(result);
    });
  });

  describe('shortUrlToQuery', () => {
    it.each([
      [{ domain: null, shortCode: 'foo' }, `${DEFAULT_DOMAIN}__foo`],
      [{ domain: 's.test', shortCode: 'bar' }, 's.test__bar'],
    ])('generates expected pattern', (shortUrl, expectedResult) => {
      expect(shortUrlToQuery(shortUrl)).toEqual(expectedResult);
    });
  });

  describe('queryToShortUrl', () => {
    it.each([
      [`${DEFAULT_DOMAIN}__foo`, { domain: null, shortCode: 'foo' }],
      ['s.test__bar', { domain: 's.test', shortCode: 'bar' }],
      ['s.test__baz__ignored', { domain: 's.test', shortCode: 'baz' }],
    ])('generates expected pattern', (query, expectedShortUrl) => {
      expect(queryToShortUrl(query)).toEqual(expectedShortUrl);
    });

    it('throws error when provided value is un-parseable', () => {
      expect(() => queryToShortUrl('foo')).toThrowError(
        'It was not possible to parse domain and short code from "foo"',
      );
    });
  });
});
