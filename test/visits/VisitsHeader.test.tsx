import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { ShlinkVisit } from '../../src/api-contract';
import { VisitsHeader } from '../../src/visits/VisitsHeader';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<VisitsHeader />', () => {
  const visits: ShlinkVisit[] = [fromPartial({}), fromPartial({}), fromPartial({})];
  const title = 'My header title';
  const setUp = () => render(
    <MemoryRouter>
      <VisitsHeader visits={visits} title={title} />
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('shows the amount of visits', () => {
    const { container } = setUp();
    expect(container.querySelector('.badge')).toHaveTextContent(`Visits: ${visits.length}`);
  });

  it('shows the title in two places', () => {
    setUp();
    expect(screen.getAllByText(title)).toHaveLength(2);
  });
});
