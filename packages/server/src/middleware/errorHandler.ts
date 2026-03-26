import type { Request, Response, NextFunction } from "express"

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof Error && err.name === "ZodError" && "issues" in err) {
    res.status(400).json({
      error: {
        code: "VALIDATION",
        message: "Validation failed",
        details: (err as { issues: unknown }).issues,
      },
    })
    return
  }

  console.error("Unhandled error:", err)

  res.status(500).json({
    error: {
      code: "INTERNAL",
      message: "Internal server error",
    },
  })
}
