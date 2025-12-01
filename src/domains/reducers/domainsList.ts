import { createAction, createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type { ProblemDetailsError, ShlinkDomainRedirects } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { createShortUrlThunk } from '../../short-urls/reducers/shortUrlCreation';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk,useApiClientFactory  } from '../../store/helpers';
import type { Domain, DomainStatus } from '../data';
import type { EditDomainRedirects } from './domainRedirects';
import { editDomainRedirects } from './domainRedirects';

const REDUCER_PREFIX = 'shlink/domainsList';

type DomainsListCommon = {
  domains: Domain[];
  filteredDomains: Domain[];
  defaultRedirects?: ShlinkDomainRedirects;
};

export type DomainsList = DomainsListCommon & ({
  status: 'idle' | 'loading';
} | {
  status: 'error';
  error?: ProblemDetailsError;
});

interface ListDomains {
  domains: Domain[];
  defaultRedirects?: ShlinkDomainRedirects;
}

interface ValidateDomain {
  domain: string;
  status: DomainStatus;
}

const initialState: DomainsList = {
  status: 'idle',
  domains: [],
  filteredDomains: [],
};

export const replaceRedirectsOnDomain = ({ domain, redirects }: EditDomainRedirects) =>
  (d: Domain): Domain => (d.domain !== domain ? d : { ...d, redirects });

export const replaceStatusOnDomain = (domain: string, status: DomainStatus) =>
  (d: Domain): Domain => (d.domain !== domain ? d : { ...d, status });

export const listDomainsThunk = createAsyncThunk(
  `${REDUCER_PREFIX}/listDomains`,
  async ({ apiClientFactory }: WithApiClient): Promise<ListDomains> => {
    const { data, defaultRedirects } = await apiClientFactory().listDomains();

    return {
      domains: data.map((domain): Domain => ({ ...domain, status: 'validating' })),
      defaultRedirects,
    };
  },
);

export const checkDomainHealthThunk = createAsyncThunk(
  `${REDUCER_PREFIX}/checkDomainHealth`,
  async ({ domain, apiClientFactory }: WithApiClient<{ domain: string }>): Promise<ValidateDomain> => {
    try {
      const { status } = await apiClientFactory().health({ domain });
      return { domain, status: status === 'pass' ? 'valid' : 'invalid' };
    } catch {
      return { domain, status: 'invalid' };
    }
  },
);

export const filterDomains = createAction<string>(`${REDUCER_PREFIX}/filterDomains`);

export const { reducer: domainsListReducer } = createSlice({
  name: REDUCER_PREFIX,
  initialState: initialState as DomainsList,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(listDomainsThunk.pending, () => ({ ...initialState, status: 'loading' }));
    builder.addCase(listDomainsThunk.rejected, (_, { error }) => (
      { ...initialState, status: 'error', error: parseApiError(error) }
    ));
    builder.addCase(listDomainsThunk.fulfilled, (_, { payload }) => (
      { ...initialState, ...payload, filteredDomains: payload.domains }
    ));

    builder.addCase(checkDomainHealthThunk.fulfilled, ({ domains, filteredDomains, ...rest }, { payload }) => ({
      ...rest,
      domains: domains.map(replaceStatusOnDomain(payload.domain, payload.status)),
      filteredDomains: filteredDomains.map(replaceStatusOnDomain(payload.domain, payload.status)),
    }));

    builder.addCase(filterDomains, (state, { payload }) => ({
      ...state,
      filteredDomains: state.domains.filter(({ domain }) => domain.toLowerCase().match(payload.toLowerCase())),
    }));

    // Update corresponding domain when its redirects are edited
    builder.addCase(editDomainRedirects.fulfilled, (state, { payload }) => ({
      ...state,
      domains: state.domains.map(replaceRedirectsOnDomain(payload)),
      filteredDomains: state.filteredDomains.map(replaceRedirectsOnDomain(payload)),
    }));

    // When a short URL is created with a new domain, add it to the list
    builder.addCase(createShortUrlThunk.fulfilled, (state, { payload }) => {
      // Domain already exists
      if (payload.domain === null || state.domains.some((d) => d.domain === payload.domain)) {
        return;
      }

      state.domains.push({
        domain: payload.domain,
        status: 'validating',
        isDefault: false,
        redirects: {
          baseUrlRedirect: null,
          regular404Redirect: null,
          invalidShortUrlRedirect: null,
        },
      });
    });
  },
});

export const useDomainsList = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const listDomains = useCallback(() => dispatch(listDomainsThunk({ apiClientFactory })), [apiClientFactory, dispatch]);
  const checkDomainHealth = useCallback(
    (domain: string) => dispatch(checkDomainHealthThunk({ domain, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const dispatchFilterDomains = useCallback((searchTerm: string) => dispatch(filterDomains(searchTerm)), [dispatch]);
  const domainsList = useAppSelector((state) => state.domainsList);

  return { domainsList, listDomains, checkDomainHealth, filterDomains: dispatchFilterDomains };
};
