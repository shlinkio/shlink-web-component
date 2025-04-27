import { Label, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { useCallback } from 'react';
import type { DateInterval, VisitsSettings as VisitsSettingsConfig } from '..';
import { useSetting } from '..';
import { DateIntervalSelector } from './DateIntervalSelector';
import { LabelledToggle } from './fe-kit/LabelledToggle';

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
    <SimpleCard title="Visits" className="card" bodyClassName="tw:flex tw:flex-col tw:gap-4">
      <LabelledToggle
        data-testid="exclude-bots"
        checked={!!visitsSettings?.excludeBots}
        onChange={(excludeBots) => updateSettings({ excludeBots })}
        helpText={(
          <>
            The visits coming from potential bots will
            be <b>{visitsSettings?.excludeBots ? 'excluded' : 'included'}</b>.
          </>
        )}
      >
        Exclude bots wherever possible (this option&lsquo;s effect might depend on Shlink server&lsquo;s version).
      </LabelledToggle>

      <LabelledToggle
        data-testid="compare-visits"
        checked={!!visitsSettings?.loadPrevInterval}
        onChange={(loadPrevInterval) => updateSettings({ loadPrevInterval })}
        helpText={(
          <>
            When loading visits, previous period <b>{visitsSettings?.loadPrevInterval ? 'will' : 'won\'t'}</b> be
            loaded by default.
          </>
        )}
      >
        Compare visits with previous period.
      </LabelledToggle>

      <div>
        <Label className="tw:mb-1.5">Default interval to load on visits sections:</Label>
        <DateIntervalSelector
          allText="All visits"
          active={currentDefaultInterval(visitsSettings)}
          onChange={(defaultInterval) => updateSettings({ defaultInterval })}
        />
      </div>
    </SimpleCard>
  );
};
