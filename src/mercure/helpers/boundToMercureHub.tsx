import type { FC } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useVisitCreation } from '../../visits/reducers/visitCreation';
import type { CreateVisit } from '../../visits/types';
import { useMercureInfo } from '../reducers/mercureInfo';
import { bindToMercureTopic } from './index';

export function boundToMercureHub<T extends object>(
  WrappedComponent: FC<T>,
  getTopicsForParams: (routeParams: any) => string[],
) {
  const pendingUpdates = new Set<CreateVisit>();

  return (props: T) => {
    const { createNewVisits } = useVisitCreation();
    const { loadMercureInfo, mercureInfo } = useMercureInfo();
    const params = useParams();

    // Every time mercure info changes, re-bind
    useEffect(() => {
      const { interval } = mercureInfo;
      const onMessage = (visit: CreateVisit) => (interval ? pendingUpdates.add(visit) : createNewVisits([visit]));
      const topics = getTopicsForParams(params);
      const closeEventSource = bindToMercureTopic(mercureInfo, topics, onMessage, loadMercureInfo);

      if (!interval) {
        return closeEventSource;
      }

      const timer = setInterval(() => {
        createNewVisits([...pendingUpdates]);
        pendingUpdates.clear();
      }, interval * 1000 * 60);

      return () => {
        clearInterval(timer);
        closeEventSource?.();
      };
    }, [createNewVisits, loadMercureInfo, mercureInfo, params]);

    return <WrappedComponent {...props} />;
  };
}
