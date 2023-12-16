import { parseQuery, stringifyQuery } from '@shlinkio/shlink-frontend-kit';
import type { DependencyList, EffectCallback } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const query = parseQuery<any>(location.search);

    query[paramName] = valueToSet;
    history.pushState(null, '', `${location.pathname}?${stringifyQuery(query)}`);
    setValue(valueToSet);
  }, [paramName]);

  return [value, setValueWithLocation];
};

export const useEffectExceptFirstTime = (callback: EffectCallback, deps: DependencyList): void => {
  const isFirstLoad = useRef(true);

  useEffect(() => {
    !isFirstLoad.current && callback();
    isFirstLoad.current = false;

    // FIXME This hooks very much feels like a workaround for some other problem (probably useEffect dependencies that
    //  were not properly wrapped in useCallback/useMemo and cause too many re-renders)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export const useGoBack = () => {
  const navigate = useNavigate();
  return useCallback(() => navigate(-1), [navigate]);
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
