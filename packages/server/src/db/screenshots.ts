import type { PrismaClient, Screenshot, ScreenshotStatus } from "@prisma/client"

interface CreateScreenshotInput {
  readonly appId: string
  readonly filePath: string
  readonly status: ScreenshotStatus
  readonly errorMessage?: string
  readonly capturedAt?: Date
}

export const createScreenshotDb = (prisma: PrismaClient) => ({
  create: (input: CreateScreenshotInput): Promise<Screenshot> =>
    prisma.screenshot.create({ data: input }),

  findById: (id: string): Promise<Screenshot | null> =>
    prisma.screenshot.findUnique({ where: { id } }),

  findByAppId: async (
    appId: string,
    page: number,
    limit: number,
  ): Promise<{ screenshots: Screenshot[]; totalCount: number }> => {
    const [screenshots, totalCount] = await prisma.$transaction([
      prisma.screenshot.findMany({
        where: { appId },
        orderBy: { capturedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.screenshot.count({ where: { appId } }),
    ])
    return { screenshots, totalCount }
  },

  deleteByAppId: async (appId: string): Promise<string[]> => {
    const screenshots = await prisma.screenshot.findMany({
      where: { appId },
      select: { filePath: true },
    })
    await prisma.screenshot.deleteMany({ where: { appId } })
    return screenshots.map((s) => s.filePath)
  },
})

export type ScreenshotDb = ReturnType<typeof createScreenshotDb>
