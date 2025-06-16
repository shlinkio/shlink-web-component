import { Dropdown, Label, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { FC, ReactNode } from 'react';
import { Muted } from '../../utils/components/Muted';
import type { ShortUrlCreationSettings as ShortUrlsSettings } from '..';
import { useSetting } from '..';
import { LabelledToggle } from './fe-kit/LabelledToggle';

type TagFilteringMode = NonNullable<ShortUrlsSettings['tagFilteringMode']>;

interface ShortUrlCreationProps {
  onChange: (settings: ShortUrlsSettings) => void;
}

const tagFilteringModeText = (tagFilteringMode: TagFilteringMode | undefined): string =>
  (tagFilteringMode === 'includes' ? 'Suggest tags including input' : 'Suggest tags starting with input');
const tagFilteringModeHint = (tagFilteringMode: TagFilteringMode | undefined): ReactNode => (
  tagFilteringMode === 'includes'
    ? <>The list of suggested tags will contain those <b>including</b> provided input.</>
    : <>The list of suggested tags will contain those <b>starting with</b> provided input.</>
);

export const ShortUrlCreationSettings: FC<ShortUrlCreationProps> = ({ onChange }) => {
  const shortUrlCreation = useSetting('shortUrlCreation', { validateUrls: false });
  const changeTagsFilteringMode = (tagFilteringMode: TagFilteringMode) => () => onChange(
    { ...shortUrlCreation ?? { validateUrls: false }, tagFilteringMode },
  );

  return (
    <SimpleCard title="Short URLs form" className="card" bodyClassName="flex flex-col gap-4">
      <LabelledToggle
        data-testid="validate-url"
        checked={shortUrlCreation.validateUrls ?? false}
        onChange={(validateUrls) => onChange({ ...shortUrlCreation, validateUrls })}
        helpText={(
          <>
            The initial state of the <b>Validate URL</b> checkbox will
            be <b>{shortUrlCreation.validateUrls ? 'checked' : 'unchecked'}</b>.
          </>
        )}
      >
        Request validation on long URLs when creating new short URLs.{' '}
        <b>This option is ignored by Shlink {'>='}4.0.0</b>
      </LabelledToggle>
      <LabelledToggle
        data-testid="forward-query"
        checked={shortUrlCreation.forwardQuery ?? true}
        onChange={(forwardQuery) => onChange({ ...shortUrlCreation, forwardQuery })}
        helpText={(
          <>
            The initial state of the <b>Forward query params on redirect</b> checkbox will
            be <b>{shortUrlCreation.forwardQuery ?? true ? 'checked' : 'unchecked'}</b>.
          </>
        )}
      >
        Make all new short URLs forward their query params to the long URL.
      </LabelledToggle>
      <div className="flex flex-col">
        <Label className="mb-1.5">Tag suggestions search mode:</Label>
        <Dropdown
          buttonContent={tagFilteringModeText(shortUrlCreation.tagFilteringMode)}
          buttonClassName="w-full"
        >
          <Dropdown.Item
            selected={!shortUrlCreation.tagFilteringMode || shortUrlCreation.tagFilteringMode === 'startsWith'}
            onClick={changeTagsFilteringMode('startsWith')}
          >
            {tagFilteringModeText('startsWith')}
          </Dropdown.Item>
          <Dropdown.Item
            selected={shortUrlCreation.tagFilteringMode === 'includes'}
            onClick={changeTagsFilteringMode('includes')}
          >
            {tagFilteringModeText('includes')}
          </Dropdown.Item>
        </Dropdown>
        <Muted size="sm" className="mt-0.5">{tagFilteringModeHint(shortUrlCreation.tagFilteringMode)}</Muted>
      </div>
    </SimpleCard>
  );
};
