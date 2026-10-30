-- Las columnas existentes conservan sus URLs para mantener compatibilidad.
ALTER TABLE "Postitulo"
ADD COLUMN "resolucionNumero" TEXT,
ADD COLUMN "resolucionPuntajeNumero" TEXT,
ADD COLUMN "dictamenNumero" TEXT,
ADD COLUMN "programa" TEXT;
