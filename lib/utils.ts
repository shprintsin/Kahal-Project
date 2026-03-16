import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toISOStringSafe(date: Date | null | undefined): string | null {
  return date?.toISOString() ?? null
}
