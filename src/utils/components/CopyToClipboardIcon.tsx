import { faClone as copyIcon } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';
import type { CopyToClipboardOptions } from '../helpers/clipboard';
import { copyToClipboard as defaultCopyToClipboard } from '../helpers/clipboard';
import { UnstyledButton } from './UnstyledButton';

type CopyToClipboardIconProps = CopyToClipboardOptions & {
  copyToClipboard?: typeof defaultCopyToClipboard;
};

export const CopyToClipboardIcon: FC<CopyToClipboardIconProps> = (
  { text, onCopy, copyToClipboard = defaultCopyToClipboard },
) => (
  <UnstyledButton
    className="ms-2 p-0"
    aria-label={typeof text === 'string' ? `Copy ${text} to clipboard` : 'Copy to clipboard'}
    onClick={() => copyToClipboard({ text, onCopy })}
  >
    <FontAwesomeIcon icon={copyIcon} className="fs-5" />
  </UnstyledButton>
);
