import { faArrowsSplitUpAndLeft as rulesIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { TimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import { CopyToClipboardButton, Table } from '@shlinkio/shlink-frontend-kit/tailwind';
import { useEffect, useRef } from 'react';
import { ExternalLink } from 'react-external-link';
import type { ShlinkShortUrl } from '../../api-contract';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { useSetting } from '../../settings';
import { Time } from '../../utils/dates/Time';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';
import { useShortUrlsQuery } from './hooks';
import { ShortUrlDetailLink } from './ShortUrlDetailLink';
import type { ShortUrlsRowMenuType } from './ShortUrlsRowMenu';
import { ShortUrlStatus } from './ShortUrlStatus';
import { ShortUrlVisitsCount } from './ShortUrlVisitsCount';
import { Tags } from './Tags';

type ShortUrlsRowProps = {
  onTagClick?: (tag: string) => void;
  shortUrl: ShlinkShortUrl;
};

type ShortUrlsRowDeps = {
  ShortUrlsRowMenu: ShortUrlsRowMenuType,
  ColorGenerator: ColorGenerator,
  useTimeoutToggle: TimeoutToggle,
};

export type ShortUrlsRowType = typeof ShortUrlsRow;

const ShortUrlsRow: FCWithDeps<ShortUrlsRowProps, ShortUrlsRowDeps> = ({ shortUrl, onTagClick }) => {
  const { ShortUrlsRowMenu, ColorGenerator: colorGenerator, useTimeoutToggle } = useDependencies(ShortUrlsRow);
  // eslint-disable-next-line react-compiler/react-compiler
  const [active, setActive] = useTimeoutToggle(false, 500);
  const isFirstRun = useRef(true);
  const [{ excludeBots }] = useShortUrlsQuery();
  const visits = useSetting('visits');
  const doExcludeBots = excludeBots ?? visits?.excludeBots;

  useEffect(() => {
    // TODO In order to highlight short URLs when new visits occur, there should be an action adding the short URLs to
    //  highlight to a list, and taking care of removing them from that list after the timeout.
    if (!isFirstRun.current) {
      setActive();
    }

    isFirstRun.current = false;
  }, [shortUrl.visitsSummary?.total, shortUrl.visitsSummary?.nonBots, shortUrl.visitsCount, setActive]);

  return (
    <Table.Row className="tw:relative">
      <Table.Cell className="tw:whitespace-nowrap" columnName="Created at:">
        <Time date={shortUrl.dateCreated} />
      </Table.Cell>
      <Table.Cell columnName="Short URL:">
        <span className="tw:lg:whitespace-nowrap tw:inline-flex tw:items-center tw:gap-x-2">
          <ExternalLink href={shortUrl.shortUrl} className="tw:max-md:break-all tw:lg:truncate tw:max-w-72" />
          <CopyToClipboardButton text={shortUrl.shortUrl} />
        </span>
      </Table.Cell>
      <Table.Cell className="tw:break-all" columnName={`${shortUrl.title ? 'Title' : 'Long URL'}:`}>
        <ExternalLink href={shortUrl.longUrl}>{shortUrl.title ?? shortUrl.longUrl}</ExternalLink>
      </Table.Cell>
      {shortUrl.title && (
        <Table.Cell className="tw:break-all tw:[&]:lg:hidden" columnName="Long URL:">
          <ExternalLink href={shortUrl.longUrl} />
        </Table.Cell>
      )}
      <Table.Cell columnName="Tags:">
        <Tags tags={shortUrl.tags} colorGenerator={colorGenerator} onTagClick={onTagClick} />
      </Table.Cell>
      <Table.Cell className="tw:lg:text-right" columnName="Visits:">
        <ShortUrlVisitsCount
          visitsCount={(
            doExcludeBots ? shortUrl.visitsSummary?.nonBots : shortUrl.visitsSummary?.total
          ) ?? shortUrl.visitsCount ?? 0}
          shortUrl={shortUrl}
          active={active}
          asLink
        />
      </Table.Cell>
      <Table.Cell columnName="Status:" className="tw:max-lg:border-none">
        <div className="tw:inline-flex tw:gap-2">
          <ShortUrlStatus shortUrl={shortUrl} />
          {shortUrl.hasRedirectRules && (
            <ShortUrlDetailLink
              asLink
              shortUrl={shortUrl}
              suffix="redirect-rules"
              title="This short URL has dynamic redirect rules"
            >
              <FontAwesomeIcon icon={rulesIcon} />
            </ShortUrlDetailLink>
          )}
        </div>
      </Table.Cell>
      <Table.Cell className="tw:text-right tw:max-lg:absolute tw:max-lg:top-1 tw:max-lg:right-1 tw:max-lg:p-0">
        <ShortUrlsRowMenu shortUrl={shortUrl} />
      </Table.Cell>
    </Table.Row>
  );
};

export const ShortUrlsRowFactory = componentFactory(
  ShortUrlsRow,
  ['ShortUrlsRowMenu', 'ColorGenerator', 'useTimeoutToggle'],
);
