'use client';

import { useEffect, useRef, useState } from 'react';

export type SSEEvent = {
  type: string;
  data: Record<string, any>;
};

export function useEventSource(url: string) {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const eventsRef = useRef<SSEEvent[]>([]);

  useEffect(() => {
    const es = new EventSource(url);

    es.onopen = () => setConnected(true);

    es.onmessage = (msg) => {
      try {
        const event: SSEEvent = JSON.parse(msg.data);
        if (event.type === 'KEEPALIVE') return;

        eventsRef.current = [event, ...eventsRef.current].slice(0, 50);
        setEvents([...eventsRef.current]);
      } catch { }
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [url]);

  const latestEvent = events[0] ?? null;

  return { events, latestEvent, connected };
}
