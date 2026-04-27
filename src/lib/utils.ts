import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DAYS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const DAYS_PT_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

/** "YYYY-MM-DD" → Date at local midnight */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** "YYYY-MM-DD" → "quinta-feira, 22 de maio de 2025" */
export function formatDateLong(iso: string): string {
  const d = parseLocalDate(iso)
  return `${DAYS_PT[d.getDay()].toLowerCase()}, ${d.getDate()} de ${MONTHS_PT[d.getMonth()]} de ${d.getFullYear()}`
}

/** "YYYY-MM-DD" → "22/05/2025" */
export function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** "YYYY-MM-DD" → "Qui 22/05" */
export function formatDateCompact(iso: string): string {
  const d = parseLocalDate(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${DAYS_PT_SHORT[d.getDay()]} ${day}/${month}`
}

/** "YYYY-MM-DD" → day of week name */
export function getDayName(iso: string): string {
  return DAYS_PT[parseLocalDate(iso).getDay()]
}

/** Today as "YYYY-MM-DD" */
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** "YYYY-MM-DD" + N days → "YYYY-MM-DD" */
export function addDays(iso: string, days: number): string {
  const d = parseLocalDate(iso)
  d.setDate(d.getDate() + days)
  return dateToISO(d)
}

export function dateToISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** "11987654321" → "(11) 98765-4321" */
export function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return d
}

/** 0–100 → "87%" */
export function formatPercent(n: number): string {
  return `${Math.round(n)}%`
}

/** ISO string → "14:35" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
