import { DropdownBtn } from '@shlinkio/shlink-frontend-kit';
import { screen, waitFor } from '@testing-library/react';
import { DateIntervalDropdownItems } from '../../../src/utils/dates/DateIntervalDropdownItems';
import type { DateInterval } from '../../../src/utils/dates/helpers/dateIntervals';
import { DATE_INTERVALS, rangeOrIntervalToString } from '../../../src/utils/dates/helpers/dateIntervals';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<DateIntervalDropdownItems />', () => {
  const onChange = vi.fn();
  const setUp = async () => {
    const { user, ...renderResult } = renderWithEvents(
      <DropdownBtn text="text">
        <DateIntervalDropdownItems allText="All" active="last180Days" onChange={onChange} />
      </DropdownBtn>,
    );

    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    return { user, ...renderResult };
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders expected amount of items', async () => {
    await setUp();

    expect(screen.getAllByRole('menuitem')).toHaveLength(DATE_INTERVALS.length + 1);
    expect(screen.getByRole('menuitem', { name: 'Last 180 days' })).toHaveClass('active');
  });

  it('sets expected item as active', async () => {
    await setUp();
    const EXPECTED_ACTIVE_INDEX = 5;

    DATE_INTERVALS.forEach((interval, index) => {
      const item = screen.getByRole('menuitem', { name: rangeOrIntervalToString(interval) });

      if (index === EXPECTED_ACTIVE_INDEX) {
        expect(item).toHaveClass('active');
      } else {
        expect(item).not.toHaveClass('active');
      }
    });
  });

  it.each([
    [3, 'last7Days' as DateInterval],
    [7, 'last365Days' as DateInterval],
    [2, 'yesterday' as DateInterval],
  ])('triggers onChange callback when selecting an element', async (index, expectedInterval) => {
    const { user } = await setUp();

    await user.click(screen.getAllByRole('menuitem')[index]);

    expect(onChange).toHaveBeenCalledWith(expectedInterval);
  });
});
