import { EventSourcePolyfill as EventSource } from 'event-source-polyfill';
import type { MercureInfo } from '../reducers/mercureInfo';

export const bindToMercureTopic = <T>(
  mercureInfo: MercureInfo,
  topics: string[],
  onMessage: (message: T) => void,
  onTokenExpired: () => void,
) => {
  const { status } = mercureInfo;

  if (status !== 'loaded' || !mercureInfo.mercureHubUrl) {
    return undefined;
  }

  const onEventSourceMessage = ({ data }: { data: string }) => onMessage(JSON.parse(data) as T);
  const onEventSourceError = ({ status }: { status: number }) => status === 401 && onTokenExpired();

  const subscriptions = topics.map((topic) => {
    const hubUrl = new URL(mercureInfo.mercureHubUrl);

    hubUrl.searchParams.append('topic', topic);
    const es = new EventSource(hubUrl, {
      headers: {
        Authorization: `Bearer ${mercureInfo.token}`,
      },
    });

    es.onmessage = onEventSourceMessage;
    es.onerror = onEventSourceError;

    return es;
  });

  return () => subscriptions.forEach((es) => es.close());
};
