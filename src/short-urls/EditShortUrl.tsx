import { Message, Result, useParsedQuery } from '@shlinkio/shlink-frontend-kit';
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
import { useDecodedShortCodeFromParams } from './helpers/hooks';
import type { ShortUrlDetail } from './reducers/shortUrlDetail';
import type { EditShortUrl as EditShortUrlInfo, ShortUrlEdition } from './reducers/shortUrlEdition';
import type { ShortUrlFormProps } from './ShortUrlForm';

type EditShortUrlProps = {
  shortUrlDetail: ShortUrlDetail;
  shortUrlEdition: ShortUrlEdition;
  getShortUrlDetail: (shortUrl: ShortUrlIdentifier) => void;
  editShortUrl: (editShortUrl: EditShortUrlInfo) => void;
};

type EditShortUrlDeps = {
  ShortUrlForm: FC<ShortUrlFormProps<ShlinkEditShortUrlData>>;
};

const EditShortUrl: FCWithDeps<EditShortUrlProps, EditShortUrlDeps> = (
  { shortUrlDetail, getShortUrlDetail, shortUrlEdition, editShortUrl },
) => {
  const { ShortUrlForm } = useDependencies(EditShortUrl);
  const { domain } = useParsedQuery<{ domain?: string }>();
  const shortCode = useDecodedShortCodeFromParams();
  const { loading, error, errorData, shortUrl } = shortUrlDetail;
  const { saving, saved, error: savingError, errorData: savingErrorData } = shortUrlEdition;
  const shortUrlCreationSettings = useSetting('shortUrlCreation');
  const initialState = useMemo(
    () => shortUrlDataFromShortUrl(shortUrl, shortUrlCreationSettings),
    [shortUrl, shortUrlCreationSettings],
  );

  useEffect(() => {
    shortCode && getShortUrlDetail({ shortCode, domain });
  }, [domain, getShortUrlDetail, shortCode]);

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
            <span className="text-center">
              <small>Edit <ExternalLink href={shortUrl?.shortUrl ?? ''} /></small>
            </span>
            <span />
          </h2>
        </Card>
      </header>
      <ShortUrlForm
        initialState={initialState}
        saving={saving}
        mode="edit"
        onSave={async (shortUrlData) => {
          if (!shortUrl) {
            return;
          }

          editShortUrl({ ...shortUrl, data: shortUrlData });
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
