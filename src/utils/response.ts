import { Response } from 'express'

export const sendSuccess = (
  res: Response,
  message: string,
  data: any = null,
  meta: any = null,
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  })
}

export const sendError = (res: Response, message: string, code = 500, details: any = null) => {
  return res.status(code).json({
    success: false,
    message,
    error: {
      code,
      details,
    },
  })
}
