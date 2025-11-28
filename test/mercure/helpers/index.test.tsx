import { fromPartial } from '@total-typescript/shoehorn';
import { bindToMercureTopic } from '../../../src/mercure/helpers';
import type { MercureInfo } from '../../../src/mercure/reducers/mercureInfo';

const noop = () => {};

describe('helpers', () => {
  describe('bindToMercureTopic', () => {
    const onMessage = vi.fn();
    const onTokenExpired = vi.fn();
    const EventSourceMock = vi.fn(class {
      close = vi.fn();
    });

    beforeEach(() => {
      vi.stubGlobal('EventSource', EventSourceMock);
    });
    afterEach(() => vi.unstubAllGlobals());

    it.each([
      [fromPartial<MercureInfo>({ status: 'error' })],
      [fromPartial<MercureInfo>({ status: 'loading' })],
      [fromPartial<MercureInfo>({ status: 'loaded', mercureHubUrl: undefined })],
    ])('does not bind an EventSource when loading, error or no hub URL', (mercureInfo) => {
      bindToMercureTopic(mercureInfo, [''], noop, noop);

      expect(EventSourceMock).not.toHaveBeenCalled();
      expect(onMessage).not.toHaveBeenCalled();
      expect(onTokenExpired).not.toHaveBeenCalled();
    });

    it('binds an EventSource when mercure info is properly loaded', () => {
      const token = 'abc.123.efg';
      const mercureHubUrl = 'https://example.com/.well-known/mercure';
      const topic = 'foo';
      const hubUrl = new URL(mercureHubUrl);

      hubUrl.searchParams.append('topic', topic);
      hubUrl.searchParams.append('authorization', token);

      const callback = bindToMercureTopic({
        status: 'loaded',
        mercureHubUrl,
        token,
      }, [topic], onMessage, onTokenExpired);

      expect(EventSourceMock).toHaveBeenCalledWith(hubUrl);

      const [es] = EventSourceMock.mock.instances as any[];

      es.onmessage?.({ data: '{"foo": "bar"}' });
      es.onerror?.();
      expect(onMessage).toHaveBeenCalledWith({ foo: 'bar' });
      expect(onTokenExpired).toHaveBeenCalled();

      callback?.();
      expect(es.close).toHaveBeenCalled();
    });
  });
});
