import { readFile, writeFile, mkdir, unlink } from "node:fs/promises"
import { join, dirname } from "node:path"
import type { StorageAdapter } from "./types.js"

export const createLocalStorage = (baseDir: string): StorageAdapter => ({
  save: async (key: string, data: Buffer): Promise<void> => {
    const fullPath = join(baseDir, key)
    await mkdir(dirname(fullPath), { recursive: true })
    await writeFile(fullPath, data)
  },

  get: async (key: string): Promise<Buffer> => {
    return readFile(join(baseDir, key))
  },

  delete: async (key: string): Promise<void> => {
    await unlink(join(baseDir, key))
  },

  getPublicUrl: (screenshotId: string): string => {
    return `/api/screenshots/${screenshotId}/image`
  },
})
