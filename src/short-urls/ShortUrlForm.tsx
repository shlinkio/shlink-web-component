import { faAndroid, faApple } from '@fortawesome/free-brands-svg-icons';
import { faDesktop } from '@fortawesome/free-solid-svg-icons';
import { Checkbox, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import { parseISO } from 'date-fns';
import type { ChangeEvent, FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Button, Input, Row } from 'reactstrap';
import type { ShlinkCreateShortUrlData, ShlinkDeviceLongUrls, ShlinkEditShortUrlData } from '../api-contract';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { DomainSelectorProps } from '../domains/DomainSelector';
import type { TagsSelectorProps } from '../tags/helpers/TagsSelector';
import type { TagsList } from '../tags/reducers/tagsList';
import type { IconInputProps } from '../utils/components/IconInput';
import { IconInput } from '../utils/components/IconInput';
import { formatIsoDate } from '../utils/dates/helpers/date';
import { LabelledDateInput } from '../utils/dates/LabelledDateInput';
import { useFeature } from '../utils/features';
import { handleEventPreventingDefault, hasValue } from '../utils/helpers';
import { ShortUrlFormCheckboxGroup } from './helpers/ShortUrlFormCheckboxGroup';
import { UseExistingIfFoundInfoIcon } from './UseExistingIfFoundInfoIcon';
import './ShortUrlForm.scss';

export interface ShortUrlFormProps<T extends ShlinkCreateShortUrlData | ShlinkEditShortUrlData> {
  basicMode?: boolean;
  saving: boolean;
  initialState: T;
  onSave: (shortUrlData: T) => Promise<unknown>;
}

type ShortUrlFormConnectProps = ShortUrlFormProps<ShlinkCreateShortUrlData | ShlinkEditShortUrlData> & {
  tagsList: TagsList;
};

type ShortUrlFormDeps = {
  TagsSelector: FC<TagsSelectorProps>;
  DomainSelector: FC<DomainSelectorProps>;
};

const toDate = (date?: string | Date): Date | undefined => (typeof date === 'string' ? parseISO(date) : date);

const isCreationData = (data: ShlinkCreateShortUrlData | ShlinkEditShortUrlData): data is ShlinkCreateShortUrlData =>
  'shortCodeLength' in data && 'customSlug' in data && 'domain' in data;

const isErrorAction = (action: any): boolean => 'error' in action;

const DeviceLongUrlInput: FC<Omit<IconInputProps, 'type' | 'name'>> = ({ id, icon, ...rest }) => (
  <IconInput
    name={id}
    id={id}
    type="url"
    icon={icon}
    {...rest}
  />
);

const ShortUrlForm: FCWithDeps<ShortUrlFormConnectProps, ShortUrlFormDeps> = (
  { basicMode = false, saving, onSave, initialState, tagsList },
) => {
  const { TagsSelector, DomainSelector } = useDependencies(ShortUrlForm as unknown as ShortUrlFormDeps);
  const [shortUrlData, setShortUrlData] = useState(initialState);
  const reset = () => setShortUrlData(initialState);
  const supportsDeviceLongUrls = useFeature('deviceLongUrls');

  const isCreation = isCreationData(shortUrlData);
  const isEdit = !isCreation;
  const changeTags = (tags: string[]) => setShortUrlData((prev) => ({ ...prev, tags }));
  const setResettableValue = (value: string, initialValue?: any) => {
    if (hasValue(value)) {
      return value;
    }

    // If an initial value was provided for this when the input is "emptied", explicitly set it to null so that the
    // value gets removed. Otherwise, set undefined so that it gets ignored.
    return hasValue(initialValue) ? null : undefined;
  };
  const submit = handleEventPreventingDefault(async () => onSave(shortUrlData)
    .then((result: any) => !isEdit && !isErrorAction(result) && reset())
    .catch(() => {}));

  const onDeviceLogUrlChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, id: keyof ShlinkDeviceLongUrls) => setShortUrlData((prev) => ({
      ...prev,
      deviceLongUrls: {
        ...(prev.deviceLongUrls ?? {}),
        [id]: setResettableValue(e.target.value, initialState.deviceLongUrls?.[id]),
      },
    })),
    [initialState.deviceLongUrls],
  );

  const basicComponents = useMemo(() => (
    <div className="d-flex flex-column gap-3">
      <Input
        name="longUrl"
        bsSize="lg"
        type="url"
        placeholder="URL to be shortened"
        required
        value={shortUrlData.longUrl}
        onChange={(e) => setShortUrlData((prev) => ({ ...prev, longUrl: e.target.value }))}
      />
      <Row>
        {basicMode && isCreation && (
          <div className="col-lg-6 mb-3">
            <Input
              name="customSlug"
              id="customSlug"
              placeholder="Custom slug"
              value={shortUrlData.customSlug ?? ''}
              onChange={(e) => setShortUrlData((prev) => ({ ...prev, customSlug: e.target.value }))}
              bsSize="lg"
            />
          </div>
        )}
        <div className={basicMode ? 'col-lg-6 mb-3' : 'col-12'}>
          <TagsSelector tags={tagsList.tags} selectedTags={shortUrlData.tags ?? []} onChange={changeTags} />
        </div>
      </Row>
    </div>
  ), [TagsSelector, basicMode, isCreation, shortUrlData, tagsList.tags]);

  return (
    <form name="shortUrlForm" className="short-url-form" onSubmit={submit}>
      {basicMode && basicComponents}
      {!basicMode && (
        <>
          <Row>
            <div className={clsx('mb-3', { 'col-sm-6': supportsDeviceLongUrls, 'col-12': !supportsDeviceLongUrls })}>
              <SimpleCard title="Main options" className="mb-3">
                {basicComponents}
              </SimpleCard>
            </div>
            {supportsDeviceLongUrls && (
              <div className="col-sm-6 mb-3">
                <SimpleCard title="Device-specific long URLs" bodyClassName="d-flex flex-column gap-3">
                  <DeviceLongUrlInput
                    icon={faAndroid}
                    id="android"
                    placeholder="Android-specific redirection"
                    value={shortUrlData.deviceLongUrls?.android ?? ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onDeviceLogUrlChange(e, 'android')}
                  />
                  <DeviceLongUrlInput
                    icon={faApple}
                    id="ios"
                    placeholder="iOS-specific redirection"
                    value={shortUrlData.deviceLongUrls?.ios ?? ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onDeviceLogUrlChange(e, 'ios')}
                  />
                  <DeviceLongUrlInput
                    icon={faDesktop}
                    id="desktop"
                    placeholder="Desktop-specific redirection"
                    value={shortUrlData.deviceLongUrls?.desktop ?? ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onDeviceLogUrlChange(e, 'desktop')}
                  />
                </SimpleCard>
              </div>
            )}
          </Row>

          <Row>
            <div className="col-sm-6 mb-3">
              <SimpleCard title="Customize the short URL" bodyClassName="d-flex flex-column gap-3">
                <Input
                  name="title"
                  id="title"
                  placeholder="Title"
                  value={shortUrlData.title ?? ''}
                  onChange={({ target }: ChangeEvent<HTMLInputElement>) => setShortUrlData((prev) => ({
                    ...prev,
                    title: setResettableValue(target.value, initialState.title),
                  }))}
                />
                {!isEdit && isCreation && (
                  <>
                    <Row>
                      <div className="col-lg-6 mb-3 mb-lg-0">
                        <Input
                          name="customSlug"
                          id="customSlug"
                          placeholder="Custom slug"
                          value={shortUrlData.customSlug ?? ''}
                          onChange={(e) => setShortUrlData((prev) => ({ ...prev, customSlug: e.target.value }))}
                          disabled={hasValue(shortUrlData.shortCodeLength)}
                        />
                      </div>
                      <div className="col-lg-6">
                        <Input
                          name="shortCodeLength"
                          id="shortCodeLength"
                          type="number"
                          placeholder="Short code length"
                          value={shortUrlData.shortCodeLength ?? ''}
                          onChange={(e) => setShortUrlData((prev) => ({ ...prev, shortCodeLength: e.target.value }))}
                          min={4}
                          disabled={hasValue(shortUrlData.customSlug)}
                        />
                      </div>
                    </Row>
                    <DomainSelector
                      value={shortUrlData.domain}
                      onChange={(domain?: string) => setShortUrlData((prev) => ({ ...prev, domain }))}
                    />
                  </>
                )}
              </SimpleCard>
            </div>

            <div className="col-sm-6 mb-3">
              <SimpleCard title="Limit access to the short URL">
                <div className="row mb-3">
                  <div className="col-lg-6">
                    <LabelledDateInput
                      label="Enabled since"
                      withTime
                      maxDate={shortUrlData.validUntil ? toDate(shortUrlData.validUntil) : undefined}
                      name="validSince"
                      value={shortUrlData.validSince ? toDate(shortUrlData.validSince) : null}
                      onChange={(date) => setShortUrlData((prev) => ({ ...prev, validSince: formatIsoDate(date) }))}
                    />
                  </div>
                  <div className="col-lg-6 mt-3 mt-lg-0">
                    <LabelledDateInput
                      label="Enabled until"
                      withTime
                      minDate={shortUrlData.validSince ? toDate(shortUrlData.validSince) : undefined}
                      name="validUntil"
                      value={shortUrlData.validUntil ? toDate(shortUrlData.validUntil) : null}
                      onChange={(date) => setShortUrlData((prev) => ({ ...prev, validUntil: formatIsoDate(date) }))}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="maxVisits" className="mb-1">Maximum visits allowed:</label>
                  <Input
                    name="maxVisits"
                    id="maxVisits"
                    type="number"
                    min={1}
                    placeholder="25..."
                    value={shortUrlData.maxVisits ?? ''}
                    onChange={(e) => setShortUrlData((prev) => ({
                      ...prev,
                      maxVisits: !hasValue(e.target.value) ? null : Number(e.target.value),
                    }))}
                  />
                </div>
              </SimpleCard>
            </div>
          </Row>

          <Row>
            <div className="col-sm-6 mb-3">
              <SimpleCard title="Extra checks">
                <ShortUrlFormCheckboxGroup
                  infoTooltip="If checked, Shlink will try to reach the long URL, failing in case it's not publicly accessible."
                  checked={shortUrlData.validateUrl}
                  onChange={(validateUrl) => setShortUrlData((prev) => ({ ...prev, validateUrl }))}
                >
                  Validate URL
                </ShortUrlFormCheckboxGroup>
                {!isEdit && isCreation && (
                  <p>
                    <Checkbox
                      inline
                      className="me-2"
                      checked={shortUrlData.findIfExists}
                      onChange={(findIfExists) => setShortUrlData((prev) => ({ ...prev, findIfExists }))}
                    >
                      Use existing URL if found
                    </Checkbox>
                    <UseExistingIfFoundInfoIcon />
                  </p>
                )}
              </SimpleCard>
            </div>
            <div className="col-sm-6 mb-3">
              <SimpleCard title="Configure behavior">
                <ShortUrlFormCheckboxGroup
                  infoTooltip="This short URL will be included in the robots.txt for your Shlink instance, allowing web crawlers (like Google) to index it."
                  checked={shortUrlData.crawlable}
                  onChange={(crawlable) => setShortUrlData((prev) => ({ ...prev, crawlable }))}
                >
                  Make it crawlable
                </ShortUrlFormCheckboxGroup>
                <ShortUrlFormCheckboxGroup
                  infoTooltip="When this short URL is visited, any query params appended to it will be forwarded to the long URL."
                  checked={shortUrlData.forwardQuery}
                  onChange={(forwardQuery) => setShortUrlData((prev) => ({ ...prev, forwardQuery }))}
                >
                  Forward query params on redirect
                </ShortUrlFormCheckboxGroup>
              </SimpleCard>
            </div>
          </Row>
        </>
      )}

      <div className="text-center">
        <Button
          outline
          color="primary"
          disabled={saving || !shortUrlData.longUrl}
          className="btn-xs-block"
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export const ShortUrlFormFactory = componentFactory(ShortUrlForm, ['TagsSelector', 'DomainSelector']);
