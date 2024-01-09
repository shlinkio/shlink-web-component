import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router-dom';
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
    const { container } = setUp();

    expect(screen.getAllByText('Visits for')).toHaveLength(2);
    expect(container.querySelector('.badge:not(.tag)')).toHaveTextContent(`Visits: ${tagVisits.visits.length}`);
  });

  it('shows title for tag', () => {
    const { container } = setUp();
    expect(container.querySelector('.badge.tag')).toHaveTextContent(tagVisits.tag);
  });
});
