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
        data: { cursanteId: cursante.id, aulaId, estado: 'ACTIVO', documentacion: 'PENDIENTE' },
      })
    }

    return cursante
  },

  async removeFromAula(cursanteId: number, aulaId: number) {
    return prisma.cursanteAula.delete({
      where: { cursanteId_aulaId: { cursanteId, aulaId } },
    })
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
        data: { cursanteId: cursante.id, aulaId, estado: 'ACTIVO', documentacion: 'PENDIENTE' },
      })

      importados.push(cursante)
    }

    return { importados, duplicados }
  },

  async updateEstado(cursanteId: number, aulaId: number, estado: 'ACTIVO' | 'ADEUDA' | 'BAJA') {
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
}
