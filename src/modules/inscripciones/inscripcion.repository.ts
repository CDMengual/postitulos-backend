import { EstadoCursante } from '@prisma/client'
import prisma from '../../infrastructure/database/prisma'

export const inscripcionRepository = {
  findCursanteByDni(dni: string) {
    return prisma.cursante.findUnique({ where: { dni } })
  },

  createCursante(data: {
    dni: string
    nombre: string
    apellido: string
    email?: string | null
    celular?: string | null
    titulo?: string | null
  }) {
    return prisma.cursante.create({ data })
  },

  findCursanteAula(cursanteId: number, aulaId: number) {
    return prisma.cursanteAula.findUnique({
      where: { cursanteId_aulaId: { cursanteId, aulaId } },
    })
  },

  createCursanteAula(data: {
    cursanteId: number
    aulaId: number
    estado?: EstadoCursante
    documentacion?: 'VERIFICADA' | 'PENDIENTE' | 'NO_CORRESPONDE'
  }) {
    return prisma.cursanteAula.create({
      data: {
        estado: EstadoCursante.ACTIVO,
        documentacion: 'PENDIENTE',
        ...data,
      },
    })
  },

  deleteCursanteAula(cursanteId: number, aulaId: number) {
    return prisma.cursanteAula.delete({
      where: { cursanteId_aulaId: { cursanteId, aulaId } },
    })
  },

  updateEstado(cursanteId: number, aulaId: number, estado: EstadoCursante) {
    return prisma.cursanteAula.update({
      where: { cursanteId_aulaId: { cursanteId, aulaId } },
      data: { estado },
    })
  },

  updateDocumentacion(
    cursanteId: number,
    aulaId: number,
    documentacion: 'VERIFICADA' | 'PENDIENTE' | 'NO_CORRESPONDE',
  ) {
    return prisma.cursanteAula.update({
      where: { cursanteId_aulaId: { cursanteId, aulaId } },
      data: { documentacion },
    })
  },

  getDetalleCursanteEnAula(cursanteId: number, aulaId: number) {
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

  updateObservaciones(cursanteId: number, aulaId: number, observaciones: string | null) {
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

  getDocumentoPath(cursanteId: number, aulaId: number) {
    return prisma.cursanteAula.findUnique({
      where: { cursanteId_aulaId: { cursanteId, aulaId } },
      select: {
        id: true,
        aulaId: true,
        cursanteId: true,
        dniAdjuntoUrl: true,
        tituloAdjuntoUrl: true,
      },
    })
  },
}
