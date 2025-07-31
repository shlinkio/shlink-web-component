import { faBars as burgerIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { clsx } from 'clsx';
import type { FC, HTMLProps } from 'react';
import { UnstyledButton } from '../utils/components/UnstyledButton';
import { useSidebarVisibility } from './ShlinkSidebarVisibilityProvider';

export type ShlinkSidebarToggleButtonProps = Omit<HTMLProps<HTMLButtonElement>, 'onClick'>;

export const ShlinkSidebarToggleButton: FC<ShlinkSidebarToggleButtonProps> = ({ className, ...rest }) => {
  const context = useSidebarVisibility();
  if (!context) {
    throw new Error('ShlinkSidebarToggleButton has to be used inside a ShlinkSidebarVisibilityProvider');
  }

  const { sidebarVisible, toggleSidebar } = context;

  return (
    <UnstyledButton
      aria-label="Toggle sidebar"
      className={clsx(
        'md:hidden transition-colors',
        {
          'text-white/50': !sidebarVisible,
          'text-white': sidebarVisible,
        },
        className,
      )}
      onClick={toggleSidebar}
      {...rest}
    >
      <FontAwesomeIcon icon={burgerIcon} size="xl" />
    </UnstyledButton>
  );
};
