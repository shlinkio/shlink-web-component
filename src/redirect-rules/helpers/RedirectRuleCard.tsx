import { faArrowDown, faArrowUp, faGripVertical, faPencilAlt, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, SimpleCard,useToggle  } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkRedirectRuleData } from '@shlinkio/shlink-js-sdk/api-contract';
import type { FC } from 'react';
import { ExternalLink } from 'react-external-link';
import { formatHumanFriendly } from '../../utils/dates/helpers/date';
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
  const { flag: isModalOpen, setToTrue: openModal, setToFalse: closeModal } = useToggle();

  return (
    <SimpleCard>
      <div className="flex align-center gap-4">
        <div className="flex flex-col my-auto hidden md:block cursor-grab drag-n-drop-handler">
          <FontAwesomeIcon icon={faGripVertical} />
        </div>
        <div className="flex flex-col my-auto">
          <Button
            variant="secondary"
            aria-label={`Move rule with priority ${priority} up`}
            disabled={priority === 1}
            onClick={onMoveUp}
            className="[&]:px-2 rounded-b-none mb-[-1px]"
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </Button>
          <Button
            variant="secondary"
            aria-label={`Move rule with priority ${priority} down`}
            disabled={isLast}
            onClick={onMoveDown}
            className="[&]:px-2 rounded-t-none"
          >
            <FontAwesomeIcon icon={faArrowDown} />
          </Button>
        </div>
        <div className="grow">
          <div className="mb-2">
            <b>Long URL:</b> <ExternalLink href={redirectRule.longUrl} data-testid="rule-long-url" />
          </div>
          <div className="flex flex-col lg:flex-row gap-2">
            <b>Conditions:</b>
            {redirectRule.conditions.map((condition, condIndex) => (
              <div
                className="rounded-sm bg-gray-600 px-1 text-white"
                key={`${condition.type}_${condIndex}`}
              >
                {condition.type === 'device' && <>Device is {condition.matchValue}</>}
                {condition.type === 'language' && <>{condition.matchValue} language is accepted</>}
                {condition.type === 'query-param' && (
                  <>Query string contains &quot;{condition.matchKey}={condition.matchValue}&quot;</>
                )}
                {condition.type === 'any-value-query-param' && (
                  <>Query string contains &quot;{condition.matchKey}&quot; param</>
                )}
                {condition.type === 'valueless-query-param' && (
                  <>
                    Query string contains &quot;{condition.matchKey}&quot; param without a value
                    (https://example.com?{condition.matchKey})
                  </>
                )}
                {condition.type === 'ip-address' && <>IP address matches {condition.matchValue}</>}
                {condition.type === 'geolocation-country-code' && <>Country code is {condition.matchValue}</>}
                {condition.type === 'geolocation-city-name' && <>City name is {condition.matchValue}</>}
                {condition.type === 'before-date' && <>Date is before {formatHumanFriendly(condition.matchValue)}</>}
                {condition.type === 'after-date' && <>Date is after {formatHumanFriendly(condition.matchValue)}</>}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-1 my-auto">
          <Button
            className="[&]:px-1.5"
            variant="secondary"
            aria-label={`Edit rule with priority ${priority}`}
            onClick={openModal}
          >
            <FontAwesomeIcon icon={faPencilAlt} />
          </Button>
          <Button
            className="[&]:px-2"
            variant="danger"
            aria-label={`Delete rule with priority ${priority}`}
            onClick={onDelete}
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </Button>
        </div>
      </div>
      <RedirectRuleModal onSave={onUpdate} isOpen={isModalOpen} onClose={closeModal} initialData={redirectRule} />
    </SimpleCard>
  );
};
