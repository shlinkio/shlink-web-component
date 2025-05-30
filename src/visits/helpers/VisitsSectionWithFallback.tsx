import { Message } from '@shlinkio/shlink-frontend-kit';
import type { FC, PropsWithChildren } from 'react';

export const VisitsSectionWithFallback: FC<PropsWithChildren<{ showFallback: boolean }>> = (
  { children, showFallback },
) => (
  <>
    {showFallback && <Message>There are no visits matching current filter</Message>}
    {!showFallback && <>{children}</>}
  </>
);
