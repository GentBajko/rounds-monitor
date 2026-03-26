export type AppStatus = "ACTIVE" | "PAUSED"
export type ScreenshotStatus = "SUCCESS" | "FAILED"

export interface App {
  readonly id: string
  readonly packageId: string
  readonly playStoreUrl: string
  readonly appName: string | null
  readonly status: AppStatus
  readonly intervalMinutes: number
  readonly createdAt: string
  readonly updatedAt: string
  readonly _count?: { readonly screenshots: number }
  readonly screenshots?: ReadonlyArray<{ readonly capturedAt: string }>
}

export interface Screenshot {
  readonly id: string
  readonly appId: string
  readonly filePath: string
  readonly capturedAt: string
  readonly status: ScreenshotStatus
  readonly errorMessage: string | null
  readonly createdAt: string
}

export interface ScreenshotPage {
  readonly screenshots: Screenshot[]
  readonly totalCount: number
}

export interface CreateAppBody {
  readonly url: string
  readonly intervalMinutes?: number
}

export interface UpdateAppBody {
  readonly intervalMinutes?: number
  readonly status?: AppStatus
}
