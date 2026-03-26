import cron, { type ScheduledTask } from "node-cron"
import type { App } from "@prisma/client"
import type { ScreenshotService } from "./screenshot.js"
import type { AppDb } from "../db/apps.js"

interface Db {
  readonly apps: AppDb
}

export const intervalToCron = (minutes: number): string => {
  if (minutes >= 1440 && minutes % 1440 === 0) {
    return "0 0 * * *"
  }
  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60
    if (hours === 1) return "0 * * * *"
    return `0 */${hours} * * *`
  }
  return `*/${minutes} * * * *`
}

export const createScheduler = (
  screenshotService: Pick<ScreenshotService, "capture">,
  db: Db,
) => {
  const jobs = new Map<string, ScheduledTask>()

  const registerJob = (app: App): void => {
    cancelJob(app.id)
    const expression = intervalToCron(app.intervalMinutes)
    const task = cron.schedule(expression, () => {
      void screenshotService.capture(app)
    })
    jobs.set(app.id, task)
  }

  const cancelJob = (appId: string): void => {
    const existing = jobs.get(appId)
    if (existing) {
      existing.stop()
      jobs.delete(appId)
    }
  }

  const restoreActiveJobs = async (): Promise<void> => {
    const activeApps = await db.apps.findAllActive()
    for (const app of activeApps) {
      registerJob(app)
    }
  }

  const stopAll = (): void => {
    for (const [id, task] of jobs) {
      task.stop()
      jobs.delete(id)
    }
  }

  const getActiveJobCount = (): number => jobs.size

  return { registerJob, cancelJob, restoreActiveJobs, stopAll, getActiveJobCount }
}

export type Scheduler = ReturnType<typeof createScheduler>
