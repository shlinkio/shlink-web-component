import { UseExistingIfFoundInfoIcon } from '../../src/short-urls/UseExistingIfFoundInfoIcon';
import { checkAccessibility } from '../__helpers__/accessibility';
import type { RenderWithEventsResult } from '../__helpers__/setUpTest';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<UseExistingIfFoundInfoIcon />', () => {
  const setUp = () => renderWithEvents(<UseExistingIfFoundInfoIcon />);
  const openModal = ({ user, ...screen }: RenderWithEventsResult) => user.click(screen.getByRole('button'));

  it.each([
    [setUp],
    [
      async () => {
        const result = await setUp();
        await openModal(result);

        return result;
      },
    ],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it('shows modal when icon is clicked', async () => {
    const { user, ...screen } = await setUp();

    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
    await openModal({ user, ...screen });
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
