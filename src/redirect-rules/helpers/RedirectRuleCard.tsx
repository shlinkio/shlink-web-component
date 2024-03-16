import { faArrowDown, faArrowUp, faPencilAlt, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkRedirectRuleData } from '@shlinkio/shlink-js-sdk/api-contract';
import type { FC } from 'react';
import { ExternalLink } from 'react-external-link';
import { Button } from 'reactstrap';

type RedirectRuleCardProps = {
  redirectRule: ShlinkRedirectRuleData;
  index: number;
  isLast: boolean;
  onMoveRuleUp: (index: number) => void;
  onMoveRuleDown: (index: number) => void;
  onDeleteRule: (index: number) => void;
};

export const RedirectRuleCard: FC<RedirectRuleCardProps> = (
  { index, isLast, redirectRule, onDeleteRule, onMoveRuleUp, onMoveRuleDown },
) => (
  <SimpleCard>
    <div className="d-flex align-content-center gap-3">
      <div className="d-flex flex-column my-auto">
        <Button
          outline
          color="secondary"
          size="sm"
          data-label={`Move rule with priority ${index + 1} up`}
          disabled={index === 0}
          onClick={() => onMoveRuleUp(index)}
          className="rounded-0 rounded-top"
          style={{ marginBottom: '-1px' }}
        >
          <FontAwesomeIcon icon={faArrowUp} />
        </Button>
        <Button
          outline
          color="secondary"
          size="sm"
          data-label={`Move rule with priority ${index + 1} down`}
          disabled={isLast}
          onClick={() => onMoveRuleDown(index)}
          className="rounded-0 rounded-bottom"
        >
          <FontAwesomeIcon icon={faArrowDown} />
        </Button>
      </div>
      <div className="flex-grow-1">
        <div className="mb-2"><b>Long URL:</b> <ExternalLink href={redirectRule.longUrl} /></div>
        <div className="d-flex flex-column flex-lg-row gap-2">
          <b>Conditions:</b>
          {redirectRule.conditions.map((condition, condIndex) => (
            <div className="badge bg-secondary" key={`${condition.type}_${condIndex}`}>
              {condition.type === 'device' && <>Device is {condition.matchValue}</>}
              {condition.type === 'language' && <>{condition.matchValue} language is accepted</>}
              {condition.type === 'query-param' && (
                <>query string contains {condition.matchKey}={condition.matchValue}</>
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
          data-label={`Edit rule with priority ${index + 1}`}
        >
          <FontAwesomeIcon icon={faPencilAlt} />
        </Button>
        <Button
          outline
          color="danger"
          size="sm"
          data-label={`Delete rule with priority ${index + 1}`}
          onClick={() => onDeleteRule(index)}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </Button>
      </div>
    </div>
  </SimpleCard>
);
