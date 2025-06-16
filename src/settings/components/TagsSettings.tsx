import { Label, OrderingDropdown, SimpleCard } from '@shlinkio/shlink-frontend-kit';
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
      <div className="flex flex-col gap-1.5">
        <Label>Default ordering for tags list:</Label>
        <OrderingDropdown
          buttonClassName="w-full"
          items={TAGS_ORDERABLE_FIELDS}
          order={tags.defaultOrdering ?? {}}
          onChange={(order) => onChange({ ...tags, defaultOrdering: !order.field && !order.dir ? undefined : order })}
        />
      </div>
    </SimpleCard>
  );
};
