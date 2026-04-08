export interface City {
  name: string;
  nameEn: string;
  longitude: number;
  latitude: number;
}

export const KOREAN_CITIES: City[] = [
  { name: "서울", nameEn: "Seoul", longitude: 126.9780, latitude: 37.5665 },
  { name: "부산", nameEn: "Busan", longitude: 129.0756, latitude: 35.1796 },
  { name: "대구", nameEn: "Daegu", longitude: 128.6014, latitude: 35.8714 },
  { name: "인천", nameEn: "Incheon", longitude: 126.7052, latitude: 37.4563 },
  { name: "광주", nameEn: "Gwangju", longitude: 126.8526, latitude: 35.1595 },
  { name: "대전", nameEn: "Daejeon", longitude: 127.3845, latitude: 36.3504 },
  { name: "울산", nameEn: "Ulsan", longitude: 129.3114, latitude: 35.5384 },
  { name: "세종", nameEn: "Sejong", longitude: 127.0000, latitude: 36.4800 },
  { name: "제주", nameEn: "Jeju", longitude: 126.5312, latitude: 33.4996 },
  { name: "수원", nameEn: "Suwon", longitude: 127.0286, latitude: 37.2636 },
  { name: "고양", nameEn: "Goyang", longitude: 126.8320, latitude: 37.6584 },
  { name: "용인", nameEn: "Yongin", longitude: 127.1793, latitude: 37.2411 },
  { name: "창원", nameEn: "Changwon", longitude: 128.6811, latitude: 35.2280 },
  { name: "성남", nameEn: "Seongnam", longitude: 127.1388, latitude: 37.4200 },
  { name: "청주", nameEn: "Cheongju", longitude: 127.4890, latitude: 36.6424 },
  { name: "전주", nameEn: "Jeonju", longitude: 127.1480, latitude: 35.8242 },
  { name: "천안", nameEn: "Cheonan", longitude: 127.1522, latitude: 36.8151 },
  { name: "김해", nameEn: "Gimhae", longitude: 128.8893, latitude: 35.2285 },
  { name: "포항", nameEn: "Pohang", longitude: 129.3654, latitude: 36.0190 },
  { name: "평택", nameEn: "Pyeongtaek", longitude: 127.1126, latitude: 36.9908 },
];

export function getCityByName(name: string): City | undefined {
  return KOREAN_CITIES.find(c => c.name === name);
}
