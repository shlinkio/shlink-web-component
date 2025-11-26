import { useParsedQuery } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useMemo } from 'react';
import type { ShlinkCreateShortUrlData } from '../api-contract';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { useSetting } from '../settings';
import { CreateShortUrlResult } from './helpers/CreateShortUrlResult';
import { useUrlCreation } from './reducers/shortUrlCreation';
import type { ShortUrlFormProps } from './ShortUrlForm';

export type CreateShortUrlProps = {
  basicMode?: boolean;
};

type CreateShortUrlDeps = {
  ShortUrlForm: FC<ShortUrlFormProps<ShlinkCreateShortUrlData>>;
};

const CreateShortUrl: FCWithDeps<CreateShortUrlProps, CreateShortUrlDeps> = ({
  basicMode = false,
}) => {
  const { createShortUrl, shortUrlCreation, resetCreateShortUrl } = useUrlCreation();
  const { ShortUrlForm } = useDependencies(CreateShortUrl);
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
          return createShortUrl(data);
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

export const CreateShortUrlFactory = componentFactory(CreateShortUrl, ['ShortUrlForm']);
