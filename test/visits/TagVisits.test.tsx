import { Card } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkVisitsList } from '@shlinkio/shlink-js-sdk/api-contract';
import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import { SettingsProvider } from '../../src/settings';
import { TagVisitsFactory } from '../../src/visits/TagVisits';
import { checkAccessibility } from '../__helpers__/accessibility';
import { MemoryRouterWithParams } from '../__helpers__/MemoryRouterWithParams';
import { renderWithStore } from '../__helpers__/setUpTest';
import { colorGeneratorMock } from '../utils/services/__mocks__/ColorGenerator.mock';

describe('<TagVisits />', () => {
  const exportVisits = vi.fn();
  const tagVisits = fromPartial<ShlinkVisitsList>({
    data: [{ date: formatISO(new Date()) }],
    pagination: { totalItems: 1, pagesCount: 1, currentPage: 1 },
  });
  const getTagVisits = vi.fn().mockResolvedValue(tagVisits);
  const TagVisits = TagVisitsFactory(fromPartial({
    ColorGenerator: colorGeneratorMock,
    ReportExporter: fromPartial({ exportVisits }),
  }));
  const setUp = async () => {
    const renderResult = renderWithStore(
      <MemoryRouterWithParams params={{ tag: 'foo' }} splat>
        <SettingsProvider value={fromPartial({})}>
          {/* Wrap in Card so that it has the proper background color and passes a11y contrast checks */}
          <Card>
            <TagVisits />
          </Card>
        </SettingsProvider>
      </MemoryRouterWithParams>,
      {
        apiClientFactory: () => fromPartial({ getTagVisits }),
      },
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    return renderResult;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps visits stats and header', async () => {
    await setUp();
    expect(screen.getAllByRole('heading')[0]).toHaveTextContent('Visits for');
    expect(getTagVisits).toHaveBeenCalled();
  });

  it('exports visits when clicking the button', async () => {
    const { user } = await setUp();
    const btn = screen.getByRole('button', { name: 'Export (1)' });

    expect(exportVisits).not.toHaveBeenCalled();
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(exportVisits).toHaveBeenCalledWith('tag_foo_visits.csv', expect.anything());
  });
});
