import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import type { ShlinkCreateShortUrlData } from '../../src/api-contract';
import { SettingsProvider } from '../../src/settings';
import { CreateShortUrlFactory } from '../../src/short-urls/CreateShortUrl';
import type { ShortUrlCreation } from '../../src/short-urls/reducers/shortUrlCreation';
import type { ShortUrlFormProps } from '../../src/short-urls/ShortUrlForm';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<CreateShortUrl />', () => {
  const ShortUrlForm = ({ initialState }: ShortUrlFormProps<ShlinkCreateShortUrlData>) => (
    <span>ShortUrlForm ({initialState.longUrl})</span>
  );
  const shortUrlCreationResult = fromPartial<ShortUrlCreation>({});
  const createShortUrl = vi.fn(async () => Promise.resolve());
  const CreateShortUrl = CreateShortUrlFactory(fromPartial({ ShortUrlForm }));
  const setUp = (longUrlQuery?: string) => {
    const history = createMemoryHistory();
    if (longUrlQuery) {
      history.push({ search: `?long-url=${longUrlQuery}` });
    }

    return render(
      <Router location={history.location} navigator={history}>
        <SettingsProvider value={{}}>
          <CreateShortUrl
            shortUrlCreation={shortUrlCreationResult}
            createShortUrl={createShortUrl}
            resetCreateShortUrl={() => {}}
          />
        </SettingsProvider>
      </Router>,
    );
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([undefined, 'https://example.com'])('renders initial long URL', (longUrl) => {
    setUp(longUrl);
    expect(screen.getByText(`ShortUrlForm (${longUrl ?? ''})`)).toBeInTheDocument();
  });
});
