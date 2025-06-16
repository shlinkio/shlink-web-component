import { faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ButtonProps } from '@shlinkio/shlink-frontend-kit';
import { Button, formatNumber  } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';

type ExportBtnProps = Omit<ButtonProps, 'disabled' | 'to'> & {
  amount?: number;
  loading?: boolean;
};

export const ExportBtn: FC<ExportBtnProps> = ({ amount = 0, loading = false, ...rest }) => (
  // @ts-expect-error We are explicitly excluding "to" prop
  <Button {...rest} disabled={loading}>
    <FontAwesomeIcon icon={faFileCsv} /> {loading ? 'Exporting...' : <>Export ({formatNumber(amount)})</>}
  </Button>
);
