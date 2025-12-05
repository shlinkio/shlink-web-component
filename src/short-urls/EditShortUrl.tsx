import { Message, Result, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { ExternalLink } from 'react-external-link';
import { ShlinkApiError } from '../common/ShlinkApiError';
import { GoBackButton } from '../utils/components/GoBackButton';
import { shortUrlDataFromShortUrl } from './helpers';
import { useShortUrlIdentifier } from './helpers/hooks';
import { useUrlEdition } from './reducers/shortUrlEdition';
import { useUrlsDetails } from './reducers/shortUrlsDetails';
import { ShortUrlForm } from './ShortUrlForm';

export const EditShortUrl: FC = () => {
  const identifier = useShortUrlIdentifier();
  const { shortUrlsDetails, getShortUrlsDetails } = useUrlsDetails();
  const { status } = shortUrlsDetails;
  const shortUrl = identifier && status === 'loaded' ? shortUrlsDetails.shortUrls.get(identifier) : undefined;

  const { shortUrlEdition, editShortUrl } = useUrlEdition();
  const { saving, saved, error: savingError, errorData: savingErrorData } = shortUrlEdition;
  const initialState = useMemo(() => shortUrlDataFromShortUrl(shortUrl), [shortUrl]);

  useEffect(() => {
    if (identifier) {
      getShortUrlsDetails([identifier]);
    }
  }, [getShortUrlsDetails, identifier]);

  if (status === 'loading') {
    return <Message loading />;
  }

  if (status === 'error') {
    return (
      <Result variant="error">
        <ShlinkApiError errorData={shortUrlsDetails.error} fallbackMessage="An error occurred while loading short URL detail :(" />
      </Result>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      <header>
        <SimpleCard>
          <h4 className="sm:flex items-center text-4xl">
            <GoBackButton />
            <div className="text-center grow">
              <small>Edit <ExternalLink href={shortUrl?.shortUrl ?? ''} /></small>
            </div>
          </h4>
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
