import { CardModal, Result } from '@shlinkio/shlink-frontend-kit';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import type { TagModalProps } from '../data';
import type { TagDeletion } from '../reducers/tagDelete';

interface DeleteTagConfirmModalProps extends TagModalProps {
  deleteTag: (tag: string) => Promise<void>;
  tagDeleted: (tag: string) => void;
  tagDelete: TagDeletion;
}

export const DeleteTagConfirmModal = (
  { tag, onClose, isOpen, deleteTag, tagDelete, tagDeleted }: DeleteTagConfirmModalProps,
) => {
  const { deleting, error, deleted, errorData } = tagDelete;
  const doDelete = async () => {
    await deleteTag(tag);
    onClose();
  };

  return (
    <CardModal
      title="Delete tag"
      variant="danger"
      open={isOpen}
      onClose={onClose}
      onClosed={() => deleted && tagDeleted(tag)}
      onConfirm={doDelete}
      confirmText={deleting ? 'Deleting tag...' : 'Delete tag'}
      confirmDisabled={deleting}
    >
      Are you sure you want to delete tag <b>{tag}</b>?
      {error && (
        <Result variant="error" size="sm" className="mt-2">
          <ShlinkApiError errorData={errorData} fallbackMessage="Something went wrong while deleting the tag :(" />
        </Result>
      )}
    </CardModal>
  );
};
