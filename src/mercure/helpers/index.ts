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

  const onEventSourceMessage = ({ data }: MessageEvent) => onMessage(JSON.parse(data) as T);

  const subscriptions = topics.map((topic) => {
    const hubUrl = new URL(mercureInfo.mercureHubUrl);
    hubUrl.searchParams.append('topic', topic);
    hubUrl.searchParams.append('authorization', mercureInfo.token);

    const es = new EventSource(hubUrl);

    es.onmessage = onEventSourceMessage;
    // When an error occurs, invoke onTokenExpired just in case that was the issue
    // TODO Limit the amount of attempts
    es.onerror = onTokenExpired;

    return es;
  });

  return () => subscriptions.forEach((es) => es.close());
};
