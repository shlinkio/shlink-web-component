import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { VisitsStatsOptions } from '../../../src/visits/helpers/VisitsStatsOptions';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<VisitsStatsOptions />', () => {
  const deleteVisits = vi.fn();
  const setUp = (deleting = false) => renderWithEvents(
    <VisitsStatsOptions deleteVisits={deleteVisits} visitsDeletion={fromPartial({ deleting })} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('deletes visits after clicking twice', async () => {
    const { user } = setUp();

    await user.click(screen.getByRole('button', { name: 'Delete visits' }));
    expect(deleteVisits).not.toHaveBeenCalled();

    // A second click is required
    await user.click(screen.getByRole('button', { name: 'Click again to confirm' }));
    expect(deleteVisits).toHaveBeenCalledOnce();
  });

  it('displays loading state while deleting visits is in progress', async () => {
    const { user } = setUp(true);
    await user.click(screen.getByRole('button', { name: 'Delete visits' }));

    expect(screen.getByRole('button', { name: 'Deleting...' })).toHaveAttribute('disabled');
  });
});
