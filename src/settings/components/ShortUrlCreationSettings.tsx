import { DropdownBtn, LabeledFormGroup, SimpleCard, ToggleSwitch } from '@shlinkio/shlink-frontend-kit';
import type { FC, ReactNode } from 'react';
import { DropdownItem } from 'reactstrap';
import type { ShortUrlCreationSettings as ShortUrlsSettings } from '..';
import { useSetting } from '..';
import { FormText } from './FormText';

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
    <SimpleCard title="Short URLs form" className="h-100" bodyClassName="d-flex flex-column gap-3">
      <ToggleSwitch
        checked={shortUrlCreation.validateUrls ?? false}
        onChange={(validateUrls) => onChange({ ...shortUrlCreation, validateUrls })}
      >
        Request validation on long URLs when creating new short URLs.{' '}
        <b>This option is ignored by Shlink {'>='}4.0.0</b>
        <FormText>
          The initial state of the <b>Validate URL</b> checkbox will
          be <b>{shortUrlCreation.validateUrls ? 'checked' : 'unchecked'}</b>.
        </FormText>
      </ToggleSwitch>
      <ToggleSwitch
        checked={shortUrlCreation.forwardQuery ?? true}
        onChange={(forwardQuery) => onChange({ ...shortUrlCreation, forwardQuery })}
      >
        Make all new short URLs forward their query params to the long URL.
        <FormText>
          The initial state of the <b>Forward query params on redirect</b> checkbox will
          be <b>{shortUrlCreation.forwardQuery ?? true ? 'checked' : 'unchecked'}</b>.
        </FormText>
      </ToggleSwitch>
      <LabeledFormGroup noMargin label="Tag suggestions search mode:">
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
        <FormText>{tagFilteringModeHint(shortUrlCreation.tagFilteringMode)}</FormText>
      </LabeledFormGroup>
    </SimpleCard>
  );
};
