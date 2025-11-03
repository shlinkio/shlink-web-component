import { Card, Table } from '@shlinkio/shlink-frontend-kit';
import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { addDays, formatISO, subDays } from 'date-fns';
import { MemoryRouter } from 'react-router';
import type { ShlinkShortUrl, ShlinkShortUrlMeta } from '../../../src/api-contract';
import type { Settings } from '../../../src/settings';
import { SettingsProvider } from '../../../src/settings';
import { ShortUrlsRowFactory } from '../../../src/short-urls/helpers/ShortUrlsRow';
import { now, parseDate } from '../../../src/utils/dates/helpers/date';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';
import { colorGeneratorMock } from '../../utils/services/__mocks__/ColorGenerator.mock';

interface SetUpOptions {
  title?: string | null;
  tags?: string[];
  meta?: ShlinkShortUrlMeta;
  settings?: Partial<Settings>;
  search?: string;
  hasRedirectRules?: boolean;
}

describe('<ShortUrlsRow />', () => {
  const timeoutToggle = vi.fn(() => true);
  const useTimeoutToggle = vi.fn(() => [false, timeoutToggle]);
  const shortUrl: ShlinkShortUrl = {
    shortCode: 'abc123',
    shortUrl: 'https://s.test/abc123',
    longUrl: 'https://foo.com/bar',
    dateCreated: formatISO(parseDate('2018-05-23 18:30:41', 'yyyy-MM-dd HH:mm:ss')),
    tags: [],
    visitsSummary: {
      total: 45,
      nonBots: 40,
      bots: 5,
    },
    domain: null,
    meta: {
      validSince: null,
      validUntil: null,
      maxVisits: null,
    },
  };
  const ShortUrlsRow = ShortUrlsRowFactory(fromPartial({
    ShortUrlsRowMenu: () => <span>ShortUrlsRowMenu</span>,
    ColorGenerator: colorGeneratorMock,
    useTimeoutToggle,
  }));

  const setUp = (
    { title, tags = [], meta = {}, settings = {}, search, hasRedirectRules }: SetUpOptions = {},
  ) => renderWithEvents(
    <MemoryRouter initialEntries={search ? [{ search }] : undefined}>
      <SettingsProvider value={fromPartial(settings)}>
        {/* Wrap in Card so that it has the proper background color and passes a11y contrast checks */}
        <Card>
          <Table header={<></>}>
            <ShortUrlsRow
              shortUrl={{ ...shortUrl, title, tags, hasRedirectRules, meta: { ...shortUrl.meta, ...meta } }}
              onTagClick={() => null}
            />
          </Table>
        </Card>
      </SettingsProvider>
    </MemoryRouter>,
  );

  it.each([
    { hasRedirectRules: true },
    { hasRedirectRules: false },
  ])('passes a11y checks', (options) => checkAccessibility(setUp(options)));

  it.each([
    [null, 7],
    [undefined, 7],
    ['The title', 8],
  ])('renders expected amount of columns', (title, expectedAmount) => {
    setUp({ title });
    expect(screen.getAllByRole('cell')).toHaveLength(expectedAmount);
  });

  it('renders date in first column', () => {
    setUp();
    expect(screen.getAllByRole('cell')[0]).toHaveTextContent('2018-05-23 18:30');
  });

  it.each([
    [1, shortUrl.shortUrl],
    [2, shortUrl.longUrl],
  ])('renders expected links on corresponding columns', (colIndex, expectedLink) => {
    setUp();

    const col = screen.getAllByRole('cell')[colIndex];
    const link = col.querySelector('a');

    expect(link).toHaveAttribute('href', expectedLink);
  });

  it.each([
    ['My super cool title', 'My super cool title'],
    [undefined, shortUrl.longUrl],
  ])('renders title when short URL has it', (title, expectedContent) => {
    setUp({ title });

    const titleSharedCol = screen.getAllByRole('cell')[2];

    expect(titleSharedCol.querySelector('a')).toHaveAttribute('href', shortUrl.longUrl);
    expect(titleSharedCol).toHaveTextContent(expectedContent);
  });

  it.each([
    [[], ['No tags']],
    [['nodejs', 'reactjs'], ['nodejs', 'reactjs']],
  ])('renders list of tags in fourth row', (tags, expectedContents) => {
    setUp({ tags });
    const cell = screen.getAllByRole('cell')[3];

    expectedContents.forEach((content) => expect(cell).toHaveTextContent(content));
  });

  it.each([
    [{}, '', shortUrl.visitsSummary?.total],
    [fromPartial<Settings>({ visits: { excludeBots: false } }), '', shortUrl.visitsSummary?.total],
    [fromPartial<Settings>({ visits: { excludeBots: true } }), '', shortUrl.visitsSummary?.nonBots],
    [fromPartial<Settings>({ visits: { excludeBots: false } }), 'excludeBots=true', shortUrl.visitsSummary?.nonBots],
    [fromPartial<Settings>({ visits: { excludeBots: true } }), 'excludeBots=true', shortUrl.visitsSummary?.nonBots],
    [{}, 'excludeBots=true', shortUrl.visitsSummary?.nonBots],
    [fromPartial<Settings>({ visits: { excludeBots: true } }), 'excludeBots=false', shortUrl.visitsSummary?.total],
    [fromPartial<Settings>({ visits: { excludeBots: false } }), 'excludeBots=false', shortUrl.visitsSummary?.total],
    [{}, 'excludeBots=false', shortUrl.visitsSummary?.total],
  ])('renders visits count in fifth row', (settings, search, expectedAmount) => {
    setUp({ settings, search });
    expect(screen.getAllByRole('cell', { hidden: true })[4]).toHaveTextContent(`${expectedAmount}`);
  });

  it.each([
    [{ validUntil: formatISO(subDays(now(), 1)) }, ['fa-calendar-xmark', 'text-danger']],
    [{ validSince: formatISO(addDays(now(), 1)) }, ['fa-calendar-xmark', 'text-warning']],
    [{ maxVisits: 45 }, ['fa-link-slash', 'text-danger']],
    [{ maxVisits: 45, validSince: formatISO(addDays(now(), 1)) }, ['fa-link-slash', 'text-danger']],
    [
      { validSince: formatISO(addDays(now(), 1)), validUntil: formatISO(subDays(now(), 1)) },
      ['fa-calendar-xmark', 'text-danger'],
    ],
    [
      { validSince: formatISO(subDays(now(), 1)), validUntil: formatISO(addDays(now(), 1)) },
      ['fa-check', 'text-lm-brand dark:text-dm-brand'],
    ],
    [{ maxVisits: 500 }, ['fa-check', 'text-lm-brand dark:text-dm-brand']],
    [{}, ['fa-check', 'text-lm-brand dark:text-dm-brand']],
  ])('displays expected status icon', (meta, expectedIconClasses) => {
    setUp({ meta });
    const icons = screen.getAllByRole('img', { hidden: true });
    const statusIcon = icons[icons.length - 1];

    expect(statusIcon).toBeInTheDocument();
    expectedIconClasses.forEach((expectedClass) => expect(statusIcon).toHaveClass(expectedClass));
    expect(statusIcon).toMatchSnapshot();
  });

  it.each([
    { hasRedirectRules: true },
    { hasRedirectRules: false },
  ])('shows indicator when a short URL has redirect rules', ({ hasRedirectRules }) => {
    setUp({ hasRedirectRules });

    if (hasRedirectRules) {
      expect(screen.getByTitle('This short URL has dynamic redirect rules')).toBeInTheDocument();
    } else {
      expect(screen.queryByTitle('This short URL has dynamic redirect rules')).not.toBeInTheDocument();
    }
  });
});
