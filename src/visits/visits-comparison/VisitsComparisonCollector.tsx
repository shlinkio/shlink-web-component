import { faChartLine, faChevronRight, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, CloseButton, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { useMemo } from 'react';
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
    <div className={clsx('sticky top-(--header-height) z-10', className)}>
      <SimpleCard bodyClassName="flex flex-col lg:flex-row gap-4 items-center">
        <ul className="flex flex-wrap gap-1 grow items-center">
          {itemsToCompare.map((item, index) => (
            <li
              key={`${item.name}_${index}`}
              className={clsx(
                'flex items-center gap-1 text-sm font-bold text-white py-0.5 px-1.5 rounded',
                { 'bg-gray-500': !item.style?.backgroundColor },
              )}
              style={item.style}
            >
              {item.name}
              <CloseButton
                label={`Remove ${item.name}`}
                className="text-xs"
                onClick={() => removeItemToCompare(item)}
              />
            </li>
          ))}
        </ul>
        <div className="flex gap-2 max-lg:w-full">
          <Button
            className="grow whitespace-nowrap"
            disabled={itemsToCompare.length < 2}
            to={itemsToCompare.length > 1 ? `${routesPrefix}/${type}/compare-visits?${type}=${query}` : undefined}
          >
            <FontAwesomeIcon icon={faChartLine} />
            Compare ({itemsToCompare.length}/5)
            <FontAwesomeIcon icon={faChevronRight} />
          </Button>
          <Button
            aria-label="Close compare"
            variant="secondary"
            onClick={clearItemsToCompare}
          >
            <FontAwesomeIcon icon={faClose} />
          </Button>
        </div>
      </SimpleCard>
    </div>
  );
};
