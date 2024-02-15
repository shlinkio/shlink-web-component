import { faClone as copyIcon } from '@fortawesome/free-regular-svg-icons';
import { faTimes as closeIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { TimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import { Result } from '@shlinkio/shlink-frontend-kit';
import { useEffect } from 'react';
import { Tooltip } from 'reactstrap';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { copyToClipboard } from '../../utils/helpers/clipboard';
import type { ShortUrlCreation } from '../reducers/shortUrlCreation';
import './CreateShortUrlResult.scss';

export type CreateShortUrlResultProps = {
  creation: ShortUrlCreation;
  resetCreateShortUrl: () => void;
  canBeClosed?: boolean;
};

type CreateShortUrlResultDeps = {
  useTimeoutToggle: TimeoutToggle;
};

const CreateShortUrlResult: FCWithDeps<CreateShortUrlResultProps, CreateShortUrlResultDeps> = (
  { creation, resetCreateShortUrl, canBeClosed = false }: CreateShortUrlResultProps,
) => {
  const { useTimeoutToggle } = useDependencies(CreateShortUrlResult);
  const [showCopyTooltip, toggleShowCopyTooltip] = useTimeoutToggle();
  const { error, saved } = creation;

  useEffect(() => {
    resetCreateShortUrl();
  }, [resetCreateShortUrl]);

  if (error) {
    return (
      <Result type="error" className="mt-3">
        {canBeClosed && (
          <FontAwesomeIcon
            data-testid="error-close-button"
            icon={closeIcon}
            className="float-end pointer"
            onClick={resetCreateShortUrl}
          />
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
    <Result type="success" className="mt-3">
      {canBeClosed && (
        <FontAwesomeIcon
          data-testid="success-close-button"
          icon={closeIcon}
          className="float-end pointer"
          onClick={resetCreateShortUrl}
        />
      )}
      <span><b>Great!</b> The short URL is <b>{shortUrl}</b></span>

      <button
        className="btn btn-light btn-sm create-short-url-result__copy-btn"
        id="copyBtn"
        type="button"
        onClick={() => copyToClipboard({ text: shortUrl, onCopy: toggleShowCopyTooltip })}
      >
        <FontAwesomeIcon icon={copyIcon} /> Copy <span className="sr-only">{shortUrl} to clipboard</span>
      </button>
      <Tooltip placement="left" isOpen={showCopyTooltip} target="copyBtn">
        Copied!
      </Tooltip>
    </Result>
  );
};

export const CreateShortUrlResultFactory = componentFactory(CreateShortUrlResult, ['useTimeoutToggle']);
