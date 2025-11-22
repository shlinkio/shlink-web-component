import { useCallback } from 'react';
import type { ShlinkApiClient, ShlinkDomainRedirects } from '../../api-contract';
import { useDependencies } from '../../container/context';
import { useAppDispatch } from '../../store';
import { createAsyncThunk } from '../../store/helpers';

const EDIT_DOMAIN_REDIRECTS = 'shlink/domainRedirects/EDIT_DOMAIN_REDIRECTS';

export type EditDomainRedirects = {
  domain: string;
  redirects: ShlinkDomainRedirects;
};

export type EditDomainRedirectsOptions = EditDomainRedirects & {
  apiClientFactory: () => ShlinkApiClient;
};

export const editDomainRedirects = createAsyncThunk(
  EDIT_DOMAIN_REDIRECTS,
  async (
    { domain, redirects: providedRedirects, apiClientFactory }: EditDomainRedirectsOptions,
  ): Promise<EditDomainRedirects> => {
    const apiClient = apiClientFactory();
    const redirects = await apiClient.editDomainRedirects({ domain, ...providedRedirects });
    return { domain, redirects };
  },
);

export const useDomainRedirects = () => {
  const dispatch = useAppDispatch();
  const [apiClientFactory] = useDependencies<[() => ShlinkApiClient]>('apiClientFactory');
  const dispatchEditDomainRedirects = useCallback((edit: EditDomainRedirects) => dispatch(editDomainRedirects({
    ...edit,
    apiClientFactory,
  })), [apiClientFactory, dispatch]);

  return { editDomainRedirects: dispatchEditDomainRedirects };
};
