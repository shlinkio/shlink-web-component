import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGoBack } from '@shlinkio/shlink-frontend-kit';
import { LinkButton } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';

export const GoBackButton: FC = () => {
  const goBack = useGoBack();
  return (
    <LinkButton size="lg" className="tw:[&]:p-1 tw:mr-4" onClick={goBack} aria-label="Go back">
      <FontAwesomeIcon icon={faArrowLeft} />
    </LinkButton>
  );
};
