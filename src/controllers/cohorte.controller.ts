import { Request, Response } from 'express'
import { cohorteService } from '../services/cohorte.service'
import { sendSuccess, sendError } from '../utils/response'
import prisma from '../prisma/client'

export const cohorteController = {
  // 🔹 GET /api/cohortes
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

  // 🔹 GET /api/cohortes/:id
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

  // 🔹 POST /api/cohortes
  async create(req: Request, res: Response) {
    try {
      const { anio, fechaInicio, fechaFin, postituloId, cantidadAulas, cupos, cuposListaEspera } =
        req.body

      if (!anio || !fechaInicio || !postituloId) {
        return sendError(res, 'Faltan campos obligatorios', 400)
      }

      // Buscar el postítulo para obtener su código
      const postitulo = await prisma.postitulo.findUnique({
        where: { id: Number(postituloId) },
        select: { id: true, codigo: true, nombre: true },
      })

      if (!postitulo) return sendError(res, 'Postítulo no encontrado', 404)

      if (!postitulo.codigo) return sendError(res, 'El postítulo no tiene código asignado', 400)

      // ✅ Generar nombre automático (SIGLA-AÑO)
      const nombreGenerado = `${postitulo.codigo}-${anio}`

      // ✅ Crear cohorte
      const cohorte = await cohorteService.create({
        anio: Number(anio),
        nombre: nombreGenerado,
        fechaInicio: new Date(fechaInicio),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        postituloId: Number(postituloId),
        cantidadAulas: cantidadAulas ? Number(cantidadAulas) : null,
        cupos: cupos ? Number(cupos) : null,
        cuposListaEspera: cuposListaEspera ? Number(cuposListaEspera) : null,
        cuposTotales:
          (cupos ? Number(cupos) : 0) + (cuposListaEspera ? Number(cuposListaEspera) : 0),
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

      // 🔹 Buscar cohorte actual
      const cohorteActual = await prisma.cohorte.findUnique({
        where: { id },
        include: { postitulo: true },
      })
      if (!cohorteActual) return sendError(res, 'Cohorte no encontrada', 404)

      let nombre = cohorteActual.nombre

      // ✅ Si cambió el año o postítulo, regenerar el nombre
      if (data.anio || data.postituloId) {
        const postitulo = await prisma.postitulo.findUnique({
          where: { id: Number(data.postituloId || cohorteActual.postituloId) },
          select: { codigo: true },
        })
        const codigo = postitulo?.codigo || 'TEMP'
        nombre = `${codigo}-${data.anio || cohorteActual.anio}`
      }

      // ✅ Convertir fechas y limpiar vacíos
      const parsedData = {
        ...data,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : null,
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
        fechaInicioInscripcion: data.fechaInicioInscripcion
          ? new Date(data.fechaInicioInscripcion)
          : null,
        fechaFinInscripcion: data.fechaFinInscripcion ? new Date(data.fechaFinInscripcion) : null,
      }

      // ✅ Actualizar cohorte
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

  // 🔹 DELETE /api/cohortes/:id
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
