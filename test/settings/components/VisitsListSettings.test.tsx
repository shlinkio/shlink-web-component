import { fromPartial } from '@total-typescript/shoehorn';
import type { Settings } from '../../../src/settings';
import { defaultVisitsListColumns, SettingsProvider } from '../../../src/settings';
import { visitsListColumns, VisitsListSettings } from '../../../src/settings/components/VisitsListSettings';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<VisitsListSettings />', () => {
  const setVisitsSettings = vi.fn();
  const setUp = (visitsListSettings: Partial<Settings['visitsList']> = {}) =>
    renderWithEvents(
      <SettingsProvider value={fromPartial({ visitsList: visitsListSettings })}>
        <VisitsListSettings onChange={setVisitsSettings} />
      </SettingsProvider>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders expected list of controls', async () => {
    const screen = await setUp();

    const items = Object.entries(visitsListColumns);

    expect(screen.getByRole('listitem').all()).toHaveLength(items.length);
    await Promise.all(
      items.map(([, name]) => expect.element(screen.getByLabelText(new RegExp(`^${name}`))).toBeInTheDocument()),
    );
  });

  it('changes enabled columns when a toggle is clicked', async () => {
    const { user, ...screen } = await setUp();

    await user.click(screen.getByLabelText('City'));
    expect(setVisitsSettings).toHaveBeenLastCalledWith(
      expect.objectContaining({
        columns: {
          ...defaultVisitsListColumns,
          city: !defaultVisitsListColumns.city,
        },
      }),
    );
  });

  it('changes excluded columns when a column with exclussions is toggled', async () => {
    const { user, ...screen } = await setUp();

    await user.click(screen.getByLabelText(/^User agent/));
    expect(setVisitsSettings).toHaveBeenLastCalledWith(
      expect.objectContaining({
        columns: {
          ...defaultVisitsListColumns,
          os: false,
          browser: false,
          userAgent: true,
        },
      }),
    );
  });
});
