export interface StorageAdapter {
  readonly save: (key: string, data: Buffer) => Promise<void>
  readonly get: (key: string) => Promise<Buffer>
  readonly delete: (key: string) => Promise<void>
  readonly getPublicUrl: (screenshotId: string) => string
}
