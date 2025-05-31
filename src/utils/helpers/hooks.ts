import {
  parseQueryString,
  stringifyQueryParams,
  useParsedQuery,
} from '@shlinkio/shlink-frontend-kit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSwipeable as useReactSwipeable } from 'react-swipeable';
import type { MediaMatcher } from '../types';

export const useSwipeable = (showSidebar: () => void, hideSidebar: () => void) => {
  const swipeMenuIfNoModalExists = (callback: () => void) => (e: any) => {
    const swippedOnVisitsTable = (e.event.composedPath() as HTMLElement[]).some(
      ({ classList }) => classList?.contains('visits-table'),
    );

    if (swippedOnVisitsTable || document.querySelector('.modal')) {
      return;
    }

    callback();
  };

  return useReactSwipeable({
    delta: 40,
    onSwipedLeft: swipeMenuIfNoModalExists(hideSidebar),
    onSwipedRight: swipeMenuIfNoModalExists(showSidebar),
  });
};

export const useQueryState = <T>(paramName: string, initialState: T): [T, (newValue: T) => void] => {
  const [value, setValue] = useState(initialState);
  const setValueWithLocation = useCallback((valueToSet: T) => {
    const { location, history } = window;
    const query = parseQueryString<any>(location.search);

    query[paramName] = valueToSet;
    history.pushState(null, '', `${location.pathname}?${stringifyQueryParams(query)}`);
    setValue(valueToSet);
  }, [paramName]);

  return [value, setValueWithLocation];
};

/**
 * Returns a param from the query string which value is a comma-separated array.
 * The result is split, returning an array of strings.
 */
export const useArrayQueryParam = (name: string): string[] => {
  const query = useParsedQuery<Record<string, string | undefined>>();
  return useMemo(() => query[name]?.split(',').filter(Boolean) ?? [], [name, query]);
};

export const useMaxResolution = (maxResolution: number, matchMedia: MediaMatcher) => {
  const matchResolution = useCallback(
    () => matchMedia(`(max-width: ${maxResolution}px)`).matches,
    [matchMedia, maxResolution],
  );
  const [doesMatchResolution, setResolutionIsMatched] = useState(matchResolution());

  useEffect(() => {
    const listener = () => setResolutionIsMatched(matchResolution());
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matchResolution]);

  return doesMatchResolution;
};

export const useKeyDown = (key: string, callback: () => void, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) {
      return () => {};
    }

    const controller = new AbortController();
    document.addEventListener('keydown', (e) => e.key === key && callback(), { signal: controller.signal });
    return () => controller.abort();
  }, [enabled, callback, key]);
};
