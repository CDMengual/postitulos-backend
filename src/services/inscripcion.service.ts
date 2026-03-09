import { EstadoCursante } from '@prisma/client'
import prisma from '../prisma/client'

export const inscripcionService = {
  // 🔹 Inscribir o crear cursante en un aula
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
    let cursante = await prisma.cursante.findUnique({ where: { dni } })
    if (!cursante) {
      cursante = await prisma.cursante.create({
        data: { dni, nombre, apellido, email, celular, titulo },
      })
    }

    const yaInscripto = await prisma.cursanteAula.findUnique({
      where: { cursanteId_aulaId: { cursanteId: cursante.id, aulaId } },
    })

    if (!yaInscripto) {
      await prisma.cursanteAula.create({
        data: {
          cursanteId: cursante.id,
          aulaId,
          estado: EstadoCursante.ACTIVO,
          documentacion: 'PENDIENTE',
        },
      })
    }

    return cursante
  },

  async removeFromAula(cursanteId: number, aulaId: number) {
    return prisma.cursanteAula.delete({
      where: { cursanteId_aulaId: { cursanteId, aulaId } },
    })
  },

  async assignExistingCursanteToAula(cursanteId: number, aulaId: number) {
    const yaInscripto = await prisma.cursanteAula.findUnique({
      where: { cursanteId_aulaId: { cursanteId, aulaId } },
    })

    if (yaInscripto) {
      return { created: false, inscripcion: yaInscripto }
    }

    const inscripcion = await prisma.cursanteAula.create({
      data: { cursanteId, aulaId, estado: EstadoCursante.ACTIVO, documentacion: 'PENDIENTE' },
    })

    return { created: true, inscripcion }
  },

  async importMany(aulaId: number, rows: any[]) {
    const importados: any[] = []
    const duplicados: any[] = []

    for (const row of rows) {
      const dni = String(row.dni || '').trim()
      if (!dni) continue

      let cursante = await prisma.cursante.findUnique({ where: { dni } })
      if (!cursante) {
        cursante = await prisma.cursante.create({
          data: {
            dni,
            nombre: row.nombre,
            apellido: row.apellido,
            email: row.email || null,
            celular: row.celular ? String(row.celular) : null,
            titulo: row.titulo || null,
          },
        })
      }

      const yaInscripto = await prisma.cursanteAula.findUnique({
        where: { cursanteId_aulaId: { cursanteId: cursante.id, aulaId } },
      })
      if (yaInscripto) {
        duplicados.push({ dni, nombre: cursante.nombre, apellido: cursante.apellido })
        continue
      }

      await prisma.cursanteAula.create({
        data: {
          cursanteId: cursante.id,
          aulaId,
          estado: EstadoCursante.ACTIVO,
          documentacion: 'PENDIENTE',
        },
      })

      importados.push(cursante)
    }

    return { importados, duplicados }
  },

  async updateEstado(
    cursanteId: number,
    aulaId: number,
    estado: EstadoCursante,
  ) {
    return prisma.cursanteAula.update({
      where: { cursanteId_aulaId: { cursanteId, aulaId } },
      data: { estado },
    })
  },

  async updateDocumentacion(
    cursanteId: number,
    aulaId: number,
    documentacion: 'VERIFICADA' | 'PENDIENTE' | 'NO_CORRESPONDE',
  ) {
    return prisma.cursanteAula.update({
      where: { cursanteId_aulaId: { cursanteId, aulaId } },
      data: { documentacion },
    })
  },

  async getDetalleCursanteEnAula(cursanteId: number, aulaId: number) {
    return prisma.cursanteAula.findUnique({
      where: { cursanteId_aulaId: { cursanteId, aulaId } },
      select: {
        aulaId: true,
        cursanteId: true,
        estado: true,
        documentacion: true,
        observaciones: true,
        dniAdjuntoUrl: true,
        tituloAdjuntoUrl: true,
        createdAt: true,
        updatedAt: true,
        aula: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            numero: true,
          },
        },
        cursante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            email: true,
            celular: true,
            titulo: true,
            distrito: {
              select: {
                nombre: true,
                regionId: true,
              },
            },
          },
        },
      },
    })
  },

  async updateObservaciones(cursanteId: number, aulaId: number, observaciones: string | null) {
    return prisma.cursanteAula.update({
      where: { cursanteId_aulaId: { cursanteId, aulaId } },
      data: { observaciones },
      select: {
        id: true,
        aulaId: true,
        cursanteId: true,
        observaciones: true,
        updatedAt: true,
      },
    })
  },

  async getDocumentoPath(cursanteId: number, aulaId: number, tipo: 'dni' | 'titulo') {
    const inscripcion = await prisma.cursanteAula.findUnique({
      where: { cursanteId_aulaId: { cursanteId, aulaId } },
      select: {
        id: true,
        aulaId: true,
        cursanteId: true,
        dniAdjuntoUrl: true,
        tituloAdjuntoUrl: true,
      },
    })

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
