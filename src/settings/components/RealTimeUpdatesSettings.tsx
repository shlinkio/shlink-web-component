import { LabeledFormGroup, SimpleCard, ToggleSwitch } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import { useId } from 'react';
import { FormGroup, Input } from 'reactstrap';
import { useSetting } from '..';
import { FormText } from './FormText';

export type RealTimeUpdatesProps = {
  toggleRealTimeUpdates: (enabled: boolean) => void;
  setRealTimeUpdatesInterval: (interval: number) => void;
};

export const RealTimeUpdatesSettings = (
  { toggleRealTimeUpdates, setRealTimeUpdatesInterval }: RealTimeUpdatesProps,
) => {
  const { enabled, interval } = useSetting('realTimeUpdates', { enabled: true });
  const inputId = useId();

  return (
    <SimpleCard title="Real-time updates" className="h-100">
      <FormGroup>
        <ToggleSwitch checked={enabled} onChange={toggleRealTimeUpdates}>
          Enable or disable real-time updates.
          <FormText>
            Real-time updates are currently being <b>{enabled ? 'processed' : 'ignored'}</b>.
          </FormText>
        </ToggleSwitch>
      </FormGroup>
      <LabeledFormGroup
        noMargin
        label="Real-time updates frequency (in minutes):"
        labelClassName={clsx('form-label', { 'text-muted': !enabled })}
        id={inputId}
      >
        <Input
          type="number"
          min={0}
          placeholder="Immediate"
          disabled={!enabled}
          value={`${interval ?? ''}`}
          id={inputId}
          onChange={({ target }) => setRealTimeUpdatesInterval(Number(target.value))}
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
      </LabeledFormGroup>
    </SimpleCard>
  );
};
