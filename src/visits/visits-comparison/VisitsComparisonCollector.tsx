import { faChartLine as lineChartIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { UnstyledButton } from '../../utils/components/UnstyledButton';
import { useRoutesPrefix } from '../../utils/routesPrefix';
import { useVisitsToCompare } from './VisitsComparisonContext';

type VisitsComparisonCollectorProps = {
  className?: string;
  type: 'short-urls' | 'tags' | 'domains';
};

export const VisitsComparisonCollector: FC<VisitsComparisonCollectorProps> = ({ className, type }) => {
  const routesPrefix = useRoutesPrefix();
  const context = useVisitsToCompare();
  const query = useMemo(
    () => (!context ? '' : encodeURIComponent(context.itemsToCompare.map((visit) => visit.query).join(','))),
    [context],
  );

  if (!context || context.itemsToCompare.length === 0) {
    return null;
  }

  return (
    <div className={clsx('top-sticky', className)}>
      <SimpleCard bodyClassName="d-flex gap-3 align-items-center">
        <div className="d-flex flex-wrap gap-1 flex-grow-1">
          {context.itemsToCompare.map((item, index) => (
            <span key={`${item.name}_${index}`} className="badge bg-secondary pe-1">
              {item.name}
              <UnstyledButton
                aria-label={`Remove ${item.name}`}
                className="fw-bold fs-6"
                onClick={() => context.removeItemToCompare(item)}
              >
                &times;
              </UnstyledButton>
            </span>
          ))}
        </div>
        <div>
          <Button
            outline
            color="primary"
            disabled={context.itemsToCompare.length < 2}
            tag={Link}
            to={`${routesPrefix}/${type}/compare-visits?${type}=${query}`}
          >
            <FontAwesomeIcon icon={lineChartIcon} fixedWidth className="me-1" />
            Compare &raquo;
          </Button>
          <Button
            aria-label="Close compare"
            outline
            color="secondary"
            className="ms-2 fw-bold"
            onClick={context.clearItemsToCompare}
          >
            &times;
          </Button>
        </div>
      </SimpleCard>
    </div>
  );
};
