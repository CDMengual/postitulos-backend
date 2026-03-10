import { Prisma } from '@prisma/client'
import { BadRequestError, NotFoundError } from '../../errors/app-error'
import { cohorteRepository } from './cohorte.repository'
import {
  CohorteEstado,
  ParsedCreateCohorteInput,
  ParsedUpdateCohorteInput,
} from './cohorte.types'

const ensureInstitutosExist = async (institutoIds?: number[]) => {
  if (!institutoIds || institutoIds.length === 0) return

  const institutosCount = await cohorteRepository.countInstitutosByIds(institutoIds)

  if (institutosCount !== institutoIds.length) {
    throw new NotFoundError('Uno o mas institutos no existen')
  }
}

const buildCohorteResponse = (cohorte: any) => {
  const { aulas, cohorteInstitutos, ...cohorteBase } = cohorte
  const cantidadAulas = cohorte.cantidadAulas ?? cohorte.aulas.length
  const cantidadCursantes = cohorte.aulas.reduce(
    (acc: number, aula: any) => acc + aula._count.cursantes,
    0,
  )

  return {
    ...cohorteBase,
    institutos: cohorteInstitutos.map((ci: any) => ci.instituto),
    cantidadAulas,
    cantidadCursantes,
  }
}

export const cohorteService = {
  async getAll(estado?: CohorteEstado) {
    const where: Prisma.CohorteWhereInput =
      !estado || estado === 'ALL'
        ? estado === 'ALL'
          ? {}
          : { estado: { in: ['INSCRIPCION', 'ACTIVA'] } }
        : { estado }

    const cohortes = await cohorteRepository.findMany(where)

    return cohortes.map(buildCohorteResponse)
  },

  async getById(id: number) {
    const cohorte = await cohorteRepository.findById(id)

    if (!cohorte) return null
    return buildCohorteResponse(cohorte)
  },

  async createFromInput(input: ParsedCreateCohorteInput) {
    const { anio, postituloId, cupos, cuposListaEspera, cantidadAulas, institutoIds } = input

    await ensureInstitutosExist(institutoIds)

    const postitulo = await cohorteRepository.findPostituloById(postituloId)

    if (!postitulo) {
      throw new NotFoundError('Postitulo no encontrado')
    }
    if (!postitulo.codigo) {
      throw new BadRequestError('El postitulo no tiene codigo asignado')
    }

    const data: any = {
      anio,
      nombre: `${postitulo.codigo}-${anio}`,
      fechaInicio: input.fechaInicio,
      fechaFin: input.fechaFin,
      fechaInicioInscripcion: input.fechaInicioInscripcion,
      fechaFinInscripcion: input.fechaFinInscripcion,
      cantidadAulas,
      cupos,
      cuposListaEspera,
      cuposTotales: cupos + cuposListaEspera,
      postitulo: { connect: { id: postituloId } },
      ...(input.formularioId ? { formulario: { connect: { id: input.formularioId } } } : {}),
      ...(Array.isArray(institutoIds) &&
        institutoIds.length > 0 && {
          cohorteInstitutos: {
            create: institutoIds.map((institutoId) => ({
              instituto: { connect: { id: institutoId } },
            })),
          },
        }),
    }

    const created = await cohorteRepository.create(data)

    return buildCohorteResponse(created)
  },

  async updateFromInput(id: number, input: ParsedUpdateCohorteInput) {
    const cohorteActual = await cohorteRepository.findByIdWithPostitulo(id)

    if (!cohorteActual) {
      throw new NotFoundError('Cohorte no encontrada')
    }

    const institutoIds = input.institutoIds
    await ensureInstitutosExist(institutoIds)

    const cuposNormalizados = input.cupos
    const cuposListaEsperaNormalizados = input.cuposListaEspera

    const anio = input.anio === undefined ? cohorteActual.anio : input.anio
    const postituloId = input.postituloId === undefined ? cohorteActual.postituloId : input.postituloId

    const postitulo = await cohorteRepository.findPostituloById(postituloId)

    const codigo = postitulo?.codigo || 'TEMP'
    const cuposFinales = cuposNormalizados ?? cohorteActual.cupos ?? 0
    const cuposListaEsperaFinales =
      cuposListaEsperaNormalizados ?? cohorteActual.cuposListaEspera ?? 0

    const data: any = {
      ...(input.anio !== undefined && { anio }),
      nombre: `${codigo}-${anio}`,
      ...(input.cantidadAulas !== undefined && {
        cantidadAulas: input.cantidadAulas,
      }),
      ...(input.cupos !== undefined && { cupos: cuposNormalizados }),
      ...(input.cuposListaEspera !== undefined && {
        cuposListaEspera: cuposListaEsperaNormalizados,
      }),
      ...((input.cupos !== undefined || input.cuposListaEspera !== undefined) && {
        cuposTotales: cuposFinales + cuposListaEsperaFinales,
      }),
      ...(Object.prototype.hasOwnProperty.call(input, 'fechaInicio') && {
        fechaInicio: input.fechaInicio ?? cohorteActual.fechaInicio,
      }),
      ...(Object.prototype.hasOwnProperty.call(input, 'fechaFin') && {
        fechaFin: input.fechaFin ?? null,
      }),
      ...(Object.prototype.hasOwnProperty.call(input, 'fechaInicioInscripcion') && {
        fechaInicioInscripcion: input.fechaInicioInscripcion ?? null,
      }),
      ...(Object.prototype.hasOwnProperty.call(input, 'fechaFinInscripcion') && {
        fechaFinInscripcion: input.fechaFinInscripcion ?? null,
      }),
      ...(input.postituloId !== undefined && {
        postitulo: { connect: { id: postituloId } },
      }),
      ...(input.formularioId !== undefined &&
        input.formularioId !== null && {
          formulario: { connect: { id: input.formularioId } },
        }),
      ...(Object.prototype.hasOwnProperty.call(input, 'formularioId') &&
        input.formularioId === null && {
          formulario: { disconnect: true },
        }),
      ...(Array.isArray(institutoIds) && {
        cohorteInstitutos: {
          deleteMany: {},
          ...(institutoIds.length > 0
            ? {
                create: institutoIds.map((institutoId) => ({
                  instituto: { connect: { id: institutoId } },
                })),
              }
            : {}),
        },
      }),
    }

    const updated = await cohorteRepository.update(id, data)

    return buildCohorteResponse(updated)
  },

  async updateEstado(id: number, estado: string) {
    if (!estado) {
      throw new BadRequestError('Debe enviar el nuevo estado')
    }

    return cohorteRepository.updateEstado(id, estado)
  },

  async remove(id: number) {
    await cohorteRepository.deleteAulasByCohorteId(id)
    return cohorteRepository.delete(id)
  },
}
