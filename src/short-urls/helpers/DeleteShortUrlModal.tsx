import { CardModal, LabelledInput, Result } from '@shlinkio/shlink-frontend-kit';
import { useCallback, useEffect, useState } from 'react';
import { isErrorAction, isInvalidDeletionError } from '../../api-contract/utils';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import type { ShortUrlModalProps } from '../data';
import { useUrlDeletion } from '../reducers/shortUrlDeletion';

export type DeleteShortUrlModalProps = ShortUrlModalProps;

const DELETION_PATTERN = 'delete';

export const DeleteShortUrlModal = ({ shortUrl, onClose, isOpen }: DeleteShortUrlModalProps) => {
  const [inputValue, setInputValue] = useState('');
  const { shortUrlDeletion, resetDeleteShortUrl, deleteShortUrl, shortUrlDeleted } = useUrlDeletion();

  useEffect(() => {
    return () => {
      resetDeleteShortUrl();
    };
  }, [resetDeleteShortUrl]);

  const { status } = shortUrlDeletion;
  const deleting = status === 'deleting';
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
      confirmText={deleting ? 'Deleting...' : 'Delete'}
      confirmDisabled={inputValue !== DELETION_PATTERN || deleting}
      onConfirm={handleDeleteUrl}
      onClose={close}
      onClosed={() => status === 'deleted' && shortUrlDeleted(shortUrl)}
    >
      <div className="flex flex-col gap-y-2">
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

        {status === 'error' && (
          <Result variant={isInvalidDeletionError(shortUrlDeletion.error) ? 'warning' : 'error'} size="sm" className="mt-2">
            <ShlinkApiError errorData={shortUrlDeletion.error} fallbackMessage="Something went wrong while deleting the URL :(" />
          </Result>
        )}
      </div>
    </CardModal>
  );
};
