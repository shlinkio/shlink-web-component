import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { DeleteTagConfirmModal } from '../../../src/tags/helpers/DeleteTagConfirmModal';
import type { TagDeletion } from '../../../src/tags/reducers/tagDelete';
import { renderWithEvents } from '../../__helpers__/setUpTest';
import { TestModalWrapper } from '../../__helpers__/TestModalWrapper';

describe('<DeleteTagConfirmModal />', () => {
  const tag = 'nodejs';
  const deleteTag = vi.fn();
  const tagDeleted = vi.fn();
  const setUp = (tagDelete: TagDeletion) => renderWithEvents(
    <TestModalWrapper
      renderModal={(args) => (
        <DeleteTagConfirmModal
          {...args}
          tag={tag}
          deleteTag={deleteTag}
          tagDeleted={tagDeleted}
          tagDelete={tagDelete}
        />
      )}
    />,
  );

  it('asks confirmation for provided tag to be deleted', () => {
    setUp({ error: false, deleted: false, deleting: false });

    const delBtn = screen.getByRole('button', { name: 'Delete tag' });

    expect(screen.getByText(/^Are you sure you want to delete tag/)).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong while deleting the tag :(')).not.toBeInTheDocument();
    expect(delBtn).toBeInTheDocument();
    expect(delBtn).not.toHaveClass('disabled');
    expect(delBtn).not.toHaveAttribute('disabled');
  });

  it('shows error message when deletion failed', () => {
    setUp({ error: true, deleted: false, deleting: false });
    expect(screen.getByText('Something went wrong while deleting the tag :(')).toBeInTheDocument();
  });

  it('shows loading status while deleting', () => {
    setUp({ error: false, deleted: false, deleting: true });

    const delBtn = screen.getByRole('button', { name: 'Deleting tag...' });

    expect(delBtn).toBeInTheDocument();
    expect(delBtn).toHaveClass('disabled');
    expect(delBtn).toHaveAttribute('disabled');
  });

  it('hides tag modal when btn is clicked', async () => {
    const { user } = setUp({ error: false, deleted: true, deleting: false });

    await user.click(screen.getByRole('button', { name: 'Delete tag' }));

    expect(deleteTag).toHaveBeenCalledOnce();
    expect(deleteTag).toHaveBeenCalledWith(tag);

    await waitFor(() => expect(tagDeleted).toHaveBeenCalledOnce());
  });

  it('does no further actions when modal is closed without deleting tag', async () => {
    const { user } = setUp({ error: false, deleted: false, deleting: false });

    await user.click(screen.getByLabelText('Close'));

    expect(deleteTag).not.toHaveBeenCalled();

    // After the modal is closed, the callback is still not invoked
    await waitForElementToBeRemoved(screen.getByLabelText('Close'));
    expect(tagDeleted).not.toHaveBeenCalled();
  });
});
