import type { ReactNode } from 'react';
import { ChartCard } from '../../../src/visits/charts/ChartCard';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { render } from '../../__helpers__/setUpTest';

describe('<ChartCard />', () => {
  const setUp = (title: ReactNode = '', footer?: ReactNode) => render(<ChartCard title={title} footer={footer} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('properly renders title by parsing provided value', async () => {
    const screen = await setUp('the title');
    await expect.element(screen.getByText('the title')).toBeInTheDocument();
  });

  it('renders footer only when provided', async () => {
    const screen = await setUp('', 'the footer');
    await expect.element(screen.getByText('the footer')).toBeInTheDocument();
  });
});
