import { ok, err, type Result } from "../types/result.js"
import type { AppError } from "../types/errors.js"

export const parsePlayStoreUrl = (url: string): Result<string, AppError> => {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return err({ code: "INVALID_URL", message: `Invalid URL: ${url}` })
  }

  if (parsed.hostname !== "play.google.com") {
    return err({ code: "INVALID_URL", message: "URL must be from play.google.com" })
  }

  if (!parsed.pathname.startsWith("/store/apps/details")) {
    return err({ code: "INVALID_URL", message: "URL must be a Play Store app details page" })
  }

  const packageId = parsed.searchParams.get("id")
  if (!packageId) {
    return err({ code: "INVALID_URL", message: "URL missing 'id' query parameter" })
  }

  return ok(packageId)
}
