import { BadRequestError, NotFoundError } from '../../errors/app-error'
import { institutoRepository } from './instituto.repository'
import {
  InstitutoDetail,
  InstitutoListItem,
  InstitutoPayload,
  InstitutoWithRelations,
} from './instituto.types'

const parseInstitutoId = (id: number) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError('ID de instituto invalido')
  }
}

const parseDistritoId = (value: unknown) => {
  const distritoId = Number(value)
  if (!Number.isInteger(distritoId) || distritoId <= 0) {
    throw new BadRequestError('El campo distritoId es obligatorio y debe ser un entero positivo')
  }
  return distritoId
}

const ensureDistritoExists = async (distritoId: number) => {
  const exists = await institutoRepository.countByDistritoId(distritoId)
  if (!exists) {
    throw new NotFoundError('Distrito no encontrado')
  }
}

const mapInstitutoListItem = (instituto: InstitutoWithRelations): InstitutoListItem => ({
  id: instituto.id,
  nombre: instituto.nombre,
  distritoNombre: instituto.distrito?.nombre || null,
  regionId: instituto.distrito?.region?.id || null,
})

const mapInstitutoDetail = (instituto: InstitutoWithRelations): InstitutoDetail => ({
  ...mapInstitutoListItem(instituto),
  distritoId: instituto.distritoId,
  regionNombre: instituto.distrito?.region ? `Region ${instituto.distrito.region.id}` : null,
})

export const institutoService = {
  async getAll() {
    const institutos = await institutoRepository.findMany()
    return institutos.map(mapInstitutoListItem)
  },

  async getById(id: number) {
    parseInstitutoId(id)

    const instituto = await institutoRepository.findById(id)
    if (!instituto) return null

    return mapInstitutoDetail(instituto)
  },

  async create(payload: InstitutoPayload) {
    if (!payload.nombre || typeof payload.nombre !== 'string' || payload.nombre.trim() === '') {
      throw new BadRequestError('El campo nombre es obligatorio')
    }

    const distritoId = parseDistritoId(payload.distritoId)
    await ensureDistritoExists(distritoId)

    return institutoRepository.create({
      nombre: payload.nombre.trim(),
      distrito: { connect: { id: distritoId } },
    })
  },

  async update(id: number, payload: InstitutoPayload) {
    parseInstitutoId(id)

    if (!payload || Object.keys(payload).length === 0) {
      throw new BadRequestError('No se proporcionaron campos para actualizar')
    }

    const instituto = await institutoRepository.findById(id)
    if (!instituto) {
      throw new NotFoundError('Instituto no encontrado')
    }

    const data: { nombre?: string; distrito?: { connect: { id: number } } } = {}

    if (Object.prototype.hasOwnProperty.call(payload, 'nombre')) {
      if (typeof payload.nombre !== 'string' || payload.nombre.trim() === '') {
        throw new BadRequestError('El campo nombre no puede estar vacio')
      }
      data.nombre = payload.nombre.trim()
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'distritoId')) {
      const distritoId = parseDistritoId(payload.distritoId)
      await ensureDistritoExists(distritoId)
      data.distrito = { connect: { id: distritoId } }
    }

    return institutoRepository.update(id, data)
  },

  async remove(id: number) {
    parseInstitutoId(id)

    const instituto = await institutoRepository.findById(id)
    if (!instituto) {
      throw new NotFoundError('Instituto no encontrado')
    }

    return institutoRepository.delete(id)
  },
}
