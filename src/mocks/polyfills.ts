/**
 * Browser globals MSW 2 expects that Hermes doesn't provide. Each one is defined only if missing.
 * Imported only by mocks/native.ts (development builds with API_MOCKS=true).
 */
import 'react-native-url-polyfill/auto';
import 'web-streams-polyfill/polyfill';

type Globals = Record<string, unknown>;
const g = globalThis as unknown as Globals;

if (typeof g.Event === 'undefined') {
  g.Event = class Event {
    readonly type: string;
    defaultPrevented = false;
    constructor(type: string) {
      this.type = type;
    }
    preventDefault() {
      this.defaultPrevented = true;
    }
    stopPropagation() {}
    stopImmediatePropagation() {}
  };
}

if (typeof g.EventTarget === 'undefined') {
  g.EventTarget = class EventTarget {
    private listeners = new Map<string, Set<(event: unknown) => void>>();
    addEventListener(type: string, listener: (event: unknown) => void) {
      if (!this.listeners.has(type)) this.listeners.set(type, new Set());
      this.listeners.get(type)!.add(listener);
    }
    removeEventListener(type: string, listener: (event: unknown) => void) {
      this.listeners.get(type)?.delete(listener);
    }
    dispatchEvent(event: { type: string }) {
      this.listeners.get(event.type)?.forEach(listener => listener(event));
      return true;
    }
  };
}

if (typeof g.MessageEvent === 'undefined') {
  const BaseEvent = g.Event as new (type: string, init?: object) => object;
  g.MessageEvent = class MessageEvent extends BaseEvent {
    readonly data: unknown;
    readonly origin: string;
    readonly lastEventId: string;
    readonly source: unknown;
    readonly ports: unknown[];
    constructor(
      type: string,
      init: {
        data?: unknown;
        origin?: string;
        lastEventId?: string;
        source?: unknown;
        ports?: unknown[];
      } = {},
    ) {
      super(type, init);
      this.data = init.data;
      this.origin = init.origin ?? '';
      this.lastEventId = init.lastEventId ?? '';
      this.source = init.source ?? null;
      this.ports = init.ports ?? [];
    }
  };
}

if (typeof g.BroadcastChannel === 'undefined') {
  // In-process only: channels with the same name in this JS runtime deliver to each other.
  const channels = new Map<string, Set<BroadcastChannelPolyfill>>();
  class BroadcastChannelPolyfill {
    onmessage: ((event: unknown) => void) | null = null;
    private listeners = new Set<(event: unknown) => void>();
    constructor(readonly name: string) {
      if (!channels.has(name)) channels.set(name, new Set());
      channels.get(name)!.add(this);
    }
    postMessage(data: unknown) {
      const MessageEventCtor = g.MessageEvent as new (
        type: string,
        init: { data: unknown },
      ) => unknown;
      channels.get(this.name)?.forEach(channel => {
        if (channel === this) return;
        const event = new MessageEventCtor('message', { data });
        channel.onmessage?.(event);
        channel.listeners.forEach(listener => listener(event));
      });
    }
    addEventListener(type: string, listener: (event: unknown) => void) {
      if (type === 'message') this.listeners.add(listener);
    }
    removeEventListener(type: string, listener: (event: unknown) => void) {
      if (type === 'message') this.listeners.delete(listener);
    }
    close() {
      channels.get(this.name)?.delete(this);
    }
  }
  g.BroadcastChannel = BroadcastChannelPolyfill;
}

if (typeof g.XMLHttpRequestUpload === 'undefined') {
  // MSW's XMLHttpRequest interceptor creates upload event targets; React Native's XHR has no such class.
  const BaseTarget = g.EventTarget as new () => object;
  g.XMLHttpRequestUpload = class XMLHttpRequestUpload extends BaseTarget {};
}
