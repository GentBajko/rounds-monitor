import { z } from "zod"

const configSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3001),
  STORAGE_TYPE: z.enum(["local"]).default("local"),
  SCREENSHOT_DIR: z.string().default("./screenshots"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

export type Config = {
  readonly databaseUrl: string
  readonly port: number
  readonly storageType: "local"
  readonly screenshotDir: string
  readonly nodeEnv: "development" | "production" | "test"
}

export const parseConfig = (env: Record<string, string | undefined>): Config => {
  const parsed = configSchema.parse(env)
  return {
    databaseUrl: parsed.DATABASE_URL,
    port: parsed.PORT,
    storageType: parsed.STORAGE_TYPE,
    screenshotDir: parsed.SCREENSHOT_DIR,
    nodeEnv: parsed.NODE_ENV,
  }
}
