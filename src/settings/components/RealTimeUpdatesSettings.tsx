import { LabelledInput, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import { useSetting } from '..';
import { LabelledToggle } from './fe-kit/LabelledToggle';
import { FormText } from './FormText';

export type RealTimeUpdatesProps = {
  toggleRealTimeUpdates: (enabled: boolean) => void;
  onIntervalChange: (interval: number) => void;
};

export const RealTimeUpdatesSettings = (
  { toggleRealTimeUpdates, onIntervalChange }: RealTimeUpdatesProps,
) => {
  const { enabled, interval } = useSetting('realTimeUpdates', { enabled: true });

  return (
    <SimpleCard title="Real-time updates" className="h-100" bodyClassName="tw:flex tw:flex-col tw:gap-y-4">
      <LabelledToggle
        checked={enabled}
        onChange={toggleRealTimeUpdates}
        helpText={<>Real-time updates are currently being <b>{enabled ? 'processed' : 'ignored'}</b>.</>}
      >
        Enable or disable real-time updates.
      </LabelledToggle>
      <div>
        <LabelledInput
          label={(
            <span className={clsx('form-label', { 'text-muted': !enabled })}>
              Real-time updates frequency (in minutes):
            </span>
          )}
          type="number"
          min={0}
          placeholder="Immediate"
          disabled={!enabled}
          value={`${interval ?? ''}`}
          onChange={({ target }) => onIntervalChange(Number(target.value))}
        />
        {enabled && (
          <FormText>
            {interval ? (
              <span>
                Updates will be reflected in the UI
                every <b>{interval}</b> minute{interval > 1 && 's'}.
              </span>
            ) : 'Updates will be reflected in the UI as soon as they happen.'}
          </FormText>
        )}
      </div>
    </SimpleCard>
  );
};
