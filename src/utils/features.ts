import { createContext, useContext, useMemo } from 'react';
import type { SemVerOrLatest, Versions } from './helpers/version';
import { versionMatch } from './helpers/version';

const supportedFeatures = {
  excludeBotsOnShortUrls: { minVersion: '3.4.0' },
  filterDisabledUrls: { minVersion: '3.4.0' },
  deviceLongUrls: { minVersion: '3.5.0', maxVersion: '3.*.*' },
  shortUrlVisitsDeletion: { minVersion: '3.6.0' },
  orphanVisitsDeletion: { minVersion: '3.7.0' },
  shortUrlRedirectRules: { minVersion: '4.0.0' },
} as const satisfies Record<string, Versions>;

Object.freeze(supportedFeatures);

export type Feature = keyof typeof supportedFeatures;

const isFeatureEnabledForVersion = (feature: Feature, serverVersion: SemVerOrLatest): boolean =>
  serverVersion === 'latest' || versionMatch(serverVersion, supportedFeatures[feature]);

const getFeaturesForVersion = (serverVersion: SemVerOrLatest): Record<Feature, boolean> => ({
  excludeBotsOnShortUrls: isFeatureEnabledForVersion('excludeBotsOnShortUrls', serverVersion),
  filterDisabledUrls: isFeatureEnabledForVersion('filterDisabledUrls', serverVersion),
  deviceLongUrls: isFeatureEnabledForVersion('deviceLongUrls', serverVersion),
  shortUrlVisitsDeletion: isFeatureEnabledForVersion('shortUrlVisitsDeletion', serverVersion),
  orphanVisitsDeletion: isFeatureEnabledForVersion('orphanVisitsDeletion', serverVersion),
  shortUrlRedirectRules: isFeatureEnabledForVersion('shortUrlRedirectRules', serverVersion),
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
