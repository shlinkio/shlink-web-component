import { LabeledFormGroup, OrderingDropdown, SimpleCard, ToggleSwitch } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import type { ShortUrlsListSettings as ShortUrlsSettings } from '..';
import { useSetting } from '..';
import { FormText } from './FormText';

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
    <SimpleCard title="Short URLs list" className="h-100" bodyClassName="d-flex flex-column gap-3">
      <ToggleSwitch
        checked={confirmDeletions}
        onChange={(confirmDeletions) => onChange({ ...shortUrlsList, confirmDeletions })}
      >
        Request confirmation before deleting a short URL.
        <FormText>
          When deleting a short URL, confirmation <b>{confirmDeletions ? 'will' : 'won\'t'}</b> be required.
        </FormText>
      </ToggleSwitch>
      <LabeledFormGroup noMargin label="Default ordering for short URLs list:">
        <OrderingDropdown
          items={SHORT_URLS_ORDERABLE_FIELDS}
          order={shortUrlsList?.defaultOrdering ?? defaultOrdering}
          onChange={(field, dir) => onChange({ defaultOrdering: { field, dir } })}
        />
      </LabeledFormGroup>
    </SimpleCard>
  );
};
