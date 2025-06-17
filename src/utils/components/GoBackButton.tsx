import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LinkButton,useGoBack  } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';

export const GoBackButton: FC = () => {
  const goBack = useGoBack();
  return (
    <LinkButton size="lg" className="[&]:p-1 mr-4" onClick={goBack} aria-label="Go back">
      <FontAwesomeIcon icon={faArrowLeft} />
    </LinkButton>
  );
};
