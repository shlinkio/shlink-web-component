import { Label, OrderingDropdown, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import type { ShortUrlsListSettings as ShortUrlsSettings } from '..';
import { useSetting } from '..';
import { LabelledToggle } from './fe-kit/LabelledToggle';

export type ShortUrlsListSettingsProps = {
  onChange: (settings: ShortUrlsSettings) => void;
  defaultOrdering: NonNullable<ShortUrlsSettings['defaultOrdering']>;
};

const SHORT_URLS_ORDERABLE_FIELDS = {
  dateCreated: 'Created at',
  shortCode: 'Short URL',
  longUrl: 'Long URL',
  title: 'Title',
  visits: 'Visits',
};

export const ShortUrlsListSettings: FC<ShortUrlsListSettingsProps> = ({ onChange, defaultOrdering }) => {
  const shortUrlsList = useSetting('shortUrlsList');
  const confirmDeletions = shortUrlsList?.confirmDeletions ?? true;

  return (
    <SimpleCard title="Short URLs list" className="card" bodyClassName="tw:flex tw:flex-col tw:gap-4">
      <LabelledToggle
        checked={confirmDeletions}
        onChange={(confirmDeletions) => onChange({ ...shortUrlsList, confirmDeletions })}
        helpText={<>When deleting a short URL, confirmation <b>{confirmDeletions ? 'will' : 'won\'t'}</b> be required.</>}
      >
        Request confirmation before deleting a short URL.
      </LabelledToggle>
      <div className="tw:flex tw:flex-col tw:gap-1.5">
        <Label>Default ordering for short URLs list:</Label>
        <OrderingDropdown
          buttonClassName="tw:w-full"
          items={SHORT_URLS_ORDERABLE_FIELDS}
          order={shortUrlsList?.defaultOrdering ?? defaultOrdering}
          onChange={(newOrder) => onChange(
            { defaultOrdering: !newOrder.dir && !newOrder.field ? undefined : newOrder },
          )}
        />
      </div>
    </SimpleCard>
  );
};
