import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { UseExistingIfFoundInfoIcon } from '../../src/short-urls/UseExistingIfFoundInfoIcon';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<UseExistingIfFoundInfoIcon />', () => {
  const setUp = () => renderWithEvents(<UseExistingIfFoundInfoIcon />);
  const openModal = (user: UserEvent) => user.click(screen.getByRole('button'));

  it.each([
    [setUp],
    [async () => {
      const { user, container } = setUp();
      await openModal(user);

      return { container };
    }],
  ])('passes a11y checks', async (setUp) => checkAccessibility(await setUp()));

  it('shows modal when icon is clicked', async () => {
    const { user } = setUp();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await openModal(user);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
