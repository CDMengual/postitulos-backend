import { Prisma } from '@prisma/client'
import prisma from '../../infrastructure/database/prisma'

export type PublicDbClient = {
  cohorte: typeof prisma.cohorte
  inscripto: typeof prisma.inscripto
}

export const publicRepository = {
  findCohortesEnInscripcion() {
    return prisma.cohorte.findMany({
      where: { estado: 'INSCRIPCION' },
      select: {
        id: true,
        nombre: true,
        anio: true,
        fechaInicioInscripcion: true,
        fechaFinInscripcion: true,
        cupos: true,
        cuposListaEspera: true,
        cuposTotales: true,
        inscriptos: {
          select: { estado: true },
          where: { estado: { not: 'RECHAZADA' } },
        },
        postitulo: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            requisitos: true,
            destinatarios: true,
          },
        },
        formulario: {
          select: { id: true, nombre: true, campos: true },
        },
      },
      orderBy: { anio: 'desc' },
    })
  },

  findCohortePublic(id: number) {
    return prisma.cohorte.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        anio: true,
        fechaInicioInscripcion: true,
        fechaFinInscripcion: true,
        postitulo: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            requisitos: true,
            destinatarios: true,
            planEstudios: true,
            resolucion: true,
            tipos: {
              select: { id: true, tipo: true, titulo: true },
            },
          },
        },
        formulario: {
          select: { id: true, nombre: true, campos: true },
        },
      },
    })
  },

  findCohorteDisponibleParaInscripcion(cohorteId: number, db: PublicDbClient = prisma) {
    return db.cohorte.findUnique({
      where: { id: cohorteId },
      select: {
        id: true,
        estado: true,
        fechaInicioInscripcion: true,
        fechaFinInscripcion: true,
        cupos: true,
        cuposListaEspera: true,
      },
    })
  },

  countInscriptosDisponibles(cohorteId: number, db: PublicDbClient = prisma) {
    return db.inscripto.count({
      where: {
        cohorteId,
        estado: { not: 'RECHAZADA' },
      },
    })
  },

  findInscripcionByCohorteYDni(cohorteId: number, dni: string, db: PublicDbClient = prisma) {
    return db.inscripto.findUnique({
      where: { cohorteId_dni: { cohorteId, dni } },
      select: { id: true },
    })
  },

  findCohorteMetaForInscripcion(cohorteId: number, tx: Prisma.TransactionClient) {
    return tx.cohorte.findUnique({
      where: { id: cohorteId },
      select: {
        postitulo: {
          select: { codigo: true },
        },
      },
    })
  },

  createInscripto(
    data: {
      cohorteId: number
      nombre: string
      apellido: string
      dni: string
      email?: string | null
      celular?: string | null
      datosFormulario?: any
      dniAdjuntoUrl?: string | null
      tituloAdjuntoUrl?: string | null
      estado: string
      prioridad: number
      observaciones: string | null
    },
    tx: Prisma.TransactionClient,
  ) {
    return tx.inscripto.create({
      data: {
        ...data,
        estado: data.estado as any,
      },
      select: {
        id: true,
        cohorteId: true,
        nombre: true,
        apellido: true,
        dni: true,
        email: true,
        celular: true,
        estado: true,
        createdAt: true,
      },
    })
  },
}
