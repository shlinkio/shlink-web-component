import { CardModal, Input, Result } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import { withDependencies } from '../../container/context';
import { ColorPicker } from '../../utils/components/ColorPicker';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';
import { useTagEdit } from '../reducers/tagEdit';

export type EditTagModalProps = {
  tag: string;
  isOpen: boolean;
  onClose: () => void;
  ColorGenerator: ColorGenerator;
};

const EditTagModalBase: FC<EditTagModalProps> = ({ tag, onClose, isOpen, ColorGenerator: colorGenerator }) => {
  const { editTag, tagEdited, tagEdit } = useTagEdit();
  const [newTagName, setNewTagName] = useState(tag);
  const [color, setColor] = useState(colorGenerator.getColorForKey(tag));
  const { status } = tagEdit;
  const editing = status === 'editing';
  const saveTag = useCallback(async () => {
    await editTag({ oldName: tag, newName: newTagName, color });
    onClose();
  }, [color, editTag, newTagName, onClose, tag]);
  const onClosed = useCallback(
    () => status === 'edited' && tagEdited({ oldName: tag, newName: newTagName, color }),
    [color, status, newTagName, tag, tagEdited],
  );

  return (
    <CardModal
      title="Edit tag"
      open={isOpen}
      onClose={onClose}
      onClosed={onClosed}
      onConfirm={saveTag}
      confirmText={editing ? 'Saving...' : 'Save'}
      confirmDisabled={editing}
    >
      <div className="flex">
        <ColorPicker color={color} onChange={setColor} className="rounded-r-none" name="tag-color" />
        <Input
          className="grow [&]:rounded-l-none"
          value={newTagName}
          placeholder="Tag"
          required
          onChange={({ target }) => setNewTagName(target.value)}
        />
      </div>

      {status === 'error' && (
        <Result variant="error" size="sm" className="mt-2">
          <ShlinkApiError errorData={tagEdit.error} fallbackMessage="Something went wrong while editing the tag :(" />
        </Result>
      )}
    </CardModal>
  );
};

export const EditTagModal = withDependencies(EditTagModalBase, ['ColorGenerator']);
