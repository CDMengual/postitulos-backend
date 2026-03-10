import { EstadoCursante } from '@prisma/client'
import { inscripcionRepository } from './inscripcion.repository'

export const inscripcionService = {
  async inscribirCursante({
    aulaId,
    dni,
    nombre,
    apellido,
    email,
    celular,
    titulo,
  }: {
    aulaId: number
    dni: string
    nombre: string
    apellido: string
    email?: string
    celular?: string
    titulo?: string
  }) {
    let cursante = await inscripcionRepository.findCursanteByDni(dni)
    if (!cursante) {
      cursante = await inscripcionRepository.createCursante({
        dni,
        nombre,
        apellido,
        email,
        celular,
        titulo,
      })
    }

    const yaInscripto = await inscripcionRepository.findCursanteAula(cursante.id, aulaId)

    if (!yaInscripto) {
      await inscripcionRepository.createCursanteAula({
        cursanteId: cursante.id,
        aulaId,
        estado: EstadoCursante.ACTIVO,
        documentacion: 'PENDIENTE',
      })
    }

    return cursante
  },

  async removeFromAula(cursanteId: number, aulaId: number) {
    return inscripcionRepository.deleteCursanteAula(cursanteId, aulaId)
  },

  async assignExistingCursanteToAula(cursanteId: number, aulaId: number) {
    const yaInscripto = await inscripcionRepository.findCursanteAula(cursanteId, aulaId)

    if (yaInscripto) {
      return { created: false, inscripcion: yaInscripto }
    }

    const inscripcion = await inscripcionRepository.createCursanteAula({
      cursanteId,
      aulaId,
      estado: EstadoCursante.ACTIVO,
      documentacion: 'PENDIENTE',
    })

    return { created: true, inscripcion }
  },

  async importMany(aulaId: number, rows: any[]) {
    const importados: any[] = []
    const duplicados: any[] = []

    for (const row of rows) {
      const dni = String(row.dni || '').trim()
      if (!dni) continue

      let cursante = await inscripcionRepository.findCursanteByDni(dni)
      if (!cursante) {
        cursante = await inscripcionRepository.createCursante({
          dni,
          nombre: row.nombre,
          apellido: row.apellido,
          email: row.email || null,
          celular: row.celular ? String(row.celular) : null,
          titulo: row.titulo || null,
        })
      }

      const yaInscripto = await inscripcionRepository.findCursanteAula(cursante.id, aulaId)
      if (yaInscripto) {
        duplicados.push({ dni, nombre: cursante.nombre, apellido: cursante.apellido })
        continue
      }

      await inscripcionRepository.createCursanteAula({
        cursanteId: cursante.id,
        aulaId,
        estado: EstadoCursante.ACTIVO,
        documentacion: 'PENDIENTE',
      })

      importados.push(cursante)
    }

    return { importados, duplicados }
  },

  async updateEstado(cursanteId: number, aulaId: number, estado: EstadoCursante) {
    return inscripcionRepository.updateEstado(cursanteId, aulaId, estado)
  },

  async updateDocumentacion(
    cursanteId: number,
    aulaId: number,
    documentacion: 'VERIFICADA' | 'PENDIENTE' | 'NO_CORRESPONDE',
  ) {
    return inscripcionRepository.updateDocumentacion(cursanteId, aulaId, documentacion)
  },

  async getDetalleCursanteEnAula(cursanteId: number, aulaId: number) {
    return inscripcionRepository.getDetalleCursanteEnAula(cursanteId, aulaId)
  },

  async updateObservaciones(cursanteId: number, aulaId: number, observaciones: string | null) {
    return inscripcionRepository.updateObservaciones(cursanteId, aulaId, observaciones)
  },

  async getDocumentoPath(cursanteId: number, aulaId: number, tipo: 'dni' | 'titulo') {
    const inscripcion = await inscripcionRepository.getDocumentoPath(cursanteId, aulaId)

    if (!inscripcion) return null

    const path = tipo === 'dni' ? inscripcion.dniAdjuntoUrl : inscripcion.tituloAdjuntoUrl
    return {
      id: inscripcion.id,
      aulaId: inscripcion.aulaId,
      cursanteId: inscripcion.cursanteId,
      path: path || null,
    }
  },
}
