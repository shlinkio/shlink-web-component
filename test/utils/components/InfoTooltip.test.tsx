import type { Placement } from '@popperjs/core';
import { screen, waitFor } from '@testing-library/react';
import type { InfoTooltipProps } from '../../../src/utils/components/InfoTooltip';
import { InfoTooltip } from '../../../src/utils/components/InfoTooltip';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<InfoTooltip />', () => {
  const setUp = (props: Partial<InfoTooltipProps> = {}) => renderWithEvents(
    <InfoTooltip placement="right" {...props} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [undefined],
    ['foo'],
    ['bar'],
  ])('renders expected className on span', (className) => {
    const { container } = setUp({ className });

    if (className) {
      expect(container.firstChild).toHaveClass(className);
    } else {
      expect(container.firstChild).toHaveAttribute('class', '');
    }
  });

  it.each([
    [<span key={1}>foo</span>, 'foo'],
    ['Foo', 'Foo'],
    ['Hello', 'Hello'],
    [['One', 'Two', <span key={3} />], 'OneTwo'],
  ])('passes children down to the nested tooltip component', async (children, expectedContent) => {
    const { container, user } = setUp({ children });
    const element = container.firstElementChild;
    if (!element) {
      throw new Error('Element not found');
    }

    await user.hover(element);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    expect(screen.getByRole('tooltip')).toHaveTextContent(expectedContent);

    await user.unhover(element);
  });

  it.each([
    ['right' as Placement],
    ['left' as Placement],
    ['top' as Placement],
    ['bottom' as Placement],
  ])('places tooltip where requested', async (placement) => {
    const { container, user } = setUp({ placement });

    if (container.firstElementChild) {
      await user.hover(container.firstElementChild);
    }
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    expect(screen.getByRole('tooltip').parentNode).toHaveAttribute('data-popper-placement', placement);
  });
});
