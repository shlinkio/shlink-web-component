import { render, screen } from '@testing-library/react';
import { VisitsSectionWithFallback } from '../../../src/visits/helpers/VisitsSectionWithFallback';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<VisitsSectionWithFallback />', () => {
  const setUp = (showFallback: boolean) => render(
    <VisitsSectionWithFallback showFallback={showFallback}>The children</VisitsSectionWithFallback>,
  );

  it.each([[true], [false]])('passes a11y checks', (showFallback) => checkAccessibility(setUp(showFallback)));

  it.each([[true], [false]])('shows expected content', (showFallback) => {
    setUp(showFallback);

    if (showFallback) {
      expect(screen.getByText('There are no visits matching current filter')).toBeInTheDocument();
      expect(screen.queryByText('The children')).not.toBeInTheDocument();
    } else {
      expect(screen.getByText('The children')).toBeInTheDocument();
      expect(screen.queryByText('There are no visits matching current filter')).not.toBeInTheDocument();
    }
  });
});
