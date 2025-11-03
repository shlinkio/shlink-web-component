import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { ShortUrlCreationSettings as ShortUrlsSettings } from '../../../src/settings';
import { SettingsProvider } from '../../../src/settings';
import { ShortUrlCreationSettings } from '../../../src/settings/components/ShortUrlCreationSettings';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<ShortUrlCreationSettings />', () => {
  const setShortUrlCreationSettings = vi.fn();
  const setUp = (shortUrlCreation?: ShortUrlsSettings) => renderWithEvents(
    <SettingsProvider value={fromPartial({ shortUrlCreation })}>
      <ShortUrlCreationSettings onChange={setShortUrlCreationSettings} />
    </SettingsProvider>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [{ forwardQuery: true }, true],
    [{ forwardQuery: false }, false],
    [{}, true],
  ])('forward query switch is toggled if option is true', (shortUrlCreation, expectedChecked) => {
    const matcher = /^Make all new short URLs forward their query params to the long URL/;

    setUp(shortUrlCreation);

    const checkbox = screen.getByLabelText(matcher);
    const helpText = screen.getByTestId('forward-query-help-text');

    if (expectedChecked) {
      expect(checkbox).toBeChecked();
      expect(helpText).toHaveTextContent('Forward query params on redirect checkbox will be checked');
      expect(helpText).not.toHaveTextContent('Forward query params on redirect checkbox will be unchecked');
    } else {
      expect(checkbox).not.toBeChecked();
      expect(helpText).toHaveTextContent('Forward query params on redirect checkbox will be unchecked');
      expect(helpText).not.toHaveTextContent('Forward query params on redirect checkbox will be checked');
    }
  });

  it.each([
    [{ tagFilteringMode: 'includes' } as ShortUrlsSettings, 'Suggest tags including input', 'including'],
    [
      { tagFilteringMode: 'startsWith' } as ShortUrlsSettings,
      'Suggest tags starting with input',
      'starting with',
    ],
    [undefined, 'Suggest tags starting with input', 'starting with'],
  ])('shows expected texts for tags suggestions', (shortUrlCreation, expectedText, expectedHint) => {
    setUp(shortUrlCreation);

    expect(screen.getByRole('button', { name: expectedText })).toBeInTheDocument();
    expect(screen.getByText(/^The list of suggested tags will contain those/)).toHaveTextContent(expectedHint);
  });

  it.each([[true], [false]])('invokes setShortUrlCreationSettings when forward query toggle value changes', async (forwardQuery) => {
    const { user } = setUp({ forwardQuery });

    expect(setShortUrlCreationSettings).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText(/^Make all new short URLs forward their query params to the long URL/));
    expect(setShortUrlCreationSettings).toHaveBeenCalledWith(expect.objectContaining({ forwardQuery: !forwardQuery }));
  });

  it('invokes setShortUrlCreationSettings when dropdown value changes', async () => {
    const { user } = setUp();
    const clickItem = async (name: string) => {
      await user.click(screen.getByRole('button', { name: 'Suggest tags starting with input' }));
      await user.click(await screen.findByRole('menuitem', { name }));
    };

    expect(setShortUrlCreationSettings).not.toHaveBeenCalled();

    await clickItem('Suggest tags including input');
    expect(setShortUrlCreationSettings).toHaveBeenCalledWith(expect.objectContaining(
      { tagFilteringMode: 'includes' },
    ));

    await clickItem('Suggest tags starting with input');
    expect(setShortUrlCreationSettings).toHaveBeenCalledWith(expect.objectContaining(
      { tagFilteringMode: 'startsWith' },
    ));
  });
});
