import type { ShlinkCreateShortUrlData } from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import { ShortUrlForm } from '../../src/short-urls/ShortUrlForm';
import { checkAccessibility } from '../__helpers__/accessibility';
import { setNativeInputValue } from '../__helpers__/input';
import type { RenderWithEventsResult } from '../__helpers__/setUpTest';
import { renderWithStore } from '../__helpers__/setUpTest';

type SetUpOptions = {
  basicMode?: boolean;
  isCreation?: boolean;
  title?: string | null;
};

describe('<ShortUrlForm />', () => {
  const createShortUrl = vi.fn().mockResolvedValue({});
  const setUp = ({ basicMode, title, isCreation = true }: SetUpOptions = {}) => {
    const initialState: ShlinkCreateShortUrlData = {
      findIfExists: false,
      title,
      longUrl: '',
    };

    // Explicitly set these props, so that the component considers this a creation
    if (isCreation) {
      initialState.customSlug = undefined;
      initialState.shortCodeLength = undefined;
      initialState.domain = undefined;
    }

    return renderWithStore(
      <ShortUrlForm basicMode={basicMode} saving={false} initialState={initialState} onSave={createShortUrl} />,
      {
        initialState: { tagsList: fromPartial({ tags: [] }) },
      },
    );
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [
      async ({ user, ...screen }: RenderWithEventsResult) => {
        await user.type(screen.getByPlaceholder('Custom slug'), 'my-slug');
      },
      { customSlug: 'my-slug' },
    ],
    [
      async ({ user, ...screen }: RenderWithEventsResult) => {
        await user.type(screen.getByPlaceholder('Short code length'), '15');
      },
      { shortCodeLength: '15' },
    ],
  ])(
    'saves short URL with data set in form controls',
    async (extraFields, extraExpectedValues) => {
      const { user, ...screen } = await setUp();

      await user.type(screen.getByPlaceholder('URL to be shortened'), 'https://long-domain.com/foo/bar');
      await user.type(screen.getByPlaceholder('Title'), 'the title');
      await user.type(screen.getByLabelText('Maximum visits allowed:'), '20');
      setNativeInputValue(screen.getByLabelText('Enabled since:').element() as HTMLInputElement, '2017-01-01 12:25');
      setNativeInputValue(screen.getByLabelText('Enabled until:').element() as HTMLInputElement, '2017-01-06 08:33');
      await extraFields({ user, ...screen });

      expect(createShortUrl).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(createShortUrl).toHaveBeenCalledWith({
        longUrl: 'https://long-domain.com/foo/bar',
        title: 'the title',
        validSince: formatISO(new Date('2017-01-01 12:25')),
        validUntil: formatISO(new Date('2017-01-06 08:33')),
        maxVisits: 20,
        findIfExists: false,
        domain: undefined,
        shortCodeLength: undefined,
        customSlug: undefined,
        ...extraExpectedValues,
      });
    },
    // FIXME This test is slow in some contexts. Set 10 second timeout and fix later.
    10_000,
  );

  it.each([
    { basicMode: true, expectedAmountOfCards: 0 },
    { basicMode: false, expectedAmountOfCards: 5 },
    { basicMode: false, isCreation: false, expectedAmountOfCards: 4 },
  ])(
    'renders expected amount of cards based on server capabilities and mode',
    async ({ basicMode, isCreation, expectedAmountOfCards }) => {
      const screen = await setUp({ basicMode, isCreation });
      const cards = screen.getByRole('heading').all();

      expect(cards).toHaveLength(expectedAmountOfCards);
    },
  );

  it.each([
    [null, true, 'new title'],
    [undefined, true, 'new title'],
    ['', true, 'new title'],
    ['old title', true, 'new title'],
    [null, false, null],
    ['', false, ''],
    [undefined, false, undefined],
    ['old title', false, null],
  ])(
    'sends expected title based on original and new values',
    async (originalTitle, withNewTitle, expectedSentTitle) => {
      const { user, ...screen } = await setUp({ title: originalTitle });

      await user.type(screen.getByPlaceholder('URL to be shortened'), 'https://long-domain.com/foo/bar');
      await user.clear(screen.getByPlaceholder('Title'));
      if (withNewTitle) {
        await user.type(screen.getByPlaceholder('Title'), 'new title');
      }
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(createShortUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expectedSentTitle,
        }),
      );
    },
  );

  it.each([
    { result: {}, initialValue: 'https://long-domain.com/foo/bar', expectedValueAfterSave: '' },
    {
      result: { error: {} },
      initialValue: 'https://long-domain.com/foo/bar',
      expectedValueAfterSave: 'https://long-domain.com/foo/bar',
    },
  ])('resets form only if there was no error on save', async ({ result, initialValue, expectedValueAfterSave }) => {
    createShortUrl.mockResolvedValue(result);

    const { user, ...screen } = await setUp();

    await user.type(screen.getByPlaceholder('URL to be shortened'), initialValue);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(createShortUrl).toHaveBeenCalled();
    await expect.element(screen.getByPlaceholder('URL to be shortened')).toHaveValue(expectedValueAfterSave);
  });
});
