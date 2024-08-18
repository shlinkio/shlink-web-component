import type {
  ShlinkRedirectCondition,
  ShlinkRedirectConditionType,
  ShlinkRedirectRuleData,
} from '@shlinkio/shlink-js-sdk/api-contract';
import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { RedirectRuleModal } from '../../../src/redirect-rules/helpers/RedirectRuleModal';
import { FeaturesProvider } from '../../../src/utils/features';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';
import { TestModalWrapper } from '../../__helpers__/TestModalWrapper';

describe('<RedirectRuleModal />', () => {
  const onSave = vi.fn();
  const setUp = (initialData?: ShlinkRedirectRuleData) => renderWithEvents(
    <TestModalWrapper
      renderModal={(args) => (
        <FeaturesProvider value={fromPartial({ ipRedirectCondition: true })}>
          <RedirectRuleModal {...args} onSave={onSave} initialData={initialData} />
        </FeaturesProvider>
      )}
    />,
  );

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
  ])('passes a11y checks', (initialData) => checkAccessibility(setUp(initialData)));

  it('can add more conditions', async () => {
    const { user } = setUp({
      longUrl: 'https://example.com',
      conditions: [
        { type: 'device', matchValue: 'android', matchKey: null },
        { type: 'language', matchValue: 'en-US', matchKey: null },
      ],
    });

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
    setUp({ longUrl: 'https://example.com', conditions });

    if (conditions.length === 0) {
      expect(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute('disabled');
    } else {
      expect(screen.getByRole('button', { name: 'Confirm' })).not.toHaveAttribute('disabled');
    }
  });

  it('saves rule when form is submit, and closes modal', async () => {
    const initialRule: ShlinkRedirectRuleData = {
      longUrl: 'https://example.com',
      conditions: [
        { type: 'device', matchValue: 'android', matchKey: null },
        { type: 'language', matchValue: 'en-US', matchKey: null },
      ],
    };
    const { user } = setUp(initialRule);
    const changeConditionType = async (option: ShlinkRedirectConditionType) => {
      await user.click(screen.getByLabelText('Add condition'));
      await user.selectOptions(screen.getAllByLabelText('Type:')[2], [option]);
    };

    // Wait for modal to finish opening, otherwise focus may transition to long URL field while some other field is
    // being edited
    await waitFor(() => expect(screen.getByLabelText('Long URL:')).toHaveFocus());

    // Change the long URL
    await user.clear(screen.getByLabelText('Long URL:'));
    await user.type(screen.getByLabelText('Long URL:'), 'https://www.example.com/edited');

    // Change device type to ios
    await user.selectOptions(screen.getByLabelText('Device type:'), ['ios']);

    // Add a new condition of type query-param
    await changeConditionType('query-param');
    await user.type(screen.getByLabelText('Param name:'), 'the_key');
    await user.type(screen.getByLabelText('Param value:'), 'the_value');

    // Remove the existing language condition
    await user.click(screen.getAllByLabelText('Remove condition')[1]);

    // Add a new condition of type ip-address
    await changeConditionType('ip-address');
    await user.type(screen.getByLabelText('IP address:'), '192.168.1.*');

    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    console.log(onSave.mock.lastCall);

    expect(onSave).toHaveBeenCalledWith({
      longUrl: 'https://www.example.com/edited',
      conditions: [
        { type: 'device', matchValue: 'ios', matchKey: null },
        { type: 'query-param', matchValue: 'the_value', matchKey: 'the_key' },
        { type: 'ip-address', matchValue: '192.168.1.*', matchKey: null },
      ],
    });

    // After form is submit, the modal itself is closed
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
