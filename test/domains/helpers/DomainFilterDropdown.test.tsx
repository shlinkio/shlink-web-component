import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { DEFAULT_DOMAIN } from '../../../src/domains/data';
import type { DomainFilterDropdownProps } from '../../../src/domains/helpers/DomainFilterDropdown';
import { DomainFilterDropdown } from '../../../src/domains/helpers/DomainFilterDropdown';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<DomainFilterDropdown />', () => {
  const onChange = vi.fn();

  const setUp = ({
    domains = [
      fromPartial({ isDefault: true, domain: 'example.com' }),
      fromPartial({ domain: 's.test' }),
    ],
    value,
  }: Partial<Omit<DomainFilterDropdownProps, 'onChange'>> = {}) => renderWithEvents(
    <DomainFilterDropdown onChange={onChange} domains={domains} value={value} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('disables button when list of domains is empty', () => {
    setUp({ domains: [] });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it.each([
    { name: 'All domains', value: 's.test', expectedNewDomain: undefined },
    { name: /^example.com/, expectedNewDomain: DEFAULT_DOMAIN },
    { name: 's.test', expectedNewDomain: 's.test' },
  ])('selects expected domain when an item is clicked', async ({ name, value, expectedNewDomain }) => {
    const { user } = setUp({ value });

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('menuitem', { name }));

    expect(onChange).toHaveBeenCalledWith(expectedNewDomain);
  });

  it('does not trigger onChange when already selected domain is clicked', async () => {
    const { user } = setUp();

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('menuitem', { name: 'All domains' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it.each([
    { selectedDomain: DEFAULT_DOMAIN, expectedText: 'example.com' },
    { selectedDomain: 's.test', expectedText: 's.test' },
  ])(`displays default domain name when value is ${DEFAULT_DOMAIN}`, ({ selectedDomain, expectedText }) => {
    setUp({ value: selectedDomain });
    expect(screen.getByRole('button')).toHaveTextContent(`Domain: ${expectedText}`);
  });
});
