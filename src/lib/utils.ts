import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBirthYMD(year: number, month: number, day: number): string {
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}
