import { CardModal, Result } from '@shlinkio/shlink-frontend-kit';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import type { TagModalProps } from '../data';
import { useTagDelete } from '../reducers/tagDelete';

export type DeleteTagConfirmModalProps = TagModalProps;

export const DeleteTagConfirmModal = ({ tag, onClose, isOpen }: DeleteTagConfirmModalProps) => {
  const { deleteTag, tagDelete, tagDeleted } = useTagDelete();
  const { status } = tagDelete;
  const deleting = status === 'deleting';
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
      onClosed={() => status === 'deleted' && tagDeleted(tag)}
      onConfirm={doDelete}
      confirmText={deleting ? 'Deleting tag...' : 'Delete tag'}
      confirmDisabled={deleting}
    >
      Are you sure you want to delete tag <b>{tag}</b>?
      {status === 'error' && (
        <Result variant="error" size="sm" className="mt-2">
          <ShlinkApiError errorData={tagDelete.error} fallbackMessage="Something went wrong while deleting the tag :(" />
        </Result>
      )}
    </CardModal>
  );
};
