export interface SijiEntry {
  value: string;
  label: string;
  hour: number | null;
}

export const SIJI_LIST: SijiEntry[] = [
  { value: "unknown", label: "모름", hour: null },
  { value: "ja", label: "자시 (23:00~01:00)", hour: 23 },
  { value: "chuk", label: "축시 (01:00~03:00)", hour: 1 },
  { value: "in", label: "인시 (03:00~05:00)", hour: 3 },
  { value: "myo", label: "묘시 (05:00~07:00)", hour: 5 },
  { value: "jin", label: "진시 (07:00~09:00)", hour: 7 },
  { value: "sa", label: "사시 (09:00~11:00)", hour: 9 },
  { value: "o", label: "오시 (11:00~13:00)", hour: 11 },
  { value: "mi", label: "미시 (13:00~15:00)", hour: 13 },
  { value: "sin", label: "신시 (15:00~17:00)", hour: 15 },
  { value: "yu", label: "유시 (17:00~19:00)", hour: 17 },
  { value: "sul", label: "술시 (19:00~21:00)", hour: 19 },
  { value: "hae", label: "해시 (21:00~23:00)", hour: 21 },
];

export const SIJI_TO_HOUR: Record<string, number | null> = Object.fromEntries(
  SIJI_LIST.map((s) => [s.value, s.hour])
);

export const HOUR_TO_SIJI: Record<number, string> = Object.fromEntries(
  SIJI_LIST.filter((s) => s.hour !== null).map((s) => [s.hour!, s.value])
);
