import type { FC, PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';

export type MemoryRouterWithParamsProps = PropsWithChildren<{
  params: Record<string, string>;

  /**
   * Set to `true` if the rendered component renders its own nested routes.
   * Defaults to `false`.
   */
  splat?: boolean;
}>;

/**
 * Wrap any component using useParams() with MemoryRouterWithParams, in order to determine wat the hook should return
 */
export const MemoryRouterWithParams: FC<MemoryRouterWithParamsProps> = ({ children, params, splat = false }) => {
  const pathname = useMemo(() => `/${Object.values(params).join('/')}`, [params]);
  const pathPattern = useMemo(() => `/:${Object.keys(params).join('/:')}${splat ? '/*' : ''}`, [params, splat]);

  return (
    <MemoryRouter>
      <Routes location={{ pathname }}>
        <Route path={pathPattern} element={children} />
      </Routes>
    </MemoryRouter>
  );
};
