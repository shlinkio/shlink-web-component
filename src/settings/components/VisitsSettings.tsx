import { LabeledFormGroup, SimpleCard, ToggleSwitch } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useCallback } from 'react';
import { FormGroup } from 'reactstrap';
import type { DateInterval, VisitsSettings as VisitsSettingsConfig } from '..';
import { useSetting } from '..';
import { DateIntervalSelector } from './DateIntervalSelector';
import { FormText } from './FormText';

export type VisitsProps = {
  onChange: (settings: VisitsSettingsConfig) => void;
};

const currentDefaultInterval = (visitsSettings?: VisitsSettingsConfig): DateInterval =>
  visitsSettings?.defaultInterval ?? 'last30Days';

export const VisitsSettings: FC<VisitsProps> = ({ onChange }) => {
  const visitsSettings = useSetting('visits');
  const updateSettings = useCallback(
    ({ defaultInterval, ...rest }: Partial<VisitsSettingsConfig>) => onChange(
      { defaultInterval: defaultInterval ?? currentDefaultInterval(visitsSettings), ...rest },
    ),
    [onChange, visitsSettings],
  );

  return (
    <SimpleCard title="Visits" className="h-100">
      <FormGroup>
        <ToggleSwitch
          checked={!!visitsSettings?.excludeBots}
          onChange={(excludeBots) => updateSettings({ excludeBots })}
        >
          Exclude bots wherever possible (this option&lsquo;s effect might depend on Shlink server&lsquo;s version).
          <FormText>
            The visits coming from potential bots will
            be <b>{visitsSettings?.excludeBots ? 'excluded' : 'included'}</b>.
          </FormText>
        </ToggleSwitch>
      </FormGroup>
      <FormGroup>
        <ToggleSwitch
          checked={!!visitsSettings?.loadPrevInterval}
          onChange={(loadPrevInterval) => updateSettings({ loadPrevInterval })}
        >
          Compare visits with previous period.
          <FormText>
            When loading visits, previous period <b>{visitsSettings?.loadPrevInterval ? 'will' : 'won\'t'}</b> be
            loaded by default.
          </FormText>
        </ToggleSwitch>
      </FormGroup>
      <LabeledFormGroup noMargin label="Default interval to load on visits sections:">
        <DateIntervalSelector
          allText="All visits"
          active={currentDefaultInterval(visitsSettings)}
          onChange={(defaultInterval) => updateSettings({ defaultInterval })}
        />
      </LabeledFormGroup>
    </SimpleCard>
  );
};
