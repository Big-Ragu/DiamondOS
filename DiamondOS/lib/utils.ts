import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

// Baseball-specific utilities
export function formatBattingAverage(avg: number) {
  return avg.toFixed(3)
}

export function formatERA(era: number) {
  return era.toFixed(2)
}

export function calculateBattingAverage(hits: number, atBats: number) {
  if (atBats === 0) return 0
  return hits / atBats
}

export function calculateOPS(onBasePercentage: number, sluggingPercentage: number) {
  return onBasePercentage + sluggingPercentage
}

export function formatInningsPitched(innings: number) {
  const wholeInnings = Math.floor(innings / 3)
  const partialInnings = innings % 3
  return `${wholeInnings}.${partialInnings}`
}