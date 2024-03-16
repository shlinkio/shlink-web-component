import type { ShlinkShortUrl } from '@shlinkio/shlink-js-sdk/api-contract';
import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router-dom';
import type { ProblemDetailsError } from '../../src/api-contract';
import { ShortUrlRedirectRules } from '../../src/redirect-rules/ShortUrlRedirectRules';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

type SetUpOptions = {
  loading?: boolean;
  saving?: boolean;
  saved?: boolean;
  errorData?: ProblemDetailsError;
};

describe('<ShortUrlRedirectRules />', () => {
  const getShortUrlRedirectRules = vi.fn();
  const getShortUrlsDetails = vi.fn();
  const setShortUrlRedirectRules = vi.fn();
  const setUp = ({ loading = false, saving = false, saved = false, errorData }: SetUpOptions = {}) => renderWithEvents(
    <MemoryRouter>
      <ShortUrlRedirectRules
        shortUrlRedirectRules={fromPartial(loading ? { loading } : {
          defaultLongUrl: 'https://shlink.io',
          redirectRules: [
            { longUrl: 'https://example.com/first', conditions: [{ type: 'device' }] },
            { longUrl: 'https://example.com/second', conditions: [{ type: 'language' }] },
            { longUrl: 'https://example.com/third', conditions: [{ type: 'query-param' }] },
          ],
        })}
        getShortUrlRedirectRules={getShortUrlRedirectRules}
        shortUrlsDetails={fromPartial(loading ? { loading } : {
          shortUrls: {
            get: () => fromPartial<ShlinkShortUrl>({ shortUrl: 'https://s.test/123' }),
          },
        })}
        getShortUrlsDetails={getShortUrlsDetails}
        shortUrlRedirectRulesSaving={fromPartial({ saving, saved, errorData })}
        setShortUrlRedirectRules={setShortUrlRedirectRules}
      />
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('loads rules and details when loaded', () => {
    setUp();

    expect(getShortUrlRedirectRules).toHaveBeenCalledOnce();
    expect(getShortUrlsDetails).toHaveBeenCalledOnce();
  });

  it('can change rules order', async () => {
    const { user } = setUp();
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
  ])('shows error when saving failed', (detail, expectedMessage) => {
    setUp({ errorData: fromPartial({ detail }) });
    expect(screen.getByText(expectedMessage)).toBeInTheDocument();
  });

  it.each([[true], [false]])('shows message when saving succeeded', (saved) => {
    setUp({ saved });
    const text = 'Redirect rules properly saved.';

    if (saved) {
      expect(screen.getByText(text)).toBeInTheDocument();
    } else {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    }
  });

  it('shows loading message while loading rules', () => {
    setUp({ loading: true });
    expect(screen.getAllByText('Loading...')).toHaveLength(2);
  });

  it('can open rule modal', async () => {
    const { user } = setUp();

    await user.click(screen.getByRole('button', { name: 'Add rule' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });

  it.each([
    [true, 'Saving...'],
    [false, 'Save rules'],
  ])('shows in progress saving state', (saving, expectedText) => {
    setUp({ saving });
    const btn = screen.getByTestId('save-button');

    expect(btn).toHaveTextContent(expectedText);
    if (saving) {
      expect(btn).toBeDisabled();
    } else {
      expect(btn).not.toBeDisabled();
    }
  });

  it('can remove existing rules', async () => {
    const { user } = setUp();

    expect(screen.getAllByTestId('rule-long-url')).toHaveLength(3);
    await user.click(screen.getByLabelText('Delete rule with priority 1'));
    expect(screen.getAllByTestId('rule-long-url')).toHaveLength(2);
    await user.click(screen.getByLabelText('Delete rule with priority 2'));
    expect(screen.getAllByTestId('rule-long-url')).toHaveLength(1);
  });

  it('saves rules on form submit', async () => {
    const { user } = setUp();

    await user.click(screen.getByRole('button', { name: 'Save rules' }));
    expect(setShortUrlRedirectRules).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        redirectRules: [
          { longUrl: 'https://example.com/first', conditions: [{ type: 'device' }] },
          { longUrl: 'https://example.com/second', conditions: [{ type: 'language' }] },
          { longUrl: 'https://example.com/third', conditions: [{ type: 'query-param' }] },
        ],
      },
    }));
  });
});
