import type { Athlete, Training, AttendanceRecord, FrequencyReport } from '@/types'
import { getDB } from '@/db'

// ─── CSV ───────────────────────────────────────────────────────────────────────

function esc(val: string | number | boolean | undefined | null): string {
  const s = val == null ? '' : String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function row(cells: (string | number | boolean | undefined | null)[]): string {
  return cells.map(esc).join(',')
}

const BOM = '﻿'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function dow(dateISO: string): string {
  const [y, m, d] = dateISO.split('-').map(Number)
  return DAYS[new Date(y, m - 1, d).getDay()]
}

export function athletesToCsv(athletes: Athlete[]): string {
  const header = row(['ID', 'Nome', 'Telefone', 'Categoria', 'Nível', 'Status', 'Criado em'])
  const rows = athletes.map((a) =>
    row([a.id, a.nome, a.telefone, a.categoria ?? '', a.nivel ?? '', a.status, a.createdAt])
  )
  return BOM + [header, ...rows].join('\n')
}

export function trainingsToCsv(trainings: Training[]): string {
  const header = row(['ID', 'Data', 'Dia', 'Hora Início', 'Hora Fim', 'Tipo', 'Status', 'Local', 'Observações'])
  const rows = trainings.map((t) =>
    row([t.id, t.data, dow(t.data), t.horaInicio, t.horaFim, t.tipo, t.status, t.local ?? '', t.observacoes ?? ''])
  )
  return BOM + [header, ...rows].join('\n')
}

export function attendanceToCsv(
  records: AttendanceRecord[],
  trainingMap: Map<string, Training>,
  athleteMap: Map<string, Athlete>,
): string {
  const header = row(['Data Treino', 'Hora', 'Atleta', 'Status', 'Justificativa', 'Confirmado pela atleta', 'Registrado em'])
  const rows = records.map((r) => {
    const t = trainingMap.get(r.treinoId)
    const a = athleteMap.get(r.atletaId)
    return row([
      t?.data ?? '',
      t?.horaInicio ?? '',
      a?.nome ?? r.atletaId,
      r.status,
      r.justificativa ?? '',
      r.confirmadoPelaAtleta ? 'sim' : 'não',
      r.registradoEm,
    ])
  })
  return BOM + [header, ...rows].join('\n')
}

export function frequencyToCsv(reports: FrequencyReport[]): string {
  const header = row(['Atleta', 'Total Treinos', 'Presentes', 'Ausentes', 'Justificados', '% Presença'])
  const rows = reports.map((r) =>
    row([r.nomeAtleta, r.totalTreinos, r.presentes, r.ausentes, r.justificados, r.percentualPresenca])
  )
  return BOM + [header, ...rows].join('\n')
}

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, filename)
}

// ─── XLSX ──────────────────────────────────────────────────────────────────────

export async function exportToXlsx(
  athletes: Athlete[],
  trainings: Training[],
  records: AttendanceRecord[],
  frequencyReports: FrequencyReport[],
): Promise<void> {
  const { utils, writeFile } = await import('xlsx')

  const trainingMap = new Map(trainings.map((t) => [t.id, t]))
  const athleteMap = new Map(athletes.map((a) => [a.id, a]))

  const wsAthletes = utils.json_to_sheet(
    athletes.map((a) => ({
      ID: a.id,
      Nome: a.nome,
      Telefone: a.telefone,
      Categoria: a.categoria ?? '',
      Nível: a.nivel ?? '',
      Status: a.status,
      'Criado em': a.createdAt,
    }))
  )

  const wsTrainings = utils.json_to_sheet(
    trainings.map((t) => ({
      ID: t.id,
      Data: t.data,
      Dia: dow(t.data),
      'Hora Início': t.horaInicio,
      'Hora Fim': t.horaFim,
      Tipo: t.tipo,
      Status: t.status,
      Local: t.local ?? '',
      Observações: t.observacoes ?? '',
    }))
  )

  const wsAttendance = utils.json_to_sheet(
    records.map((r) => {
      const t = trainingMap.get(r.treinoId)
      const a = athleteMap.get(r.atletaId)
      return {
        'Data Treino': t?.data ?? '',
        Hora: t?.horaInicio ?? '',
        Atleta: a?.nome ?? r.atletaId,
        Status: r.status,
        Justificativa: r.justificativa ?? '',
        'Confirmado pela atleta': r.confirmadoPelaAtleta ? 'sim' : 'não',
        'Registrado em': r.registradoEm,
      }
    })
  )

  const wsFrequency = utils.json_to_sheet(
    frequencyReports.map((r) => ({
      Atleta: r.nomeAtleta,
      'Total Treinos': r.totalTreinos,
      Presentes: r.presentes,
      Ausentes: r.ausentes,
      Justificados: r.justificados,
      '% Presença': r.percentualPresenca,
    }))
  )

  const wb = utils.book_new()
  utils.book_append_sheet(wb, wsAthletes, 'Atletas')
  utils.book_append_sheet(wb, wsTrainings, 'Treinos')
  utils.book_append_sheet(wb, wsAttendance, 'Presenças')
  utils.book_append_sheet(wb, wsFrequency, 'Frequências')

  const date = new Date().toISOString().slice(0, 10)
  writeFile(wb, `cepraea-${date}.xlsx`)
}

// ─── Backup JSON ───────────────────────────────────────────────────────────────

export async function exportFullBackup(): Promise<void> {
  const db = await getDB()
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    athletes: await db.getAll('athletes'),
    trainings: await db.getAll('trainings'),
    attendance: await db.getAll('attendance'),
    settings: await db.getAll('settings'),
  }
  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const date = new Date().toISOString().slice(0, 10)
  triggerDownload(blob, `cepraea-backup-${date}.json`)
}

export async function importFullBackup(json: string): Promise<void> {
  const data = JSON.parse(json)
  if (data.version !== 1) throw new Error('Versão de backup incompatível')

  const db = await getDB()
  const tx = db.transaction(['athletes', 'trainings', 'attendance', 'settings'], 'readwrite')

  await Promise.all([
    tx.objectStore('athletes').clear(),
    tx.objectStore('trainings').clear(),
    tx.objectStore('attendance').clear(),
  ])

  await Promise.all([
    ...(data.athletes ?? []).map((a: Athlete) => tx.objectStore('athletes').put(a)),
    ...(data.trainings ?? []).map((t: Training) => tx.objectStore('trainings').put(t)),
    ...(data.attendance ?? []).map((r: AttendanceRecord) => tx.objectStore('attendance').put(r)),
    ...(data.settings ?? []).map((s: { key: string; value: unknown }) =>
      tx.objectStore('settings').put(s)
    ),
  ])

  await tx.done
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
