import { Prisma } from '@prisma/client'
import { BadRequestError, NotFoundError } from '../../errors/app-error'
import { postituloRepository } from './postitulo.repository'
import { PostituloPayload, PostituloTipoInput } from './postitulo.types'

const parseId = (id: number, entity = 'postitulo') => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError(`ID de ${entity} invalido`)
  }
}

const buildCreateData = (payload: PostituloPayload): Prisma.PostituloCreateInput => {
  const { tipos, ...rest } = payload

  if (!rest.nombre || typeof rest.nombre !== 'string' || rest.nombre.trim() === '') {
    throw new BadRequestError('El campo nombre es obligatorio')
  }

  const tiposNormalizados = tipos as PostituloTipoInput[] | undefined

  return {
    ...(rest as Prisma.PostituloCreateInput),
    nombre: rest.nombre.trim(),
    codigo: typeof rest.codigo === 'string' && rest.codigo.trim() !== '' ? rest.codigo.trim() : undefined,
    cargaHoraria: (rest.cargaHoraria as number | null | undefined) ?? undefined,
    horasSincronicas: (rest.horasSincronicas as number | null | undefined) ?? undefined,
    horasVirtuales: (rest.horasVirtuales as number | null | undefined) ?? undefined,
    tipos: tiposNormalizados
      ? {
          create: tiposNormalizados,
        }
      : undefined,
  }
}

const buildUpdateData = (payload: PostituloPayload): {
  data: Prisma.PostituloUpdateInput
  tipos?: PostituloTipoInput[]
} => {
  if (!payload || Object.keys(payload).length === 0) {
    throw new BadRequestError('No se proporcionaron campos para actualizar')
  }

  const { tipos, ...rest } = payload
  const tiposNormalizados = tipos as PostituloTipoInput[] | undefined

  const data: Prisma.PostituloUpdateInput = {
    ...(rest as Prisma.PostituloUpdateInput),
    ...(typeof rest.nombre === 'string' && { nombre: rest.nombre.trim() }),
    ...(Object.prototype.hasOwnProperty.call(rest, 'codigo') && {
      codigo: typeof rest.codigo === 'string' && rest.codigo.trim() !== '' ? rest.codigo.trim() : null,
    }),
    ...(Object.prototype.hasOwnProperty.call(rest, 'cargaHoraria') && {
      cargaHoraria: rest.cargaHoraria as number | null,
    }),
    ...(Object.prototype.hasOwnProperty.call(rest, 'horasSincronicas') && {
      horasSincronicas: rest.horasSincronicas as number | null,
    }),
    ...(Object.prototype.hasOwnProperty.call(rest, 'horasVirtuales') && {
      horasVirtuales: rest.horasVirtuales as number | null,
    }),
  }

  return { data, tipos: tiposNormalizados }
}

export const postituloService = {
  async getAll() {
    return postituloRepository.findMany()
  },

  async getById(id: number) {
    parseId(id)
    return postituloRepository.findById(id)
  },

  async create(payload: PostituloPayload) {
    return postituloRepository.create(buildCreateData(payload))
  },

  async update(id: number, payload: PostituloPayload) {
    parseId(id)

    const current = await postituloRepository.findById(id)
    if (!current) {
      throw new NotFoundError('Postitulo no encontrado')
    }

    const { data, tipos } = buildUpdateData(payload)
    await postituloRepository.update(id, data)

    if (Array.isArray(tipos)) {
      await postituloRepository.deleteTiposByPostituloId(id)

      if (tipos.length > 0) {
        await postituloRepository.createManyTipos(
          tipos.map((tipo) => ({
            ...tipo,
            postituloId: id,
          })),
        )
      }
    }

    return postituloRepository.findById(id)
  },

  async remove(id: number) {
    parseId(id)

    const current = await postituloRepository.findById(id)
    if (!current) {
      throw new NotFoundError('Postitulo no encontrado')
    }

    await postituloRepository.deleteTiposByPostituloId(id)
    return postituloRepository.delete(id)
  },
}
