import type { PrismaClient, App, AppStatus } from "@prisma/client"

interface CreateAppInput {
  readonly packageId: string
  readonly playStoreUrl: string
  readonly intervalMinutes: number
}

interface UpdateAppInput {
  readonly intervalMinutes?: number
  readonly status?: AppStatus
  readonly appName?: string
}

export const createAppDb = (prisma: PrismaClient) => ({
  create: (input: CreateAppInput): Promise<App> =>
    prisma.app.create({ data: input }),

  findById: (id: string): Promise<App | null> =>
    prisma.app.findUnique({ where: { id } }),

  findByPackageId: (packageId: string): Promise<App | null> =>
    prisma.app.findUnique({ where: { packageId } }),

  findAll: () =>
    prisma.app.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { screenshots: true } },
        screenshots: {
          orderBy: { capturedAt: "desc" },
          take: 1,
          select: { capturedAt: true },
        },
      },
    }),

  findAllActive: (): Promise<App[]> =>
    prisma.app.findMany({ where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } }),

  update: (id: string, data: UpdateAppInput): Promise<App> =>
    prisma.app.update({ where: { id }, data }),

  remove: (id: string): Promise<App> =>
    prisma.app.delete({ where: { id } }),
})

export type AppDb = ReturnType<typeof createAppDb>
