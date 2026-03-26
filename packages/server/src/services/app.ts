import { ok, err, type Result } from "../types/result.js"
import type { AppError } from "../types/errors.js"
import type { AppDb } from "../db/apps.js"
import type { ScreenshotDb } from "../db/screenshots.js"
import type { StorageAdapter } from "../storage/types.js"
import { parsePlayStoreUrl } from "../utils/parsePlayStoreUrl.js"
import type { App } from "@prisma/client"

interface CreateAppInput {
  readonly url: string
  readonly intervalMinutes?: number
}

interface UpdateAppInput {
  readonly intervalMinutes?: number
  readonly status?: "ACTIVE" | "PAUSED"
}

interface Db {
  readonly apps: AppDb
  readonly screenshots: ScreenshotDb
}

export const createAppService = (db: Db, storage: StorageAdapter) => ({
  createApp: async (input: CreateAppInput): Promise<Result<App, AppError>> => {
    const parseResult = parsePlayStoreUrl(input.url)
    if (!parseResult.ok) return parseResult

    const packageId = parseResult.data
    const existing = await db.apps.findByPackageId(packageId)
    if (existing) {
      return err({ code: "DUPLICATE", message: `App ${packageId} is already tracked` })
    }

    const app = await db.apps.create({
      packageId,
      playStoreUrl: input.url,
      intervalMinutes: input.intervalMinutes ?? 60,
    })
    return ok(app)
  },

  getApp: async (id: string): Promise<Result<App, AppError>> => {
    const app = await db.apps.findById(id)
    if (!app) {
      return err({ code: "NOT_FOUND", message: `App ${id} not found` })
    }
    return ok(app)
  },

  listApps: async (): Promise<Result<App[], AppError>> => {
    const apps = await db.apps.findAll()
    return ok(apps)
  },

  updateApp: async (id: string, input: UpdateAppInput): Promise<Result<App, AppError>> => {
    const existing = await db.apps.findById(id)
    if (!existing) {
      return err({ code: "NOT_FOUND", message: `App ${id} not found` })
    }
    const updated = await db.apps.update(id, input)
    return ok(updated)
  },

  deleteApp: async (id: string): Promise<Result<App, AppError>> => {
    const existing = await db.apps.findById(id)
    if (!existing) {
      return err({ code: "NOT_FOUND", message: `App ${id} not found` })
    }
    const filePaths = await db.screenshots.deleteByAppId(id)
    await Promise.all(
      filePaths
        .filter((p) => p.length > 0)
        .map((p) => storage.delete(p).catch(() => { /* file may already be gone */ })),
    )
    const deleted = await db.apps.remove(id)
    return ok(deleted)
  },
})

export type AppService = ReturnType<typeof createAppService>
