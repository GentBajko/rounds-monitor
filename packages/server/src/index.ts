import express from "express"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { chromium } from "playwright"
import { parseConfig } from "./utils/config.js"
import { createLocalStorage } from "./storage/local.js"
import { createAppDb } from "./db/apps.js"
import { createScreenshotDb } from "./db/screenshots.js"
import { createAppService } from "./services/app.js"
import { createScreenshotService } from "./services/screenshot.js"
import { createScheduler } from "./services/scheduler.js"
import { createAppRoutes } from "./routes/apps.js"
import { createScreenshotRoutes } from "./routes/screenshots.js"
import { errorHandler } from "./middleware/errorHandler.js"

const main = async (): Promise<void> => {
  const config = parseConfig(process.env)
  const adapter = new PrismaPg({ connectionString: config.databaseUrl })
  const prisma = new PrismaClient({ adapter })
  const storage = createLocalStorage(config.screenshotDir)
  const browser = await chromium.launch()

  const db = {
    apps: createAppDb(prisma),
    screenshots: createScreenshotDb(prisma),
  }

  const appService = createAppService(db, storage)
  const screenshotService = createScreenshotService(db, storage, browser)
  const scheduler = createScheduler(screenshotService, db)

  const app = express()
  app.use(express.json())

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" })
  })

  app.use("/api/apps", createAppRoutes(appService, screenshotService, scheduler))
  app.use("/api", createScreenshotRoutes(storage, db.screenshots))
  app.use(errorHandler)

  await scheduler.restoreActiveJobs()
  console.log(`Restored ${scheduler.getActiveJobCount()} active capture jobs`)

  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`)
  })

  const shutdown = async (): Promise<void> => {
    console.log("Shutting down...")
    scheduler.stopAll()
    server.close()
    await browser.close()
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on("SIGTERM", () => void shutdown())
  process.on("SIGINT", () => void shutdown())
}

main().catch((err) => {
  console.error("Failed to start server:", err)
  process.exit(1)
})
