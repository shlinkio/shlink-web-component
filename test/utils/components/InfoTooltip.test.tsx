import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
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
      expect(container.firstChild).not.toHaveAttribute('class');
    }
  });

  it.each([
    [<span key={1}>foo</span>, 'foo'],
    ['Foo', 'Foo'],
    ['Hello', 'Hello'],
    [['One', 'Two', <span key={3} />], 'OneTwo'],
  ])('passes children down to the nested tooltip component', async (children, expectedContent) => {
    const { user } = setUp({ children });
    const anchor = screen.getByTestId('tooltip-anchor');

    await user.hover(anchor);
    const tooltip = await screen.findByRole('tooltip');

    expect(tooltip).toHaveTextContent(expectedContent);

    await user.unhover(anchor);
    await waitForElementToBeRemoved(tooltip);
  });

  it.each([
    ['right' as const],
    ['left' as const],
    ['top' as const],
    ['bottom' as const],
  ])('places tooltip where requested', async (placement) => {
    const { user } = setUp({ placement });
    const anchor = screen.getByTestId('tooltip-anchor');

    await user.hover(anchor);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());

    expect(anchor).toHaveAttribute('data-placement', placement);

    await user.unhover(anchor);
    await waitForElementToBeRemoved(screen.getByRole('tooltip'));
  });
});
