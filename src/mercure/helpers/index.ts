import type { EventSourceMessage } from '@microsoft/fetch-event-source';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { MercureInfo } from '../reducers/mercureInfo';

export const bindToMercureTopic = <T>(
  mercureInfo: MercureInfo & { version?: 'legacy' | 'stable' },
  topics: string[],
  onMessage: (message: T) => void,
  onTokenExpired: () => void,

  /* Test seam */
  _fetchEventSource: typeof fetchEventSource = fetchEventSource,
) => {
  const { status, version: mercureVersion = 'legacy' } = mercureInfo;

  if (status !== 'loaded' || !mercureInfo.mercureHubUrl) {
    return undefined;
  }

  const onEventSourceMessage = ({ data }: EventSourceMessage) => onMessage(JSON.parse(data) as T);
  const controller = new AbortController();

  topics.forEach((topic) => {
    const hubUrl = new URL(mercureInfo.mercureHubUrl);
    hubUrl.searchParams.append(mercureVersion === 'legacy' ? 'topic' : 'match', topic);

    _fetchEventSource(hubUrl.toString(), {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${mercureInfo.token}` },
      onmessage: onEventSourceMessage,
      // TODO Limit the amount of attempts
      onerror: onTokenExpired,
    }).catch((e) => console.warn(e));
  });

  return () => controller.abort();
};
