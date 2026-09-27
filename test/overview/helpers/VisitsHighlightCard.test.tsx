import { MemoryRouter } from 'react-router';
import type { VisitsHighlightCardProps } from '../../../src/overview/helpers/VisitsHighlightCard';
import { VisitsHighlightCard } from '../../../src/overview/helpers/VisitsHighlightCard';
import { checkAccessibility } from '../../__helpers__/accessibility';
import type { RenderWithEventsResult } from '../../__helpers__/setUpTest';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<VisitsHighlightCard />', () => {
  const setUp = (props: Partial<VisitsHighlightCardProps> = {}) =>
    renderWithEvents(
      <MemoryRouter>
        <VisitsHighlightCard
          loading={false}
          visitsSummary={{ total: 0, bots: 0, nonBots: 0 }}
          excludeBots={false}
          title="title"
          link=""
          {...props}
        />
      </MemoryRouter>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [true, (screen: RenderWithEventsResult) => expect.element(screen.getByText('Loading...')).toBeInTheDocument()],
    [false, (screen) => expect.element(screen.getByText('Loading...')).not.toBeInTheDocument()],
  ])('displays loading message on loading', async (loading, assert) => {
    const screen = await setUp({ loading });
    await assert(screen);
  });

  it('does not render tooltip when summary has no bots', async () => {
    const { user, ...screen } = await setUp({ title: 'Foo' });

    await user.hover(screen.getByText('Foo'));
    await expect.element(screen.getByText(/potential bot visits$/)).not.toBeInTheDocument();
  });

  it('renders tooltip when summary has bots', async () => {
    const { user, ...screen } = await setUp({
      title: 'Foo',
      visitsSummary: { total: 50, bots: 1000, nonBots: 0 },
    });

    await user.hover(screen.getByText('Foo'));
    await expect.element(screen.getByTestId('tooltip-amount')).toHaveTextContent('1,000');
    await user.unhover(screen.getByText('Foo'));
  });

  it.each([
    [
      true,
      20,
      async (screen: RenderWithEventsResult) => {
        await expect.element(screen.getByText('20')).toBeInTheDocument();
        await expect.element(screen.getByText('50')).not.toBeInTheDocument();
      },
    ],
    [
      true,
      0,
      async (screen) => {
        await expect.element(screen.getByText('0')).toBeInTheDocument();
        await expect.element(screen.getByText('50')).not.toBeInTheDocument();
      },
    ],
    [
      false,
      20,
      async (screen) => {
        await expect.element(screen.getByText('50')).toBeInTheDocument();
        await expect.element(screen.getByText('20')).not.toBeInTheDocument();
      },
    ],
  ])('displays non-bots when present and bots are excluded', async (excludeBots, nonBots, assert) => {
    const screen = await setUp({
      excludeBots,
      visitsSummary: { total: 50, bots: 0, nonBots },
    });
    await assert(screen);
  });
});
