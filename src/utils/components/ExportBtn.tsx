import { faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ButtonProps } from '@shlinkio/shlink-frontend-kit/tailwind';
import { Button } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { prettify } from '../helpers/numbers';

type ExportBtnProps = Omit<ButtonProps, 'disabled' | 'to'> & {
  amount?: number;
  loading?: boolean;
};

export const ExportBtn: FC<ExportBtnProps> = ({ amount = 0, loading = false, ...rest }) => (
  // @ts-expect-error We are explicitly excluding "to" prop
  <Button {...rest} disabled={loading}>
    <FontAwesomeIcon icon={faFileCsv} /> {loading ? 'Exporting...' : <>Export ({prettify(amount)})</>}
  </Button>
);
