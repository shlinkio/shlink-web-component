import { CardModal, LabelledInput, Result } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { ShlinkShortUrlIdentifier } from '@shlinkio/shlink-js-sdk/api-contract';
import { useCallback, useEffect, useState } from 'react';
import { isErrorAction, isInvalidDeletionError } from '../../api-contract/utils';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import type { ShortUrlModalProps } from '../data';
import type { ShortUrlDeletion } from '../reducers/shortUrlDeletion';

export type DeleteShortUrlModalProps = ShortUrlModalProps & {
  deleteShortUrl: (shortUrl: ShlinkShortUrlIdentifier) => Promise<void>;
  shortUrlDeleted: (shortUrl: ShlinkShortUrlIdentifier) => void;
};

type DeleteShortUrlModalConnectProps = DeleteShortUrlModalProps & {
  shortUrlDeletion: ShortUrlDeletion;
  resetDeleteShortUrl: () => void;
};

const DELETION_PATTERN = 'delete';

export const DeleteShortUrlModal = ({
  shortUrl,
  onClose,
  isOpen,
  shortUrlDeletion,
  resetDeleteShortUrl,
  deleteShortUrl,
  shortUrlDeleted,
}: DeleteShortUrlModalConnectProps) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => resetDeleteShortUrl, [resetDeleteShortUrl]);

  const { loading, error, deleted, errorData } = shortUrlDeletion;
  const close = useCallback(() => {
    resetDeleteShortUrl();
    onClose();
  }, [resetDeleteShortUrl, onClose]);
  const handleDeleteUrl = useCallback(
    () => deleteShortUrl(shortUrl).then((a) => !isErrorAction(a) && onClose()),
    [deleteShortUrl, shortUrl, onClose],
  );

  return (
    <CardModal
      open={isOpen}
      title="Delete short URL"
      variant="danger"
      confirmText={loading ? 'Deleting...' : 'Delete'}
      confirmDisabled={inputValue !== DELETION_PATTERN || loading}
      onConfirm={handleDeleteUrl}
      onClose={close}
      onClosed={() => deleted && shortUrlDeleted(shortUrl)}
    >
      <div className="tw:flex tw:flex-col tw:gap-y-2">
        <p><b className="text-danger">Caution!</b> You are about to delete a short URL.</p>
        <p>This action cannot be undone. Once you have deleted it, all the visits stats will be lost.</p>

        <LabelledInput
          label={<>Type <b>{DELETION_PATTERN}</b> to confirm deletion.</>}
          type="text"
          placeholder={DELETION_PATTERN}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleDeleteUrl()}
        />

        {error && (
          <Result variant={isInvalidDeletionError(errorData) ? 'warning' : 'error'} size="sm" className="tw:mt-2">
            <ShlinkApiError errorData={errorData} fallbackMessage="Something went wrong while deleting the URL :(" />
          </Result>
        )}
      </div>
    </CardModal>
  );
};
