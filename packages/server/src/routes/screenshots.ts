import { Router } from "express"
import type { StorageAdapter } from "../storage/types.js"
import type { ScreenshotDb } from "../db/screenshots.js"

export const createScreenshotRoutes = (
  storage: StorageAdapter,
  screenshotDb: ScreenshotDb,
): Router => {
  const router = Router()

  router.get("/screenshots/:id/image", async (req, res, _next) => {
    try {
      const screenshot = await screenshotDb.findById(req.params.id!)
      if (!screenshot) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Screenshot not found" } })
        return
      }
      const buffer = await storage.get(screenshot.filePath)
      res.set("Content-Type", "image/png")
      res.set("Cache-Control", "public, max-age=86400")
      res.send(buffer)
    } catch {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Screenshot file not found" } })
    }
  })

  return router
}
