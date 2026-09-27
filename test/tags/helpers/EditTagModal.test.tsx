import { fromPartial } from '@total-typescript/shoehorn';
import { ContainerProvider } from '../../../src/container/context';
import { EditTagModal } from '../../../src/tags/helpers/EditTagModal';
import type { TagEdition } from '../../../src/tags/reducers/tagEdit';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithStore } from '../../__helpers__/setUpTest';
import { colorGeneratorMock } from '../../utils/services/__mocks__/ColorGenerator.mock';

describe('<EditTagModal />', () => {
  const editTag = vi.fn().mockReturnValue(Promise.resolve());
  const onClose = vi.fn();
  const setUp = (tagEdit: Partial<TagEdition> = {}) =>
    renderWithStore(
      <ContainerProvider
        value={fromPartial({
          apiClientFactory: () => fromPartial({ editTag }),
          ColorGenerator: colorGeneratorMock,
        })}
      >
        <EditTagModal tag="foo" isOpen onClose={onClose} />
      </ContainerProvider>,
      {
        initialState: { tagEdit: fromPartial<TagEdition>(tagEdit) },
      },
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('allows modal to be closed with different mechanisms', async () => {
    const { user, ...screen } = await setUp();

    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText('Close dialog'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(editTag).not.toHaveBeenCalled();
  });

  it.each([
    [true, 'Saving...'],
    [false, 'Save'],
  ])('renders submit button in expected state', async (editing, name) => {
    const screen = await setUp({ status: editing ? 'editing' : 'idle' });
    await expect.element(screen.getByRole('button', { name })).toBeInTheDocument();
  });

  it('displays error result in case of error', async () => {
    const screen = await setUp({ status: 'error', error: fromPartial({}) });
    await expect.element(screen.getByText('Something went wrong while editing the tag :(')).toBeInTheDocument();
  });

  it('updates tag value when text changes', async () => {
    const { user, ...screen } = await setUp();
    const getInput = () => screen.getByPlaceholder('Tag');

    await expect.element(getInput()).toHaveValue('foo');
    await user.clear(getInput());
    await user.type(getInput(), 'bar');
    await expect.element(getInput()).toHaveValue('bar');
  });

  it('invokes all functions on form submit', async () => {
    const { user, ...screen } = await setUp();

    expect(editTag).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(editTag).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
