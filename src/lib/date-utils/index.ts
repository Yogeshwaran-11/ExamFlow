import {
  format,
  parseISO,
  differenceInDays,
  addDays,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
} from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export const TIMEZONE = 'Asia/Kolkata'

export function getTodayIST(): Date {
  return toZonedTime(new Date(), TIMEZONE)
}

export function getTodayISODate(): string {
  return format(getTodayIST(), 'yyyy-MM-dd')
}

export function formatDate(isoDate: string): string {
  return format(parseISO(isoDate), 'EEE, d MMM yyyy')
}

export function formatShortDate(isoDate: string): string {
  return format(parseISO(isoDate), 'd MMM')
}

export function formatDayLabel(isoDate: string): string {
  return format(parseISO(isoDate), 'EEE d')
}

export function daysUntil(isoDate: string): number {
  const today = startOfDay(getTodayIST())
  const target = startOfDay(parseISO(isoDate))
  return differenceInDays(target, today)
}

export function addDaysToISO(isoDate: string, days: number): string {
  return format(addDays(parseISO(isoDate), days), 'yyyy-MM-dd')
}

export function isTodayISO(isoDate: string): boolean {
  return isToday(parseISO(isoDate))
}

export function isPastDate(isoDate: string): boolean {
  return isBefore(parseISO(isoDate), startOfDay(getTodayIST()))
}

export function isFutureDate(isoDate: string): boolean {
  return isAfter(parseISO(isoDate), startOfDay(getTodayIST()))
}

export function minutesToHoursLabel(minutes: number): string {
  if (minutes <= 0) return '0m'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function getHourGreeting(): string {
  const hour = getTodayIST().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
