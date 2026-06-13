// Mock weather data for Weather-Aware AI Planning (Feature G)

export interface WeatherForecast {
  destination: string;
  condition: "sunny" | "cloudy" | "rainy" | "stormy" | "windy" | "partly_cloudy";
  temp: number;
  icon: string;
  advice: string;
  recommendation: string;
}

const MOCK_WEATHER: Record<string, WeatherForecast> = {
  "phuket": {
    destination: "ภูเก็ต",
    condition: "sunny",
    temp: 32,
    icon: "clear_day",
    advice: "แดดแรงมาก! อย่าลืมครีมกันแดดและหมวก",
    recommendation: "☀️ สภาพอากาศแจ่มใส เหมาะกับกิจกรรมกลางแจ้ง เล่นน้ำทะเล หรือดำน้ำตื้น"
  },
  "bangkok": {
    destination: "กรุงเทพ",
    condition: "rainy",
    temp: 29,
    icon: "rainy",
    advice: "มีฝนฟ้าคะนอง 60% ควรพกร่ม",
    recommendation: "🌧️ มีโอกาสฝนตกในช่วงบ่าย แนะนำให้วางแผนกิจกรรม Indoor เช่น พิพิธภัณฑ์ หรือคาเฟ่ในช่วงบ่าย"
  },
  "chiang mai": {
    destination: "เชียงใหม่",
    condition: "cloudy",
    temp: 25,
    icon: "cloud",
    advice: "อากาศเย็นสบาย ท้องฟ้ามีเมฆบางส่วน",
    recommendation: "⛅ อากาศกำลังดี เหมาะกับการเดินเล่นเมืองเก่า หรือนั่งคาเฟ่กลางแจ้ง"
  },
  "pattaya": {
    destination: "พัทยา",
    condition: "sunny",
    temp: 31,
    icon: "clear_day",
    advice: "อากาศร้อนจัด ดื่มน้ำเยอะๆ",
    recommendation: "☀️ อากาศร้อน เหมาะกับกิจกรรมทางน้ำ แต่ควรหลีกเลี่ยงช่วงเที่ยงวัน"
  },
  "koh samui": {
    destination: "เกาะสมุย",
    condition: "sunny",
    temp: 33,
    icon: "clear_day",
    advice: "ทะเลสวย น่าเล่นน้ำ",
    recommendation: "☀️ สภาพอากาศดีมาก เล่นน้ำทะเลและกิจกรรมชายหาดได้เต็มที่"
  },
  "krabi": {
    destination: "กระบี่",
    condition: "partly_cloudy",
    temp: 30,
    icon: "partly_cloudy_day",
    advice: "มีเมฆเป็นระยะ แดดไม่ร้อนมาก",
    recommendation: "⛅ อากาศกำลังดี เหมาะกับการนั่งเรือเที่ยวเกาะ"
  },
  "tokyo": {
    destination: "โตเกียว",
    condition: "rainy",
    temp: 22,
    icon: "rainy",
    advice: "มีฝนตกปรอยๆ ควรพกร่ม",
    recommendation: "🌧️ ฝนตกเล็กน้อย แนะนำกิจกรรมในร่ม เช่น ช้อปปิ้ง พิพิธภัณฑ์ หรือร้านอาหาร"
  },
};

const DEFAULT_WEATHER: WeatherForecast = {
  destination: "จุดหมายปลายทาง",
  condition: "sunny",
  temp: 28,
  icon: "clear_day",
  advice: "อากาศดี เหมาะกับการท่องเที่ยว",
  recommendation: "☀️ สภาพอากาศโดยทั่วไปดี สามารถทำกิจกรรมต่างๆ ได้ตามแผน"
};

export function getWeatherForDestination(destination: string): WeatherForecast {
  const key = destination.toLowerCase().trim();
  // Try to match partial names
  for (const [k, v] of Object.entries(MOCK_WEATHER)) {
    if (key.includes(k) || k.includes(key)) {
      return v;
    }
  }
  return DEFAULT_WEATHER;
}
