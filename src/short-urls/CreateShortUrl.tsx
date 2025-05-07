import type { FC } from 'react';
import { useMemo } from 'react';
import type { ShlinkCreateShortUrlData } from '../api-contract';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { ShortUrlCreationSettings } from '../settings';
import { useSetting } from '../settings';
import { CreateShortUrlResult } from './helpers/CreateShortUrlResult';
import type { ShortUrlCreation } from './reducers/shortUrlCreation';
import type { ShortUrlFormProps } from './ShortUrlForm';

export interface CreateShortUrlProps {
  basicMode?: boolean;
}

interface CreateShortUrlConnectProps extends CreateShortUrlProps {
  shortUrlCreation: ShortUrlCreation;
  createShortUrl: (data: ShlinkCreateShortUrlData) => Promise<void>;
  resetCreateShortUrl: () => void;
}

type CreateShortUrlDeps = {
  ShortUrlForm: FC<ShortUrlFormProps<ShlinkCreateShortUrlData>>;
};

const getInitialState = (settings?: ShortUrlCreationSettings): ShlinkCreateShortUrlData => ({
  longUrl: '',
  tags: [],
  customSlug: '',
  title: undefined,
  shortCodeLength: undefined,
  domain: '',
  validSince: undefined,
  validUntil: undefined,
  maxVisits: undefined,
  findIfExists: false,
  validateUrl: settings?.validateUrls ?? false,
  forwardQuery: settings?.forwardQuery ?? true,
});

const CreateShortUrl: FCWithDeps<CreateShortUrlConnectProps, CreateShortUrlDeps> = ({
  createShortUrl,
  shortUrlCreation,
  resetCreateShortUrl,
  basicMode = false,
}: CreateShortUrlConnectProps) => {
  const { ShortUrlForm } = useDependencies(CreateShortUrl);
  const shortUrlCreationSettings = useSetting('shortUrlCreation');
  const initialState = useMemo(() => getInitialState(shortUrlCreationSettings), [shortUrlCreationSettings]);

  return (
    <>
      <ShortUrlForm
        initialState={initialState}
        saving={shortUrlCreation.saving}
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
