import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { ShlinkVisit } from '../../src/api-contract';
import { VisitsHeader } from '../../src/visits/VisitsHeader';
import { checkAccessibility } from '../__helpers__/accessibility';
import { render } from '../__helpers__/setUpTest';

describe('<VisitsHeader />', () => {
  const visits: ShlinkVisit[] = [fromPartial({}), fromPartial({}), fromPartial({})];
  const title = 'My header title';
  const setUp = () =>
    render(
      <MemoryRouter>
        <VisitsHeader visits={visits} title={title} />
      </MemoryRouter>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('shows the amount of visits', async () => {
    const screen = await setUp();
    await expect.element(screen.getByTestId('badge')).toHaveTextContent(`Visits: ${visits.length}`);
  });

  it('shows the title in two places', async () => {
    const screen = await setUp();
    expect(screen.getByText(title).all()).toHaveLength(2);
  });
});
