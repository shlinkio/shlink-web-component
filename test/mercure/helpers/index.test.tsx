import { fromPartial } from '@total-typescript/shoehorn';
import { bindToMercureTopic } from '../../../src/mercure/helpers';
import type { MercureInfo } from '../../../src/mercure/reducers/mercureInfo';

const noop = () => {};

describe('helpers', () => {
  describe('bindToMercureTopic', () => {
    const onMessage = vi.fn();
    const onTokenExpired = vi.fn();
    const fetchEventSource = vi.fn().mockResolvedValue(undefined);

    it.each([
      [fromPartial<MercureInfo>({ status: 'error' })],
      [fromPartial<MercureInfo>({ status: 'loading' })],
      [fromPartial<MercureInfo>({ status: 'loaded', mercureHubUrl: undefined })],
    ])('does not bind an EventSource when loading, error or no hub URL', (mercureInfo) => {
      bindToMercureTopic(mercureInfo, ['topic'], noop, noop);

      expect(fetchEventSource).not.toHaveBeenCalled();
      expect(onMessage).not.toHaveBeenCalled();
      expect(onTokenExpired).not.toHaveBeenCalled();
    });

    it.each([
      { version: 'legacy' as const, expectedTopicArg: 'topic' },
      { version: 'stable' as const, expectedTopicArg: 'match' },
    ])('binds an EventSource when mercure info is properly loaded', ({ version, expectedTopicArg }) => {
      const token = 'abc.123.def';
      const mercureHubUrl = 'https://example.com/.well-known/mercure';
      const topic = 'foo';
      const hubUrl = new URL(mercureHubUrl);

      hubUrl.searchParams.append(expectedTopicArg, topic);

      bindToMercureTopic(
        {
          status: 'loaded',
          mercureHubUrl,
          token,
          version,
        },
        [topic],
        onMessage,
        onTokenExpired,
        fetchEventSource,
      );

      expect(fetchEventSource).toHaveBeenCalledWith(
        hubUrl.toString(),
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      const [, args] = fetchEventSource.mock.lastCall as any[];

      args?.onmessage?.({ data: '{"foo": "bar"}' });
      args?.onerror?.();
      expect(onMessage).toHaveBeenCalledWith({ foo: 'bar' });
      expect(onTokenExpired).toHaveBeenCalled();
    });
  });
});
