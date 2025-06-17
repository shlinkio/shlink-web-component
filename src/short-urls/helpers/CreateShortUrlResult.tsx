import { CloseButton, CopyToClipboardButton, Result } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useEffect } from 'react';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import type { ShortUrlCreation } from '../reducers/shortUrlCreation';

export type CreateShortUrlResultProps = {
  creation: ShortUrlCreation;
  resetCreateShortUrl: () => void;
  canBeClosed?: boolean;
};

export const CreateShortUrlResult: FC<CreateShortUrlResultProps> = (
  { creation, resetCreateShortUrl, canBeClosed = false }: CreateShortUrlResultProps,
) => {
  const { error, saved } = creation;

  useEffect(() => {
    resetCreateShortUrl();
  }, [resetCreateShortUrl]);

  if (error) {
    return (
      <Result variant="error" className="mt-4 relative">
        {canBeClosed && (
          <div className="absolute right-1.5 top-1.5" data-testid="error-close-button">
            <CloseButton onClick={resetCreateShortUrl} />
          </div>
        )}
        <ShlinkApiError errorData={creation.errorData} fallbackMessage="An error occurred while creating the URL :(" />
      </Result>
    );
  }

  if (!saved) {
    return null;
  }

  const { shortUrl } = creation.result;

  return (
    <Result variant="success" className="mt-4 relative">
      {canBeClosed && (
        <div className="absolute right-1.5 top-1.5" data-testid="success-close-button">
          <CloseButton onClick={resetCreateShortUrl} />
        </div>
      )}
      <div className="flex items-center justify-center gap-1">
        <span><b>Great!</b> The short URL is <b>{shortUrl}</b></span>
        <CopyToClipboardButton text={shortUrl} />
      </div>
    </Result>
  );
};
