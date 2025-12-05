import { useParsedQuery } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useMemo } from 'react';
import type { ShlinkCreateShortUrlData } from '../api-contract';
import { useSetting } from '../settings';
import { CreateShortUrlResult } from './helpers/CreateShortUrlResult';
import { useUrlCreation } from './reducers/shortUrlCreation';
import { ShortUrlForm } from './ShortUrlForm';

export type CreateShortUrlProps = {
  basicMode?: boolean;
};

export const CreateShortUrl: FC<CreateShortUrlProps> = ({ basicMode = false }) => {
  const { createShortUrl, shortUrlCreation, resetCreateShortUrl } = useUrlCreation();
  const shortUrlCreationSettings = useSetting('shortUrlCreation');
  const { 'long-url': longUrlFromQuery = '' } = useParsedQuery<{ 'long-url'?: string }>();
  const initialState = useMemo(
    (): ShlinkCreateShortUrlData => ({
      longUrl: longUrlFromQuery,
      tags: [],
      customSlug: '',
      title: undefined,
      shortCodeLength: undefined,
      domain: '',
      validSince: undefined,
      validUntil: undefined,
      maxVisits: undefined,
      findIfExists: false,
      forwardQuery: shortUrlCreationSettings?.forwardQuery ?? true,
    }),
    [longUrlFromQuery, shortUrlCreationSettings?.forwardQuery],
  );

  return (
    <>
      <ShortUrlForm
        initialState={initialState}
        saving={shortUrlCreation.status === 'saving'}
        basicMode={basicMode}
        onSave={async (data) => {
          resetCreateShortUrl();
          return createShortUrl(data as ShlinkCreateShortUrlData);
        }}
      />
      <CreateShortUrlResult
        creation={shortUrlCreation}
        resetCreateShortUrl={resetCreateShortUrl}
        canBeClosed={basicMode}
      />
    </>
  );
};
