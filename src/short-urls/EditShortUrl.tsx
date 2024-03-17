import { Message, Result } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import { ExternalLink } from 'react-external-link';
import { Card } from 'reactstrap';
import type { ShlinkEditShortUrlData } from '../api-contract';
import { ShlinkApiError } from '../common/ShlinkApiError';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { GoBackButton } from '../utils/components/GoBackButton';
import { useSetting } from '../utils/settings';
import type { ShortUrlIdentifier } from './data';
import { shortUrlDataFromShortUrl } from './helpers';
import { useShortUrlIdentifier } from './helpers/hooks';
import type { EditShortUrl as EditShortUrlInfo, ShortUrlEdition } from './reducers/shortUrlEdition';
import type { ShortUrlsDetails } from './reducers/shortUrlsDetails';
import type { ShortUrlFormProps } from './ShortUrlForm';

type EditShortUrlProps = {
  shortUrlsDetails: ShortUrlsDetails;
  shortUrlEdition: ShortUrlEdition;
  getShortUrlsDetails: (identifiers: ShortUrlIdentifier[]) => void;
  editShortUrl: (editShortUrl: EditShortUrlInfo) => void;
};

type EditShortUrlDeps = {
  ShortUrlForm: FC<ShortUrlFormProps<ShlinkEditShortUrlData>>;
};

const EditShortUrl: FCWithDeps<EditShortUrlProps, EditShortUrlDeps> = (
  { shortUrlsDetails, getShortUrlsDetails, shortUrlEdition, editShortUrl },
) => {
  const { ShortUrlForm } = useDependencies(EditShortUrl);
  const identifier = useShortUrlIdentifier();
  const { loading, error, errorData, shortUrls } = shortUrlsDetails;
  const shortUrl = identifier && shortUrls?.get(identifier);

  const { saving, saved, error: savingError, errorData: savingErrorData } = shortUrlEdition;
  const shortUrlCreationSettings = useSetting('shortUrlCreation');
  const initialState = useMemo(
    () => shortUrlDataFromShortUrl(shortUrl, shortUrlCreationSettings),
    [shortUrl, shortUrlCreationSettings],
  );

  useEffect(() => {
    identifier && getShortUrlsDetails([identifier]);
  }, [getShortUrlsDetails, identifier]);

  if (loading) {
    return <Message loading />;
  }

  if (error) {
    return (
      <Result type="error">
        <ShlinkApiError errorData={errorData} fallbackMessage="An error occurred while loading short URL detail :(" />
      </Result>
    );
  }

  return (
    <>
      <header className="mb-3">
        <Card body>
          <h2 className="d-sm-flex justify-content-between align-items-center mb-0">
            <GoBackButton />
            <div className="text-center flex-grow-1">
              <small>Edit <ExternalLink href={shortUrl?.shortUrl ?? ''} /></small>
            </div>
          </h2>
        </Card>
      </header>
      <ShortUrlForm
        initialState={initialState}
        saving={saving}
        onSave={async (shortUrlData) => {
          shortUrl && editShortUrl({ ...shortUrl, data: shortUrlData });
        }}
      />
      {saved && savingError && (
        <Result type="error" className="mt-3">
          <ShlinkApiError errorData={savingErrorData} fallbackMessage="An error occurred while updating short URL :(" />
        </Result>
      )}
      {saved && !savingError && <Result type="success" className="mt-3">Short URL properly edited.</Result>}
    </>
  );
};

export const EditShortUrlFactory = componentFactory(EditShortUrl, ['ShortUrlForm']);
