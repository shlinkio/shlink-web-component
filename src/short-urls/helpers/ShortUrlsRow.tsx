import { faArrowsSplitUpAndLeft as rulesIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { TimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import { CopyToClipboardButton, Table } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { ExternalLink } from 'react-external-link';
import type { ShlinkShortUrl } from '../../api-contract';
import { withDependencies } from '../../container/context';
import { useSetting } from '../../settings';
import { Time } from '../../utils/dates/Time';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';
import { useShortUrlsQuery } from './hooks';
import { ShortUrlDetailLink } from './ShortUrlDetailLink';
import { ShortUrlsRowMenu } from './ShortUrlsRowMenu';
import { ShortUrlStatus } from './ShortUrlStatus';
import { ShortUrlVisitsCount } from './ShortUrlVisitsCount';
import { Tags } from './Tags';

export type ShortUrlsRowProps = {
  onTagClick?: (tag: string) => void;
  shortUrl: ShlinkShortUrl;
  ColorGenerator: ColorGenerator;
  useTimeoutToggle: TimeoutToggle;
};

const ShortUrlsRowBase: FC<ShortUrlsRowProps> = (
  { shortUrl, onTagClick, ColorGenerator: colorGenerator, useTimeoutToggle },
) => {
  // eslint-disable-next-line react-compiler/react-compiler
  const [active, setActive] = useTimeoutToggle({ initialValue: false, delay: 500 });
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
  }, [shortUrl.visitsSummary.total, shortUrl.visitsSummary.nonBots, setActive]);

  return (
    <Table.Row className="relative">
      <Table.Cell className="whitespace-nowrap" columnName="Created at:">
        <Time date={shortUrl.dateCreated} />
      </Table.Cell>
      <Table.Cell columnName="Short URL:">
        <span className="lg:whitespace-nowrap inline-flex items-center gap-x-2">
          <ExternalLink href={shortUrl.shortUrl} className="max-md:break-all lg:truncate max-w-72" />
          <CopyToClipboardButton text={shortUrl.shortUrl} />
        </span>
      </Table.Cell>
      <Table.Cell className="break-all" columnName={`${shortUrl.title ? 'Title' : 'Long URL'}:`}>
        <ExternalLink href={shortUrl.longUrl}>{shortUrl.title ?? shortUrl.longUrl}</ExternalLink>
      </Table.Cell>
      {shortUrl.title && (
        <Table.Cell className="break-all [&]:lg:hidden" columnName="Long URL:">
          <ExternalLink href={shortUrl.longUrl} />
        </Table.Cell>
      )}
      <Table.Cell columnName="Tags:">
        <Tags tags={shortUrl.tags} colorGenerator={colorGenerator} onTagClick={onTagClick} />
      </Table.Cell>
      <Table.Cell className="lg:text-right" columnName="Visits:">
        <ShortUrlVisitsCount
          visitsCount={doExcludeBots ? shortUrl.visitsSummary.nonBots : shortUrl.visitsSummary.total}
          shortUrl={shortUrl}
          active={active}
          asLink
        />
      </Table.Cell>
      <Table.Cell columnName="Status:" className="max-lg:border-none">
        <div className="inline-flex gap-2">
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
      <Table.Cell className="text-right max-lg:absolute max-lg:top-1 max-lg:right-1 max-lg:p-0">
        <ShortUrlsRowMenu shortUrl={shortUrl} />
      </Table.Cell>
    </Table.Row>
  );
};

export const ShortUrlsRow = withDependencies(ShortUrlsRowBase, ['ColorGenerator', 'useTimeoutToggle']);
