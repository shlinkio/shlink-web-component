import { Card } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkShortUrl } from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { SetShortUrlRedirectRules } from '../../src/redirect-rules/reducers/setShortUrlRedirectRules';
import { ShortUrlRedirectRules } from '../../src/redirect-rules/ShortUrlRedirectRules';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore, cleanup } from '../__helpers__/setUpTest';

type SetUpOptions = Partial<SetShortUrlRedirectRules> & {
  loading?: boolean;
};

describe('<ShortUrlRedirectRules />', () => {
  const getShortUrlRedirectRules = vi.fn().mockResolvedValue({});
  const getShortUrl = vi.fn().mockResolvedValue(fromPartial<ShlinkShortUrl>({ shortUrl: 'https://s.test/123' }));
  const setShortUrlRedirectRules = vi.fn();
  const setUp = async ({ loading, ...data }: SetUpOptions = {}) => {
    const screen = await renderWithStore(
      <MemoryRouter>
        {/* Wrap in Card so that it has the proper background color and passes a11y contrast checks */}
        <Card>
          <ShortUrlRedirectRules />
        </Card>
      </MemoryRouter>,
      {
        initialState: {
          shortUrlRedirectRules: fromPartial(
            loading
              ? { status: 'loading' }
              : {
                  status: 'loaded',
                  defaultLongUrl: 'https://shlink.io',
                  redirectRules: [
                    { longUrl: 'https://example.com/first', conditions: [{ type: 'device' }] },
                    { longUrl: 'https://example.com/second', conditions: [{ type: 'language' }] },
                    { longUrl: 'https://example.com/third', conditions: [{ type: 'query-param' }] },
                  ],
                },
          ),
          shortUrlRedirectRulesSaving: fromPartial({ status: 'idle', ...data }),
        },
        apiClientFactory: () => fromPartial({ getShortUrlRedirectRules, setShortUrlRedirectRules, getShortUrl }),
      },
    );

    if (!loading) {
      await expect.element(screen.getByText('Loading...')).not.toBeInTheDocument();
    }

    return screen;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('loads rules and details when loaded', async () => {
    await setUp();

    expect(getShortUrlRedirectRules).toHaveBeenCalledOnce();
    expect(getShortUrl).toHaveBeenCalledOnce();
  });

  it('resets rules state when unmounted', async () => {
    const { store } = await setUp({ status: 'saved' });

    await cleanup();
    expect(store.getState().shortUrlRedirectRulesSaving.status).toEqual('idle');
  });

  it('can change rules order', async () => {
    const { user, ...screen } = await setUp();
    const moveRule = (priority: number, direction: 'up' | 'down') =>
      user.click(screen.getByLabelText(`Move rule with priority ${priority} ${direction}`));
    const assertLinksOrder = async (links: string[]) => {
      const ruleLinks = screen.getByTestId('rule-long-url').all();

      expect(links).toHaveLength(ruleLinks.length);
      await Promise.all(
        links.map((link, index) =>
          expect.element(ruleLinks[index]).toHaveAttribute('href', `https://example.com/${link}`),
        ),
      );
    };

    await assertLinksOrder(['first', 'second', 'third']);

    await moveRule(2, 'up');
    await assertLinksOrder(['second', 'first', 'third']);

    await moveRule(2, 'down');
    await moveRule(1, 'down');
    await assertLinksOrder(['third', 'second', 'first']);
  });

  it.each([
    [undefined, 'An error occurred while saving short URL redirect rules :('],
    ['There was an error', 'There was an error'],
  ])('shows error when saving failed', async (detail, expectedMessage) => {
    const screen = await setUp({ status: 'error', error: fromPartial({ detail }) });
    await expect.element(screen.getByText(expectedMessage)).toBeInTheDocument();
  });

  it.each([[true], [false]])('shows message when saving succeeded', async (saved) => {
    const screen = await setUp({ status: saved ? 'saved' : 'idle' });
    const text = 'Redirect rules properly saved.';

    if (saved) {
      await expect.element(screen.getByText(text)).toBeInTheDocument();
    } else {
      await expect.element(screen.getByText(text)).not.toBeInTheDocument();
    }
  });

  // FIXME
  it.skip('shows loading message while loading rules', async () => {
    const screen = await setUp({ loading: true });
    expect(screen.getByText(/Loading/).all()).toHaveLength(2);
  });

  it('can open rule modal', async () => {
    const { user, ...screen } = await setUp();

    await user.click(screen.getByRole('button', { name: 'Add rule' }));
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it.each([
    [true, 'Saving...'],
    [false, 'Save rules'],
  ])('shows in progress saving state', async (saving, expectedText) => {
    const screen = await setUp({ status: saving ? 'saving' : 'idle' });
    const btn = screen.getByTestId('save-button');

    await expect.element(btn).toHaveTextContent(expectedText);
    if (saving) {
      await expect.element(btn).toBeDisabled();
    } else {
      await expect.element(btn).not.toBeDisabled();
    }
  });

  it('can remove existing rules', async () => {
    const { user, ...screen } = await setUp();

    expect(screen.getByTestId('rule-long-url').all()).toHaveLength(3);
    await user.click(screen.getByLabelText('Delete rule with priority 1'));
    expect(screen.getByTestId('rule-long-url').all()).toHaveLength(2);
    await user.click(screen.getByLabelText('Delete rule with priority 2'));
    expect(screen.getByTestId('rule-long-url').all()).toHaveLength(1);
  });

  it('saves rules on form submit', async () => {
    const { user, ...screen } = await setUp();

    await user.click(screen.getByRole('button', { name: 'Save rules' }));
    expect(setShortUrlRedirectRules).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        redirectRules: [
          { longUrl: 'https://example.com/first', conditions: [{ type: 'device' }] },
          { longUrl: 'https://example.com/second', conditions: [{ type: 'language' }] },
          { longUrl: 'https://example.com/third', conditions: [{ type: 'query-param' }] },
        ],
      }),
    );
  });
});
