import { faPalette as colorIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Result } from '@shlinkio/shlink-frontend-kit';
import { useCallback, useState } from 'react';
import { Button, Input, InputGroup, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { handleEventPreventingDefault } from '../../utils/helpers';
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
  { tag, editTag, toggle, tagEdited, isOpen, tagEdit },
) => {
  const { ColorGenerator: colorGenerator } = useDependencies(EditTagModal);
  const [newTagName, setNewTagName] = useState(tag);
  const [color, setColor] = useState(colorGenerator.getColorForKey(tag));
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
            <div
              className="input-group-text p-0 position-relative"
              style={{ backgroundColor: color, borderColor: color }}
            >
              <FontAwesomeIcon
                icon={colorIcon}
                className="position-absolute top-50 start-50 translate-middle text-white"
              />
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

export const EditTagModalFactory = componentFactory(EditTagModal, ['ColorGenerator']);
