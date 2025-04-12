import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { DomainStatus } from '../../../src/domains/data';
import { DomainStatusIcon } from '../../../src/domains/helpers/DomainStatusIcon';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<DomainStatusIcon />', () => {
  const matchMedia = vi.fn().mockReturnValue(fromPartial<MediaQueryList>({ matches: false }));
  const setUp = (status: DomainStatus) => renderWithEvents(
    <DomainStatusIcon status={status} matchMedia={matchMedia} />,
  );

  it.each([
    ['validating' as const],
    ['invalid' as const],
    ['valid' as const],
  ])('passes a11y checks', (status) => checkAccessibility(setUp(status)));

  it.each([
    ['validating' as const, 'circle-notch'],
    ['invalid' as const, 'xmark'],
    ['valid' as const, 'check'],
  ])('renders expected icon and tooltip when status is not validating', (status, expectedIcon) => {
    setUp(status);
    expect(screen.getByRole('img', { hidden: true })).toHaveAttribute('data-icon', expectedIcon);
  });

  it.each([
    ['invalid' as const],
    ['valid' as const],
  ])('renders proper tooltip based on state', async (status) => {
    const { user } = setUp(status);

    await user.hover(screen.getByRole('img', { hidden: true }));
    await screen.findByRole('tooltip');

    if (status === 'valid') {
      expect(screen.getByText(/Congratulations! This domain is properly configured/)).toBeInTheDocument();
      expect(screen.queryByText(/Oops! There is some missing configuration/)).not.toBeInTheDocument();
    } else {
      expect(screen.getByText(/Oops! There is some missing configuration/)).toBeInTheDocument();
      expect(screen.queryByText(/Congratulations! This domain is properly configured/)).not.toBeInTheDocument();
    }

    await user.unhover(screen.getByRole('img', { hidden: true }));
  });
});
