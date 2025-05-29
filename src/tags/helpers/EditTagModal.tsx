import { Result } from '@shlinkio/shlink-frontend-kit';
import { CardModal, Input } from '@shlinkio/shlink-frontend-kit/tailwind';
import { useCallback, useState } from 'react';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { ColorPicker } from '../../utils/components/ColorPicker';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';
import type { TagModalProps } from '../data';
import type { EditTag, TagEdition } from '../reducers/tagEdit';

interface EditTagModalProps extends TagModalProps {
  tagEdit: TagEdition;
  editTag: (editTag: EditTag) => Promise<void>;
  tagEdited: (tagEdited: EditTag) => void;
}

type EditTagModalDeps = {
  ColorGenerator: ColorGenerator;
};

const EditTagModal: FCWithDeps<EditTagModalProps, EditTagModalDeps> = (
  { tag, editTag, onClose, tagEdited, isOpen, tagEdit },
) => {
  const { ColorGenerator: colorGenerator } = useDependencies(EditTagModal);
  const [newTagName, setNewTagName] = useState(tag);
  const [color, setColor] = useState(colorGenerator.getColorForKey(tag));
  const { editing, error, edited, errorData } = tagEdit;
  const saveTag = useCallback(async () => {
    await editTag({ oldName: tag, newName: newTagName, color });
    onClose();
  }, [color, editTag, newTagName, onClose, tag]);
  const onClosed = useCallback(
    () => edited && tagEdited({ oldName: tag, newName: newTagName, color }),
    [color, edited, newTagName, tag, tagEdited],
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
      <div className="tw:flex">
        <ColorPicker color={color} onChange={setColor} className="tw:rounded-r-none" name="tag-color" />
        <Input
          className="tw:grow tw:[&]:rounded-l-none"
          value={newTagName}
          placeholder="Tag"
          required
          onChange={({ target }) => setNewTagName(target.value)}
        />
      </div>

      {error && (
        <Result type="error" small className="tw:mt-2">
          <ShlinkApiError errorData={errorData} fallbackMessage="Something went wrong while editing the tag :(" />
        </Result>
      )}
    </CardModal>
  );
};

export const EditTagModalFactory = componentFactory(EditTagModal, ['ColorGenerator']);
