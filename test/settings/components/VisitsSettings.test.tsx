import { fromPartial } from '@total-typescript/shoehorn';
import type { Settings } from '../../../src/settings';
import { SettingsProvider } from '../../../src/settings';
import { VisitsSettings } from '../../../src/settings/components/VisitsSettings';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<VisitsSettings />', () => {
  const setVisitsSettings = vi.fn();
  const setUp = (settings: Partial<Settings> = {}) =>
    renderWithEvents(
      <SettingsProvider value={fromPartial(settings)}>
        <VisitsSettings onChange={setVisitsSettings} />
      </SettingsProvider>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders expected components', async () => {
    const screen = await setUp();

    await Promise.all([
      expect.element(screen.getByRole('heading')).toMatchTextContent('Visits'),
      expect.element(screen.getByText('Default interval to load on visits sections:')).toBeInTheDocument(),
      expect.element(screen.getByText(/^Exclude bots wherever possible/)).toBeInTheDocument(),
      expect.element(screen.getByText('Compare visits with previous period.')).toBeInTheDocument(),
    ]);
  });

  it.each([
    [fromPartial<Settings>({}), 'Last 30 days'],
    [fromPartial<Settings>({ visits: {} }), 'Last 30 days'],
    [
      fromPartial<Settings>({
        visits: {
          defaultInterval: 'last7Days',
        },
      }),
      'Last 7 days',
    ],
    [
      fromPartial<Settings>({
        visits: {
          defaultInterval: 'today',
        },
      }),
      'Today',
    ],
  ])('sets expected interval as active', async (settings, expectedInterval) => {
    const screen = await setUp(settings);
    await expect.element(screen.getByRole('button')).toMatchTextContent(expectedInterval);
  });

  it('invokes setVisitsSettings when interval changes', async () => {
    const { user, ...screen } = await setUp();
    const selectOption = async (name: string) => {
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('menuitem', { name }));
    };

    await selectOption('Last 7 days');
    await selectOption('Last 180 days');
    await selectOption('Yesterday');

    expect(setVisitsSettings).toHaveBeenCalledTimes(3);
    expect(setVisitsSettings).toHaveBeenNthCalledWith(1, { defaultInterval: 'last7Days' });
    expect(setVisitsSettings).toHaveBeenNthCalledWith(2, { defaultInterval: 'last180Days' });
    expect(setVisitsSettings).toHaveBeenNthCalledWith(3, { defaultInterval: 'yesterday' });
  });

  it.each([
    [
      fromPartial<Settings>({}),
      /The visits coming from potential bots will be included.$/,
      /The visits coming from potential bots will be excluded.$/,
    ],
    [
      fromPartial<Settings>({ visits: { excludeBots: false } }),
      /The visits coming from potential bots will be included.$/,
      /The visits coming from potential bots will be excluded.$/,
    ],
    [
      fromPartial<Settings>({ visits: { excludeBots: true } }),
      /The visits coming from potential bots will be excluded.$/,
      /The visits coming from potential bots will be included.$/,
    ],
  ])('displays expected helper text for exclude bots control', async (settings, expectedText, notExpectedText) => {
    const screen = await setUp(settings);
    const helperText = screen.getByTestId('exclude-bots-help-text');

    await expect.element(helperText).toMatchTextContent(expectedText);
    await expect.element(helperText).not.toMatchTextContent(notExpectedText);
  });

  it('invokes setVisitsSettings when bot exclusion is toggled', async () => {
    const { user, ...screen } = await setUp();

    await user.click(screen.getByText(/^Exclude bots wherever possible/));
    expect(setVisitsSettings).toHaveBeenCalledWith(expect.objectContaining({ excludeBots: true }));
  });

  it.each([
    [
      fromPartial<Settings>({}),
      /When loading visits, previous period won't be loaded by default.$/,
      /When loading visits, previous period will be loaded by default.$/,
    ],
    [
      fromPartial<Settings>({ visits: { loadPrevInterval: false } }),
      /When loading visits, previous period won't be loaded by default.$/,
      /When loading visits, previous period will be loaded by default.$/,
    ],
    [
      fromPartial<Settings>({ visits: { loadPrevInterval: true } }),
      /When loading visits, previous period will be loaded by default.$/,
      /When loading visits, previous period won't be loaded by default.$/,
    ],
  ])('displays expected helper text for prev interval control', async (settings, expectedText, notExpectedText) => {
    const screen = await setUp(settings);
    const helperText = screen.getByTestId('compare-visits-help-text');

    await expect.element(helperText).toMatchTextContent(expectedText);
    await expect.element(helperText).not.toMatchTextContent(notExpectedText);
  });

  it('invokes setVisitsSettings when loading prev visits is toggled', async () => {
    const { user, ...screen } = await setUp();

    await user.click(screen.getByText('Compare visits with previous period.'));
    expect(setVisitsSettings).toHaveBeenCalledWith(expect.objectContaining({ loadPrevInterval: true }));
  });
});
