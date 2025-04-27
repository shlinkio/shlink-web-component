import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type {
  ShlinkRedirectCondition,
  ShlinkRedirectConditionType,
  ShlinkRedirectRuleData,
} from '@shlinkio/shlink-js-sdk/api-contract';
import type { FC, FormEvent } from 'react';
import { useCallback, useId, useMemo , useRef , useState } from 'react';
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { countryCodes } from '../../utils/country-codes';
import { useFeature } from '../../utils/features';
import './RedirectRuleModal.scss';

const deviceNames = {
  android: 'Android',
  ios: 'iOS',
  desktop: 'Desktop',
} as const satisfies Record<string, string>;

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

const PlainValueControls: FC<{
  value?: string;
  onValueChange: (newValue: string) => void;
  label: string;
  placeholder: string;
}> = ({
  value,
  onValueChange,
  label,
  placeholder,
}) => {
  const inputId = useId();
  return (
    <div>
      <label htmlFor={inputId}>{label}:</label>
      <Input
        id={inputId}
        value={value ?? ''}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        required
      />
    </div>
  );
};

const LanguageControls: FC<{ language?: string; onLanguageChange: (lang: string) => void; }> = ({
  language,
  onLanguageChange,
}) => (
  <PlainValueControls value={language} onValueChange={onLanguageChange} label="Language" placeholder="en-US / en" />
);

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

const IpAddressControls: FC<{ ipAddress?: string; onIpAddressChange: (ipAddress: string) => void; }> = (
  { ipAddress, onIpAddressChange },
) => (
  <PlainValueControls value={ipAddress} onValueChange={onIpAddressChange} label="IP address" placeholder="192.168.1.10" />
);

const CountryCodeControls: FC<{ countryCode?: string; onCountryCodeChange: (countryCode: string) => void }> = ({
  countryCode,
  onCountryCodeChange,
}) => {
  const countryCodeId = useId();
  return (
    <div>
      <label htmlFor={countryCodeId}>Country:</label>
      <select
        id={countryCodeId}
        className="form-select"
        value={countryCode}
        onChange={(e) => onCountryCodeChange(e.target.value)}
        required
      >
        {!countryCode && <option value="">- Select country -</option>}
        {Object.entries(countryCodes).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
      </select>
    </div>
  );
};

const CityNameControls: FC<{ cityName?: string; onCityNameChange: (cityName: string) => void; }> = (
  { cityName, onCityNameChange },
) => (
  <PlainValueControls value={cityName} onValueChange={onCityNameChange} label="City name" placeholder="New York" />
);

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
  const supportsIpRedirectCondition = useFeature('ipRedirectCondition');
  const supportsGeolocationRedirectCondition = useFeature('geolocationRedirectCondition');
  const conditionNames = useMemo((): Partial<Record<ShlinkRedirectConditionType, string>> => {
    const conditionNames: Partial<Record<ShlinkRedirectConditionType, string>> = {
      device: 'Device type',
      language: 'Language',
      'query-param': 'Query param',
    };

    if (supportsIpRedirectCondition) {
      conditionNames['ip-address'] = 'IP address';
    }

    if (supportsGeolocationRedirectCondition) {
      conditionNames['geolocation-country-code'] = 'Country (geolocation)';
      conditionNames['geolocation-city-name'] = 'City name (geolocation)';
    }

    return conditionNames;
  }, [supportsGeolocationRedirectCondition, supportsIpRedirectCondition]);

  return (
    <div className="redirect-rule-modal__condition rounded p-3 h-100 d-flex flex-column gap-2 position-relative">
      <div>
        <Button
          outline
          size="sm"
          type="button"
          aria-label="Remove condition"
          onClick={onDelete}
          className="position-absolute rounded-circle redirect-rule-modal__remove-condition-button"
        >
          <FontAwesomeIcon icon={faXmark} className="redirect-rule-modal__remove-condition-button-icon" />
        </Button>
        <label htmlFor={conditionId}>Type:</label>
        <select
          id={conditionId}
          className="form-select flex-grow-1"
          value={condition.type}
          onChange={(e) => switchToType(e.target.value as ShlinkRedirectConditionType)}
        >
          {Object.entries(conditionNames).map(([condition, name]) => (
            <option key={condition} value={condition}>{name}</option>
          ))}
        </select>
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
      {condition.type === 'ip-address' && (
        <IpAddressControls ipAddress={condition.matchValue} onIpAddressChange={setConditionValue} />
      )}
      {condition.type === 'geolocation-country-code' && (
        <CountryCodeControls countryCode={condition.matchValue} onCountryCodeChange={setConditionValue} />
      )}
      {condition.type === 'geolocation-city-name' && (
        <CityNameControls cityName={condition.matchValue} onCityNameChange={setConditionValue} />
      )}
    </div>
  );
};

export type RedirectRuleModalProps = {
  initialData?: ShlinkRedirectRuleData;
  onSave: (redirectRule: ShlinkRedirectRuleData) => void;
  isOpen: boolean;
  toggle: () => void;
};

export const RedirectRuleModal: FC<RedirectRuleModalProps> = ({ isOpen, toggle, onSave, initialData }) => {
  const [redirectRule, setRedirectRule] = useState(initialData ?? { longUrl: '', conditions: [] });
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // When editing, this form is inside other form. Let's prevent the parent to be submit

    if (redirectRule) {
      onSave(redirectRule);
    }
    toggle();
  }, [onSave, redirectRule, toggle]);

  const addDraftCondition = useCallback(() => setRedirectRule(
    ({ longUrl, conditions }) => ({
      longUrl,
      conditions: [...conditions, { type: 'device', matchValue: '', matchKey: null }],
    }),
  ), []);
  const updateCondition = useCallback((index: number, newCondition: ShlinkRedirectCondition) => setRedirectRule(
    ({ longUrl, conditions: prevConditions }) => {
      const conditions = [...prevConditions];
      conditions[index] = newCondition;
      return { longUrl, conditions };
    },
  ), []);
  const removeCondition = useCallback((index: number) => setRedirectRule(
    ({ longUrl, conditions: oldConditions }) => {
      const conditions = [...oldConditions];
      conditions.splice(index, 1);
      return { longUrl, conditions };
    },
  ), []);

  const longUrlRef = useRef<HTMLInputElement>(null);
  const focusLongUrl = useCallback(() => longUrlRef?.current?.focus(), [longUrlRef]);
  const reset = useCallback(() => setRedirectRule(initialData ?? { longUrl: '', conditions: [] }), [initialData]);

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
            value={redirectRule.longUrl}
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
            <Row className="redirect-rule-modal__conditions-row">
              {redirectRule.conditions.map((condition, index) => (
                <div key={`${index}_${condition.type}`} className="col-lg-6 col-xl-4 mt-4">
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
