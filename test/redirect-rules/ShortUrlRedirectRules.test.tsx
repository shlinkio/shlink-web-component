import { Card } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkShortUrl } from '@shlinkio/shlink-js-sdk/api-contract';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { SetShortUrlRedirectRules } from '../../src/redirect-rules/reducers/setShortUrlRedirectRules';
import { ShortUrlRedirectRules } from '../../src/redirect-rules/ShortUrlRedirectRules';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';

type SetUpOptions = Partial<SetShortUrlRedirectRules> & {
  loading?: boolean;
};

describe('<ShortUrlRedirectRules />', () => {
  const getShortUrlRedirectRules = vi.fn().mockResolvedValue({});
  const getShortUrlsDetails = vi.fn();
  const setShortUrlRedirectRules = vi.fn();
  const setUp = async ({ loading, ...data }: SetUpOptions = {}) => {
    const renderResult = renderWithStore(
      <MemoryRouter>
        {/* Wrap in Card so that it has the proper background color and passes a11y contrast checks */}
        <Card>
          <ShortUrlRedirectRules
            shortUrlsDetails={fromPartial(loading ? { status: 'loading' } : {
              status: 'loaded',
              shortUrls: {
                get: () => fromPartial<ShlinkShortUrl>({ shortUrl: 'https://s.test/123' }),
              },
            })}
            getShortUrlsDetails={getShortUrlsDetails}
          />
        </Card>
      </MemoryRouter>,
      {
        initialState: {
          shortUrlRedirectRules: fromPartial(loading ? { status: 'loading' } : {
            status: 'loaded',
            defaultLongUrl: 'https://shlink.io',
            redirectRules: [
              { longUrl: 'https://example.com/first', conditions: [{ type: 'device' }] },
              { longUrl: 'https://example.com/second', conditions: [{ type: 'language' }] },
              { longUrl: 'https://example.com/third', conditions: [{ type: 'query-param' }] },
            ],
          }),
          shortUrlRedirectRulesSaving: fromPartial({ status: 'idle', ...data }),
        },
        apiClientFactory: () => fromPartial({ getShortUrlRedirectRules, setShortUrlRedirectRules }),
      },
    );

    if (!loading) {
      await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    }

    return renderResult;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('loads rules and details when loaded', async () => {
    await setUp();

    expect(getShortUrlRedirectRules).toHaveBeenCalledOnce();
    expect(getShortUrlsDetails).toHaveBeenCalledOnce();
  });

  it('resets rules state when unmounted', async () => {
    const { store } = await setUp({ status: 'saved' });

    cleanup();
    expect(store.getState().shortUrlRedirectRulesSaving.status).toEqual('idle');
  });

  it('can change rules order', async () => {
    const { user } = await setUp();
    const moveRule = (priority: number, direction: 'up' | 'down') => user.click(
      screen.getByLabelText(`Move rule with priority ${priority} ${direction}`),
    );
    const assertLinksOrder = (links: string[]) => {
      const ruleLinks = screen.getAllByTestId('rule-long-url');

      expect(links).toHaveLength(ruleLinks.length);
      links.forEach((link, index) => expect(ruleLinks[index]).toHaveAttribute('href', `https://example.com/${link}`));
    };

    assertLinksOrder(['first', 'second', 'third']);

    await moveRule(2, 'up');
    assertLinksOrder(['second', 'first', 'third']);

    await moveRule(2, 'down');
    await moveRule(1, 'down');
    assertLinksOrder(['third', 'second', 'first']);
  });

  it.each([
    [undefined, 'An error occurred while saving short URL redirect rules :('],
    ['There was an error', 'There was an error'],
  ])('shows error when saving failed', async (detail, expectedMessage) => {
    await setUp({ status: 'error', error: fromPartial({ detail }) });
    expect(screen.getByText(expectedMessage)).toBeInTheDocument();
  });

  it.each([[true], [false]])('shows message when saving succeeded', async (saved) => {
    await setUp({ status: saved ? 'saved' : 'idle' });
    const text = 'Redirect rules properly saved.';

    if (saved) {
      expect(screen.getByText(text)).toBeInTheDocument();
    } else {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    }
  });

  it('shows loading message while loading rules', async () => {
    const setUpPromise = setUp({ loading: true });

    expect(screen.getAllByText('Loading...')).toHaveLength(2);
    await setUpPromise;
    await waitFor(() => expect(screen.getAllByText('Loading...')).toHaveLength(1));
  });

  it('can open rule modal', async () => {
    const { user } = await setUp();

    await user.click(screen.getByRole('button', { name: 'Add rule' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });

  it.each([
    [true, 'Saving...'],
    [false, 'Save rules'],
  ])('shows in progress saving state', async (saving, expectedText) => {
    await setUp({ status: saving ? 'saving' : 'idle' });
    const btn = screen.getByTestId('save-button');

    expect(btn).toHaveTextContent(expectedText);
    if (saving) {
      expect(btn).toBeDisabled();
    } else {
      expect(btn).not.toBeDisabled();
    }
  });

  it('can remove existing rules', async () => {
    const { user } = await setUp();

    expect(screen.getAllByTestId('rule-long-url')).toHaveLength(3);
    await user.click(screen.getByLabelText('Delete rule with priority 1'));
    expect(screen.getAllByTestId('rule-long-url')).toHaveLength(2);
    await user.click(screen.getByLabelText('Delete rule with priority 2'));
    expect(screen.getAllByTestId('rule-long-url')).toHaveLength(1);
  });

  it('saves rules on form submit', async () => {
    const { user } = await setUp();

    await user.click(screen.getByRole('button', { name: 'Save rules' }));
    expect(setShortUrlRedirectRules).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
      redirectRules: [
        { longUrl: 'https://example.com/first', conditions: [{ type: 'device' }] },
        { longUrl: 'https://example.com/second', conditions: [{ type: 'language' }] },
        { longUrl: 'https://example.com/third', conditions: [{ type: 'query-param' }] },
      ],
    }));
  });
});
