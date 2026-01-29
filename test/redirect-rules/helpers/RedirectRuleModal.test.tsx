import type {
  ShlinkRedirectCondition,
  ShlinkRedirectConditionType,
  ShlinkRedirectRuleData,
} from '@shlinkio/shlink-js-sdk/api-contract';
import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { fromPartial } from '@total-typescript/shoehorn';
import { RedirectRuleModal } from '../../../src/redirect-rules/helpers/RedirectRuleModal';
import { countryCodes } from '../../../src/utils/country-codes';
import { FeaturesProvider } from '../../../src/utils/features';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';
import { TestModalWrapper } from '../../__helpers__/TestModalWrapper';

type SetUpOptions = {
  initialData?: ShlinkRedirectRuleData;
  ipRedirectCondition?: boolean;
  geolocationRedirectCondition?: boolean;
  advancedQueryRedirectConditions?: boolean;
  desktopDeviceTypes?: boolean;
  dateRedirectConditions?: boolean;
};

describe('<RedirectRuleModal />', () => {
  const onSave = vi.fn();
  const setUp = ({
    initialData,
    ipRedirectCondition = true,
    geolocationRedirectCondition = true,
    advancedQueryRedirectConditions = true,
    desktopDeviceTypes = true,
    dateRedirectConditions = true,
  }: SetUpOptions) => renderWithEvents(
    <TestModalWrapper
      renderModal={(args) => (
        <FeaturesProvider
          value={fromPartial({
            ipRedirectCondition,
            geolocationRedirectCondition,
            advancedQueryRedirectConditions,
            desktopDeviceTypes,
            dateRedirectConditions,
          })}
        >
          <RedirectRuleModal {...args} onSave={onSave} initialData={initialData} />
        </FeaturesProvider>
      )}
    />,
  );
  const addConditionWithType = async (user: UserEvent, option: ShlinkRedirectConditionType) => {
    await user.click(screen.getByLabelText('Add condition'));
    const [lastTypeSelect] = screen.getAllByLabelText('Type:').reverse();
    await user.selectOptions(lastTypeSelect, [option]);
  };

  it.each([
    [undefined],
    [{
      longUrl: 'https://example.com',
      conditions: [],
    } satisfies ShlinkRedirectRuleData],
    [{
      longUrl: 'https://example.com',
      conditions: [
        { type: 'device', matchValue: 'android', matchKey: null },
        { type: 'language', matchValue: 'en-US', matchKey: null },
      ],
    } satisfies ShlinkRedirectRuleData],
  ])('passes a11y checks', (initialData) => checkAccessibility(setUp({ initialData })));

  it('can add more conditions', async () => {
    const initialData: ShlinkRedirectRuleData = {
      longUrl: 'https://example.com',
      conditions: [
        { type: 'device', matchValue: 'android', matchKey: null },
        { type: 'language', matchValue: 'en-US', matchKey: null },
      ],
    };
    const { user } = setUp({ initialData });

    expect(screen.getAllByLabelText('Type:')).toHaveLength(2);

    await user.click(screen.getByLabelText('Add condition'));
    expect(screen.getAllByLabelText('Type:')).toHaveLength(3);

    await user.click(screen.getByLabelText('Add condition'));
    await user.click(screen.getByLabelText('Add condition'));
    expect(screen.getAllByLabelText('Type:')).toHaveLength(5);
  });

  it.each([
    [[]],
    [[{ type: 'device', matchValue: 'android', matchKey: null } satisfies ShlinkRedirectCondition]],
  ])('disables confirm button as long as there are no conditions', (conditions) => {
    setUp({
      initialData: { longUrl: 'https://example.com', conditions },
    });

    if (conditions.length === 0) {
      expect(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute('disabled');
    } else {
      expect(screen.getByRole('button', { name: 'Confirm' })).not.toHaveAttribute('disabled');
    }
  });

  it('saves rule when form is submit, and closes modal', async () => {
    const initialData: ShlinkRedirectRuleData = {
      longUrl: 'https://example.com',
      conditions: [
        { type: 'device', matchValue: 'android', matchKey: null },
        { type: 'language', matchValue: 'en-US', matchKey: null },
      ],
    };
    const { user } = setUp({ initialData });

    // Wait for modal to finish opening, otherwise focus may transition to long URL field while some other field is
    // being edited
    await waitFor(() => expect(screen.getByLabelText('Long URL:')).toBeInTheDocument());

    // Change the long URL
    await user.clear(screen.getByLabelText('Long URL:'));
    await user.type(screen.getByLabelText('Long URL:'), 'https://www.example.com/edited');

    // Change device type to ios
    await user.selectOptions(screen.getByLabelText('Device type:'), ['ios']);

    // Add a new condition of type query-param
    await addConditionWithType(user, 'query-param');
    await user.type(screen.getByLabelText('Param name:'), 'the_key');
    await user.type(screen.getByLabelText('Param value:'), 'the_value');

    // Add a new condition of type any-value-query-param
    await addConditionWithType(user, 'any-value-query-param');
    await user.type(screen.getAllByLabelText('Param name:').reverse()[0], 'the_any_value_key');

    // Add a new condition of type valueless-query-param
    await addConditionWithType(user, 'valueless-query-param');
    await user.type(screen.getAllByLabelText('Param name:').reverse()[0], 'the_valueless_key');

    // Remove the existing language condition
    await user.click(screen.getAllByLabelText('Remove condition')[1]);

    // Add a new condition of type language
    await addConditionWithType(user, 'language');
    await user.type(screen.getByLabelText('Language:'), 'es-ES');

    // Add a new condition of type ip-address
    await addConditionWithType(user, 'ip-address');
    await user.type(screen.getByLabelText('IP address:'), '192.168.1.*');

    // Add a new condition of type geolocation-country-code
    await addConditionWithType(user, 'geolocation-country-code');
    await user.selectOptions(screen.getByLabelText('Country:'), [countryCodes.CL]);

    // Add a new condition of type geolocation-city-name
    await addConditionWithType(user, 'geolocation-city-name');
    await user.type(screen.getByLabelText('City name:'), 'Los Angeles');

    // Add a new condition of type before-date
    await addConditionWithType(user, 'before-date');
    await user.type(screen.getByLabelText('Before:'), '2025-01-01 10:00');

    // Add a new condition of type after-date
    await addConditionWithType(user, 'after-date');
    await user.type(screen.getByLabelText('After:'), '2035-01-01 10:00');

    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onSave).toHaveBeenCalledWith({
      longUrl: 'https://www.example.com/edited',
      conditions: [
        { type: 'device', matchValue: 'ios', matchKey: null },
        { type: 'query-param', matchValue: 'the_value', matchKey: 'the_key' },
        { type: 'any-value-query-param', matchValue: null, matchKey: 'the_any_value_key' },
        { type: 'valueless-query-param', matchValue: null, matchKey: 'the_valueless_key' },
        { type: 'language', matchValue: 'es-ES', matchKey: null },
        { type: 'ip-address', matchValue: '192.168.1.*', matchKey: null },
        { type: 'geolocation-country-code', matchValue: 'CL', matchKey: null },
        { type: 'geolocation-city-name', matchValue: 'Los Angeles', matchKey: null },
        { type: 'before-date', matchValue: '2025-01-01T10:00:00Z', matchKey: null },
        { type: 'after-date', matchValue: '2035-01-01T10:00:00Z', matchKey: null },
      ],
    });

    // After form is submit, the modal itself is closed
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it.each([
    {
      ipRedirectCondition: false,
      geolocationRedirectCondition: false,
      advancedQueryRedirectConditions: false,
      dateRedirectConditions: false,
      expectedOptions: ['Device', 'Language', 'Query param'] as const,
    },
    {
      ipRedirectCondition: true,
      geolocationRedirectCondition: false,
      advancedQueryRedirectConditions: false,
      dateRedirectConditions: false,
      expectedOptions: ['Device', 'Language', 'Query param', 'IP address'] as const,
    },
    {
      ipRedirectCondition: true,
      geolocationRedirectCondition: true,
      advancedQueryRedirectConditions: false,
      dateRedirectConditions: false,
      expectedOptions: [
        'Device',
        'Language',
        'Query param',
        'IP address',
        'Country (geolocation)',
        'City name (geolocation)',
      ] as const,
    },
    {
      ipRedirectCondition: true,
      geolocationRedirectCondition: true,
      advancedQueryRedirectConditions: true,
      dateRedirectConditions: false,
      expectedOptions: [
        'Device',
        'Language',
        'Query param',
        'Any value query param',
        'Valueless query param',
        'IP address',
        'Country (geolocation)',
        'City name (geolocation)',
      ] as const,
    },
    {
      ipRedirectCondition: true,
      geolocationRedirectCondition: true,
      advancedQueryRedirectConditions: true,
      dateRedirectConditions: true,
      expectedOptions: [
        'Device',
        'Language',
        'Query param',
        'Any value query param',
        'Valueless query param',
        'IP address',
        'Country (geolocation)',
        'City name (geolocation)',
        'Before date',
        'After date',
      ] as const,
    },
  ])('displays only supported options', async ({ expectedOptions, ...features }) => {
    const { user } = setUp({ ...features });

    // Add a condition box, with a type other than device-type (default one), so that device type options do not affect
    // assertions and cause false negatives
    await addConditionWithType(user, 'language');
    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(expectedOptions.length);
    options.forEach((option, index) => {
      expect(option).toHaveTextContent(expectedOptions[index]);
    });
  });

  it.each([
    {
      desktopDeviceTypes: false,
      expectedOptions: ['- Select type -', 'Android', 'iOS', 'Any desktop device'],
    },
    {
      desktopDeviceTypes: true,
      expectedOptions: [
        '- Select type -',
        'Android',
        'iOS',
        'Any mobile device',
        'Windows',
        'MacOS',
        'Linux',
        'ChromeOS',
        'Any desktop device',
      ],
    },
  ])('displays only supported device types', async ({ desktopDeviceTypes, expectedOptions }) => {
    const { user } = setUp({ desktopDeviceTypes });

    await addConditionWithType(user, 'device');
    const options = screen.getByLabelText('Device type:').querySelectorAll('option');

    expect(options).toHaveLength(expectedOptions.length);
    options.forEach((option, index) => {
      expect(option).toHaveTextContent(expectedOptions[index]);
    });
  });
});
