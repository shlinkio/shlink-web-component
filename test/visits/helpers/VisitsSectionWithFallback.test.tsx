import { VisitsSectionWithFallback } from '../../../src/visits/helpers/VisitsSectionWithFallback';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { render } from '../../__helpers__/setUpTest';

describe('<VisitsSectionWithFallback />', () => {
  const setUp = (showFallback: boolean) =>
    render(<VisitsSectionWithFallback showFallback={showFallback}>The children</VisitsSectionWithFallback>);

  it.each([[true], [false]])('passes a11y checks', (showFallback) => checkAccessibility(setUp(showFallback)));

  it.each([[true], [false]])('shows expected content', async (showFallback) => {
    const screen = await setUp(showFallback);

    if (showFallback) {
      await Promise.all([
        expect.element(screen.getByText('There are no visits matching current filter')).toBeInTheDocument(),
        expect.element(screen.getByText('The children')).not.toBeInTheDocument(),
      ]);
    } else {
      await Promise.all([
        expect.element(screen.getByText('The children')).toBeInTheDocument(),
        expect.element(screen.getByText('There are no visits matching current filter')).not.toBeInTheDocument(),
      ]);
    }
  });
});
