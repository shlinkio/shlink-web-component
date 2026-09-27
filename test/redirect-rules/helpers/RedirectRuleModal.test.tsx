import type {
  ShlinkRedirectCondition,
  ShlinkRedirectConditionType,
  ShlinkRedirectRuleData,
} from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import { RedirectRuleModal } from '../../../src/redirect-rules/helpers/RedirectRuleModal';
import { countryCodes } from '../../../src/utils/country-codes';
import { FeaturesProvider } from '../../../src/utils/features';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { setNativeInputValue } from '../../__helpers__/input';
import type { RenderWithEventsResult } from '../../__helpers__/setUpTest';
import { renderWithEvents } from '../../__helpers__/setUpTest';
import { TestModalWrapper } from '../../__helpers__/TestModalWrapper';

type SetUpOptions = {
  initialData?: ShlinkRedirectRuleData;
  ipRedirectCondition?: boolean;
  geolocationRedirectCondition?: boolean;
  advancedQueryRedirectConditions?: boolean;
  desktopDeviceTypes?: boolean;
  dateRedirectConditions?: boolean;
  browserRedirectConditions?: boolean;
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
    browserRedirectConditions = true,
  }: SetUpOptions) =>
    renderWithEvents(
      <TestModalWrapper
        renderModal={(args) => (
          <FeaturesProvider
            value={fromPartial({
              ipRedirectCondition,
              geolocationRedirectCondition,
              advancedQueryRedirectConditions,
              desktopDeviceTypes,
              dateRedirectConditions,
              browserRedirectConditions,
            })}
          >
            <RedirectRuleModal {...args} onSave={onSave} initialData={initialData} />
          </FeaturesProvider>
        )}
      />,
    );
  const addConditionWithType = async (
    { user, ...screen }: RenderWithEventsResult,
    option: ShlinkRedirectConditionType,
  ) => {
    await user.click(screen.getByLabelText('Add condition'));
    const [lastTypeSelect] = screen.getByLabelText('Type:').all().reverse();
    await user.selectOptions(lastTypeSelect, [option]);
  };

  it.each([
    [undefined],
    [
      {
        longUrl: 'https://example.com',
        conditions: [],
      } satisfies ShlinkRedirectRuleData,
    ],
    [
      {
        longUrl: 'https://example.com',
        conditions: [
          { type: 'device', matchValue: 'android', matchKey: null },
          { type: 'language', matchValue: 'en-US', matchKey: null },
        ],
      } satisfies ShlinkRedirectRuleData,
    ],
  ])('passes a11y checks', (initialData) => checkAccessibility(setUp({ initialData })));

  it('can add more conditions', async () => {
    const initialData: ShlinkRedirectRuleData = {
      longUrl: 'https://example.com',
      conditions: [
        { type: 'device', matchValue: 'android', matchKey: null },
        { type: 'language', matchValue: 'en-US', matchKey: null },
      ],
    };
    const { user, ...screen } = await setUp({ initialData });

    expect(screen.getByLabelText('Type:').all()).toHaveLength(2);

    await user.click(screen.getByLabelText('Add condition'));
    expect(screen.getByLabelText('Type:').all()).toHaveLength(3);

    await user.click(screen.getByLabelText('Add condition'));
    await user.click(screen.getByLabelText('Add condition'));
    expect(screen.getByLabelText('Type:').all()).toHaveLength(5);
  });

  it.each([[[]], [[{ type: 'device', matchValue: 'android', matchKey: null } satisfies ShlinkRedirectCondition]]])(
    'disables confirm button as long as there are no conditions',
    async (conditions) => {
      const screen = await setUp({
        initialData: { longUrl: 'https://example.com', conditions },
      });

      if (conditions.length === 0) {
        await expect.element(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute('disabled');
      } else {
        await expect.element(screen.getByRole('button', { name: 'Confirm' })).not.toHaveAttribute('disabled');
      }
    },
  );

  it('saves rule when form is submit, and closes modal', async () => {
    const initialData: ShlinkRedirectRuleData = {
      longUrl: 'https://example.com',
      conditions: [
        { type: 'device', matchValue: 'android', matchKey: null },
        { type: 'language', matchValue: 'en-US', matchKey: null },
      ],
    };
    const renderResult = await setUp({ initialData });
    const { user, ...screen } = renderResult;

    // Wait for modal to finish opening, otherwise focus may transition to long URL field while some other field is
    // being edited
    await screen.getByLabelText('Long URL:').findElement();

    // Change the long URL
    await user.clear(screen.getByLabelText('Long URL:'));
    await user.type(screen.getByLabelText('Long URL:'), 'https://www.example.com/edited');

    // Change device type to ios
    await user.selectOptions(screen.getByLabelText('Device type:'), ['ios']);

    // Add a new condition of type query-param
    await addConditionWithType(renderResult, 'query-param');
    await user.type(screen.getByLabelText('Param name:'), 'the_key');
    await user.type(screen.getByLabelText('Param value:'), 'the_value');

    // Add a new condition of type any-value-query-param
    await addConditionWithType(renderResult, 'any-value-query-param');
    await user.type(screen.getByLabelText('Param name:').all().reverse()[0], 'the_any_value_key');

    // Add a new condition of type valueless-query-param
    await addConditionWithType(renderResult, 'valueless-query-param');
    await user.type(screen.getByLabelText('Param name:').all().reverse()[0], 'the_valueless_key');

    // Remove the existing language condition
    await user.click(screen.getByLabelText('Remove condition').all()[1]);

    // Add a new condition of type language
    await addConditionWithType(renderResult, 'language');
    await user.type(screen.getByLabelText('Language:'), 'es-ES');

    // Add a new condition of type ip-address
    await addConditionWithType(renderResult, 'ip-address');
    await user.type(screen.getByLabelText('IP address:'), '192.168.1.*');

    // Add a new condition of type geolocation-country-code
    await addConditionWithType(renderResult, 'geolocation-country-code');
    await user.selectOptions(screen.getByLabelText('Country:'), [countryCodes.CL]);

    // Add a new condition of type geolocation-city-name
    await addConditionWithType(renderResult, 'geolocation-city-name');
    await user.type(screen.getByLabelText('City name:'), 'Los Angeles');

    // Add a new condition of type before-date
    await addConditionWithType(renderResult, 'before-date');
    setNativeInputValue(screen.getByLabelText('Before:').element() as HTMLInputElement, '2025-01-01 10:00');

    // // Add a new condition of type after-date
    await addConditionWithType(renderResult, 'after-date');
    setNativeInputValue(screen.getByLabelText('After:').element() as HTMLInputElement, '2035-01-01 10:00');

    // Add a new condition of type browser
    await addConditionWithType(renderResult, 'browser');
    await user.selectOptions(screen.getByLabelText('Browser:'), ['firefox']);

    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await expect
      .poll(() => onSave)
      .toHaveBeenCalledWith({
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
          { type: 'browser', matchValue: 'firefox', matchKey: null },
        ],
      });

    // After form is submit, the modal itself should be closed
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([
    {
      ipRedirectCondition: false,
      geolocationRedirectCondition: false,
      advancedQueryRedirectConditions: false,
      dateRedirectConditions: false,
      browserRedirectConditions: false,
      expectedOptions: ['Device type', 'Language', 'Query param'] as const,
    },
    {
      ipRedirectCondition: true,
      geolocationRedirectCondition: false,
      advancedQueryRedirectConditions: false,
      dateRedirectConditions: false,
      browserRedirectConditions: false,
      expectedOptions: ['Device type', 'Language', 'Query param', 'IP address'] as const,
    },
    {
      ipRedirectCondition: true,
      geolocationRedirectCondition: true,
      advancedQueryRedirectConditions: false,
      dateRedirectConditions: false,
      browserRedirectConditions: false,
      expectedOptions: [
        'Device type',
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
      browserRedirectConditions: false,
      expectedOptions: [
        'Device type',
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
      dateRedirectConditions: false,
      browserRedirectConditions: true,
      expectedOptions: [
        'Device type',
        'Language',
        'Query param',
        'Any value query param',
        'Valueless query param',
        'IP address',
        'Country (geolocation)',
        'City name (geolocation)',
        'Browser',
      ] as const,
    },
    {
      ipRedirectCondition: true,
      geolocationRedirectCondition: true,
      advancedQueryRedirectConditions: true,
      dateRedirectConditions: true,
      browserRedirectConditions: false,
      expectedOptions: [
        'Device type',
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
    const { user, ...screen } = await setUp({ ...features });

    // Add a condition box, with a type other than device-type (default one), so that device type options do not affect
    // assertions and cause false negatives
    await addConditionWithType({ user, ...screen }, 'language');
    const options = screen.getByRole('option').all();

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
    const { user, ...screen } = await setUp({ desktopDeviceTypes });

    await addConditionWithType({ user, ...screen }, 'device');
    const options = [...screen.getByLabelText('Device type:').element().querySelectorAll('option')];

    expect(options).toHaveLength(expectedOptions.length);
    await Promise.all(options.map((option, index) => expect.element(option).toHaveTextContent(expectedOptions[index])));
  });
});
