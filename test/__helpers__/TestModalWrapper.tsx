import { useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC, ReactElement } from 'react';

interface RenderModalArgs {
  isOpen: boolean;
  onClose: () => void;
}

export const TestModalWrapper: FC<{ renderModal: (args: RenderModalArgs) => ReactElement }> = (
  { renderModal },
) => {
  const { flag: isOpen, setToFalse: onClose } = useToggle(true, true);
  return renderModal({ isOpen, onClose });
};
