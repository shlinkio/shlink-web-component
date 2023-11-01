import { zipObj } from '@shlinkio/data-manipulation';
import bowser from 'bowser';
import type { Empty } from '../../utils/helpers';
import { hasValue } from '../../utils/helpers';
import type { Stats, UserAgent } from '../types';

const DEFAULT = 'Others';
const BROWSERS_ALLOWLIST = [
  'Android Browser',
  'Chrome',
  'Chromium',
  'Firefox',
  'Internet Explorer',
  'Microsoft Edge',
  'Opera',
  'Safari',
  'Samsung Internet for Android',
  'Vivaldi',
  'WeChat',
];

export const parseUserAgent = (userAgent: string | Empty): UserAgent => {
  if (!hasValue(userAgent)) {
    return { browser: DEFAULT, os: DEFAULT };
  }

  const { browser: { name: browser }, os: { name: os } } = bowser.parse(userAgent);

  return { os: os ?? DEFAULT, browser: browser && BROWSERS_ALLOWLIST.includes(browser) ? browser : DEFAULT };
};

export const extractDomain = (url: string | Empty): string => {
  if (!hasValue(url)) {
    return 'Direct';
  }

  return url.split('/')[url.includes('://') ? 2 : 0]?.split(':')[0] ?? '';
};

export const fillTheGaps = (stats: Stats, labels: string[]): number[] =>
  Object.values({ ...zipObj(labels, labels.map(() => 0)), ...stats });
