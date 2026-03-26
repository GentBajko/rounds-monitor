import path from "node:path"
import { defineConfig } from "prisma/config"
import { loadEnvFile } from "node:process"

try {
  loadEnvFile(path.resolve(import.meta.dirname, ".env"))
} catch {
}

export default defineConfig({
  earlyAccess: true,
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
  migrate: {
    async adapter() {
      const { PrismaPg } = await import("@prisma/adapter-pg")
      const connectionString = process.env["DATABASE_URL"]
      if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set")
      }
      return new PrismaPg({ connectionString })
    },
  },
})
