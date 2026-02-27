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

      const parsedData = {
        ...data,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : null,
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
        fechaInicioInscripcion: data.fechaInicioInscripcion
          ? new Date(data.fechaInicioInscripcion)
          : null,
        fechaFinInscripcion: data.fechaFinInscripcion ? new Date(data.fechaFinInscripcion) : null,
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
