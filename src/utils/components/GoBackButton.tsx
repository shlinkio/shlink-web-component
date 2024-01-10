import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';
import { Button } from 'reactstrap';
import { useGoBack } from '../helpers/hooks';

export const GoBackButton: FC = () => {
  const goBack = useGoBack();
  return (
    <Button color="link" size="lg" className="p-0 me-3" onClick={goBack} aria-label="Go back">
      <FontAwesomeIcon icon={faArrowLeft} />
    </Button>
  );
};
