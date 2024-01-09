import { Message, Result } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { Progress } from 'reactstrap';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import type { VisitsLoadingInfo } from '../reducers/types';

type VisitsLoadingFeedbackProps = {
  info: VisitsLoadingInfo;
};

export const VisitsLoadingFeedback: FC<VisitsLoadingFeedbackProps> = ({ info }) => {
  const { loading, errorData, progress } = info;
  return (
    <>
      {loading && progress === null && <Message loading />}
      {loading && progress !== null && (
        <Message loading>
          This is going to take a while... :S
          <Progress value={progress} striped={progress >= 100} className="mt-3" />
        </Message>
      )}
      {errorData && (
        <Result type="error">
          <ShlinkApiError errorData={errorData} fallbackMessage="An error occurred while loading visits :(" />
        </Result>
      )}
    </>
  );
};
