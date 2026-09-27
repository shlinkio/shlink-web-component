import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { TagVisits } from '../../src/visits/reducers/tagVisits';
import { TagVisitsHeader } from '../../src/visits/TagVisitsHeader';
import { checkAccessibility } from '../__helpers__/accessibility';
import { render } from '../__helpers__/setUpTest';
import { colorGeneratorMock } from '../utils/services/__mocks__/ColorGenerator.mock';

describe('<TagVisitsHeader />', () => {
  const tagVisits = fromPartial<Extract<TagVisits, { status: 'loaded' }>>({
    status: 'loaded',
    tag: 'foo',
    visits: [{}, {}, {}, {}],
  });
  const setUp = () =>
    render(
      <MemoryRouter>
        <TagVisitsHeader tagVisits={tagVisits} colorGenerator={colorGeneratorMock} />
      </MemoryRouter>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('shows expected visits', async () => {
    const screen = await setUp();

    expect(screen.getByText('Visits for').all()).toHaveLength(2);
    await expect.element(screen.getByTestId('badge')).toMatchTextContent(`Visits: ${tagVisits.visits.length}`);
  });

  it('shows title for tag', async () => {
    const screen = await setUp();
    expect(screen.getByText(tagVisits.tag).all()).not.toHaveLength(0);
  });
});
