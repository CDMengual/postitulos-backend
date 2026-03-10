import { Prisma } from '@prisma/client'
import * as XLSX from 'xlsx'
import { BadRequestError, NotFoundError } from '../../errors/app-error'
import { inscripcionService } from '../inscripciones'
import { cursanteRepository } from './cursante.repository'
import { CreateCursanteInput, CursanteDetalleEnAula, ListCursantesInput } from './cursante.types'

const normalizeText = (value: unknown) => {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  return text === '' ? null : text
}

const normalizeCursantePayload = (input: CreateCursanteInput) => {
  const nombre = normalizeText(input.nombre)
  const apellido = normalizeText(input.apellido)
  const dni = normalizeText(input.dni)
  const email = normalizeText(input.email)
  const celular = normalizeText(input.celular)
  const titulo = normalizeText(input.titulo)

  return { nombre, apellido, dni, email, celular, titulo }
}

const mapDetalleEnAula = (detalle: CursanteDetalleEnAula | null) => {
  if (!detalle) return null

  return {
    cursante: {
      id: detalle.cursante.id,
      nombre: detalle.cursante.nombre,
      apellido: detalle.cursante.apellido,
      dni: detalle.cursante.dni,
      email: detalle.cursante.email,
      celular: detalle.cursante.celular,
      titulo: detalle.cursante.titulo,
      distrito: detalle.cursante.distrito?.nombre || null,
      regionId: detalle.cursante.distrito?.regionId || null,
    },
    inscripcionAula: {
      aulaId: detalle.aulaId,
      aula: detalle.aula
        ? {
            id: detalle.aula.id,
            nombre: detalle.aula.nombre,
            codigo: detalle.aula.codigo,
            numero: detalle.aula.numero,
          }
        : null,
      cursanteId: detalle.cursanteId,
      estado: detalle.estado,
      documentacion: detalle.documentacion,
      observaciones: detalle.observaciones,
      dniAdjuntoUrl: detalle.dniAdjuntoUrl,
      tituloAdjuntoUrl: detalle.tituloAdjuntoUrl,
      createdAt: detalle.createdAt,
      updatedAt: detalle.updatedAt,
    },
  }
}

export const cursanteService = {
  async create(data: Prisma.CursanteCreateInput) {
    return cursanteRepository.create(data)
  },

  async getById(id: number) {
    return cursanteRepository.findById(id)
  },

  async update(id: number, data: Prisma.CursanteUpdateInput) {
    return cursanteRepository.update(id, data)
  },

  async remove(id: number) {
    await cursanteRepository.deleteAulasByCursanteId(id)
    return cursanteRepository.delete(id)
  },

  async list({ search, page = 1, limit = 10 }: ListCursantesInput) {
    const skip = (page - 1) * limit
    const searchTerms = (search || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)

    const where: Prisma.CursanteWhereInput =
      searchTerms.length > 0
        ? {
            AND: searchTerms.map((term) => ({
              OR: [
                { nombre: { contains: term } },
                { apellido: { contains: term } },
                { dni: { contains: term } },
                { email: { contains: term } },
              ],
            })),
          }
        : {}

    const [cursantes, total] = await Promise.all([
      cursanteRepository.findManyPaginated({
        where,
        skip,
        take: limit,
      }),
      cursanteRepository.count(where),
    ])

    return { cursantes, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async getByDni(dni: string) {
    return cursanteRepository.findByDni(dni)
  },

  async createStandalone(input: CreateCursanteInput & { aulaId?: number | null }) {
    const { nombre, apellido, dni, email, celular, titulo } = normalizeCursantePayload(input)

    if (!nombre || !apellido || !dni) {
      throw new BadRequestError('Debe enviar nombre, apellido y dni')
    }

    const existing = await this.getByDni(dni)
    if (existing) {
      throw new BadRequestError('Ya existe un cursante con ese DNI')
    }

    const cursante = await this.create({
      nombre,
      apellido,
      dni,
      email,
      celular,
      titulo,
    })

    if (input.aulaId !== undefined && input.aulaId !== null) {
      if (!Number.isInteger(input.aulaId) || input.aulaId <= 0) {
        throw new BadRequestError('aulaId invalido')
      }
      await inscripcionService.assignExistingCursanteToAula(cursante.id, input.aulaId)
    }

    return this.getById(cursante.id)
  },

  async createOrAssignToAula(
    input: CreateCursanteInput & {
      aulaId: number
    },
  ) {
    if (!Number.isInteger(input.aulaId) || input.aulaId <= 0) {
      throw new BadRequestError('Debe enviar un aulaId valido')
    }

    const normalized = normalizeCursantePayload(input)
    if (!normalized.dni) {
      throw new BadRequestError('Debe enviar al menos DNI y aulaId')
    }

    let cursante = await this.getByDni(normalized.dni)

    if (!cursante) {
      if (!normalized.nombre || !normalized.apellido) {
        throw new BadRequestError('Faltan nombre y apellido para crear cursante nuevo')
      }

      cursante = await this.create({
        nombre: normalized.nombre,
        apellido: normalized.apellido,
        dni: normalized.dni,
        email: normalized.email,
        celular: normalized.celular,
        titulo: normalized.titulo,
      })
    }

    return inscripcionService.inscribirCursante({
      aulaId: input.aulaId,
      dni: cursante.dni,
      nombre: cursante.nombre,
      apellido: cursante.apellido,
      email: cursante.email || undefined,
      celular: cursante.celular || undefined,
      titulo: cursante.titulo || undefined,
    })
  },

  async assignToAula(cursanteId: number, aulaId: number) {
    if (!Number.isInteger(cursanteId) || cursanteId <= 0) {
      throw new BadRequestError('ID de cursante invalido')
    }
    if (!Number.isInteger(aulaId) || aulaId <= 0) {
      throw new BadRequestError('Debe enviar un aulaId valido')
    }

    const cursante = await this.getById(cursanteId)
    if (!cursante) {
      throw new NotFoundError('Cursante no encontrado')
    }

    const result = await inscripcionService.assignExistingCursanteToAula(cursanteId, aulaId)
    const updated = await this.getById(cursanteId)

    return {
      created: result.created,
      cursante: updated,
    }
  },

  parseImportRows(fileBuffer: Buffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    return XLSX.utils.sheet_to_json(sheet, { defval: '' })
  },

  async importFromFile(aulaId: number, fileBuffer: Buffer) {
    const rows = this.parseImportRows(fileBuffer)
    return inscripcionService.importMany(aulaId, rows)
  },

  async getDetalleEnAula(cursanteId: number, aulaId: number) {
    const detalle = await inscripcionService.getDetalleCursanteEnAula(cursanteId, aulaId)
    return mapDetalleEnAula(detalle as CursanteDetalleEnAula | null)
  },

  normalizeObservaciones(value: unknown) {
    return value === null || value === undefined || String(value).trim() === ''
      ? null
      : String(value).trim()
  },
}
