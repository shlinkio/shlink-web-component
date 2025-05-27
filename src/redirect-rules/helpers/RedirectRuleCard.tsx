import { faArrowDown, faArrowUp, faGripVertical, faPencilAlt, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useToggle } from '@shlinkio/shlink-frontend-kit';
import { Button, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { ShlinkRedirectRuleData } from '@shlinkio/shlink-js-sdk/api-contract';
import type { FC } from 'react';
import { ExternalLink } from 'react-external-link';
import { RedirectRuleModal } from './RedirectRuleModal';

export type RedirectRuleCardProps = {
  redirectRule: ShlinkRedirectRuleData;
  priority: number;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onUpdate: (newData: ShlinkRedirectRuleData) => void;
};

export const RedirectRuleCard: FC<RedirectRuleCardProps> = (
  { priority, isLast, redirectRule, onDelete, onMoveUp, onMoveDown, onUpdate },
) => {
  const { flag: isModalOpen, toggle: toggleModal } = useToggle(true, true);

  return (
    <SimpleCard>
      <div className="tw:flex tw:align-center tw:gap-4">
        <div className="tw:flex tw:flex-col tw:my-auto tw:hidden tw:md:block tw:cursor-grab drag-n-drop-handler">
          <FontAwesomeIcon icon={faGripVertical} />
        </div>
        <div className="tw:flex tw:flex-col tw:my-auto">
          <Button
            variant="secondary"
            aria-label={`Move rule with priority ${priority} up`}
            disabled={priority === 1}
            onClick={onMoveUp}
            className="tw:[&]:px-2 tw:rounded-b-none tw:mb-[-1px]"
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </Button>
          <Button
            variant="secondary"
            aria-label={`Move rule with priority ${priority} down`}
            disabled={isLast}
            onClick={onMoveDown}
            className="tw:[&]:px-2 tw:rounded-t-none"
          >
            <FontAwesomeIcon icon={faArrowDown} />
          </Button>
        </div>
        <div className="tw:grow">
          <div className="tw:mb-2">
            <b>Long URL:</b> <ExternalLink href={redirectRule.longUrl} data-testid="rule-long-url" />
          </div>
          <div className="tw:flex tw:flex-col tw:lg:flex-row tw:gap-2">
            <b>Conditions:</b>
            {redirectRule.conditions.map((condition, condIndex) => (
              <div
                className="tw:rounded-sm tw:bg-gray-600 tw:px-1 tw:text-white"
                key={`${condition.type}_${condIndex}`}
              >
                {condition.type === 'device' && <>Device is {condition.matchValue}</>}
                {condition.type === 'language' && <>{condition.matchValue} language is accepted</>}
                {condition.type === 'query-param' && (
                  <>Query string contains {condition.matchKey}={condition.matchValue}</>
                )}
                {condition.type === 'ip-address' && <>IP address matches {condition.matchValue}</>}
                {condition.type === 'geolocation-country-code' && <>Country code is {condition.matchValue}</>}
                {condition.type === 'geolocation-city-name' && <>City name is {condition.matchValue}</>}
              </div>
            ))}
          </div>
        </div>
        <div className="tw:flex tw:flex-col tw:sm:flex-row tw:gap-1 tw:my-auto">
          <Button
            className="tw:[&]:px-1.5"
            variant="secondary"
            aria-label={`Edit rule with priority ${priority}`}
            onClick={toggleModal}
          >
            <FontAwesomeIcon icon={faPencilAlt} />
          </Button>
          <Button
            className="tw:[&]:px-2"
            variant="danger"
            aria-label={`Delete rule with priority ${priority}`}
            onClick={onDelete}
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </Button>
        </div>
      </div>
      <RedirectRuleModal onSave={onUpdate} isOpen={isModalOpen} toggle={toggleModal} initialData={redirectRule} />
    </SimpleCard>
  );
};
