import { Message, Result } from '@shlinkio/shlink-frontend-kit';
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
    <div className={clsx('flex h-4 bg-gray-100 overflow-hidden rounded-md', className)} {...rest}>
      <div
        role="progressbar"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={normalizedValue}
        className="bg-lm-brand dark:bg-dm-brand transition-[width]"
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  );
};

export const VisitsLoadingFeedback: FC<VisitsLoadingFeedbackProps> = ({ info }) => {
  const { status } = info;

  if (status === 'error') {
    return (
      <Result variant="error">
        <ShlinkApiError errorData={info.error} fallbackMessage="An error occurred while loading visits :(" />
      </Result>
    );
  }

  if (status === 'loading') {
    return info.progress === null ? <Message loading /> : (
      <Message loading>
        This is going to take a while... :S
        <ProgressBar value={info.progress} className="mt-4" />
      </Message>
    );
  }

  return null;
};
