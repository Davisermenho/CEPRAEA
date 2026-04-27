import type { Holiday, HolidayConflict } from '@/types'
import type { Training } from '@/types'
import { addDays, dateToISO } from './utils'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function iso(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`
}

/** Algoritmo de Meeus/Jones/Butcher para data da Páscoa */
function easterDate(year: number): [number, number] {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return [month, day]
}

function getHolidaysForYear(year: number): Holiday[] {
  const [em, ed] = easterDate(year)
  const easter = iso(year, em, ed)

  return [
    // Nacionais fixos
    { data: iso(year, 1, 1),   nome: 'Confraternização Universal',   tipo: 'nacional' },
    { data: iso(year, 4, 21),  nome: 'Tiradentes',                   tipo: 'nacional' },
    { data: iso(year, 5, 1),   nome: 'Dia do Trabalho',              tipo: 'nacional' },
    { data: iso(year, 9, 7),   nome: 'Independência do Brasil',      tipo: 'nacional' },
    { data: iso(year, 10, 12), nome: 'Nossa Senhora Aparecida',      tipo: 'nacional' },
    { data: iso(year, 11, 2),  nome: 'Finados',                      tipo: 'nacional' },
    { data: iso(year, 11, 15), nome: 'Proclamação da República',     tipo: 'nacional' },
    { data: iso(year, 11, 20), nome: 'Consciência Negra',            tipo: 'nacional' },
    { data: iso(year, 12, 25), nome: 'Natal',                        tipo: 'nacional' },
    // Nacionais móveis (baseados na Páscoa)
    { data: addDays(easter, -48), nome: 'Carnaval (segunda)',        tipo: 'nacional' },
    { data: addDays(easter, -47), nome: 'Carnaval (terça)',          tipo: 'nacional' },
    { data: addDays(easter, -2),  nome: 'Sexta-feira Santa',         tipo: 'nacional' },
    { data: easter,               nome: 'Páscoa',                    tipo: 'nacional' },
    { data: addDays(easter, 60),  nome: 'Corpus Christi',            tipo: 'nacional' },
    // Estadual RJ
    { data: iso(year, 4, 23),  nome: 'São Jorge',                    tipo: 'estadual' },
    // Municipal Rio de Janeiro
    { data: iso(year, 1, 20),  nome: 'São Sebastião (Rio)',          tipo: 'municipal' },
  ]
}

const ALL_HOLIDAYS: Holiday[] = [
  ...getHolidaysForYear(2025),
  ...getHolidaysForYear(2026),
  ...getHolidaysForYear(2027),
]

export const HOLIDAYS: Map<string, Holiday> = new Map(
  ALL_HOLIDAYS.map((h) => [h.data, h])
)

export function isHoliday(dateISO: string): Holiday | undefined {
  return HOLIDAYS.get(dateISO)
}

/**
 * Sugere datas alternativas para um treino em feriado.
 * Preferência: manhã (sábado ou domingo seguinte às 8h),
 * depois segunda-feira, depois sábado anterior.
 */
export function getHolidayAlternatives(dateISO: string): string[] {
  const date = new Date(dateISO + 'T00:00:00')
  const dow = date.getDay()

  const candidates: string[] = []

  // Próximo sábado
  const toSat = (6 - dow + 7) % 7 || 7
  candidates.push(addDays(dateISO, toSat))

  // Próxima segunda
  const toMon = (1 - dow + 7) % 7 || 7
  candidates.push(addDays(dateISO, toMon))

  // Sábado anterior
  const prevSat = dow === 0 ? 1 : dow === 6 ? 7 : dow + 1
  candidates.push(addDays(dateISO, -prevSat))

  // Próximo domingo (se não for o feriado em si)
  const toSun = (7 - dow) % 7 || 7
  const nextSun = addDays(dateISO, toSun)
  if (!candidates.includes(nextSun)) candidates.push(nextSun)

  return candidates.filter((d) => !isHoliday(d) && d !== dateISO)
}

export function getTrainingConflicts(trainings: Training[]): HolidayConflict[] {
  return trainings
    .filter((t) => t.status === 'agendado')
    .flatMap((t) => {
      const holiday = isHoliday(t.data)
      if (!holiday) return []
      return [{ training: t, holiday, alternatives: getHolidayAlternatives(t.data) }]
    })
}

/** Formata feriado para exibição: "São Jorge (estadual RJ)" */
export function formatHolidayLabel(h: Holiday): string {
  const tipo = h.tipo === 'nacional' ? 'nacional' : h.tipo === 'estadual' ? 'estadual RJ' : 'municipal Rio'
  return `${h.nome} (${tipo})`
}

/** Exporta lista de todos os feriados para fins de auditoria */
export function getAllHolidays(): Holiday[] {
  return ALL_HOLIDAYS.sort((a, b) => a.data.localeCompare(b.data))
}

/** Sugere horário de manhã para treino alternativo */
export function morningSchedule(originalStart: string): { horaInicio: string; horaFim: string } {
  // Quintas são 20h-21h30 → alternativa de manhã: 08h00-09h30
  // Domingos são 07h30-09h → mantém o mesmo
  if (originalStart === '07:30') return { horaInicio: '07:30', horaFim: '09:00' }
  return { horaInicio: '08:00', horaFim: '09:30' }
}

export function isoToDateObj(iso: string): Date {
  return new Date(iso + 'T00:00:00')
}

export function formatAlternativeDate(iso: string): string {
  const d = isoToDateObj(iso)
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${days[d.getDay()]} ${d.getDate()}/${months[d.getMonth()]}`
}

export { dateToISO }
