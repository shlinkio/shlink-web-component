import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import { SettingsProvider } from '../../src/settings';
import { CreateShortUrl } from '../../src/short-urls/CreateShortUrl';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';

describe('<CreateShortUrl />', () => {
  const setUp = (longUrlQuery?: string) => {
    const history = createMemoryHistory();
    if (longUrlQuery) {
      history.push({ search: `?long-url=${longUrlQuery}` });
    }

    return renderWithStore(
      <Router location={history.location} navigator={history}>
        <SettingsProvider value={{}}>
          <CreateShortUrl />
        </SettingsProvider>
      </Router>,
    );
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([undefined, 'https://example.com'])('renders initial long URL', async (longUrl) => {
    const screen = await setUp(longUrl);
    const input = screen.getByPlaceholder('URL to be shortened');

    if (longUrl) {
      await expect.element(input).toHaveValue(longUrl);
    } else {
      await expect.element(input).not.toHaveValue();
    }
  });
});
