import type { Request, Response, NextFunction } from "express"
import type { ZodType } from "zod"

export const validateBody = (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      next(result.error)
      return
    }
    req.body = result.data
    next()
  }

export const validateQuery = (schema: ZodType) =>
  (_req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(_req.query)
    if (!result.success) {
      next(result.error)
      return
    }
    res.locals["parsedQuery"] = result.data
    next()
  }
