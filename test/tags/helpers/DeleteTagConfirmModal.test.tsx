import { screen, waitFor } from '@testing-library/react';
import { DeleteTagConfirmModal } from '../../../src/tags/helpers/DeleteTagConfirmModal';
import type { TagDeletion } from '../../../src/tags/reducers/tagDelete';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';
import { TestModalWrapper } from '../../__helpers__/TestModalWrapper';

describe('<DeleteTagConfirmModal />', () => {
  const tag = 'nodejs';
  const deleteTag = vi.fn();
  const tagDeleted = vi.fn();
  const setUp = (tagDelete: Partial<TagDeletion> = {}) => renderWithEvents(
    <TestModalWrapper
      renderModal={(args) => (
        <DeleteTagConfirmModal
          {...args}
          tag={tag}
          deleteTag={deleteTag}
          tagDeleted={tagDeleted}
          tagDelete={{ error: false, deleted: false, deleting: false, ...tagDelete }}
        />
      )}
    />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('asks confirmation for provided tag to be deleted', () => {
    setUp();

    const delBtn = screen.getByRole('button', { name: 'Delete tag' });

    expect(screen.getByText(/^Are you sure you want to delete tag/)).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong while deleting the tag :(')).not.toBeInTheDocument();
    expect(delBtn).toBeInTheDocument();
    expect(delBtn).not.toHaveClass('disabled');
    expect(delBtn).not.toHaveAttribute('disabled');
  });

  it('shows error message when deletion failed', () => {
    setUp({ error: true });
    expect(screen.getByText('Something went wrong while deleting the tag :(')).toBeInTheDocument();
  });

  it('shows loading status while deleting', () => {
    setUp({ deleting: true });

    const delBtn = screen.getByRole('button', { name: 'Deleting tag...' });

    expect(delBtn).toBeInTheDocument();
    expect(delBtn).toBeDisabled();
  });

  it('hides tag modal when btn is clicked', async () => {
    const { user } = setUp({ deleted: true });

    await user.click(screen.getByRole('button', { name: 'Delete tag' }));

    expect(deleteTag).toHaveBeenCalledOnce();
    expect(deleteTag).toHaveBeenCalledWith(tag);

    await waitFor(() => expect(tagDeleted).toHaveBeenCalledOnce());
  });

  it('does no further actions when modal is closed without deleting tag', async () => {
    const { user } = setUp();

    await user.click(screen.getByLabelText('Close dialog'));

    expect(deleteTag).not.toHaveBeenCalled();
    expect(tagDeleted).not.toHaveBeenCalled();
  });
});
