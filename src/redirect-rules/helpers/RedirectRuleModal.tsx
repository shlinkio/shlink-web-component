import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, CardModal, LabelledInput, LabelledSelect } from '@shlinkio/shlink-frontend-kit';
import type {
  ShlinkRedirectCondition,
  ShlinkRedirectConditionType,
  ShlinkRedirectRuleData,
} from '@shlinkio/shlink-js-sdk/api-contract';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { useCallback, useEffect , useMemo, useRef, useState } from 'react';
import { countryCodes } from '../../utils/country-codes';
import { useFeature } from '../../utils/features';

const deviceNames = {
  android: 'Android',
  ios: 'iOS',
  desktop: 'Desktop',
} as const satisfies Record<string, string>;

type DeviceType = keyof typeof deviceNames;

const DeviceTypeControls: FC<{ deviceType: string | null; onDeviceTypeChange: (deviceType: DeviceType) => void }> = ({
  deviceType,
  onDeviceTypeChange,
}) => (
  <LabelledSelect
    label="Device type:"
    value={deviceType ?? undefined}
    onChange={(e) => onDeviceTypeChange((e.target as HTMLSelectElement).value as DeviceType)}
    hiddenRequired
  >
    {!deviceType && <option value="">- Select type -</option>}
    {Object.entries(deviceNames).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
  </LabelledSelect>
);

const PlainValueControls: FC<{
  value: string | null;
  onValueChange: (newValue: string) => void;
  label: string;
  placeholder: string;
}> = ({
  value,
  onValueChange,
  label,
  placeholder,
}) => (
  <LabelledInput
    label={`${label}:`}
    value={value ?? ''}
    onChange={(e) => onValueChange(e.target.value)}
    placeholder={placeholder}
    hiddenRequired
  />
);

const LanguageControls: FC<{ language: string | null; onLanguageChange: (lang: string) => void; }> = ({
  language,
  onLanguageChange,
}) => (
  <PlainValueControls value={language} onValueChange={onLanguageChange} label="Language" placeholder="en-US / en" />
);

const QueryParamControls: FC<{
  name: string | null;
  value?: string | null;
  onValueChange: (value: string) => void;
  onNameChange: (value: string) => void;
}> = ({
  name,
  value,
  onNameChange,
  onValueChange,
}) => (
  <>
    <LabelledInput
      label="Param name:"
      value={name ?? ''}
      onChange={(e) => onNameChange(e.target.value)}
      placeholder="hello"
      hiddenRequired
    />
    {typeof value === 'string' && (
      <LabelledInput
        label="Param value:"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="world"
        hiddenRequired
      />
    )}
  </>
);

const IpAddressControls: FC<{ ipAddress: string | null; onIpAddressChange: (ipAddress: string) => void; }> = (
  { ipAddress, onIpAddressChange },
) => (
  <PlainValueControls value={ipAddress} onValueChange={onIpAddressChange} label="IP address" placeholder="192.168.1.10" />
);

const CountryCodeControls: FC<{ countryCode: string | null; onCountryCodeChange: (countryCode: string) => void }> = ({
  countryCode,
  onCountryCodeChange,
}) => (
  <LabelledSelect
    label="Country:"
    value={countryCode ?? undefined}
    onChange={(e) => onCountryCodeChange((e.target as HTMLSelectElement).value)}
    hiddenRequired
  >
    {!countryCode && <option value="">- Select country -</option>}
    {Object.entries(countryCodes).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
  </LabelledSelect>
);

const CityNameControls: FC<{ cityName: string | null; onCityNameChange: (cityName: string) => void; }> = (
  { cityName, onCityNameChange },
) => (
  <PlainValueControls value={cityName} onValueChange={onCityNameChange} label="City name" placeholder="New York" />
);

const Condition: FC<{
  condition: ShlinkRedirectCondition;
  onConditionChange: (condition: ShlinkRedirectCondition) => void;
  onDelete: () => void;
}> = ({ condition, onConditionChange, onDelete }) => {
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
  const supportsAdvancedQueryConditions = useFeature('advancedQueryRedirectConditions');
  const conditionNames = useMemo((): Partial<Record<ShlinkRedirectConditionType, string>> => {
    const conditionNames: Partial<Record<ShlinkRedirectConditionType, string>> = {
      device: 'Device type',
      language: 'Language',
      'query-param': 'Query param',
    };

    if (supportsAdvancedQueryConditions) {
      conditionNames['any-value-query-param'] = 'Any value query param';
      conditionNames['valueless-query-param'] = 'Valueless query param';
    }

    if (supportsIpRedirectCondition) {
      conditionNames['ip-address'] = 'IP address';
    }

    if (supportsGeolocationRedirectCondition) {
      conditionNames['geolocation-country-code'] = 'Country (geolocation)';
      conditionNames['geolocation-city-name'] = 'City name (geolocation)';
    }

    return conditionNames;
  }, [supportsAdvancedQueryConditions, supportsGeolocationRedirectCondition, supportsIpRedirectCondition]);

  return (
    <div className={clsx(
      'flex flex-col gap-2',
      'border border-lm-border dark:border-dm-border',
      'rounded-md relative p-4 h-full',
    )}>
      <div>
        <Button
          variant="secondary"
          aria-label="Remove condition"
          onClick={onDelete}
          className={clsx(
            'absolute -top-3.5 -right-3.5 [&]:px-2',
            '[&]:rounded-full bg-lm-primary dark:bg-dm-primary',
          )}
        >
          <FontAwesomeIcon icon={faXmark} />
        </Button>
        <LabelledSelect
          label="Type:"
          value={condition.type}
          onChange={(e) => switchToType((e.target as HTMLSelectElement).value as ShlinkRedirectConditionType)}
          hiddenRequired
        >
          {Object.entries(conditionNames).map(([condition, name]) => (
            <option key={condition} value={condition}>{name}</option>
          ))}
        </LabelledSelect>
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
      {condition.type === 'any-value-query-param' && (
        <QueryParamControls
          name={condition.matchKey}
          onNameChange={setConditionKey}
          onValueChange={setConditionValue}
        />
      )}
      {condition.type === 'valueless-query-param' && (
        <QueryParamControls
          name={condition.matchKey}
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
  onClose: () => void;
};

export const RedirectRuleModal: FC<RedirectRuleModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [redirectRule, setRedirectRule] = useState(initialData ?? { longUrl: '', conditions: [] });
  const save = useCallback(() => {
    if (redirectRule) {
      onSave(redirectRule);
    }
    onClose();
  }, [onSave, redirectRule, onClose]);

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
  const reset = useCallback(() => setRedirectRule(initialData ?? { longUrl: '', conditions: [] }), [initialData]);

  // Focus URL input as soon as it's added to the DOM
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (longUrlRef.current && isOpen) {
        longUrlRef.current.focus();
        observer.disconnect(); // Stop observing until the modal is open again
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isOpen]);

  return (
    <CardModal
      size="xl"
      title="Redirect rule"
      open={isOpen}
      onClose={onClose}
      onClosed={reset}
      onConfirm={save}
      confirmDisabled={redirectRule.conditions.length === 0}
      confirmText="Confirm"
    >
      <LabelledInput
        label="Long URL:"
        type="url"
        placeholder="https://www.example.com"
        value={redirectRule.longUrl}
        onChange={(e) => setRedirectRule((prev) => ({ ...prev, longUrl: e.target.value }))}
        hiddenRequired
        ref={longUrlRef}
      />

      <hr />

      <div className="flex justify-between">
        <b>Conditions:</b>
        <Button className="[&]:px-1.5" variant="secondary" aria-label="Add condition" onClick={addDraftCondition}>
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>
      {redirectRule.conditions.length === 0 && <div className="text-center"><i>Add conditions...</i></div>}
      {redirectRule.conditions.length > 0 && (
        <div className="pr-3 mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {redirectRule.conditions.map((condition, index) => (
            <Condition
              key={`${index}_${condition.type}`}
              condition={condition}
              onConditionChange={(c) => updateCondition(index, c)}
              onDelete={() => removeCondition(index)}
            />
          ))}
        </div>
      )}
    </CardModal>
  );
};
