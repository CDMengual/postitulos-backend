import { Request, Response } from 'express'
import { aulaService } from './aula.service'
import { aulaSchema } from './aula.schema'
import { sendSuccess, sendError } from '../../shared/http/response'

export const aulaController = {
  async createMonthlySnapshot(req: Request, res: Response) {
    try {
      const { aulaId, fechaCorte, observaciones } = aulaSchema.parseSnapshotParams(
        req.params as Record<string, unknown>,
        (req.body || {}) as Record<string, unknown>,
      )

      const snapshot = await aulaService.createMonthlySnapshot(aulaId, {
        fechaCorte,
        observaciones,
      })

      return sendSuccess(res, 'Snapshot mensual generado correctamente', snapshot, null, 201)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al generar snapshot mensual', error.statusCode || 400)
    }
  },

  async createMonthlySnapshotsForCohorte(req: Request, res: Response) {
    try {
      const { cohorteId, fechaCorte, observaciones } = aulaSchema.parseSnapshotByCohorte(
        (req.body || {}) as Record<string, unknown>,
      )

      const snapshots = await aulaService.createMonthlySnapshotsForCohorte(cohorteId, {
        fechaCorte,
        observaciones,
      })

      return sendSuccess(
        res,
        'Snapshots mensuales generados correctamente',
        snapshots,
        { total: snapshots.length },
        201,
      )
    } catch (error: any) {
      console.error(error)
      return sendError(
        res,
        error.message || 'Error al generar snapshots mensuales',
        error.statusCode || 400,
      )
    }
  },

  async getMonthlySnapshotsByAula(req: Request, res: Response) {
    try {
      const aulaId = aulaSchema.parseRouteId(req.params as Record<string, unknown>, 'aulaId')
      const snapshots = await aulaService.getMonthlySnapshotsByAula(aulaId)
      return sendSuccess(res, 'Snapshots mensuales obtenidos correctamente', snapshots, {
        total: snapshots.length,
      })
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener snapshots mensuales', 500)
    }
  },

  async getMonthlySnapshotSeriesByCohorte(req: Request, res: Response) {
    try {
      const { userId, rol } = aulaSchema.parseListQuery({}, req.user)
      const cohorteId = aulaSchema.parseRouteId({ cohorteId: req.query.cohorteId }, 'cohorteId')
      const serie = await aulaService.getMonthlySnapshotsSeriesByCohorte(userId, rol, cohorteId)
      return sendSuccess(res, 'Serie mensual obtenida correctamente', serie)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener la serie mensual', 500)
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const { userId, rol, estado, postituloId } = aulaSchema.parseListQuery(
        req.query as Record<string, unknown>,
        req.user,
      )
      const aulas = await aulaService.getAllForUser(userId, rol, estado as any, postituloId)
      return sendSuccess(res, 'Aulas obtenidas correctamente', aulas, { total: aulas.length })
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener aulas')
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = aulaSchema.parseRouteId(req.params as Record<string, unknown>)
      const aula = await aulaService.getById(id)

      if (!aula) return sendError(res, 'Aula no encontrada', 404)

      return sendSuccess(res, 'Aula obtenida correctamente', aula)
    } catch (error) {
      console.error(error)
      return sendError(res, 'Error al obtener aula')
    }
  },

  async create(req: Request, res: Response) {
    try {
      const aula = await aulaService.createForUser(
        aulaSchema.parseCreate((req.body || {}) as Record<string, unknown>, req.user),
      )

      return sendSuccess(res, 'Aula creada correctamente', aula, null, 201)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al crear aula', error.statusCode || 400)
    }
  },

  async createMany(req: Request, res: Response) {
    try {
      const created = await aulaService.createManyForAdmin(
        aulaSchema.parseCreateMany((req.body || {}) as Record<string, unknown>, req.user),
      )

      return sendSuccess(res, `Se crearon ${created.length} aulas correctamente`, created)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al crear aulas masivas', error.statusCode || 400)
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = aulaSchema.parseRouteId(req.params as Record<string, unknown>)
      const data = req.body
      const aula = await aulaService.update(id, data)
      return sendSuccess(res, 'Aula actualizada correctamente', aula)
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al actualizar aula', 400)
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = aulaSchema.parseRouteId(req.params as Record<string, unknown>)
      await aulaService.remove(id)
      return sendSuccess(res, 'Aula eliminada correctamente')
    } catch (error: any) {
      console.error(error)
      return sendError(res, error.message || 'Error al eliminar aula', 400)
    }
  },
}
