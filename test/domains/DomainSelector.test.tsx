import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { fromPartial } from '@total-typescript/shoehorn';
import { DomainSelector } from '../../src/domains/DomainSelector';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<DomainSelector />', () => {
  const setUp = (value = '') => renderWithEvents(
    <DomainSelector
      value={value}
      onChange={vi.fn()}
      domains={[
        fromPartial({ domain: 'default.com', isDefault: true }),
        fromPartial({ domain: 'foo.com' }),
        fromPartial({ domain: 'bar.com' }),
      ]}
    />,
  );

  const switchToInputMode = async (user: UserEvent) => {
    await user.click(screen.getByRole('button', { name: 'Domain' }));
    await user.click(await screen.findByText('New domain'));
  };

  it.each([
    [setUp],
    [async () => {
      const { user, container } = setUp();
      await switchToInputMode(user);

      return { container };
    }],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it.each([
    ['', 'Domain', 'domains-dropdown__toggle-btn'],
    ['my-domain.com', 'Domain: my-domain.com', 'domains-dropdown__toggle-btn--active'],
  ])('shows dropdown by default', async (value, expectedText, expectedClassName) => {
    const { user } = setUp(value);
    const btn = screen.getByRole('button', { name: expectedText });

    expect(screen.queryByPlaceholderText('Domain')).not.toBeInTheDocument();
    expect(btn).toHaveClass(
      `dropdown-btn__toggle ${expectedClassName} btn-block dropdown-btn__toggle--with-caret dropdown-toggle btn btn-primary`,
    );
    await user.click(btn);

    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
  });

  it('allows toggling between dropdown and input', async () => {
    const { user } = setUp();

    expect(screen.queryByPlaceholderText('Domain')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Domain' })).toBeInTheDocument();

    await switchToInputMode(user);

    expect(screen.getByPlaceholderText('Domain')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Domain' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to domains list' }));

    expect(screen.queryByPlaceholderText('Domain')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Domain' })).toBeInTheDocument();
  });

  it.each([
    [0, 'default.comdefault'],
    [1, 'foo.com'],
    [2, 'bar.com'],
  ])('shows expected content on every item', async (index, expectedContent) => {
    const { user } = setUp();

    await user.click(screen.getByRole('button', { name: 'Domain' }));
    const items = await screen.findAllByRole('menuitem');

    expect(items[index]).toHaveTextContent(expectedContent);
  });
});
