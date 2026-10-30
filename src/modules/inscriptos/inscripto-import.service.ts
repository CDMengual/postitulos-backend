import { createHash } from 'crypto'
import { Prisma } from '@prisma/client'
import { BadRequestError, NotFoundError } from '../../errors/app-error'
import { inscriptoRepository } from './inscripto.repository'
import { analyzeCsv } from './inscripto-import.parser'

const prisma = inscriptoRepository.prisma
async function prepare(file: Express.Multer.File | undefined, rawCohorteId: unknown) {
  const cohorteId = Number(rawCohorteId)
  if (!Number.isInteger(cohorteId) || cohorteId <= 0)
    throw new BadRequestError('Selecciona una cohorte valida')
  if (!file || !/\.csv$/i.test(file.originalname))
    throw new BadRequestError('Selecciona un archivo CSV')
  const cohorte = await prisma.cohorte.findUnique({
    where: { id: cohorteId },
    select: { id: true, nombre: true, anio: true },
  })
  if (!cohorte) throw new NotFoundError('Cohorte no encontrada')
  const [existing, distritos, regiones] = await Promise.all([
    prisma.inscripto.findMany({ where: { cohorteId }, select: { dni: true } }),
    prisma.distrito.findMany({ select: { id: true, nombre: true, regionId: true } }),
    prisma.region.findMany({ select: { id: true } }),
  ])
  const rows = analyzeCsv(
    file.buffer.toString('utf8'),
    new Set(existing.map((r) => r.dni.replace(/[.\s-]/g, ''))),
    distritos,
    regiones.map((r) => r.id),
  )
  const hash = createHash('sha256').update(String(cohorteId)).update(file.buffer).digest('hex')
  return { cohorte, rows, hash }
}
function summary(rows: Awaited<ReturnType<typeof prepare>>['rows']) {
  return {
    total: rows.length,
    validas: rows.filter((r) => r.resultado === 'IMPORTAR').length,
    duplicadas: rows.filter((r) => r.resultado === 'DUPLICADA').length,
    invalidas: rows.filter((r) => r.resultado === 'INVALIDA').length,
  }
}
export const inscriptoImportService = {
  async preview(file: Express.Multer.File | undefined, cohorteId: unknown) {
    const prepared = await prepare(file, cohorteId)
    return {
      cohorte: prepared.cohorte,
      hash: prepared.hash,
      ...summary(prepared.rows),
      filas: prepared.rows.map(({ data, ...row }) => row),
    }
  },
  async commit(
    file: Express.Multer.File | undefined,
    cohorteId: unknown,
    hash: unknown,
    userId: number,
  ) {
    const prepared = await prepare(file, cohorteId)
    if (!hash || hash !== prepared.hash)
      throw new BadRequestError(
        'El archivo o la cohorte cambiaron. Volve a generar la vista previa',
      )
    const valid = prepared.rows.filter((r) => r.resultado === 'IMPORTAR')
    if (!valid.length)
      throw new BadRequestError('No hay inscripciones nuevas validas para importar')
    const timestamp = new Date().toISOString()
    const data = valid.map((row) => ({
      ...row.data,
      cohorteId: prepared.cohorte.id,
      estado: 'PENDIENTE' as const,
      documentacion: 'PENDIENTE' as const,
      datosFormulario: {
        ...row.data.datosFormulario,
        origen_registro: 'CSV',
        archivo_origen: file!.originalname,
        fila_csv: row.fila,
        fecha_importacion: timestamp,
        importado_por_usuario_id: userId,
      } as Prisma.InputJsonObject,
    }))
    const creadas = await prisma.$transaction(
      async (tx) => {
        let count = 0
        for (let i = 0; i < data.length; i += 500) {
          const result = await tx.inscripto.createMany({
            data: data.slice(i, i + 500),
            skipDuplicates: true,
          })
          count += result.count
        }
        return count
      },
      { timeout: 60000 },
    )
    return {
      cohorteId: prepared.cohorte.id,
      ...summary(prepared.rows),
      creadas,
      omitidas: prepared.rows.length - creadas,
    }
  },
}
