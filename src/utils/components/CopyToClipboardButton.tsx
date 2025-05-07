import { faClone } from '@fortawesome/free-regular-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import type { Size } from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import type { FC, HTMLProps } from 'react';
import { useCallback } from 'react';

type CopyToClipboardIconProps = Omit<HTMLProps<HTMLButtonElement>, 'type' | 'onClick' | 'size'> & {
  /** Text to be copied when the button is clicked */
  text: string;
  /** Size of the button. Defaults to `lg` */
  size?: Size;

  /** Test seam */
  initialCopied?: boolean;
  /** Test seam */
  navigator_?: typeof globalThis.navigator;
};

export const CopyToClipboardButton: FC<CopyToClipboardIconProps> = (
  { text, className, size = 'lg', initialCopied = false, navigator_ = globalThis.navigator, ...rest },
) => {
  const [copied, toggleCopied] = useTimeoutToggle(initialCopied);
  const copyToClipboard = useCallback(
    () => navigator_.clipboard.writeText(text).then(toggleCopied),
    [navigator_.clipboard, text, toggleCopied],
  );

  return (
    <button
      type="button"
      className={clsx(
        'tw:focus-ring tw:rounded-sm',
        {
          'tw:text-md': size === 'sm',
          'tw:text-lg': size === 'md',
          'tw:text-xl': size === 'lg',
        },
        className,
      )}
      aria-label={`Copy ${text} to clipboard`}
      title="Copy to clipboard"
      onClick={copyToClipboard}
      {...rest}
    >
      <FontAwesomeIcon icon={copied ? faCheck : faClone} fixedWidth />
    </button>
  );
};
