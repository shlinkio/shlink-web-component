import { fromPartial } from '@total-typescript/shoehorn';
import { DomainSelector } from '../../src/domains/DomainSelector';
import { checkAccessibility } from '../__helpers__/accessibility';
import type { RenderWithEventsResult } from '../__helpers__/setUpTest';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<DomainSelector />', () => {
  const setUp = (value = '') =>
    renderWithEvents(
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

  const switchToInputMode = async ({ user, ...screen }: RenderWithEventsResult) => {
    await user.click(screen.getByRole('button', { name: 'Domain' }));
    await user.click(await screen.getByText('New domain').findElement());
  };

  it.each([
    [setUp],
    [
      async () => {
        const renderResult = await setUp();
        await switchToInputMode(renderResult);

        return renderResult;
      },
    ],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it.each([
    ['', 'Domain', true],
    ['my-domain.com', 'Domain: my-domain.com', false],
  ])('shows dropdown by default', async (value, expectedText, hasPlaceholderClass) => {
    const { user, ...screen } = await setUp(value);
    const btn = screen.getByRole('button', { name: expectedText });

    await expect.element(screen.getByPlaceholder('Domain')).not.toBeInTheDocument();
    if (hasPlaceholderClass) {
      await expect.element(btn).toHaveClass('text-placeholder');
    } else {
      await expect.element(btn).not.toHaveClass('text-placeholder');
    }
    await user.click(btn);

    await expect.element(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem').all()).toHaveLength(4);
  });

  it('allows toggling between dropdown and input', async () => {
    const { user, ...screen } = await setUp();

    await expect.element(screen.getByPlaceholder('Domain')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Domain' })).toBeInTheDocument();

    await switchToInputMode({ user, ...screen });

    await expect.element(screen.getByPlaceholder('Domain')).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Domain' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to domains list' }));

    await expect.element(screen.getByPlaceholder('Domain')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Domain' })).toBeInTheDocument();
  });

  it.each([
    [0, 'default.comdefault'],
    [1, 'foo.com'],
    [2, 'bar.com'],
  ])('shows expected content on every item', async (index, expectedContent) => {
    const { user, ...screen } = await setUp();

    await user.click(screen.getByRole('button', { name: 'Domain' }));
    const items = screen.getByRole('menuitem').all();

    await expect.element(items[index]).toHaveTextContent(expectedContent);
  });
});
