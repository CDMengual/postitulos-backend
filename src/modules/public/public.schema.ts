import { BadRequestError } from '../../errors/app-error'
import {
  parseOptionalTrimmedString,
  parseRequiredPositiveInt,
  parseRequiredTrimmedString,
} from '../../shared/validation/common'
import { storageService, type PublicDocumentType } from '../../shared/storage/storage.service'

const normalizeDni = (value: unknown) => String(value || '').replace(/\D/g, '').trim()

const parseTipoDocumento = (value: unknown, field = 'tipo') => {
  const tipo = parseRequiredTrimmedString(value, field).toLowerCase()
  if (!storageService.isSupportedTipo(tipo)) {
    throw new BadRequestError('tipo invalido. Valores permitidos: dni, titulo')
  }

  return tipo as PublicDocumentType
}

const parseOptionalAttachmentPath = (value: unknown) => {
  const normalized = parseOptionalTrimmedString(value)
  return normalized || null
}

export const publicSchema = {
  parseCohorteId(params: Record<string, unknown>) {
    return parseRequiredPositiveInt(params.id, 'cohorteId')
  },

  parseSignUpload(params: Record<string, unknown>, body: Record<string, unknown>) {
    const fileSize = Number(body.fileSize)
    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      throw new BadRequestError('Debe enviar fileSize valido')
    }

    return {
      cohorteId: parseRequiredPositiveInt(params.id, 'cohorteId'),
      dni: normalizeDni(parseRequiredTrimmedString(body.dni, 'dni')),
      tipo: parseTipoDocumento(body.tipo),
      fileName: parseRequiredTrimmedString(body.fileName, 'fileName'),
      contentType: parseRequiredTrimmedString(body.contentType, 'contentType'),
      fileSize,
    }
  },

  parseCreateInscripcion(params: Record<string, unknown>, body: Record<string, unknown>) {
    const cohorteIdRaw = params.id ?? body.cohorteId
    const cohorteId = parseRequiredPositiveInt(cohorteIdRaw, 'cohorteId')
    const nombre = parseRequiredTrimmedString(body.nombre, 'nombre')
    const apellido = parseRequiredTrimmedString(body.apellido, 'apellido')
    const dni = normalizeDni(parseRequiredTrimmedString(body.dni, 'dni'))

    if (dni.length < 6 || dni.length > 12) {
      throw new BadRequestError('Debe enviar un dni valido')
    }

    return {
      cohorteId,
      nombre,
      apellido,
      dni,
      email: parseOptionalTrimmedString(body.email) || null,
      celular: parseOptionalTrimmedString(body.celular) || null,
      datosFormulario: body.datosFormulario ?? null,
      dniAdjuntoUrl: parseOptionalAttachmentPath(body.dniAdjuntoPath ?? body.dniAdjuntoUrl),
      tituloAdjuntoUrl: parseOptionalAttachmentPath(body.tituloAdjuntoPath ?? body.tituloAdjuntoUrl),
    }
  },
}
