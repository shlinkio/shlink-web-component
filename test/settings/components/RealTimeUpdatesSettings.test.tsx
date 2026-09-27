import { fromPartial } from '@total-typescript/shoehorn';
import type { RealTimeUpdatesSettings as RealTimeUpdatesSettingsOptions } from '../../../src/settings';
import { SettingsProvider } from '../../../src/settings';
import { RealTimeUpdatesSettings } from '../../../src/settings/components/RealTimeUpdatesSettings';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<RealTimeUpdatesSettings />', () => {
  const toggleRealTimeUpdates = vi.fn();
  const setRealTimeUpdatesInterval = vi.fn();
  const setUp = (realTimeUpdates: Partial<RealTimeUpdatesSettingsOptions> = {}) =>
    renderWithEvents(
      <SettingsProvider value={fromPartial({ realTimeUpdates })}>
        <RealTimeUpdatesSettings
          toggleRealTimeUpdates={toggleRealTimeUpdates}
          onIntervalChange={setRealTimeUpdatesInterval}
        />
      </SettingsProvider>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders enabled real time updates as expected', async () => {
    const screen = await setUp({ enabled: true });

    await expect.element(screen.getByLabelText(/^Enable or disable real-time updates./)).toBeChecked();
    await expect.element(screen.getByText(/^Real-time updates are currently being/)).toMatchTextContent('processed');
    await expect.element(screen.getByText(/^Real-time updates are currently being/)).not.toMatchTextContent('ignored');
    await expect
      .element(screen.getByText('Real-time updates frequency (in minutes):'))
      .not.toHaveClass('dark:text-gray-400');
    await expect
      .element(screen.getByLabelText('Real-time updates frequency (in minutes):'))
      .not.toHaveAttribute('disabled');
    await expect
      .element(screen.getByText('Updates will be reflected in the UI as soon as they happen.'))
      .toBeInTheDocument();
  });

  it('renders disabled real time updates as expected', async () => {
    const screen = await setUp({ enabled: false });

    await expect.element(screen.getByLabelText(/^Enable or disable real-time updates./)).not.toBeChecked();
    await expect
      .element(screen.getByText(/^Real-time updates are currently being/))
      .not.toMatchTextContent('processed');
    await expect.element(screen.getByText(/^Real-time updates are currently being/)).toMatchTextContent('ignored');
    await expect
      .element(screen.getByText('Real-time updates frequency (in minutes):'))
      .toHaveClass('dark:text-gray-400');
    await expect
      .element(screen.getByLabelText('Real-time updates frequency (in minutes):'))
      .toHaveAttribute('disabled');
    await expect
      .element(screen.getByText('Updates will be reflected in the UI as soon as they happen.'))
      .not.toBeInTheDocument();
  });

  it.each([
    [1, 'minute'],
    [2, 'minutes'],
    [10, 'minutes'],
    [100, 'minutes'],
  ])('shows expected children when interval is greater than 0', async (interval, minutesWord) => {
    const screen = await setUp({ enabled: true, interval });

    await expect
      .element(screen.getByText(/^Updates will be reflected in the UI every/))
      .toMatchTextContent(`${interval} ${minutesWord}`);
    await expect.element(screen.getByLabelText('Real-time updates frequency (in minutes):')).toHaveValue(interval);
    await expect
      .element(screen.getByText('Updates will be reflected in the UI as soon as they happen.'))
      .not.toBeInTheDocument();
  });

  it.each([[undefined], [0]])('shows expected children when interval is 0 or undefined', async (interval) => {
    const screen = await setUp({ enabled: true, interval });

    await expect.element(screen.getByText(/^Updates will be reflected in the UI every/)).not.toBeInTheDocument();
    await expect
      .element(screen.getByText('Updates will be reflected in the UI as soon as they happen.'))
      .toBeInTheDocument();
  });

  it('updates real time updates when typing on input', async () => {
    const { user, ...screen } = await setUp({ enabled: true });

    expect(setRealTimeUpdatesInterval).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText('Real-time updates frequency (in minutes):'), '5');
    expect(setRealTimeUpdatesInterval).toHaveBeenCalledWith(5);
  });

  it('toggles real time updates on switch change', async () => {
    const { user, ...screen } = await setUp({ enabled: true });

    expect(toggleRealTimeUpdates).not.toHaveBeenCalled();
    await user.click(screen.getByText(/^Enable or disable real-time updates./));
    expect(toggleRealTimeUpdates).toHaveBeenCalled();
  });
});
