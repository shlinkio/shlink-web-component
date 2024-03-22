import { faArrowDown, faArrowUp, faGripVertical, faPencilAlt, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SimpleCard, useToggle } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkRedirectRuleData } from '@shlinkio/shlink-js-sdk/api-contract';
import type { FC } from 'react';
import { ExternalLink } from 'react-external-link';
import { Button } from 'reactstrap';
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
  const [isModalOpen, toggleModal] = useToggle();

  return (
    <SimpleCard>
      <div className="d-flex align-content-center gap-3">
        <div className="d-flex flex-column my-auto drag-n-drop-handler d-none d-md-block" style={{ cursor: 'grab' }}>
          <FontAwesomeIcon icon={faGripVertical} />
        </div>
        <div className="d-flex flex-column my-auto">
          <Button
            outline
            color="secondary"
            size="sm"
            aria-label={`Move rule with priority ${priority} up`}
            disabled={priority === 1}
            onClick={onMoveUp}
            className="rounded-0 rounded-top"
            style={{ marginBottom: '-1px' }}
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </Button>
          <Button
            outline
            color="secondary"
            size="sm"
            aria-label={`Move rule with priority ${priority} down`}
            disabled={isLast}
            onClick={onMoveDown}
            className="rounded-0 rounded-bottom"
          >
            <FontAwesomeIcon icon={faArrowDown} />
          </Button>
        </div>
        <div className="flex-grow-1">
          <div className="mb-2">
            <b>Long URL:</b> <ExternalLink href={redirectRule.longUrl} data-testid="rule-long-url" />
          </div>
          <div className="d-flex flex-column flex-lg-row gap-2">
            <b>Conditions:</b>
            {redirectRule.conditions.map((condition, condIndex) => (
              <div className="badge bg-secondary" key={`${condition.type}_${condIndex}`}>
                {condition.type === 'device' && <>Device is {condition.matchValue}</>}
                {condition.type === 'language' && <>{condition.matchValue} language is accepted</>}
                {condition.type === 'query-param' && (
                  <>Query string contains {condition.matchKey}={condition.matchValue}</>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="d-flex flex-column flex-sm-row gap-1 my-auto">
          <Button
            outline
            color="secondary"
            size="sm"
            aria-label={`Edit rule with priority ${priority}`}
            onClick={toggleModal}
          >
            <FontAwesomeIcon icon={faPencilAlt} />
          </Button>
          <Button
            outline
            color="danger"
            size="sm"
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
