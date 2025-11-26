import multer from 'multer'

export const uploadMemory = multer({
  storage: multer.memoryStorage(), // 👈 se guarda en memoria, no en disco
  limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5MB
})
