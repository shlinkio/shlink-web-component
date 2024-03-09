import { compare } from 'compare-versions';

type SemVerPatternFragment = `${bigint | '*'}`;

type SemVerPattern = SemVerPatternFragment
| `${SemVerPatternFragment}.${SemVerPatternFragment}`
| `${SemVerPatternFragment}.${SemVerPatternFragment}.${SemVerPatternFragment}`;

export type Versions = {
  maxVersion?: SemVerPattern;
  minVersion?: SemVerPattern;
};

export type SemVer = `${bigint}.${bigint}.${bigint}`;

export type SemVerOrLatest = SemVer | 'latest';

export const versionMatch = (versionToMatch: SemVer, { maxVersion, minVersion }: Versions): boolean => {
  const matchesMinVersion = !minVersion || compare(versionToMatch, minVersion, '>=');
  const matchesMaxVersion = !maxVersion || compare(versionToMatch, maxVersion, '<=');

  return matchesMaxVersion && matchesMinVersion;
};
