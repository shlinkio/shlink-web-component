import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Message, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { FC, ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { Button } from 'reactstrap';
import { useGoBack } from '../../utils/helpers/hooks';
import { chartColorForIndex } from '../charts/constants';
import { LineChartCard, type VisitsList } from '../charts/LineChartCard';
import { normalizeVisits } from '../services/VisitsParser';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from './reducers/types';

type VisitsComparisonProps = {
  title: ReactNode;
  getVisitsForComparison: (params: LoadVisitsForComparison) => void;
  visitsComparisonInfo: VisitsComparisonInfo;
  colors?: Record<string, string>;
};

// TODO
//      * Display a title
//      * Support date filtering
//      * Support other filters
export const VisitsComparison: FC<VisitsComparisonProps> = ({
  title,
  colors,
  getVisitsForComparison,
  visitsComparisonInfo,
}) => {
  const goBack = useGoBack();
  const { loading, visitsGroups } = visitsComparisonInfo;
  const normalizedVisitsGroups = useMemo(
    () => Object.keys(visitsGroups).reduce<Record<string, VisitsList>>((acc, key, index) => {
      acc[key] = Object.assign(normalizeVisits(visitsGroups[key]), {
        color: colors?.[key] ?? chartColorForIndex(index),
      });
      return acc;
    }, {}),
    [colors, visitsGroups],
  );

  useEffect(() => {
    getVisitsForComparison({});
  }, [getVisitsForComparison]);

  if (loading) {
    return <Message loading />;
  }

  return (
    <>
      <div className="mb-3">
        <SimpleCard bodyClassName="d-flex">
          <Button color="link" size="lg" className="p-0 me-3" onClick={goBack} aria-label="Go back">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Button>
          <h3 className="mb-0 flex-grow-1 text-center">{title}</h3>
        </SimpleCard>
      </div>
      <LineChartCard visitsGroups={normalizedVisitsGroups} />
    </>
  );
};
