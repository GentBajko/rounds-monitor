import { useState, useEffect } from "react"
import { useScreenshots } from "../../hooks/useScreenshots"
import type { Screenshot } from "../../types"

interface ScreenshotTimelineProps {
  appId: string
}

export const ScreenshotTimeline = ({ appId }: ScreenshotTimelineProps) => {
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<Screenshot[]>([])
  const { data, isLoading, isError } = useScreenshots(appId, page)

  useEffect(() => {
    if (!data) return
    setAccumulated((prev) => {
      if (page === 1) return data.screenshots

      const existingIds = new Set(prev.map((s) => s.id))
      const newScreenshots = data.screenshots.filter((s) => !existingIds.has(s.id))
      return [...prev, ...newScreenshots]
    })
  }, [data, page])

  if (isLoading && accumulated.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-on-surface-variant">
        Loading screenshots...
      </div>
    )
  }

  if (isError && accumulated.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-error">
        Failed to load screenshots.
      </div>
    )
  }

  if (accumulated.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-on-surface-variant">
        No screenshots yet. Click Refresh to capture the first one.
      </div>
    )
  }

  const totalCount = data?.totalCount ?? 0
  const hasMore = accumulated.length < totalCount

  return (
    <div>
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/20" />

        <div className="space-y-8">
          {accumulated.map((screenshot) => (
            <div key={screenshot.id} className="relative pl-12">
              {/* Timeline dot */}
              <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-surface" />

              {/* Timestamp */}
              <p className="text-sm font-semibold text-on-surface mb-3">
                {new Date(screenshot.capturedAt).toUTCString()}
              </p>

              {/* Content */}
              {screenshot.status === "FAILED" ? (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-error-container text-error text-sm">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{screenshot.errorMessage ?? "Screenshot capture failed"}</span>
                </div>
              ) : (
                <a
                  href={`/api/screenshots/${screenshot.id}/image`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-surface-container-lowest rounded-xl p-2 shadow-sm ring-1 ring-outline-variant/10 hover:ring-primary/30 transition-all"
                >
                  <img
                    src={`/api/screenshots/${screenshot.id}/image`}
                    alt={`Screenshot captured at ${new Date(screenshot.capturedAt).toUTCString()}`}
                    className="rounded-lg max-w-sm w-full"
                    loading="lazy"
                  />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-outline-variant/10 bg-surface-container-lowest text-sm text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
            {isLoading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  )
}
