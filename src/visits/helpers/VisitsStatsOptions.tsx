import { Button, SimpleCard,useToggle  } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { SpaceBetweenContainer } from '../../common/SpaceBetweenContainer';
import type { VisitsDeletion } from '../reducers/types';

export type VisitsStatsOptionsProps = {
  deleteVisits: () => void;
  visitsDeletion: VisitsDeletion;
};

export const VisitsStatsOptions: FC<VisitsStatsOptionsProps> = ({ visitsDeletion, deleteVisits }) => {
  const deleting = visitsDeletion.status === 'deleting';
  const { flag: doubleConfirmed, setToTrue: setDoubleConfirmed } = useToggle();

  return (
    <SimpleCard title={<span className="text-danger font-bold text-base">Danger zone</span>}>
      <SpaceBetweenContainer>
        <dl className="m-0 mr-3">
          <dt>Delete visits.</dt>
          <dd className="m-0">This will delete <b>all</b> visits, not only the ones matching current filter.</dd>
        </dl>
        {!doubleConfirmed && (
          <Button variant="danger" solid className="whitespace-nowrap" onClick={setDoubleConfirmed}>
            Delete visits
          </Button>
        )}
        {doubleConfirmed && (
          <Button
            solid
            variant="danger"
            disabled={deleting}
            className="whitespace-nowrap"
            onClick={deleteVisits}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          >
            {!deleting && <>Click again to confirm</>}
            {deleting && <>Deleting...</>}
          </Button>
        )}
      </SpaceBetweenContainer>
    </SimpleCard>
  );
};
