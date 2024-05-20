import type { TimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import { useEffect, useRef } from 'react';
import { ExternalLink } from 'react-external-link';
import type { ShlinkShortUrl } from '../../api-contract';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { useSetting } from '../../settings';
import { CopyToClipboardIcon } from '../../utils/components/CopyToClipboardIcon';
import { Time } from '../../utils/dates/Time';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';
import { useShortUrlsQuery } from './hooks';
import type { ShortUrlsRowMenuType } from './ShortUrlsRowMenu';
import { ShortUrlStatus } from './ShortUrlStatus';
import { ShortUrlVisitsCount } from './ShortUrlVisitsCount';
import { Tags } from './Tags';
import './ShortUrlsRow.scss';

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
  const [copiedToClipboard, setCopiedToClipboard] = useTimeoutToggle();
  const [active, setActive] = useTimeoutToggle(false, 500);
  const isFirstRun = useRef(true);
  const [{ excludeBots }] = useShortUrlsQuery();
  const visits = useSetting('visits');
  const doExcludeBots = excludeBots ?? visits?.excludeBots;

  useEffect(() => {
    !isFirstRun.current && setActive();
    isFirstRun.current = false;
  }, [shortUrl.visitsSummary?.total, shortUrl.visitsSummary?.nonBots, shortUrl.visitsCount, setActive]);

  return (
    <tr className="responsive-table__row">
      <td className="indivisible short-urls-row__cell responsive-table__cell" data-th="Created at">
        <Time date={shortUrl.dateCreated} />
      </td>
      <td className="responsive-table__cell short-urls-row__cell" data-th="Short URL">
        <span className="position-relative short-urls-row__cell--indivisible">
          <span className="short-urls-row__short-url-wrapper">
            <ExternalLink href={shortUrl.shortUrl} />
          </span>
          <CopyToClipboardIcon text={shortUrl.shortUrl} onCopy={setCopiedToClipboard} />
          <span
            role="status"
            className="badge bg-warning text-black short-urls-row__copy-hint"
            hidden={!copiedToClipboard}
          >
            Copied short URL!
          </span>
        </span>
      </td>
      <td
        className="responsive-table__cell short-urls-row__cell short-urls-row__cell--break"
        data-th={`${shortUrl.title ? 'Title' : 'Long URL'}`}
      >
        <ExternalLink href={shortUrl.longUrl}>{shortUrl.title ?? shortUrl.longUrl}</ExternalLink>
      </td>
      {shortUrl.title && (
        <td className="short-urls-row__cell responsive-table__cell short-urls-row__cell--break d-lg-none" data-th="Long URL">
          <ExternalLink href={shortUrl.longUrl} />
        </td>
      )}
      <td className="responsive-table__cell short-urls-row__cell" data-th="Tags">
        <Tags tags={shortUrl.tags} colorGenerator={colorGenerator} onTagClick={onTagClick} />
      </td>
      <td className="responsive-table__cell short-urls-row__cell text-lg-end" data-th="Visits">
        <ShortUrlVisitsCount
          visitsCount={(
            doExcludeBots ? shortUrl.visitsSummary?.nonBots : shortUrl.visitsSummary?.total
          ) ?? shortUrl.visitsCount ?? 0}
          shortUrl={shortUrl}
          active={active}
          asLink
        />
      </td>
      <td className="responsive-table__cell short-urls-row__cell" data-th="Status">
        <ShortUrlStatus shortUrl={shortUrl} />
      </td>
      <td className="responsive-table__cell short-urls-row__cell text-end">
        <ShortUrlsRowMenu shortUrl={shortUrl} />
      </td>
    </tr>
  );
};

export const ShortUrlsRowFactory = componentFactory(
  ShortUrlsRow,
  ['ShortUrlsRowMenu', 'ColorGenerator', 'useTimeoutToggle'],
);
