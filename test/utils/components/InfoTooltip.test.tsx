import type { InfoTooltipProps } from '../../../src/utils/components/InfoTooltip';
import { InfoTooltip } from '../../../src/utils/components/InfoTooltip';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<InfoTooltip />', () => {
  const setUp = (props: Partial<InfoTooltipProps> = {}) =>
    renderWithEvents(<InfoTooltip placement="right" {...props} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([[undefined], ['foo'], ['bar']])('renders expected className on span', async (className) => {
    const { container } = await setUp({ className });

    if (className) {
      await expect.element(container.firstChild as HTMLElement).toHaveClass(className);
    } else {
      await expect.element(container.firstChild as HTMLElement).not.toHaveAttribute('class');
    }
  });

  it.each([
    [<span key={1}>foo</span>, 'foo'],
    ['Foo', 'Foo'],
    ['Hello', 'Hello'],
    [['One', 'Two', <span key={3} />], 'OneTwo'],
  ])('passes children down to the nested tooltip component', async (children, expectedContent) => {
    const { user, ...screen } = await setUp({ children });
    const anchor = screen.getByTestId('tooltip-anchor');

    await user.hover(anchor);
    const tooltip = await screen.getByRole('tooltip').findElement();

    await expect.element(tooltip).toMatchTextContent(expectedContent);
    await user.unhover(anchor);
    await expect.element(tooltip).not.toBeInTheDocument();
  });

  it.each([['right' as const], ['left' as const], ['top' as const], ['bottom' as const]])(
    'places tooltip where requested',
    async (placement) => {
      const { user, ...screen } = await setUp({ placement });
      const anchor = screen.getByTestId('tooltip-anchor');

      await user.hover(anchor);
      await expect.element(screen.getByRole('tooltip')).toBeInTheDocument();

      await expect.element(anchor).toHaveAttribute('data-placement', placement);

      await user.unhover(anchor);
      await expect.element(screen.getByRole('tooltip')).not.toBeInTheDocument();
    },
  );
});
