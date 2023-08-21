import { Result } from '@shlinkio/shlink-frontend-kit';
import { useCallback, useState } from 'react';
import { Button, Input, InputGroup, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import { handleEventPreventingDefault } from '../../utils/helpers';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';
import type { TagModalProps } from '../data';
import type { EditTag, TagEdition } from '../reducers/tagEdit';

interface EditTagModalProps extends TagModalProps {
  tagEdit: TagEdition;
  editTag: (editTag: EditTag) => Promise<void>;
  tagEdited: (tagEdited: EditTag) => void;
}

export const EditTagModal = ({ getColorForKey }: ColorGenerator) => (
  { tag, editTag, toggle, tagEdited, isOpen, tagEdit }: EditTagModalProps,
) => {
  const [newTagName, setNewTagName] = useState(tag);
  const [color, setColor] = useState(getColorForKey(tag));
  const { editing, error, edited, errorData } = tagEdit;
  const saveTag = handleEventPreventingDefault(
    async () => {
      await editTag({ oldName: tag, newName: newTagName, color });
      toggle();
    },
  );
  const onClosed = useCallback(
    () => edited && tagEdited({ oldName: tag, newName: newTagName, color }),
    [edited, tagEdited],
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered onClosed={onClosed}>
      <form name="editTag" onSubmit={saveTag}>
        <ModalHeader toggle={toggle}>Edit tag</ModalHeader>
        <ModalBody>
          <InputGroup>
            <div className="input-group-text p-0" style={{ backgroundColor: color, borderColor: color }}>
              <Input
                className="form-control-color opacity-0"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <Input
              value={newTagName}
              placeholder="Tag"
              required
              onChange={({ target }) => setNewTagName(target.value)}
            />
          </InputGroup>

          {error && (
            <Result type="error" small className="mt-2">
              <ShlinkApiError errorData={errorData} fallbackMessage="Something went wrong while editing the tag :(" />
            </Result>
          )}
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="link" onClick={toggle}>Cancel</Button>
          <Button color="primary" disabled={editing}>{editing ? 'Saving...' : 'Save'}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
