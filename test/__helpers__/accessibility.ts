import { run } from 'axe-core';

export const checkAccessibility = async ({ container }: { container: HTMLElement }) => {
  const result = await run(container);
  expect(result.violations).toStrictEqual([]);
};
