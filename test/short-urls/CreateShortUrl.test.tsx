import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { SettingsProvider } from '../../src/settings';
import { CreateShortUrlFactory } from '../../src/short-urls/CreateShortUrl';
import type { ShortUrlCreation } from '../../src/short-urls/reducers/shortUrlCreation';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<CreateShortUrl />', () => {
  const ShortUrlForm = () => <span>ShortUrlForm</span>;
  const CreateShortUrlResult = () => <span>CreateShortUrlResult</span>;
  const shortUrlCreation = { validateUrls: true };
  const shortUrlCreationResult = fromPartial<ShortUrlCreation>({});
  const createShortUrl = vi.fn(async () => Promise.resolve());
  const CreateShortUrl = CreateShortUrlFactory(fromPartial({ ShortUrlForm, CreateShortUrlResult }));
  const setUp = () => render(
    <SettingsProvider value={fromPartial({ shortUrlCreation })}>
      <CreateShortUrl
        shortUrlCreation={shortUrlCreationResult}
        createShortUrl={createShortUrl}
        resetCreateShortUrl={() => {}}
      />
    </SettingsProvider>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders computed initial state', () => {
    setUp();

    expect(screen.getByText('ShortUrlForm')).toBeInTheDocument();
    expect(screen.getByText('CreateShortUrlResult')).toBeInTheDocument();
  });
});
