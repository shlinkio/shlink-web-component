import { faChartLine, faChevronRight, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, CloseButton, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
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
    <div className={clsx('tw:sticky tw:top-(--header-height) tw:z-10', className)}>
      <SimpleCard bodyClassName="tw:flex tw:flex-col tw:lg:flex-row tw:gap-4 tw:items-center">
        <ul className="tw:flex tw:flex-wrap tw:gap-1 tw:grow tw:items-center tw:p-0 tw:m-0">
          {itemsToCompare.map((item, index) => (
            <li
              key={`${item.name}_${index}`}
              className={clsx(
                'tw:flex tw:items-center tw:gap-1 tw:text-sm tw:font-bold tw:text-white tw:py-0.5 tw:px-1.5 tw:rounded',
                { 'tw:bg-gray-500': !item.style?.backgroundColor },
              )}
              style={item.style}
            >
              {item.name}
              <CloseButton
                label={`Remove ${item.name}`}
                className="tw:text-xs"
                onClick={() => removeItemToCompare(item)}
              />
            </li>
          ))}
        </ul>
        <div className="tw:flex tw:gap-2 tw:max-lg:w-full">
          <Button
            className="tw:grow tw:whitespace-nowrap"
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
