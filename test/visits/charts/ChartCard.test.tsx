import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ChartCard } from '../../../src/visits/charts/ChartCard';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<ChartCard />', () => {
  const setUp = (title: ReactNode = '', footer?: ReactNode) => render(
    <ChartCard title={title} footer={footer} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('properly renders title by parsing provided value', () => {
    setUp('the title');
    expect(screen.getByText('the title')).toBeInTheDocument();
  });

  it('renders footer only when provided', () => {
    setUp('', 'the footer');
    expect(screen.getByText('the footer')).toBeInTheDocument();
  });
});
