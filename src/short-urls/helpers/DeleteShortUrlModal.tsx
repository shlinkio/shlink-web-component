import { Result } from '@shlinkio/shlink-frontend-kit';
import type { SyntheticEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { isErrorAction, isInvalidDeletionError } from '../../api-contract/utils';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import type { ShortUrlIdentifier, ShortUrlModalProps } from '../data';
import type { ShortUrlDeletion } from '../reducers/shortUrlDeletion';

export type DeleteShortUrlModalProps = ShortUrlModalProps & {
  deleteShortUrl: (shortUrl: ShortUrlIdentifier) => Promise<void>;
  shortUrlDeleted: (shortUrl: ShortUrlIdentifier) => void;
};

type DeleteShortUrlModalConnectProps = DeleteShortUrlModalProps & {
  shortUrlDeletion: ShortUrlDeletion;
  resetDeleteShortUrl: () => void;
};

const DELETION_PATTERN = 'delete';

export const DeleteShortUrlModal = ({
  shortUrl,
  toggle,
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
    toggle();
  }, [resetDeleteShortUrl, toggle]);
  const handleDeleteUrl = useCallback((e: SyntheticEvent) => {
    e.preventDefault();
    return deleteShortUrl(shortUrl).then((a) => !isErrorAction(a) && toggle());
  }, [deleteShortUrl, shortUrl, toggle]);

  return (
    <Modal isOpen={isOpen} toggle={close} centered onClosed={() => deleted && shortUrlDeleted(shortUrl)}>
      <form onSubmit={handleDeleteUrl}>
        <ModalHeader toggle={close}>
          <span className="text-danger">Delete short URL</span>
        </ModalHeader>
        <ModalBody>
          <p><b className="text-danger">Caution!</b> You are about to delete a short URL.</p>
          <p>This action cannot be undone. Once you have deleted it, all the visits stats will be lost.</p>
          <p>Write <b>{DELETION_PATTERN}</b> to confirm deletion.</p>

          <input
            type="text"
            className="form-control"
            placeholder={`Insert ${DELETION_PATTERN}`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          {error && (
            <Result type={isInvalidDeletionError(errorData) ? 'warning' : 'error'} small className="mt-2">
              <ShlinkApiError errorData={errorData} fallbackMessage="Something went wrong while deleting the URL :(" />
            </Result>
          )}
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-link" onClick={close}>Cancel</button>
          <button
            type="submit"
            className="btn btn-danger"
            disabled={inputValue !== DELETION_PATTERN || loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
