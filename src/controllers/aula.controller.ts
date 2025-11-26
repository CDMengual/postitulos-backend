import { Request, Response } from 'express'
import { aulaService } from '../services/aula.service'
import { sendSuccess, sendError } from '../utils/response'
import prisma from '../prisma/client'
import * as XLSX from 'xlsx'

export const aulaController = {
  // 🔹 GET /api/aulas
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      const rol = (req as any).user?.rol
      if (!userId) return sendError(res, 'No autorizado', 401)

      const aulas = await aulaService.getAllForUser(userId, rol)
      return sendSuccess(res, 'Aulas obtenidas correctamente', aulas, { total: aulas.length })
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener aulas')
    }
  },

  // 🔹 GET /api/aulas/:id
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const aula = await aulaService.getById(id)

      if (!aula) return sendError(res, 'Aula no encontrada', 404)

      // 🔸 Mapear cursantes con su estado y documentación
      const cursantes = aula.cursantes.map((ins) => ({
        id: ins.cursante.id,
        nombre: ins.cursante.nombre,
        apellido: ins.cursante.apellido,
        dni: ins.cursante.dni,
        email: ins.cursante.email,
        celular: ins.cursante.celular,
        titulo: ins.cursante.titulo,
        estado: ins.estado,
        documentacion: ins.documentacion,
      }))

      const result = { ...aula, cursantes }

      return sendSuccess(res, 'Aula obtenida correctamente', result)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener aula')
    }
  },

  // 🔹 POST /api/aulas
  async create(req: Request, res: Response) {
    try {
      const cohorteId = Number(req.body.cohorteId)
      const referenteId = req.body.referenteId ? Number(req.body.referenteId) : null
      const currentUser = req.user

      if (!cohorteId) {
        return sendError(res, 'Debe seleccionar una cohorte', 400)
      }

      // 🔹 Obtener admins del sistema
      const admins = await prisma.user.findMany({
        where: { rol: 'ADMIN' },
        select: { id: true },
      })

      // 🔹 Determinar referentes
      let referentesIds: number[] = []

      if (currentUser?.rol === 'ADMIN') {
        if (!referenteId) return sendError(res, 'Debe seleccionar un referente', 400)
        referentesIds = [referenteId]
      } else if (currentUser?.rol === 'REFERENTE') {
        referentesIds = [currentUser.id]
      } else {
        return sendError(res, 'No tiene permisos para crear aulas', 403)
      }

      // 🔹 Obtener el instituto del referente principal
      const referentePrincipal = await prisma.user.findUnique({
        where: { id: referentesIds[0] },
        select: { institutoId: true },
      })

      if (!referentePrincipal?.institutoId) {
        return sendError(res, 'El referente seleccionado no tiene un instituto asignado', 400)
      }

      // 🔹 Crear el aula (el service se encarga de generar nombre, código y número)
      const aula = await aulaService.create({
        cohorteId,
        referenteId: referentesIds[0],
        institutoId: referentePrincipal.institutoId,
      })

      // 🔹 Conectar los admins al aula recién creada
      await prisma.aula.update({
        where: { id: aula.id },
        data: {
          admins: { connect: admins.map((a) => ({ id: a.id })) },
          referentes: { connect: referentesIds.map((id) => ({ id })) },
        },
      })

      return sendSuccess(res, 'Aula creada correctamente', aula, null, 201)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al crear aula', 400)
    }
  },

  async createMany(req: Request, res: Response) {
    try {
      const { cohorteId, total, distribucion } = req.body
      const currentUser = req.user

      if (!cohorteId || !total || !Array.isArray(distribucion) || distribucion.length === 0) {
        return sendError(res, 'Debe enviar cohorteId, total y distribución', 400)
      }

      if (currentUser?.rol !== 'ADMIN') {
        return sendError(res, 'No autorizado', 403)
      }

      // 🔹 Validar suma total
      const suma = distribucion.reduce((acc, d) => acc + Number(d.cantidad || 0), 0)
      if (suma !== Number(total)) {
        return sendError(res, `La suma de aulas (${suma}) no coincide con el total (${total})`, 400)
      }

      // 🔹 Obtener admins y cohorte
      const admins = await prisma.user.findMany({
        where: { rol: 'ADMIN' },
        select: { id: true },
      })

      const cohorte = await prisma.cohorte.findUnique({
        where: { id: Number(cohorteId) },
        include: { postitulo: true },
      })

      if (!cohorte) return sendError(res, 'Cohorte no encontrada', 404)
      if (!cohorte.postitulo) return sendError(res, 'Cohorte sin postítulo', 400)

      const created: any[] = []
      let numero = 1

      // 🔸 Crear aulas en bloques por referente
      for (const bloque of distribucion) {
        const referente = await prisma.user.findUnique({
          where: { id: bloque.referenteId },
          select: { institutoId: true },
        })

        if (!referente?.institutoId) continue

        for (let i = 0; i < bloque.cantidad; i++) {
          const aula = await prisma.aula.create({
            data: {
              numero,
              cohorte: { connect: { id: Number(cohorteId) } },
              instituto: { connect: { id: referente.institutoId } },
              codigo: `${cohorte.postitulo.codigo}-${cohorte.anio}-Aula${String(numero).padStart(
                2,
                '0',
              )}`,
              nombre: `${cohorte.postitulo.nombre} - Aula ${numero} (${cohorte.nombre})`,
              referentes: { connect: [{ id: bloque.referenteId }] },
              admins: { connect: admins.map((a) => ({ id: a.id })) },
            },
            include: {
              cohorte: { include: { postitulo: true } },
              referentes: true,
            },
          })

          created.push(aula)
          numero++
        }
      }

      return sendSuccess(res, `Se crearon ${created.length} aulas correctamente`, created)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al crear aulas masivas')
    }
  },
  // 🔹 PATCH /api/aulas/:id
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const data = req.body
      const aula = await aulaService.update(id, data)
      return sendSuccess(res, 'Aula actualizada correctamente', aula)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al actualizar aula', 400)
    }
  },

  // 🔹 DELETE /api/aulas/:id
  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      await aulaService.remove(id)
      return sendSuccess(res, 'Aula eliminada correctamente')
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al eliminar aula', 400)
    }
  },
}
