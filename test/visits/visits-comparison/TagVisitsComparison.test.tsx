import { cleanup, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { TagVisitsComparisonFactory } from '../../../src/visits/visits-comparison/TagVisitsComparison';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithStore } from '../../__helpers__/setUpTest';
import { colorGeneratorMock, getColorForKey } from '../../utils/services/__mocks__/ColorGenerator.mock';

describe('<TagVisitsComparison />', () => {
  const TagVisitsComparison = TagVisitsComparisonFactory(fromPartial({
    ColorGenerator: colorGeneratorMock,
  }));
  const getTagVisitsForComparison = vi.fn();
  const cancelGetTagVisitsComparison = vi.fn();
  const setUp = (tags = ['foo', 'bar', 'baz']) => renderWithStore(
    <MemoryRouter initialEntries={[{ search: `?tags=${tags.join(',')}` }]}>
      <TagVisitsComparison
        getTagVisitsForComparison={getTagVisitsForComparison}
        cancelGetTagVisitsComparison={cancelGetTagVisitsComparison}
        tagVisitsComparison={fromPartial({
          visitsGroups: Object.fromEntries(tags.map((tag) => [tag, []])),
        })}
      />
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [['foo']],
    [['foo', 'bar']],
    [['baz', 'something', 'whatever']],
  ])('loads tags on mount', (tags) => {
    setUp(tags);
    expect(getTagVisitsForComparison).toHaveBeenLastCalledWith(expect.objectContaining({ tags }));
  });

  it('cancels loading visits when unmounted', () => {
    setUp();

    expect(cancelGetTagVisitsComparison).not.toHaveBeenCalled();
    cleanup();
    expect(cancelGetTagVisitsComparison).toHaveBeenCalledOnce();
  });

  it.each([
    [['foo']],
    [['foo', 'bar']],
    [['baz', 'something', 'whatever']],
  ])('renders tags in title', (tags) => {
    setUp(tags);

    expect.assertions(tags.length);
    tags.forEach((tag) => expect(screen.getByText(tag)).toBeInTheDocument());
  });

  it('loads colors for tags', () => {
    setUp();
    expect(getColorForKey).toHaveBeenCalledTimes(3);
    expect(getColorForKey).toHaveBeenNthCalledWith(1, 'foo');
    expect(getColorForKey).toHaveBeenNthCalledWith(2, 'bar');
    expect(getColorForKey).toHaveBeenNthCalledWith(3, 'baz');
  });
});
