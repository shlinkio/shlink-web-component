import type { FC } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { CreateVisit } from '../../visits/types';
import type { MercureInfo } from '../reducers/mercureInfo';
import { bindToMercureTopic } from './index';

export interface MercureBoundProps {
  createNewVisits: (createdVisits: CreateVisit[]) => void;
  loadMercureInfo: () => void;
  mercureInfo: MercureInfo;
}

export function boundToMercureHub<T extends object>(
  WrappedComponent: FC<MercureBoundProps & T>,
  getTopicsForParams: (routeParams: any) => string[],
) {
  const pendingUpdates = new Set<CreateVisit>();

  return (props: MercureBoundProps & T) => {
    const { createNewVisits, loadMercureInfo, mercureInfo } = props;
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
