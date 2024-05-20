import { LabeledFormGroup, OrderingDropdown, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import type { ShortUrlsListSettings as ShortUrlsSettings } from '..';
import { useSetting } from '..';

export type ShortUrlsListSettingsProps = {
  updateShortUrlsListSettings: (settings: ShortUrlsSettings) => void;
  defaultOrdering: NonNullable<ShortUrlsSettings['defaultOrdering']>;
};

const SHORT_URLS_ORDERABLE_FIELDS = {
  dateCreated: 'Created at',
  shortCode: 'Short URL',
  longUrl: 'Long URL',
  title: 'Title',
  visits: 'Visits',
};

export const ShortUrlsListSettings: FC<ShortUrlsListSettingsProps> = (
  { updateShortUrlsListSettings, defaultOrdering },
) => {
  const shortUrlsList = useSetting('shortUrlsList');

  return (
    <SimpleCard title="Short URLs list" className="h-100">
      <LabeledFormGroup noMargin label="Default ordering for short URLs list:">
        <OrderingDropdown
          items={SHORT_URLS_ORDERABLE_FIELDS}
          order={shortUrlsList?.defaultOrdering ?? defaultOrdering}
          onChange={(field, dir) => updateShortUrlsListSettings({ defaultOrdering: { field, dir } })}
        />
      </LabeledFormGroup>
    </SimpleCard>
  );
};
