import { screen } from '@testing-library/react';
import { endOfDay } from 'date-fns';
import { DateRangeRow } from '../../../src/utils/dates/DateRangeRow';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<DateRangeRow />', () => {
  const onEndDateChange = vi.fn();
  const onStartDateChange = vi.fn();
  const setUp = () => renderWithEvents(
    <DateRangeRow onEndDateChange={onEndDateChange} onStartDateChange={onStartDateChange} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('invokes start date callback when change event is triggered on first input', async () => {
    const { user } = setUp();

    expect(onStartDateChange).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText('Since:'), '2020-05-05');
    expect(onStartDateChange).toHaveBeenCalledWith(new Date('2020-05-05 00:00:00'));
  });

  it('invokes end date callback when change event is triggered on second input', async () => {
    const { user } = setUp();

    expect(onEndDateChange).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText('Until:'), '2022-05-05');
    expect(onEndDateChange).toHaveBeenCalledWith(endOfDay(new Date('2022-05-05 23:59:59')));
  });
});
