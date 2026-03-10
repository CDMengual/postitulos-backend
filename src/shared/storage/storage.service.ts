import crypto from 'crypto'
import { getSupabaseAdmin, getSupabaseBucket } from '../../lib/supabase'

const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const EXT_TO_MIME: Record<string, string[]> = {
  pdf: ['application/pdf'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
}

const DEFAULT_MAX_FILE_SIZE = 8 * 1024 * 1024

export type PublicDocumentType = 'dni' | 'titulo'

const normalizeDni = (dni: string) => String(dni || '').replace(/\D/g, '')

const parseMaxFileSize = () => {
  const raw = process.env.PUBLIC_UPLOAD_MAX_BYTES
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_FILE_SIZE
}

const extractExtension = (fileName: string) => {
  const clean = String(fileName || '').trim().toLowerCase()
  const parts = clean.split('.')
  if (parts.length < 2) return null
  return parts.pop() || null
}

const buildStoragePath = (
  cohorteId: number,
  dni: string,
  tipo: PublicDocumentType,
  extension: string,
) => {
  const fileId = crypto.randomBytes(16).toString('hex')
  return `inscripciones/${cohorteId}/${dni}/${tipo}/${fileId}.${extension}`
}

const getAllowedMimeTypes = () => Object.keys(MIME_TO_EXT)

const isSupportedTipo = (value: string): value is PublicDocumentType =>
  value === 'dni' || value === 'titulo'

export const storageService = {
  getAllowedMimeTypes,
  isSupportedTipo,

  async createSignedUploadForPublicForm(params: {
    cohorteId: number
    dni: string
    tipo: PublicDocumentType
    fileName: string
    contentType: string
    fileSize: number
  }) {
    const dni = normalizeDni(params.dni)
    if (!dni || dni.length < 6 || dni.length > 12) {
      return { error: 'DNI invalido para generar la subida', code: 400 as const }
    }

    const maxFileSize = parseMaxFileSize()
    if (!Number.isFinite(params.fileSize) || params.fileSize <= 0) {
      return { error: 'Debe enviar fileSize valido', code: 400 as const }
    }
    if (params.fileSize > maxFileSize) {
      return {
        error: `El archivo excede el maximo permitido (${maxFileSize} bytes)`,
        code: 400 as const,
      }
    }

    const contentType = String(params.contentType || '').toLowerCase().trim()
    if (!MIME_TO_EXT[contentType]) {
      return {
        error: `Tipo de archivo no permitido. Permitidos: ${getAllowedMimeTypes().join(', ')}`,
        code: 400 as const,
      }
    }

    const extensionFromName = extractExtension(params.fileName || '')
    if (extensionFromName && EXT_TO_MIME[extensionFromName]) {
      const allowedMimes = EXT_TO_MIME[extensionFromName]
      if (!allowedMimes.includes(contentType)) {
        return { error: 'La extension del archivo no coincide con su contentType', code: 400 as const }
      }
    }

    const extension = MIME_TO_EXT[contentType]
    const path = buildStoragePath(params.cohorteId, dni, params.tipo, extension)
    const supabase = getSupabaseAdmin()
    const bucket = getSupabaseBucket()

    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path)
    if (error || !data) {
      return { error: 'No se pudo generar URL firmada de subida', code: 500 as const }
    }

    return {
      data: {
        bucket,
        path: data.path,
        token: data.token,
        signedUrl: data.signedUrl,
        contentType,
        maxFileSize,
      },
    }
  },

  async validateUploadedPublicPath(params: {
    path: string
    cohorteId: number
    dni: string
    tipo: PublicDocumentType
  }) {
    const path = String(params.path || '').trim()
    const dni = normalizeDni(params.dni)
    if (!path) return { error: 'Ruta de archivo vacia', code: 400 as const }
    if (!dni || dni.length < 6 || dni.length > 12) {
      return { error: 'DNI invalido', code: 400 as const }
    }

    const pathMatch = path.match(
      /^inscripciones\/(\d+)\/(\d{6,12})\/(dni|titulo)\/([a-f0-9]{32})\.(pdf|jpg|png|webp)$/i,
    )

    if (!pathMatch) {
      return { error: 'Ruta de archivo invalida', code: 400 as const }
    }

    const [, cohorteIdStr, dniPath, tipoPath] = pathMatch
    if (Number(cohorteIdStr) !== params.cohorteId) {
      return { error: 'El archivo no corresponde a la cohorte enviada', code: 400 as const }
    }
    if (dniPath !== dni) {
      return { error: 'El archivo no corresponde al DNI enviado', code: 400 as const }
    }
    if (tipoPath !== params.tipo) {
      return { error: `El archivo no corresponde al tipo ${params.tipo}`, code: 400 as const }
    }

    const parts = path.split('/')
    const fileName = parts.pop()
    const folder = parts.join('/')
    const supabase = getSupabaseAdmin()
    const bucket = getSupabaseBucket()

    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      limit: 100,
      offset: 0,
      search: fileName,
    })

    if (error) {
      return { error: 'No se pudo verificar el archivo en storage', code: 500 as const }
    }

    const exists = !!data?.some((item) => item.name === fileName)
    if (!exists) {
      return { error: 'El archivo no existe en storage', code: 400 as const }
    }

    return { data: { path } }
  },

  async createSignedReadUrl(path: string, expiresIn = 60 * 10) {
    const cleanPath = String(path || '').trim()
    if (!cleanPath) {
      return { error: 'Ruta de archivo vacia', code: 400 as const }
    }

    const supabase = getSupabaseAdmin()
    const bucket = getSupabaseBucket()
    const seconds = Number.isFinite(expiresIn) && expiresIn > 0 ? Math.floor(expiresIn) : 600

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(cleanPath, seconds)
    if (error || !data?.signedUrl) {
      return { error: 'No se pudo generar URL firmada de lectura', code: 500 as const }
    }

    return {
      data: {
        bucket,
        path: cleanPath,
        signedUrl: data.signedUrl,
        expiresIn: seconds,
      },
    }
  },
}
