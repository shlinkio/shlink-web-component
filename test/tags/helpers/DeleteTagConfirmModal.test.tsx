import type { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { fromPartial } from '@total-typescript/shoehorn';
import { DeleteTagConfirmModal } from '../../../src/tags/helpers/DeleteTagConfirmModal';
import type { TagDeletion } from '../../../src/tags/reducers/tagDelete';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithStore } from '../../__helpers__/setUpTest';
import { TestModalWrapper } from '../../__helpers__/TestModalWrapper';

describe('<DeleteTagConfirmModal />', () => {
  const tag = 'nodejs';
  const deleteTags = vi.fn();
  const setUp = (tagDelete: TagDeletion = { status: 'idle' }) =>
    renderWithStore(<TestModalWrapper renderModal={(args) => <DeleteTagConfirmModal {...args} tag={tag} />} />, {
      initialState: { tagDelete },
      apiClientFactory: () => fromPartial<ShlinkApiClient>({ deleteTags }),
    });

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('asks confirmation for provided tag to be deleted', async () => {
    const screen = await setUp();

    const delBtn = screen.getByRole('button', { name: 'Delete tag' });

    await Promise.all([
      expect.element(screen.getByText(/^Are you sure you want to delete tag/)).toBeInTheDocument(),
      expect.element(screen.getByText('Something went wrong while deleting the tag :(')).not.toBeInTheDocument(),
      expect.element(delBtn).toBeInTheDocument(),
      expect.element(delBtn).not.toHaveClass('disabled'),
      expect.element(delBtn).not.toHaveAttribute('disabled'),
    ]);
  });

  it('shows error message when deletion failed', async () => {
    const screen = await setUp({ status: 'error' });
    await expect.element(screen.getByText('Something went wrong while deleting the tag :(')).toBeInTheDocument();
  });

  it('shows loading status while deleting', async () => {
    const screen = await setUp({ status: 'deleting' });

    const delBtn = screen.getByRole('button', { name: 'Deleting tag...' });

    await Promise.all([expect.element(delBtn).toBeInTheDocument(), expect.element(delBtn).toBeDisabled()]);
  });

  it('hides tag modal when btn is clicked', async () => {
    const { user, ...screen } = await setUp({ status: 'deleted' });

    await user.click(screen.getByRole('button', { name: 'Delete tag' }));

    expect(deleteTags).toHaveBeenCalledExactlyOnceWith([tag]);
  });

  it('does no further actions when modal is closed without deleting tag', async () => {
    const { user, ...screen } = await setUp();

    await user.click(screen.getByLabelText('Close dialog'));

    expect(deleteTags).not.toHaveBeenCalled();
  });
});
