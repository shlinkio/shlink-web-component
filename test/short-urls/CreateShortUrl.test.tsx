import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import type { ShlinkCreateShortUrlData } from '../../src/api-contract';
import { ContainerProvider } from '../../src/container/context';
import { SettingsProvider } from '../../src/settings';
import { CreateShortUrlFactory } from '../../src/short-urls/CreateShortUrl';
import type { ShortUrlFormProps } from '../../src/short-urls/ShortUrlForm';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';

describe('<CreateShortUrl />', () => {
  const ShortUrlForm = ({ initialState }: ShortUrlFormProps<ShlinkCreateShortUrlData>) => (
    <span>ShortUrlForm ({initialState.longUrl})</span>
  );
  const CreateShortUrl = CreateShortUrlFactory(fromPartial({ ShortUrlForm }));
  const setUp = (longUrlQuery?: string) => {
    const history = createMemoryHistory();
    if (longUrlQuery) {
      history.push({ search: `?long-url=${longUrlQuery}` });
    }

    return renderWithStore(
      <ContainerProvider value={fromPartial({ apiClientFactory: vi.fn() })}>
        <Router location={history.location} navigator={history}>
          <SettingsProvider value={{}}>
            <CreateShortUrl />
          </SettingsProvider>
        </Router>
      </ContainerProvider>,
    );
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([undefined, 'https://example.com'])('renders initial long URL', (longUrl) => {
    setUp(longUrl);
    expect(screen.getByText(`ShortUrlForm (${longUrl ?? ''})`)).toBeInTheDocument();
  });
});
