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
    ['validating' as const],
    ['invalid' as const],
    ['valid' as const],
  ])('renders expected icon and tooltip when status is not validating', (status) => {
    const { container } = setUp(status);
    expect(container.firstChild).toMatchSnapshot();
  });

  it.each([
    ['invalid' as const],
    ['valid' as const],
  ])('renders proper tooltip based on state', async (status) => {
    const { container, user } = setUp(status);

    if (container.firstElementChild) {
      await user.hover(container.firstElementChild);
    }
    expect(await screen.findByRole('tooltip')).toMatchSnapshot();
  });
});
