import { fromPartial } from '@total-typescript/shoehorn';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { bindToMercureTopic } from '../../../src/mercure/helpers';
import type { MercureInfo } from '../../../src/mercure/reducers/mercureInfo';

vi.mock('event-source-polyfill');

const noop = () => {};

describe('helpers', () => {
  describe('bindToMercureTopic', () => {
    const onMessage = vi.fn();
    const onTokenExpired = vi.fn();

    it.each([
      [fromPartial<MercureInfo>({ status: 'error' })],
      [fromPartial<MercureInfo>({ status: 'loading' })],
      [fromPartial<MercureInfo>({ status: 'loaded', mercureHubUrl: undefined })],
    ])('does not bind an EventSource when loading, error or no hub URL', (mercureInfo) => {
      bindToMercureTopic(mercureInfo, [''], noop, noop);

      expect(EventSourcePolyfill).not.toHaveBeenCalled();
      expect(onMessage).not.toHaveBeenCalled();
      expect(onTokenExpired).not.toHaveBeenCalled();
    });

    it('binds an EventSource when mercure info is properly loaded', () => {
      const token = 'abc.123.efg';
      const mercureHubUrl = 'https://example.com/.well-known/mercure';
      const topic = 'foo';
      const hubUrl = new URL(mercureHubUrl);

      hubUrl.searchParams.append('topic', topic);

      const callback = bindToMercureTopic({
        status: 'loaded',
        mercureHubUrl,
        token,
      }, [topic], onMessage, onTokenExpired);

      expect(EventSourcePolyfill).toHaveBeenCalledWith(hubUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const [es] = (EventSourcePolyfill as any).mock.instances as EventSourcePolyfill[];

      es.onmessage?.({ data: '{"foo": "bar"}' });
      es.onerror?.({ status: 401 });
      expect(onMessage).toHaveBeenCalledWith({ foo: 'bar' });
      expect(onTokenExpired).toHaveBeenCalled();

      callback?.();
      expect(es.close).toHaveBeenCalled();
    });
  });
});
