import type { ShlinkShortUrl } from '@shlinkio/shlink-js-sdk/api-contract';
import { ExternalLink } from 'react-external-link';
import { UncontrolledTooltip } from 'reactstrap';
import { Time } from '../utils/dates/Time';
import type { ShortUrlVisits } from './reducers/shortUrlVisits';
import { VisitsHeader } from './VisitsHeader';

interface ShortUrlVisitsHeaderProps {
  loading: boolean;
  shortUrl?: ShlinkShortUrl;
  shortUrlVisits: ShortUrlVisits;
}

export const ShortUrlVisitsHeader = ({ shortUrl, loading, shortUrlVisits }: ShortUrlVisitsHeaderProps) => {
  const { visits } = shortUrlVisits;
  const shortLink = shortUrl?.shortUrl ?? '';
  const longLink = shortUrl?.longUrl ?? '';
  const title = shortUrl?.title;

  const renderDate = () => (!shortUrl ? <small>Loading...</small> : (
    <span>
      <b id="created" className="tw:cursor-default">
        <Time date={shortUrl.dateCreated} relative />
      </b>
      <UncontrolledTooltip placement="bottom" target="created">
        <Time date={shortUrl.dateCreated} />
      </UncontrolledTooltip>
    </span>
  ));
  const visitsStatsTitle = <>Visits for <ExternalLink href={shortLink} /></>;

  return (
    <VisitsHeader title={visitsStatsTitle} visits={visits} shortUrl={shortUrl}>
      <hr />
      <div>Created: {renderDate()}</div>
      <div data-testid="long-url-container">
        {`${title ? 'Title' : 'Long URL'}: `}
        {loading && <small>Loading...</small>}
        {!loading && <ExternalLink href={longLink}>{title ?? longLink}</ExternalLink>}
      </div>
    </VisitsHeader>
  );
};
