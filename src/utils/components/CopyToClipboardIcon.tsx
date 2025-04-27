import { faClone as copyIcon } from '@fortawesome/free-regular-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { copyToClipboard as defaultCopyToClipboard  } from '../helpers/clipboard';

type CopyToClipboardIconProps = {
  text: string;
  className?: string;

  /** Test seam */
  copyToClipboard?: typeof defaultCopyToClipboard;
  /** Test seam */
  initialCopied?: boolean;
};

export const CopyToClipboardIcon: FC<CopyToClipboardIconProps> = (
  { text, className, copyToClipboard = defaultCopyToClipboard, initialCopied = false },
) => {
  const [copied, toggleCopied] = useTimeoutToggle(initialCopied);
  return (
    <button
      className={clsx('tw:focus-ring tw:rounded-sm', className)}
      aria-label={`Copy ${text} to clipboard`}
      onClick={() => copyToClipboard({ text, onCopy: toggleCopied })}
    >
      <FontAwesomeIcon icon={copied ? faCheck : copyIcon} className="fs-5" fixedWidth />
    </button>
  );
};
