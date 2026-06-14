const HOTEL_NAMES = [
  'Siam Grand Hotel', 'Phuket Ocean Breeze Resort', 'Chiang Mai Lanna Boutique',
  'Krabi Beachfront Villa', 'Bangkok Riverside Luxury', 'Pattaya Sea View',
  'Koh Samui Paradise Resort', 'Hilton Tokyo Shinjuku',
];

const USER_NAMES = [
  'Somchai Jaidee', 'Alice Smith', 'Mana Dee', 'Siriporn Wong',
  'John Doe', 'Tanakorn R', 'Pimchanok L', 'Michael Chen',
];

const AIRLINES = ['Thai Sky', 'Siam Airways', 'Andaman Jet', 'Nok Air', 'AirAsia'];

const LOCATIONS = [
  'กรุงเทพ', 'ภูเก็ต', 'เชียงใหม่', 'กระบี่', 'พัทยา', 'เกาะสมุย', 'โตเกียว',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function currentTime(): string {
  return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

function generateEvent() {
  const type = Math.random() < 0.3 ? 'NEW_USER' : Math.random() < 0.6 ? 'NEW_HOTEL_BOOKING' : 'NEW_FLIGHT_BOOKING';
  const time = currentTime();

  switch (type) {
    case 'NEW_USER':
      return {
        type,
        data: { name: pick(USER_NAMES), time, id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
      };
    case 'NEW_HOTEL_BOOKING':
      return {
        type,
        data: {
          hotel: pick(HOTEL_NAMES), user: pick(USER_NAMES), amount: randomAmount(1500, 25000),
          nights: randomAmount(1, 5), time, id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        },
      };
    case 'NEW_FLIGHT_BOOKING':
      return {
        type,
        data: {
          airline: pick(AIRLINES), user: pick(USER_NAMES),
          from: pick(LOCATIONS), to: pick(LOCATIONS.filter(l => l !== LOCATIONS[0])),
          amount: randomAmount(1200, 15000), time, id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        },
      };
  }
}

export async function GET(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const keepalive = setInterval(() => {
        send({ type: 'KEEPALIVE', data: { time: currentTime() } });
      }, 15_000);

      const push = () => {
        const event = generateEvent();
        send(event);
        const nextDelay = Math.random() * 10_000 + 5_000;
        timer = setTimeout(push, nextDelay);
      };

      let timer = setTimeout(push, 3_000);

      req.signal.addEventListener('abort', () => {
        clearTimeout(timer);
        clearInterval(keepalive);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
