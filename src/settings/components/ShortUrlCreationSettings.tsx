import { DropdownBtn } from '@shlinkio/shlink-frontend-kit';
import { Label, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC, ReactNode } from 'react';
import { DropdownItem } from 'reactstrap';
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
    <SimpleCard title="Short URLs form" className="card" bodyClassName="tw:flex tw:flex-col tw:gap-4">
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
      <div>
        <Label className="tw:mb-1.5">Tag suggestions search mode:</Label>
        <DropdownBtn text={tagFilteringModeText(shortUrlCreation.tagFilteringMode)}>
          <DropdownItem
            active={!shortUrlCreation.tagFilteringMode || shortUrlCreation.tagFilteringMode === 'startsWith'}
            onClick={changeTagsFilteringMode('startsWith')}
          >
            {tagFilteringModeText('startsWith')}
          </DropdownItem>
          <DropdownItem
            active={shortUrlCreation.tagFilteringMode === 'includes'}
            onClick={changeTagsFilteringMode('includes')}
          >
            {tagFilteringModeText('includes')}
          </DropdownItem>
        </DropdownBtn>
        <Muted size="sm">{tagFilteringModeHint(shortUrlCreation.tagFilteringMode)}</Muted>
      </div>
    </SimpleCard>
  );
};
