import type { Browser, BrowserContext } from "playwright"
import type { App, Screenshot } from "@prisma/client"
import { ok, err, type Result } from "../types/result.js"
import type { AppError } from "../types/errors.js"
import type { ScreenshotDb } from "../db/screenshots.js"
import type { AppDb } from "../db/apps.js"
import type { StorageAdapter } from "../storage/types.js"

interface Db {
  readonly screenshots: ScreenshotDb
  readonly apps: AppDb
}

const REALISTIC_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

export const createScreenshotService = (
  db: Db,
  storage: StorageAdapter,
  browser: Browser,
) => ({
  capture: async (app: App): Promise<Result<Screenshot, AppError>> => {
    let context: BrowserContext | undefined
    try {
      context = await browser.newContext({ userAgent: REALISTIC_USER_AGENT })
      const page = await context.newPage()
      await page.setViewportSize({ width: 1280, height: 800 })

      await page.goto(app.playStoreUrl, { waitUntil: "networkidle", timeout: 30_000 })
      await page.waitForLoadState("networkidle")

      const selectors = ["h1", "button[aria-label='Install']", "[data-screenshot-id]", "img[alt]"]
      await Promise.allSettled(
        selectors.map((s) => page.waitForSelector(s, { timeout: 10_000 })),
      )

      const buffer = await page.screenshot({ fullPage: true })
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const key = `${app.packageId}/${timestamp}.png`

      await storage.save(key, buffer)

      const screenshot = await db.screenshots.create({
        appId: app.id,
        filePath: key,
        status: "SUCCESS",
      })

      if (!app.appName) {
        try {
          const title = await page.locator("h1").textContent()
          if (title) {
            await db.apps.update(app.id, { appName: title.trim() })
          }
        } catch {
        }
      }

      return ok(screenshot)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown capture error"

      await db.screenshots.create({
        appId: app.id,
        filePath: "",
        status: "FAILED",
        errorMessage: message,
      })

      return err({ code: "CAPTURE_FAILED", message })
    } finally {
      await context?.close()
    }
  },

  getScreenshots: async (
    appId: string,
    page: number,
    limit: number,
  ): Promise<Result<{ screenshots: Screenshot[]; totalCount: number }, AppError>> => {
    const result = await db.screenshots.findByAppId(appId, page, limit)
    return ok(result)
  },
})

export type ScreenshotService = ReturnType<typeof createScreenshotService>
