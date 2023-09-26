import { render, screen } from '@testing-library/react';
import type {
  ShortUrlFormCheckboxGroupProps,
} from '../../../src/short-urls/helpers/ShortUrlFormCheckboxGroup';
import {
  ShortUrlFormCheckboxGroup,
} from '../../../src/short-urls/helpers/ShortUrlFormCheckboxGroup';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<ShortUrlFormCheckboxGroup />', () => {
  const setUp = (props: ShortUrlFormCheckboxGroupProps = {}) => render(<ShortUrlFormCheckboxGroup {...props} />);

  it.each([
    [undefined],
    ['This is the tooltip'],
  ])('passes a11y checks', (infoTooltip) => checkAccessibility(setUp({ infoTooltip, children: 'A checkbox' })));

  it.each([
    [undefined, '', 0],
    ['This is the tooltip', 'me-2', 1],
  ])('renders tooltip only when provided', (infoTooltip, expectedClassName, expectedAmountOfTooltips) => {
    setUp({ infoTooltip });

    expect(screen.getByRole('checkbox').parentNode).toHaveAttribute(
      'class',
      expect.stringContaining(expectedClassName),
    );
    expect(screen.queryAllByRole('img', { hidden: true })).toHaveLength(expectedAmountOfTooltips);
  });
});
