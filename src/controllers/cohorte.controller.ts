import { Request, Response } from 'express'
import { cohorteService } from '../services/cohorte.service'
import { sendSuccess, sendError } from '../utils/response'
import prisma from '../prisma/client'

export const cohorteController = {
  async getAll(req: Request, res: Response) {
    try {
      const cohortes = await cohorteService.getAll()
      return sendSuccess(res, 'Cohortes obtenidas correctamente', cohortes, {
        total: cohortes.length,
      })
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener cohortes')
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const cohorte = await cohorteService.getById(id)
      if (!cohorte) return sendError(res, 'Cohorte no encontrada', 404)
      return sendSuccess(res, 'Cohorte obtenida correctamente', cohorte)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener cohorte')
    }
  },

  async create(req: Request, res: Response) {
    try {
      const {
        anio,
        fechaInicio,
        fechaFin,
        fechaInicioInscripcion,
        fechaFinInscripcion,
        postituloId,
        cantidadAulas,
        cupos,
        cuposListaEspera,
        institutoIds,
      } = req.body

      const isEmpty = (value: any) =>
        value === undefined || value === null || (typeof value === 'string' && value.trim() === '')

      if (
        isEmpty(anio) ||
        isEmpty(postituloId) ||
        isEmpty(cupos) ||
        isEmpty(cuposListaEspera)
      ) {
        return sendError(
          res,
          'Campos obligatorios: anio, postituloId, cupos, cuposListaEspera',
          400,
        )
      }

      const parseDate = (value: any, field: string) => {
        const parsed = new Date(value)
        if (isNaN(parsed.getTime())) throw new Error(`Fecha invalida en ${field}`)
        return parsed
      }

      const toPositiveInt = (value: any, field: string) => {
        const parsed = Number(value)
        if (!Number.isInteger(parsed) || parsed <= 0) {
          throw new Error(`El campo ${field} debe ser un numero entero mayor a 0`)
        }
        return parsed
      }

      const anioNum = toPositiveInt(anio, 'anio')
      const postituloIdNum = toPositiveInt(postituloId, 'postituloId')
      const cuposNum = toPositiveInt(cupos, 'cupos')
      const cuposListaEsperaNum = toPositiveInt(cuposListaEspera, 'cuposListaEspera')

      const cantidadAulasNum = isEmpty(cantidadAulas)
        ? null
        : toPositiveInt(cantidadAulas, 'cantidadAulas')

      const institutoIdsNormalizados =
        institutoIds === undefined
          ? undefined
          : Array.isArray(institutoIds)
            ? institutoIds.map((id: any) => Number(id)).filter((id: number) => Number.isInteger(id))
            : (() => {
                throw new Error('El campo institutoIds debe ser un array de IDs')
              })()

      if (institutoIdsNormalizados && institutoIdsNormalizados.length > 0) {
        const institutosCount = await prisma.instituto.count({
          where: { id: { in: institutoIdsNormalizados } },
        })
        if (institutosCount !== institutoIdsNormalizados.length) {
          return sendError(res, 'Uno o más institutos no existen', 404)
        }
      }

      const fechaInicioDate = isEmpty(fechaInicio) ? null : parseDate(fechaInicio, 'fechaInicio')
      const fechaFinDate = isEmpty(fechaFin) ? null : parseDate(fechaFin, 'fechaFin')
      const fechaInicioInscripcionDate = isEmpty(fechaInicioInscripcion)
        ? null
        : parseDate(fechaInicioInscripcion, 'fechaInicioInscripcion')
      const fechaFinInscripcionDate = isEmpty(fechaFinInscripcion)
        ? null
        : parseDate(fechaFinInscripcion, 'fechaFinInscripcion')

      const postitulo = await prisma.postitulo.findUnique({
        where: { id: postituloIdNum },
        select: { id: true, codigo: true, nombre: true },
      })

      if (!postitulo) return sendError(res, 'Postitulo no encontrado', 404)
      if (!postitulo.codigo) return sendError(res, 'El postitulo no tiene codigo asignado', 400)

      const nombreGenerado = `${postitulo.codigo}-${anioNum}`

      const cohorte = await cohorteService.create({
        anio: anioNum,
        nombre: nombreGenerado,
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate,
        fechaInicioInscripcion: fechaInicioInscripcionDate,
        fechaFinInscripcion: fechaFinInscripcionDate,
        postituloId: postituloIdNum,
        cantidadAulas: cantidadAulasNum,
        cupos: cuposNum,
        cuposListaEspera: cuposListaEsperaNum,
        cuposTotales: cuposNum + cuposListaEsperaNum,
        ...(institutoIdsNormalizados !== undefined && { institutoIds: institutoIdsNormalizados }),
        ...(req.body.formularioId && {
          formulario: { connect: { id: Number(req.body.formularioId) } },
        }),
      })

      return sendSuccess(res, 'Cohorte creada correctamente', cohorte, null, 201)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al crear cohorte', 400)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const data = req.body

      const cohorteActual = await prisma.cohorte.findUnique({
        where: { id },
        include: { postitulo: true },
      })
      if (!cohorteActual) return sendError(res, 'Cohorte no encontrada', 404)

      let nombre = cohorteActual.nombre

      if (data.anio || data.postituloId) {
        const postitulo = await prisma.postitulo.findUnique({
          where: { id: Number(data.postituloId || cohorteActual.postituloId) },
          select: { codigo: true },
        })
        const codigo = postitulo?.codigo || 'TEMP'
        nombre = `${codigo}-${data.anio || cohorteActual.anio}`
      }

      const isEmpty = (value: any) =>
        value === undefined || value === null || (typeof value === 'string' && value.trim() === '')

      const toPositiveInt = (value: any, field: string) => {
        const parsed = Number(value)
        if (!Number.isInteger(parsed) || parsed <= 0) {
          throw new Error(`El campo ${field} debe ser un numero entero mayor a 0`)
        }
        return parsed
      }

      const parseDate = (value: any, field: string) => {
        if (isEmpty(value)) return null
        const parsed = new Date(value)
        if (isNaN(parsed.getTime())) throw new Error(`Fecha invalida en ${field}`)
        return parsed
      }

      const cuposNormalizados =
        data.cupos === undefined ? undefined : toPositiveInt(data.cupos, 'cupos')
      const cuposListaEsperaNormalizados =
        data.cuposListaEspera === undefined
          ? undefined
          : toPositiveInt(data.cuposListaEspera, 'cuposListaEspera')

      const institutoIdsNormalizados =
        data.institutoIds === undefined
          ? undefined
          : Array.isArray(data.institutoIds)
            ? data.institutoIds
                .map((value: any) => Number(value))
                .filter((value: number) => Number.isInteger(value))
            : (() => {
                throw new Error('El campo institutoIds debe ser un array de IDs')
              })()

      if (institutoIdsNormalizados && institutoIdsNormalizados.length > 0) {
        const institutosCount = await prisma.instituto.count({
          where: { id: { in: institutoIdsNormalizados } },
        })
        if (institutosCount !== institutoIdsNormalizados.length) {
          return sendError(res, 'Uno o más institutos no existen', 404)
        }
      }

      const cuposFinales = cuposNormalizados ?? cohorteActual.cupos ?? 0
      const cuposListaEsperaFinales =
        cuposListaEsperaNormalizados ?? cohorteActual.cuposListaEspera ?? 0

      const parsedData = {
        ...data,
        ...(data.anio !== undefined && { anio: toPositiveInt(data.anio, 'anio') }),
        ...(data.cantidadAulas !== undefined && {
          cantidadAulas: isEmpty(data.cantidadAulas)
            ? null
            : toPositiveInt(data.cantidadAulas, 'cantidadAulas'),
        }),
        ...(cuposNormalizados !== undefined && { cupos: cuposNormalizados }),
        ...(cuposListaEsperaNormalizados !== undefined && {
          cuposListaEspera: cuposListaEsperaNormalizados,
        }),
        ...((cuposNormalizados !== undefined || cuposListaEsperaNormalizados !== undefined) && {
          cuposTotales: cuposFinales + cuposListaEsperaFinales,
        }),
        ...(Object.prototype.hasOwnProperty.call(data, 'fechaInicio') && {
          fechaInicio: parseDate(data.fechaInicio, 'fechaInicio'),
        }),
        ...(Object.prototype.hasOwnProperty.call(data, 'fechaFin') && {
          fechaFin: parseDate(data.fechaFin, 'fechaFin'),
        }),
        ...(Object.prototype.hasOwnProperty.call(data, 'fechaInicioInscripcion') && {
          fechaInicioInscripcion: parseDate(data.fechaInicioInscripcion, 'fechaInicioInscripcion'),
        }),
        ...(Object.prototype.hasOwnProperty.call(data, 'fechaFinInscripcion') && {
          fechaFinInscripcion: parseDate(data.fechaFinInscripcion, 'fechaFinInscripcion'),
        }),
        ...(institutoIdsNormalizados !== undefined && {
          institutoIds: institutoIdsNormalizados,
        }),
      }

      const cohorte = await cohorteService.update(id, {
        ...parsedData,
        nombre,
        ...(data.formularioId && {
          formulario: { connect: { id: Number(data.formularioId) } },
        }),
      })

      return sendSuccess(res, 'Cohorte actualizada correctamente', cohorte)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al actualizar cohorte', 400)
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      await cohorteService.remove(id)
      return sendSuccess(res, 'Cohorte eliminada correctamente')
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al eliminar cohorte', 400)
    }
  },

  async updateEstado(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const { estado } = req.body

      if (!estado) return sendError(res, 'Debe enviar el nuevo estado', 400)

      const cohorte = await prisma.cohorte.update({
        where: { id },
        data: { estado },
        select: {
          id: true,
          nombre: true,
          estado: true,
        },
      })

      return sendSuccess(res, 'Estado de cohorte actualizado', cohorte)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al cambiar el estado', 400)
    }
  },
}
