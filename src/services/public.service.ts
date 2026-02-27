import prisma from '../prisma/client'

export const publicService = {
  // 🔹 Cohortes en inscripción (solo datos públicos)
  async getCohortesEnInscripcion() {
    const ahora = new Date()

    return prisma.cohorte.findMany({
      where: {
        estado: 'INSCRIPCION',
      },
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
            destinatarios: true,
          },
        },

        formulario: {
          select: {
            id: true,
            nombre: true,
            campos: true, // solo los campos publicables
          },
        },
      },
      orderBy: {
        anio: 'desc',
      },
    })
  },

  // 🔹 Obtener cohorte pública por ID
  async getCohortePublic(id: number) {
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
            destinatarios: true,
            planEstudios: true,
            resolucion: true,
            tipos: {
              select: {
                id: true,
                tipo: true,
                titulo: true,
              },
            },
          },
        },

        formulario: {
          select: {
            id: true,
            nombre: true,
            campos: true,
          },
        },
      },
    })
  },

  async createInscripcionPublic(data: {
    cohorteId: number
    nombre: string
    apellido: string
    dni: string
    email?: string | null
    celular?: string | null
    datosFormulario?: any
    dniAdjuntoUrl?: string | null
    tituloAdjuntoUrl?: string | null
  }) {
    const cohorte = await prisma.cohorte.findUnique({
      where: { id: data.cohorteId },
      select: {
        id: true,
        estado: true,
        fechaInicioInscripcion: true,
        fechaFinInscripcion: true,
      },
    })

    if (!cohorte) {
      return { error: 'Cohorte no encontrada', code: 404 as const }
    }

    if (cohorte.estado !== 'INSCRIPCION') {
      return { error: 'La cohorte no esta en periodo de inscripcion', code: 400 as const }
    }

    const now = new Date()
    if (cohorte.fechaInicioInscripcion && now < cohorte.fechaInicioInscripcion) {
      return { error: 'La inscripcion aun no esta habilitada', code: 400 as const }
    }
    if (cohorte.fechaFinInscripcion && now > cohorte.fechaFinInscripcion) {
      return { error: 'La inscripcion para esta cohorte ya cerro', code: 400 as const }
    }

    const existente = await prisma.inscripto.findUnique({
      where: { cohorteId_dni: { cohorteId: data.cohorteId, dni: data.dni } },
      select: { id: true },
    })

    if (existente) {
      return { error: 'Ya existe una inscripcion para este DNI en la cohorte', code: 409 as const }
    }

    const inscripto = await prisma.inscripto.create({
      data: {
        cohorteId: data.cohorteId,
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        email: data.email || null,
        celular: data.celular || null,
        datosFormulario: data.datosFormulario ?? null,
        dniAdjuntoUrl: data.dniAdjuntoUrl || null,
        tituloAdjuntoUrl: data.tituloAdjuntoUrl || null,
        estado: 'PENDIENTE',
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

    return { data: inscripto }
  },
}
