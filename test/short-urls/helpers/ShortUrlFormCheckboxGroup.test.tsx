import { render } from '@testing-library/react';
import type { ShortUrlFormCheckboxGroupProps } from '../../../src/short-urls/helpers/ShortUrlFormCheckboxGroup';
import { ShortUrlFormCheckboxGroup } from '../../../src/short-urls/helpers/ShortUrlFormCheckboxGroup';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<ShortUrlFormCheckboxGroup />', () => {
  const setUp = (props: Omit<ShortUrlFormCheckboxGroupProps, 'infoTooltip'> = {}) => render(
    <ShortUrlFormCheckboxGroup infoTooltip="This is the tooltip" {...props} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp({ children: 'A checkbox' })));
});
