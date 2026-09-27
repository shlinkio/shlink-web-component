import type { DomainStatus } from '../../../src/domains/data';
import { DomainStatusIcon } from '../../../src/domains/helpers/DomainStatusIcon';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<DomainStatusIcon />', () => {
  const setUp = (status: DomainStatus) => renderWithEvents(<DomainStatusIcon status={status} />);

  it.each([['validating' as const], ['invalid' as const], ['valid' as const]])('passes a11y checks', (status) =>
    checkAccessibility(setUp(status)),
  );

  it.each([
    ['validating' as const, 'circle-notch'],
    ['invalid' as const, 'xmark'],
    ['valid' as const, 'check'],
  ])('renders expected icon and tooltip when status is not validating', async (status, expectedIcon) => {
    const screen = await setUp(status);
    expect(screen.getByRole('img', { includeHidden: true })).toHaveAttribute('data-icon', expectedIcon);
  });

  it.each([['invalid' as const], ['valid' as const]])('renders proper tooltip based on state', async (status) => {
    const { user, ...screen } = await setUp(status);

    await user.hover(screen.getByRole('img', { includeHidden: true }));
    await screen.getByRole('tooltip').findElement();

    if (status === 'valid') {
      await expect.element(screen.getByText(/This domain is properly configured/)).toBeInTheDocument();
      await expect.element(screen.getByText(/Oops! There is some missing configuration/)).not.toBeInTheDocument();
    } else {
      await expect.element(screen.getByText(/Oops! There is some missing configuration/)).toBeInTheDocument();
      await expect.element(screen.getByText(/This domain is properly configured/)).not.toBeInTheDocument();
    }

    await user.unhover(screen.getByRole('img', { includeHidden: true }));
  });
});
