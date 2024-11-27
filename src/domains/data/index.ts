import type { ShlinkDomain } from '../../api-contract';

export type DomainStatus = 'validating' | 'valid' | 'invalid';

export interface Domain extends ShlinkDomain {
  status: DomainStatus;
}

export const DEFAULT_DOMAIN = 'DEFAULT';
