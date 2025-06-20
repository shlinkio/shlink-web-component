import { formatNumber } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import type { PartialVisitsSummary } from '../../visits/reducers/visitsOverview';
import type { HighlightCardProps } from './HighlightCard';
import { HighlightCard } from './HighlightCard';

export type VisitsHighlightCardProps = Omit<HighlightCardProps, 'tooltip' | 'children'> & {
  loading: boolean;
  excludeBots: boolean;
  visitsSummary: PartialVisitsSummary;
};

export const VisitsHighlightCard: FC<VisitsHighlightCardProps> = ({ loading, excludeBots, visitsSummary, ...rest }) => (
  <HighlightCard
    tooltip={
      visitsSummary.bots !== undefined
        ? <>{excludeBots ? 'Plus' : 'Including'} <b data-testid="tooltip-amount">{formatNumber(visitsSummary.bots)}</b> potential bot visits</>
        : undefined
    }
    {...rest}
  >
    {loading ? 'Loading...' : formatNumber(
      excludeBots && visitsSummary.nonBots !== undefined ? visitsSummary.nonBots : visitsSummary.total,
    )}
  </HighlightCard>
);
