import { SimpleCard, useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { Button } from 'reactstrap';
import { SpaceBetweenContainer } from '../../common/SpaceBetweenContainer';
import type { VisitsDeletion } from '../reducers/types';

export type VisitsStatsOptionsProps = {
  deleteVisits: () => void;
  visitsDeletion: VisitsDeletion;
};

export const VisitsStatsOptions: FC<VisitsStatsOptionsProps> = ({ visitsDeletion, deleteVisits }) => {
  const { deleting } = visitsDeletion;
  const [doubleConfirmed,, setDoubleConfirmed] = useToggle();

  return (
    <SimpleCard title={<span className="text-danger fw-bold">Danger zone</span>}>
      <SpaceBetweenContainer>
        <dl className="m-0 me-3">
          <dt>Delete visits.</dt>
          <dd className="m-0">This will delete <b>all</b> visits, not only the ones matching current filter.</dd>
        </dl>
        {!doubleConfirmed && (
          <Button color="danger" className="indivisible" onClick={setDoubleConfirmed}>
            Delete visits
          </Button>
        )}
        {doubleConfirmed && (
          <Button
            color="danger"
            disabled={deleting}
            className="indivisible"
            onClick={deleteVisits}
            innerRef={(e) => {
              // Focus this button when mounted, to allow interacting with keyboard by pressing Enter twice
              e?.focus();
            }}
          >
            {!deleting && <>Click again to confirm</>}
            {deleting && <>Deleting...</>}
          </Button>
        )}
      </SpaceBetweenContainer>
    </SimpleCard>
  );
};
