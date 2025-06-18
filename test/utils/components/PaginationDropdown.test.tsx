import { Card } from '@shlinkio/shlink-frontend-kit';
import { screen } from '@testing-library/react';
import { PaginationDropdown } from '../../../src/utils/components/PaginationDropdown';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<PaginationDropdown />', () => {
  const setValue = vi.fn();
  const setUp = async () => {
    const result = renderWithEvents(
      // Wrap in Card so that it has the proper background color and passes a11y contrast checks
      <Card>
        <PaginationDropdown ranges={[10, 50, 100, 200]} value={50} setValue={setValue} />
      </Card>,
    );
    const { user } = result;

    await user.click(screen.getByRole('button'));

    return result;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders expected amount of items', async () => {
    await setUp();
    expect(screen.getAllByRole('menuitem')).toHaveLength(5);
  });

  it.each([
    [0, 10],
    [1, 50],
    [2, 100],
    [3, 200],
  ])('sets expected value when an item is clicked', async (index, expectedValue) => {
    const { user } = await setUp();

    expect(setValue).not.toHaveBeenCalled();
    await user.click(screen.getAllByRole('menuitem')[index]);
    expect(setValue).toHaveBeenCalledWith(expectedValue);
  });
});
