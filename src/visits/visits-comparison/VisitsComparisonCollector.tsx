import { faChartLine as lineChartIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { Button } from 'reactstrap';
import { UnstyledButton } from '../../utils/components/UnstyledButton';
import { useRoutesPrefix } from '../../utils/routesPrefix';
import { useVisitsComparisonContext } from './VisitsComparisonContext';

type VisitsComparisonCollectorProps = {
  type: 'short-urls' | 'tags' | 'domains';
  className?: string;
};

export const VisitsComparisonCollector: FC<VisitsComparisonCollectorProps> = ({ className, type }) => {
  const routesPrefix = useRoutesPrefix();
  const context = useVisitsComparisonContext();
  const query = useMemo(
    () => (!context ? '' : encodeURIComponent(context.itemsToCompare.map((item) => item.query).join(','))),
    [context],
  );

  if (!context || context.itemsToCompare.length === 0) {
    return null;
  }

  const { itemsToCompare, clearItemsToCompare, removeItemToCompare } = context;
  return (
    <div className={clsx('top-sticky', className)}>
      <SimpleCard bodyClassName="d-md-flex gap-3 align-items-center">
        <ul className="d-flex flex-wrap gap-1 flex-grow-1 p-0 m-0">
          {itemsToCompare.map((item, index) => (
            <li
              key={`${item.name}_${index}`}
              className={clsx('badge pe-1', { 'bg-secondary': !item.style?.backgroundColor })}
              style={item.style}
            >
              {item.name}
              <UnstyledButton
                aria-label={`Remove ${item.name}`}
                className="fw-bold fs-6"
                onClick={() => removeItemToCompare(item)}
              >
                &times;
              </UnstyledButton>
            </li>
          ))}
        </ul>
        <div className="d-flex mt-3 mt-md-0">
          <Button
            outline
            color="primary"
            className="flex-grow-1 indivisible"
            disabled={itemsToCompare.length < 2}
            tag={Link}
            to={`${routesPrefix}/${type}/compare-visits?${type}=${query}`}
          >
            <FontAwesomeIcon icon={lineChartIcon} fixedWidth className="me-1" />
            Compare ({itemsToCompare.length}/5) &raquo;
          </Button>
          <Button
            aria-label="Close compare"
            outline
            color="secondary"
            className="ms-2 fw-bold"
            onClick={clearItemsToCompare}
          >
            &times;
          </Button>
        </div>
      </SimpleCard>
    </div>
  );
};
