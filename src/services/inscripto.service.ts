import prisma from '../prisma/client'

type EstadoInscripto = 'PENDIENTE' | 'RECHAZADA' | 'ASIGNADA' | 'LISTA_ESPERA'
type DocumentacionInscripto = 'VERIFICADA' | 'PENDIENTE' | 'NO_CORRESPONDE'
type AsignacionInstituto = { inscriptoId: number; institutoId: number | null }
type UpdateInscriptoData = {
  observaciones?: string | null
  prioridad?: number | null
  condicionada?: boolean
}

interface ListInscriptosParams {
  cohorteId?: number
  institutoId?: number
  estado?: EstadoInscripto
  documentacion?: DocumentacionInscripto
  search?: string
  page: number
  limit: number
}

export const inscriptoService = {
  async list(params: ListInscriptosParams) {
    const { cohorteId, institutoId, estado, documentacion, search, page, limit } = params

    const where = {
      ...(cohorteId ? { cohorteId } : {}),
      ...(institutoId ? { institutoId } : {}),
      ...(estado ? { estado } : {}),
      ...(documentacion ? { documentacion } : {}),
      ...(search
        ? {
            OR: [
              { nombre: { contains: search } },
              { apellido: { contains: search } },
              { dni: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
    }

    const [total, inscriptos] = await Promise.all([
      prisma.inscripto.count({ where }),
      prisma.inscripto.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          cohorteId: true,
          nombre: true,
          apellido: true,
          dni: true,
          email: true,
          celular: true,
          estado: true,
          institutoId: true,
          prioridad: true,
          listaEspera: true,
          condicionada: true,
          documentacion: true,
          createdAt: true,
          updatedAt: true,
          cohorte: {
            select: {
              id: true,
              nombre: true,
              anio: true,
              estado: true,
              postitulo: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
            },
          },
          instituto: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      }),
    ])

    return {
      inscriptos,
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    }
  },

  async getById(id: number) {
    return prisma.inscripto.findUnique({
      where: { id },
      select: {
        id: true,
        cohorteId: true,
        nombre: true,
        apellido: true,
        dni: true,
        email: true,
        celular: true,
        estado: true,
        institutoId: true,
        prioridad: true,
        listaEspera: true,
        condicionada: true,
        observaciones: true,
        documentacion: true,
        datosFormulario: true,
        dniAdjuntoUrl: true,
        tituloAdjuntoUrl: true,
        createdAt: true,
        updatedAt: true,
        cohorte: {
          select: {
            id: true,
            nombre: true,
            anio: true,
            estado: true,
            fechaInicioInscripcion: true,
            fechaFinInscripcion: true,
            postitulo: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
        instituto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })
  },

  async updateEstado(id: number, estado: EstadoInscripto) {
    return prisma.$transaction(async (tx) => {
      const inscripto = await tx.inscripto.findUnique({
        where: { id },
        select: {
          id: true,
          cohorteId: true,
          institutoId: true,
          dni: true,
          nombre: true,
          apellido: true,
          email: true,
          celular: true,
        },
      })

      if (!inscripto) {
        throw new Error('Inscripto no encontrado')
      }

      if (estado !== 'ASIGNADA') {
        return tx.inscripto.update({
          where: { id },
          data: {
            estado,
            listaEspera: estado === 'LISTA_ESPERA',
          },
          select: {
            id: true,
            estado: true,
            listaEspera: true,
            updatedAt: true,
          },
        })
      }

      if (!inscripto.institutoId) {
        throw new Error('El inscripto debe tener instituto asignado para pasar a ASIGNADA')
      }

      let cursante = await tx.cursante.findUnique({
        where: { dni: inscripto.dni },
        select: { id: true },
      })

      if (!cursante) {
        cursante = await tx.cursante.create({
          data: {
            dni: inscripto.dni,
            nombre: inscripto.nombre,
            apellido: inscripto.apellido,
            email: inscripto.email,
            celular: inscripto.celular,
          },
          select: { id: true },
        })
      }

      const existenteEnCohorte = await tx.cursanteAula.findFirst({
        where: {
          cursanteId: cursante.id,
          aula: { cohorteId: inscripto.cohorteId },
        },
        select: {
          id: true,
          aulaId: true,
        },
      })

      let asignacion:
        | {
            created: boolean
            cursanteAulaId: number
            aulaId: number
          }
        | undefined

      if (existenteEnCohorte) {
        asignacion = {
          created: false,
          cursanteAulaId: existenteEnCohorte.id,
          aulaId: existenteEnCohorte.aulaId,
        }
      } else {
        const aulas = await tx.aula.findMany({
          where: {
            cohorteId: inscripto.cohorteId,
            institutoId: inscripto.institutoId,
          },
          select: {
            id: true,
            _count: { select: { cursantes: true } },
          },
        })

        if (aulas.length === 0) {
          throw new Error('No hay aulas disponibles para la cohorte e instituto del inscripto')
        }

        const aulaElegida = [...aulas].sort((a, b) => {
          if (a._count.cursantes !== b._count.cursantes) {
            return a._count.cursantes - b._count.cursantes
          }
          return a.id - b.id
        })[0]

        const cursanteAula = await tx.cursanteAula.create({
          data: {
            cursanteId: cursante.id,
            aulaId: aulaElegida.id,
            estado: 'ACTIVO',
            documentacion: 'PENDIENTE',
          },
          select: {
            id: true,
            aulaId: true,
          },
        })

        asignacion = {
          created: true,
          cursanteAulaId: cursanteAula.id,
          aulaId: cursanteAula.aulaId,
        }
      }

      const updated = await tx.inscripto.update({
        where: { id },
        data: {
          estado: 'ASIGNADA',
          listaEspera: false,
        },
        select: {
          id: true,
          estado: true,
          listaEspera: true,
          updatedAt: true,
        },
      })

      return {
        ...updated,
        cursanteId: cursante.id,
        asignacion,
      }
    })
  },

  async updateDocumentacion(id: number, documentacion: DocumentacionInscripto) {
    return prisma.inscripto.update({
      where: { id },
      data: { documentacion },
      select: {
        id: true,
        documentacion: true,
        updatedAt: true,
      },
    })
  },

  async update(id: number, data: UpdateInscriptoData) {
    return prisma.inscripto.update({
      where: { id },
      data,
      select: {
        id: true,
        observaciones: true,
        prioridad: true,
        condicionada: true,
        updatedAt: true,
      },
    })
  },

  async assignInstituto(id: number, institutoId: number | null) {
    return prisma.inscripto.update({
      where: { id },
      data: { institutoId },
      select: {
        id: true,
        institutoId: true,
        updatedAt: true,
        instituto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })
  },

  async assignInstitutosBulk(asignaciones: AsignacionInstituto[]) {
    return prisma.$transaction(async (tx) => {
      const inscriptoIds = [...new Set(asignaciones.map((a) => a.inscriptoId))]
      const institutoIds = [
        ...new Set(
          asignaciones
            .map((a) => a.institutoId)
            .filter((id): id is number => typeof id === 'number' && Number.isInteger(id)),
        ),
      ]

      const [inscriptosCount, institutosCount] = await Promise.all([
        tx.inscripto.count({ where: { id: { in: inscriptoIds } } }),
        institutoIds.length > 0
          ? tx.instituto.count({ where: { id: { in: institutoIds } } })
          : Promise.resolve(0),
      ])

      if (inscriptosCount !== inscriptoIds.length) {
        throw new Error('Uno o mas inscriptos no existen')
      }
      if (institutoIds.length > 0 && institutosCount !== institutoIds.length) {
        throw new Error('Uno o mas institutos no existen')
      }

      const updates = await Promise.all(
        asignaciones.map((a) =>
          tx.inscripto.update({
            where: { id: a.inscriptoId },
            data: { institutoId: a.institutoId },
            select: {
              id: true,
              institutoId: true,
              updatedAt: true,
            },
          }),
        ),
      )

      return updates
    })
  },

  async getDocumentoPath(id: number, tipo: 'dni' | 'titulo') {
    const inscripto = await prisma.inscripto.findUnique({
      where: { id },
      select: {
        id: true,
        dniAdjuntoUrl: true,
        tituloAdjuntoUrl: true,
      },
    })

    if (!inscripto) return null

    const path = tipo === 'dni' ? inscripto.dniAdjuntoUrl : inscripto.tituloAdjuntoUrl
    return { id: inscripto.id, path: path || null }
  },
}
