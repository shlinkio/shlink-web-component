import { faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useElementRef } from '@shlinkio/shlink-frontend-kit';
import type {
  ShlinkRedirectCondition,
  ShlinkRedirectConditionType,
  ShlinkRedirectRuleData,
} from '@shlinkio/shlink-js-sdk/api-contract';
import type { FC, FormEvent } from 'react';
import { useCallback, useId, useState } from 'react';
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import './RedirectRuleModal.scss';

type RedirectRuleModalProps = {
  initialData?: ShlinkRedirectRuleData;
  onSave: (redirectRule: ShlinkRedirectRuleData) => void;
  isOpen: boolean;
  toggle: () => void;
};

const deviceNames = {
  android: 'Android',
  ios: 'iOS',
  desktop: 'Desktop',
} satisfies Record<string, string>;
type DeviceType = keyof typeof deviceNames;

const DeviceTypeControls: FC<{ deviceType?: string; onDeviceTypeChange: (deviceType: DeviceType) => void }> = ({
  deviceType,
  onDeviceTypeChange,
}) => {
  const deviceId = useId();
  return (
    <div>
      <label htmlFor={deviceId}>Device type:</label>
      <select
        id={deviceId}
        className="form-select"
        value={deviceType}
        onChange={(e) => onDeviceTypeChange(e.target.value as DeviceType)}
        required
      >
        {!deviceType && <option value="">- Select type -</option>}
        {Object.entries(deviceNames).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
      </select>
    </div>
  );
};

const LanguageControls: FC<{ language?: string; onLanguageChange: (lang: string) => void; }> = ({
  language,
  onLanguageChange,
}) => {
  const languageId = useId();
  return (
    <div>
      <label htmlFor={languageId}>Language:</label>
      <Input
        id={languageId}
        value={language ?? ''}
        onChange={(e) => onLanguageChange(e.target.value)}
        placeholder="en-US"
        required
      />
    </div>
  );
};

const QueryParamControls: FC<{
  name?: string;
  value?: string;
  onValueChange: (value: string) => void;
  onNameChange: (value: string) => void;
}> = ({
  name,
  value,
  onNameChange,
  onValueChange,
}) => {
  const nameId = useId();
  const keyId = useId();

  return (
    <>
      <div>
        <label htmlFor={nameId}>Param name:</label>
        <Input
          id={nameId}
          value={name ?? ''}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="hello"
          required
        />
      </div>
      <div>
        <label htmlFor={keyId}>Param value:</label>
        <Input
          id={keyId}
          value={value ?? ''}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="world"
          required
        />
      </div>
    </>
  );
};

const conditionNames: Record<ShlinkRedirectConditionType, string> = {
  device: 'Device type',
  language: 'Language',
  'query-param': 'Query param',
};

const Condition: FC<{
  condition: ShlinkRedirectCondition;
  onConditionChange: (condition: ShlinkRedirectCondition) => void;
  onDelete: () => void;
}> = ({ condition, onConditionChange, onDelete }) => {
  const conditionId = useId();
  const switchToType = useCallback((newType: ShlinkRedirectConditionType) => onConditionChange({
    type: newType,
    matchValue: '',
    matchKey: null,
  }), [onConditionChange]);
  const setConditionValue = useCallback(
    (newValue: string) => onConditionChange({ ...condition, matchValue: newValue }),
    [condition, onConditionChange],
  );
  const setConditionKey = useCallback(
    (newKey: string) => onConditionChange({ ...condition, matchKey: newKey }),
    [condition, onConditionChange],
  );

  return (
    <div className="redirect-rule-modal__condition rounded p-3 h-100 d-flex flex-column gap-2">
      <div>
        <label htmlFor={conditionId}>Type:</label>
        <div className="d-flex gap-2">
          <select
            id={conditionId}
            className="form-select flex-grow-1"
            value={condition.type}
            onChange={(e) => switchToType(e.target.value as ShlinkRedirectConditionType)}
          >
            {Object.entries(conditionNames).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
          </select>
          <Button outline color="danger" type="button" aria-label="Delete condition" onClick={onDelete}>
            <FontAwesomeIcon icon={faTrashCan} />
          </Button>
        </div>
      </div>
      {condition.type === 'device' && (
        <DeviceTypeControls deviceType={condition.matchValue} onDeviceTypeChange={setConditionValue} />
      )}
      {condition.type === 'language' && (
        <LanguageControls language={condition.matchValue} onLanguageChange={setConditionValue} />
      )}
      {condition.type === 'query-param' && (
        <QueryParamControls
          value={condition.matchValue}
          name={condition.matchKey ?? ''}
          onNameChange={setConditionKey}
          onValueChange={setConditionValue}
        />
      )}
    </div>
  );
};

const emptyRule: ShlinkRedirectRuleData = { longUrl: '', conditions: [] };

export const RedirectRuleModal: FC<RedirectRuleModalProps> = ({ isOpen, toggle, onSave, initialData }) => {
  const [redirectRule, setRedirectRule] = useState(initialData ?? emptyRule);
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    redirectRule && onSave(redirectRule);
    toggle();
  }, [onSave, redirectRule, toggle]);

  const addDraftCondition = useCallback(() => setRedirectRule(
    ({ longUrl, conditions }) => ({
      longUrl,
      conditions: [...conditions, { type: 'device', matchValue: '', matchKey: null }],
    }),
  ), []);
  const updateCondition = useCallback((index: number, newCondition: ShlinkRedirectCondition) => setRedirectRule(
    ({ longUrl, conditions }) => {
      // eslint-disable-next-line no-param-reassign
      conditions[index] = newCondition;
      return { longUrl, conditions };
    },
  ), []);
  const removeCondition = useCallback((index: number) => setRedirectRule(
    ({ longUrl, conditions }) => {
      conditions.splice(index, 1);
      return { longUrl, conditions };
    },
  ), []);

  const longUrlRef = useElementRef<HTMLInputElement>();
  const focusLongUrl = useCallback(() => longUrlRef?.current?.focus(), [longUrlRef]);
  const reset = useCallback(() => setRedirectRule(initialData ?? emptyRule), [initialData]);

  return (
    <Modal size="xl" isOpen={isOpen} toggle={toggle} centered onOpened={focusLongUrl} onClosed={reset}>
      <form onSubmit={handleSubmit}>
        <ModalHeader toggle={toggle} className="sticky-top redirect-rule-modal__header">Redirect rule</ModalHeader>
        <ModalBody>
          <label htmlFor="longUrl" className="fw-bold">Long URL:</label>
          <Input
            id="longUrl"
            type="url"
            placeholder="https://www.example.com"
            value={redirectRule.longUrl ?? ''}
            onChange={(e) => setRedirectRule((prev) => ({ ...prev, longUrl: e.target.value }))}
            required
            innerRef={longUrlRef}
          />

          <hr />

          <div className="d-flex justify-content-between">
            <b>Conditions:</b>
            <Button outline size="sm" type="button" aria-label="Add condition" onClick={addDraftCondition}>
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </div>
          {redirectRule.conditions.length === 0 && <div className="text-center"><i>Add conditions...</i></div>}
          {redirectRule.conditions.length > 0 && (
            <Row>
              {redirectRule.conditions.map((condition, index) => (
                <div key={`${index}_${condition.type}`} className="col-lg-6 col-xl-4 mt-3">
                  <Condition
                    condition={condition}
                    onConditionChange={(c) => updateCondition(index, c)}
                    onDelete={() => removeCondition(index)}
                  />
                </div>
              ))}
            </Row>
          )}
        </ModalBody>
        <ModalFooter className="sticky-bottom redirect-rule-modal__footer">
          <Button type="button" color="link" onClick={toggle}>Cancel</Button>
          <Button color="primary" disabled={redirectRule.conditions.length === 0}>Confirm</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
