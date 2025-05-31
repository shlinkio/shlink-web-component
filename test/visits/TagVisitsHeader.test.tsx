import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { TagVisits } from '../../src/visits/reducers/tagVisits';
import { TagVisitsHeader } from '../../src/visits/TagVisitsHeader';
import { checkAccessibility } from '../__helpers__/accessibility';
import { colorGeneratorMock } from '../utils/services/__mocks__/ColorGenerator.mock';

describe('<TagVisitsHeader />', () => {
  const tagVisits = fromPartial<TagVisits>({
    tag: 'foo',
    visits: [{}, {}, {}, {}],
  });
  const setUp = () => render(
    <MemoryRouter>
      <TagVisitsHeader tagVisits={tagVisits} colorGenerator={colorGeneratorMock} />
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('shows expected visits', () => {
    setUp();

    expect(screen.getAllByText('Visits for')).toHaveLength(2);
    expect(screen.getByTestId('badge')).toHaveTextContent(`Visits: ${tagVisits.visits.length}`);
  });

  it('shows title for tag', () => {
    setUp();
    expect(screen.getAllByText(tagVisits.tag)).not.toHaveLength(0);
  });
});
