import ky from "ky"
import type { App, Screenshot, ScreenshotPage, CreateAppBody, UpdateAppBody } from "../types"

const api = ky.create({ prefixUrl: "/api" })

export const appsApi = {
  list: (): Promise<App[]> =>
    api.get("apps").json(),

  get: (id: string): Promise<App> =>
    api.get(`apps/${id}`).json(),

  create: (body: CreateAppBody): Promise<App> =>
    api.post("apps", { json: body }).json(),

  update: (id: string, body: UpdateAppBody): Promise<App> =>
    api.patch(`apps/${id}`, { json: body }).json(),

  delete: (id: string): Promise<void> =>
    api.delete(`apps/${id}`).json(),
}

export const screenshotsApi = {
  list: (appId: string, page: number = 1, limit: number = 20): Promise<ScreenshotPage> =>
    api.get(`apps/${appId}/screenshots`, { searchParams: { page, limit } }).json(),

  capture: (appId: string): Promise<Screenshot> =>
    api.post(`apps/${appId}/screenshots/capture`).json(),
}
