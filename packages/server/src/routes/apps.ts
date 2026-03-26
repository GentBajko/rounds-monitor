import { Router } from "express"
import { z } from "zod"
import type { AppService } from "../services/app.js"
import type { ScreenshotService } from "../services/screenshot.js"
import type { Scheduler } from "../services/scheduler.js"
import { errorToStatus } from "../types/errors.js"
import { validateBody, validateQuery } from "../middleware/validateRequest.js"

const createAppSchema = z.object({
  url: z.string().url(),
  intervalMinutes: z.number().int().min(15).max(1440).optional(),
})

const updateAppSchema = z.object({
  intervalMinutes: z.number().int().min(15).max(1440).optional(),
  status: z.enum(["ACTIVE", "PAUSED"]).optional(),
})

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const createAppRoutes = (
  appService: AppService,
  screenshotService: ScreenshotService,
  scheduler: Scheduler,
): Router => {
  const router = Router()

  router.get("/", async (_req, res, next) => {
    try {
      const result = await appService.listApps()
      if (!result.ok) {
        res.status(errorToStatus(result.error)).json({ error: result.error })
        return
      }
      res.json(result.data)
    } catch (err) {
      next(err)
    }
  })

  router.post("/", validateBody(createAppSchema), async (req, res, next) => {
    try {
      const result = await appService.createApp(req.body)
      if (!result.ok) {
        res.status(errorToStatus(result.error)).json({ error: result.error })
        return
      }

      scheduler.registerJob(result.data)
      void screenshotService.capture(result.data)

      res.status(201).json(result.data)
    } catch (err) {
      next(err)
    }
  })

  router.get("/:id", async (req, res, next) => {
    try {
      const result = await appService.getApp(req.params.id!)
      if (!result.ok) {
        res.status(errorToStatus(result.error)).json({ error: result.error })
        return
      }
      res.json(result.data)
    } catch (err) {
      next(err)
    }
  })

  router.patch("/:id", validateBody(updateAppSchema), async (req, res, next) => {
    try {
      const result = await appService.updateApp(String(req.params.id), req.body)
      if (!result.ok) {
        res.status(errorToStatus(result.error)).json({ error: result.error })
        return
      }

      const app = result.data
      if (req.body.status === "PAUSED") {
        scheduler.cancelJob(app.id)
      } else if (req.body.status === "ACTIVE") {
        scheduler.registerJob(app)
      }
      if (req.body.intervalMinutes) {
        scheduler.cancelJob(app.id)
        if (app.status === "ACTIVE") scheduler.registerJob(app)
      }

      res.json(app)
    } catch (err) {
      next(err)
    }
  })

  router.delete("/:id", async (req, res, next) => {
    try {
      const id = req.params.id!
      scheduler.cancelJob(id)
      const result = await appService.deleteApp(id)
      if (!result.ok) {
        res.status(errorToStatus(result.error)).json({ error: result.error })
        return
      }
      res.status(204).end()
    } catch (err) {
      next(err)
    }
  })

  router.get("/:id/screenshots", validateQuery(paginationSchema), async (req, res, next) => {
    try {
      const { page, limit } = res.locals["parsedQuery"] as { page: number; limit: number }
      const result = await screenshotService.getScreenshots(String(req.params.id), page, limit)
      if (!result.ok) {
        res.status(errorToStatus(result.error)).json({ error: result.error })
        return
      }
      res.json(result.data)
    } catch (err) {
      next(err)
    }
  })

  router.post("/:id/screenshots/capture", async (req, res, next) => {
    try {
      const appResult = await appService.getApp(req.params.id!)
      if (!appResult.ok) {
        res.status(errorToStatus(appResult.error)).json({ error: appResult.error })
        return
      }

      const captureResult = await screenshotService.capture(appResult.data)
      if (!captureResult.ok) {
        res.status(errorToStatus(captureResult.error)).json({ error: captureResult.error })
        return
      }

      res.status(201).json(captureResult.data)
    } catch (err) {
      next(err)
    }
  })

  return router
}
