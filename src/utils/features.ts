import { createContext, useContext, useMemo } from 'react';
import type { SemVerOrLatest, Versions } from './helpers/version';
import { versionMatch } from './helpers/version';

const supportedFeatures = {
  shortUrlVisitsDeletion: { minVersion: '3.6.0' },
  orphanVisitsDeletion: { minVersion: '3.7.0' },
  deviceLongUrls: { maxVersion: '3.*.*' },
  urlValidation: { maxVersion: '3.*.*' },
  shortUrlRedirectRules: { minVersion: '4.0.0' },
  ipRedirectCondition: { minVersion: '4.2.0' },
  geolocationRedirectCondition: { minVersion: '4.3.0' },
  filterShortUrlsByDomain: { minVersion: '4.3.0' },
  advancedQueryRedirectConditions: { minVersion: '4.5.0' },
  desktopDeviceTypes: { minVersion: '4.5.0' },
} as const satisfies Record<string, Versions>;

Object.freeze(supportedFeatures);

export type Feature = keyof typeof supportedFeatures;

const isFeatureEnabledForVersion = (feature: Feature, serverVersion: SemVerOrLatest): boolean =>
  // When serverVersion is `latest`, fall back to a very big version number.
  // That will disable features with a maxVersion, and keep enabled those with only a minVersion
  versionMatch(serverVersion === 'latest' ? '999.99.99' : serverVersion, supportedFeatures[feature]);

const getFeaturesForVersion = (serverVersion: SemVerOrLatest): Record<Feature, boolean> => ({
  deviceLongUrls: isFeatureEnabledForVersion('deviceLongUrls', serverVersion),
  shortUrlVisitsDeletion: isFeatureEnabledForVersion('shortUrlVisitsDeletion', serverVersion),
  orphanVisitsDeletion: isFeatureEnabledForVersion('orphanVisitsDeletion', serverVersion),
  shortUrlRedirectRules: isFeatureEnabledForVersion('shortUrlRedirectRules', serverVersion),
  urlValidation: isFeatureEnabledForVersion('urlValidation', serverVersion),
  ipRedirectCondition: isFeatureEnabledForVersion('ipRedirectCondition', serverVersion),
  geolocationRedirectCondition: isFeatureEnabledForVersion('geolocationRedirectCondition', serverVersion),
  filterShortUrlsByDomain: isFeatureEnabledForVersion('filterShortUrlsByDomain', serverVersion),
  advancedQueryRedirectConditions: isFeatureEnabledForVersion('advancedQueryRedirectConditions', serverVersion),
  desktopDeviceTypes: isFeatureEnabledForVersion('advancedQueryRedirectConditions', serverVersion),
});

const FeaturesContext = createContext(getFeaturesForVersion('0.0.0'));

export const FeaturesProvider = FeaturesContext.Provider;

export const useFeatures = (serverVersion: SemVerOrLatest) => useMemo(
  () => getFeaturesForVersion(serverVersion),
  [serverVersion],
);

export const useFeature = (feature: Feature) => {
  const features = useContext(FeaturesContext);
  return features[feature];
};
