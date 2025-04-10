import { faClone as copyIcon } from '@fortawesome/free-regular-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { copyToClipboard as defaultCopyToClipboard  } from '../helpers/clipboard';
import { UnstyledButton } from './UnstyledButton';

type CopyToClipboardIconProps = {
  text: string;

  /** Test seam */
  copyToClipboard?: typeof defaultCopyToClipboard;
  /** Test seam */
  initialCopied?: boolean;
};

export const CopyToClipboardIcon: FC<CopyToClipboardIconProps> = (
  { text, copyToClipboard = defaultCopyToClipboard, initialCopied = false },
) => {
  const [copied, toggleCopied] = useTimeoutToggle(initialCopied);
  return (
    <UnstyledButton
      className="ms-2 p-0"
      aria-label={`Copy ${text} to clipboard`}
      onClick={() => copyToClipboard({ text, onCopy: toggleCopied })}
    >
      <FontAwesomeIcon icon={copied ? faCheck : copyIcon} className="fs-5" fixedWidth />
    </UnstyledButton>
  );
};
