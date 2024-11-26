import type { ShlinkRedirectCondition } from '@shlinkio/shlink-js-sdk/api-contract';
import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { RedirectRuleCardProps } from '../../../src/redirect-rules/helpers/RedirectRuleCard';
import { RedirectRuleCard } from '../../../src/redirect-rules/helpers/RedirectRuleCard';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<RedirectRuleCard />', () => {
  const conditions: ShlinkRedirectCondition[] = [
    { type: 'device', matchValue: 'android', matchKey: null },
    { type: 'language', matchValue: 'es-ES', matchKey: null },
    { type: 'query-param', matchValue: 'bar', matchKey: 'foo' },
    { type: 'ip-address', matchValue: '1.2.3.4', matchKey: null },
    { type: 'geolocation-country-code', matchValue: 'FR', matchKey: null },
    { type: 'geolocation-city-name', matchValue: 'Paris', matchKey: null },
  ];
  const setUp = (props: Partial<RedirectRuleCardProps> = {}) => renderWithEvents(
    <RedirectRuleCard
      {...fromPartial<RedirectRuleCardProps>({
        redirectRule: fromPartial({ conditions: [] }),
        ...props,
      })}
    />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp({
    redirectRule: fromPartial({ conditions }),
  })));

  it('can move the rule up and down', async () => {
    const onMoveUp = vi.fn();
    const onMoveDown = vi.fn();

    const { user } = setUp({ onMoveUp, onMoveDown, priority: 2 });

    await user.click(screen.getByLabelText('Move rule with priority 2 up'));
    expect(onMoveUp).toHaveBeenCalledOnce();

    await user.click(screen.getByLabelText('Move rule with priority 2 down'));
    expect(onMoveDown).toHaveBeenCalledOnce();
  });

  it('disables up and down button for corner rules', () => {
    setUp({ priority: 1, isLast: true });

    expect(screen.getByLabelText('Move rule with priority 1 up')).toBeDisabled();
    expect(screen.getByLabelText('Move rule with priority 1 down')).toBeDisabled();
  });

  it('renders human-friendly conditions', () => {
    setUp({
      redirectRule: fromPartial({ conditions }),
    });

    expect(screen.getByText('Device is android')).toBeInTheDocument();
    expect(screen.getByText('es-ES language is accepted')).toBeInTheDocument();
    expect(screen.getByText('Query string contains foo=bar')).toBeInTheDocument();
    expect(screen.getByText('IP address matches 1.2.3.4')).toBeInTheDocument();
    expect(screen.getByText('Country code is FR')).toBeInTheDocument();
    expect(screen.getByText('City name is Paris')).toBeInTheDocument();
  });

  it('can delete the rule', async () => {
    const onDelete = vi.fn();

    const { user } = setUp({ onDelete, priority: 4 });

    await user.click(screen.getByLabelText('Delete rule with priority 4'));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('opens modal to edit rule', async () => {
    const { user } = setUp({ priority: 3 });

    await user.click(screen.getByLabelText('Edit rule with priority 3'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });
});
