import { Tooltip, useTooltip } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { ShlinkShortUrl } from '@shlinkio/shlink-js-sdk/api-contract';
import { ExternalLink } from 'react-external-link';
import { Time } from '../utils/dates/Time';
import type { ShortUrlVisits } from './reducers/shortUrlVisits';
import { VisitsHeader } from './VisitsHeader';

interface ShortUrlVisitsHeaderProps {
  loading: boolean;
  shortUrl?: ShlinkShortUrl;
  shortUrlVisits: ShortUrlVisits;
}

const Date = ({ shortUrl }: { shortUrl?: ShlinkShortUrl }) => {
  const { anchor, tooltip } = useTooltip({ placement: 'bottom' });

  if (!shortUrl) {
    return <small>Loading...</small>;
  }

  return (
    <span>
      <b className="tw:cursor-default" {...anchor}>
        <Time date={shortUrl.dateCreated} relative />
      </b>
      <Tooltip {...tooltip}>
        <Time date={shortUrl.dateCreated} />
      </Tooltip>
    </span>
  );
};

export const ShortUrlVisitsHeader = ({ shortUrl, loading, shortUrlVisits }: ShortUrlVisitsHeaderProps) => {
  const { visits } = shortUrlVisits;
  const shortLink = shortUrl?.shortUrl ?? '';
  const longLink = shortUrl?.longUrl ?? '';
  const title = shortUrl?.title;

  return (
    <VisitsHeader title={<>Visits for <ExternalLink href={shortLink} /></>} visits={visits} shortUrl={shortUrl}>
      <hr />
      <div>Created: <Date shortUrl={shortUrl} /></div>
      <div data-testid="long-url-container">
        {`${title ? 'Title' : 'Long URL'}: `}
        {loading && <small>Loading...</small>}
        {!loading && <ExternalLink href={longLink}>{title ?? longLink}</ExternalLink>}
      </div>
    </VisitsHeader>
  );
};
