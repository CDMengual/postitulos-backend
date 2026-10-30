-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'REFERENTE', 'FORMADOR', 'COORDINADOR');

-- CreateEnum
CREATE TYPE "TipoPostitulo" AS ENUM ('ESPECIALIZACION', 'DIPLOMATURA', 'ACTUALIZACION');

-- CreateEnum
CREATE TYPE "EstadoCursante" AS ENUM ('ACTIVO', 'ADEUDA', 'BAJA', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "Documentacion" AS ENUM ('VERIFICADA', 'PENDIENTE', 'NO_CORRESPONDE');

-- CreateEnum
CREATE TYPE "EstadoCohorte" AS ENUM ('INSCRIPCION', 'ACTIVA', 'INACTIVA', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoInscripto" AS ENUM ('PENDIENTE', 'RECHAZADA', 'ASIGNADA', 'LISTA_ESPERA');

-- CreateTable
CREATE TABLE "Region" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distrito" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "regionId" INTEGER NOT NULL,

    CONSTRAINT "Distrito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instituto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "distritoId" INTEGER NOT NULL,

    CONSTRAINT "Instituto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "celular" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'REFERENTE',
    "password" TEXT NOT NULL,
    "institutoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Postitulo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT DEFAULT 'TEMP',
    "requisitos" JSONB,
    "destinatarios" TEXT,
    "descripcion" TEXT,
    "autores" TEXT,
    "coordinadores" TEXT,
    "resolucion" TEXT,
    "planEstudios" TEXT,
    "resolucionPuntaje" TEXT,
    "dictamen" TEXT,
    "modalidad" TEXT,
    "cargaHoraria" INTEGER,
    "horasSincronicas" INTEGER,
    "horasVirtuales" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Postitulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostituloTipo" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoPostitulo" NOT NULL,
    "titulo" TEXT NOT NULL,
    "postituloId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostituloTipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aula" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "cohorteId" INTEGER NOT NULL,
    "institutoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AulaSnapshotMensual" (
    "id" SERIAL NOT NULL,
    "aulaId" INTEGER NOT NULL,
    "fechaCorte" TIMESTAMP(3) NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "totalInicial" INTEGER NOT NULL,
    "activos" INTEGER NOT NULL,
    "adeuda" INTEGER NOT NULL,
    "baja" INTEGER NOT NULL,
    "finalizado" INTEGER NOT NULL,
    "totalFoto" INTEGER NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AulaSnapshotMensual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cursante" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email" TEXT,
    "celular" TEXT,
    "titulo" TEXT,
    "regionId" INTEGER,
    "distritoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cursante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CursanteAula" (
    "id" SERIAL NOT NULL,
    "cursanteId" INTEGER NOT NULL,
    "aulaId" INTEGER NOT NULL,
    "estado" "EstadoCursante" NOT NULL DEFAULT 'ACTIVO',
    "documentacion" "Documentacion" NOT NULL DEFAULT 'PENDIENTE',
    "dniAdjuntoUrl" TEXT,
    "tituloAdjuntoUrl" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CursanteAula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cohorte" (
    "id" SERIAL NOT NULL,
    "anio" INTEGER NOT NULL,
    "nombre" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "estado" "EstadoCohorte" NOT NULL DEFAULT 'INACTIVA',
    "fechaInicioInscripcion" TIMESTAMP(3),
    "fechaFinInscripcion" TIMESTAMP(3),
    "postituloId" INTEGER NOT NULL,
    "formularioId" INTEGER,
    "cantidadAulas" INTEGER,
    "cupos" INTEGER,
    "cuposListaEspera" INTEGER,
    "cuposTotales" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cohorte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CohorteInstituto" (
    "cohorteId" INTEGER NOT NULL,
    "institutoId" INTEGER NOT NULL,

    CONSTRAINT "CohorteInstituto_pkey" PRIMARY KEY ("cohorteId","institutoId")
);

-- CreateTable
CREATE TABLE "Inscripto" (
    "id" SERIAL NOT NULL,
    "cohorteId" INTEGER NOT NULL,
    "institutoId" INTEGER,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email" TEXT,
    "celular" TEXT,
    "datosFormulario" JSONB,
    "dniAdjuntoUrl" TEXT,
    "tituloAdjuntoUrl" TEXT,
    "estado" "EstadoInscripto" NOT NULL DEFAULT 'PENDIENTE',
    "prioridad" INTEGER,
    "condicionada" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "documentacion" "Documentacion" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inscripto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formulario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "campos" JSONB NOT NULL,
    "postituloId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Formulario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AdminAulas" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AdminAulas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CoordinadorAulas" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CoordinadorAulas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ReferenteAulas" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ReferenteAulas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FormadorAulas" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FormadorAulas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Distrito_nombre_key" ON "Distrito"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Postitulo_codigo_key" ON "Postitulo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Aula_codigo_key" ON "Aula"("codigo");

-- CreateIndex
CREATE INDEX "AulaSnapshotMensual_fechaCorte_idx" ON "AulaSnapshotMensual"("fechaCorte");

-- CreateIndex
CREATE UNIQUE INDEX "AulaSnapshotMensual_aulaId_anio_mes_key" ON "AulaSnapshotMensual"("aulaId", "anio", "mes");

-- CreateIndex
CREATE UNIQUE INDEX "Cursante_dni_key" ON "Cursante"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "CursanteAula_cursanteId_aulaId_key" ON "CursanteAula"("cursanteId", "aulaId");

-- CreateIndex
CREATE INDEX "CohorteInstituto_institutoId_idx" ON "CohorteInstituto"("institutoId");

-- CreateIndex
CREATE UNIQUE INDEX "Inscripto_cohorteId_dni_key" ON "Inscripto"("cohorteId", "dni");

-- CreateIndex
CREATE INDEX "_AdminAulas_B_index" ON "_AdminAulas"("B");

-- CreateIndex
CREATE INDEX "_CoordinadorAulas_B_index" ON "_CoordinadorAulas"("B");

-- CreateIndex
CREATE INDEX "_ReferenteAulas_B_index" ON "_ReferenteAulas"("B");

-- CreateIndex
CREATE INDEX "_FormadorAulas_B_index" ON "_FormadorAulas"("B");

-- AddForeignKey
ALTER TABLE "Distrito" ADD CONSTRAINT "Distrito_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instituto" ADD CONSTRAINT "Instituto_distritoId_fkey" FOREIGN KEY ("distritoId") REFERENCES "Distrito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_institutoId_fkey" FOREIGN KEY ("institutoId") REFERENCES "Instituto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostituloTipo" ADD CONSTRAINT "PostituloTipo_postituloId_fkey" FOREIGN KEY ("postituloId") REFERENCES "Postitulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aula" ADD CONSTRAINT "Aula_cohorteId_fkey" FOREIGN KEY ("cohorteId") REFERENCES "Cohorte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aula" ADD CONSTRAINT "Aula_institutoId_fkey" FOREIGN KEY ("institutoId") REFERENCES "Instituto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AulaSnapshotMensual" ADD CONSTRAINT "AulaSnapshotMensual_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "Aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cursante" ADD CONSTRAINT "Cursante_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cursante" ADD CONSTRAINT "Cursante_distritoId_fkey" FOREIGN KEY ("distritoId") REFERENCES "Distrito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursanteAula" ADD CONSTRAINT "CursanteAula_cursanteId_fkey" FOREIGN KEY ("cursanteId") REFERENCES "Cursante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursanteAula" ADD CONSTRAINT "CursanteAula_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "Aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cohorte" ADD CONSTRAINT "Cohorte_postituloId_fkey" FOREIGN KEY ("postituloId") REFERENCES "Postitulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cohorte" ADD CONSTRAINT "Cohorte_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES "Formulario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohorteInstituto" ADD CONSTRAINT "CohorteInstituto_cohorteId_fkey" FOREIGN KEY ("cohorteId") REFERENCES "Cohorte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohorteInstituto" ADD CONSTRAINT "CohorteInstituto_institutoId_fkey" FOREIGN KEY ("institutoId") REFERENCES "Instituto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripto" ADD CONSTRAINT "Inscripto_cohorteId_fkey" FOREIGN KEY ("cohorteId") REFERENCES "Cohorte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripto" ADD CONSTRAINT "Inscripto_institutoId_fkey" FOREIGN KEY ("institutoId") REFERENCES "Instituto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formulario" ADD CONSTRAINT "Formulario_postituloId_fkey" FOREIGN KEY ("postituloId") REFERENCES "Postitulo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminAulas" ADD CONSTRAINT "_AdminAulas_A_fkey" FOREIGN KEY ("A") REFERENCES "Aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminAulas" ADD CONSTRAINT "_AdminAulas_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoordinadorAulas" ADD CONSTRAINT "_CoordinadorAulas_A_fkey" FOREIGN KEY ("A") REFERENCES "Aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoordinadorAulas" ADD CONSTRAINT "_CoordinadorAulas_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReferenteAulas" ADD CONSTRAINT "_ReferenteAulas_A_fkey" FOREIGN KEY ("A") REFERENCES "Aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReferenteAulas" ADD CONSTRAINT "_ReferenteAulas_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormadorAulas" ADD CONSTRAINT "_FormadorAulas_A_fkey" FOREIGN KEY ("A") REFERENCES "Aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormadorAulas" ADD CONSTRAINT "_FormadorAulas_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
