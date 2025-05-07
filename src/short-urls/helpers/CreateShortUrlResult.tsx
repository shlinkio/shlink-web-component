import { CloseButton, Result } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { useEffect } from 'react';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import { CopyToClipboardButton } from '../../utils/components/CopyToClipboardButton';
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
      <Result variant="error" className="tw:mt-4 tw:relative">
        {canBeClosed && (
          <div className="tw:absolute tw:right-1.5 tw:top-1.5" data-testid="error-close-button">
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
    <Result variant="success" className="tw:mt-4 tw:relative">
      {canBeClosed && (
        <div className="tw:absolute tw:right-1.5 tw:top-1.5" data-testid="success-close-button">
          <CloseButton onClick={resetCreateShortUrl} />
        </div>
      )}
      <div className="tw:flex tw:items-center tw:justify-center tw:gap-1">
        <span><b>Great!</b> The short URL is <b>{shortUrl}</b></span>
        <CopyToClipboardButton text={shortUrl} />
      </div>
    </Result>
  );
};
