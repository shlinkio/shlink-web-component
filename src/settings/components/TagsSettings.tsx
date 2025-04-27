import { OrderingDropdown } from '@shlinkio/shlink-frontend-kit';
import { Label, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import type { TagsSettings as TagsSettingsOptions } from '..';
import { useSetting } from '..';

export type TagsProps = {
  onChange: (settings: TagsSettingsOptions) => void;
};

const TAGS_ORDERABLE_FIELDS = {
  tag: 'Tag',
  shortUrls: 'Short URLs',
  visits: 'Visits',
};

export const TagsSettings: FC<TagsProps> = ({ onChange }) => {
  const tags = useSetting('tags', {});

  return (
    <SimpleCard title="Tags" className="card">
      <Label className="tw:mb-1.5">Default ordering for tags list:</Label>
      <OrderingDropdown
        items={TAGS_ORDERABLE_FIELDS}
        order={tags.defaultOrdering ?? {}}
        onChange={(field, dir) => onChange({ ...tags, defaultOrdering: { field, dir } })}
      />
    </SimpleCard>
  );
};
