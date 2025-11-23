import { Message, Result, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkShortUrlIdentifier } from '@shlinkio/shlink-js-sdk/api-contract';
import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { ExternalLink } from 'react-external-link';
import type { ShlinkEditShortUrlData } from '../api-contract';
import { ShlinkApiError } from '../common/ShlinkApiError';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { GoBackButton } from '../utils/components/GoBackButton';
import { shortUrlDataFromShortUrl } from './helpers';
import { useShortUrlIdentifier } from './helpers/hooks';
import { useUrlEdition } from './reducers/shortUrlEdition';
import type { ShortUrlsDetails } from './reducers/shortUrlsDetails';
import type { ShortUrlFormProps } from './ShortUrlForm';

type EditShortUrlProps = {
  shortUrlsDetails: ShortUrlsDetails;
  getShortUrlsDetails: (identifiers: ShlinkShortUrlIdentifier[]) => void;
};

type EditShortUrlDeps = {
  ShortUrlForm: FC<ShortUrlFormProps<ShlinkEditShortUrlData>>;
};

const EditShortUrl: FCWithDeps<EditShortUrlProps, EditShortUrlDeps> = ({ shortUrlsDetails, getShortUrlsDetails }) => {
  const { ShortUrlForm } = useDependencies(EditShortUrl);
  const identifier = useShortUrlIdentifier();
  const { loading, error, errorData, shortUrls } = shortUrlsDetails;
  const shortUrl = identifier && shortUrls?.get(identifier);

  const { shortUrlEdition, editShortUrl } = useUrlEdition();
  const { saving, saved, error: savingError, errorData: savingErrorData } = shortUrlEdition;
  const initialState = useMemo(() => shortUrlDataFromShortUrl(shortUrl), [shortUrl]);

  useEffect(() => {
    if (identifier) {
      getShortUrlsDetails([identifier]);
    }
  }, [getShortUrlsDetails, identifier]);

  if (loading) {
    return <Message loading />;
  }

  if (error) {
    return (
      <Result variant="error">
        <ShlinkApiError errorData={errorData} fallbackMessage="An error occurred while loading short URL detail :(" />
      </Result>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      <header>
        <SimpleCard>
          <h2 className="sm:flex items-center">
            <GoBackButton />
            <div className="text-center grow">
              <small>Edit <ExternalLink href={shortUrl?.shortUrl ?? ''} /></small>
            </div>
          </h2>
        </SimpleCard>
      </header>
      <ShortUrlForm
        initialState={initialState}
        saving={saving}
        onSave={async (shortUrlData) => {
          if (shortUrl) {
            editShortUrl({ ...shortUrl, data: shortUrlData });
          }
        }}
      />
      {saved && savingError && (
        <Result variant="error">
          <ShlinkApiError errorData={savingErrorData} fallbackMessage="An error occurred while updating short URL :(" />
        </Result>
      )}
      {saved && !savingError && <Result variant="success">Short URL properly edited.</Result>}
    </div>
  );
};

export const EditShortUrlFactory = componentFactory(EditShortUrl, ['ShortUrlForm']);
