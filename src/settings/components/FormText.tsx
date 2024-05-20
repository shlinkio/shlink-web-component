import type { FC, PropsWithChildren } from 'react';

export const FormText: FC<PropsWithChildren> = ({ children }) => (
  <small className="form-text text-muted d-block">{children}</small>
);
