import { Message, Result } from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import type { FC, HTMLProps } from 'react';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import type { VisitsLoadingInfo } from '../reducers/types';

export type VisitsLoadingFeedbackProps = {
  info: VisitsLoadingInfo;
};

type ProgressBarProps = HTMLProps<HTMLDivElement> & {
  value: number;
};

const ProgressBar: FC<ProgressBarProps> = ({ className, value, ...rest }) => {
  const normalizedValue = Math.min(100, Math.max(0, value));
  return (
    <div className={clsx('tw:flex tw:h-4 tw:bg-gray-100 tw:overflow-hidden tw:rounded-md', className)} {...rest}>
      <div
        role="progressbar"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={normalizedValue}
        className="tw:bg-lm-brand tw:dark:bg-dm-brand tw:transition-[width]"
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  );
};

export const VisitsLoadingFeedback: FC<VisitsLoadingFeedbackProps> = ({ info }) => {
  const { loading, errorData, progress } = info;
  return (
    <>
      {loading && progress === null && <Message loading />}
      {loading && progress !== null && (
        <Message loading>
          This is going to take a while... :S
          <ProgressBar value={progress} className="tw:mt-4" />
        </Message>
      )}
      {errorData && (
        <Result variant="error">
          <ShlinkApiError errorData={errorData} fallbackMessage="An error occurred while loading visits :(" />
        </Result>
      )}
    </>
  );
};
