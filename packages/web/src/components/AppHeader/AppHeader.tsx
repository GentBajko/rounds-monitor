import { useNavigate } from "react-router-dom"
import { useTriggerCapture } from "../../hooks/useScreenshots"
import type { App } from "../../types"

interface AppHeaderProps {
  app: App
}

const formatInterval = (minutes: number): string => {
  if (minutes === 1440) return "Daily"
  if (minutes >= 60) {
    const hours = minutes / 60
    return hours === 1 ? "Every hour" : `Every ${hours} hours`
  }
  return `Every ${minutes} min`
}

export const AppHeader = ({ app }: AppHeaderProps) => {
  const navigate = useNavigate()
  const triggerCapture = useTriggerCapture()

  const handleRefresh = () => {
    triggerCapture.mutate(app.id)
  }

  const isPaused = app.status === "PAUSED"

  return (
    <div className="mb-8">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-4"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Back to Market Insights
      </button>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
            {app.appName ?? app.packageId}
          </h1>
          <code className="text-sm font-mono text-on-surface-variant mt-1 block">
            {app.packageId}
          </code>
          <div className="flex items-center gap-3 mt-3">
            {isPaused ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]">pause_circle</span>
                Paused
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Active
              </span>
            )}
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {formatInterval(app.intervalMinutes)}
            </span>
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              Tracking since {new Date(app.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={app.playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant/10 bg-surface-container-lowest text-sm text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            View Play Store
          </a>
          <button
            onClick={handleRefresh}
            disabled={triggerCapture.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={`material-symbols-outlined text-[18px] ${triggerCapture.isPending ? "animate-spin" : ""}`}>
              refresh
            </span>
            {triggerCapture.isPending ? "Capturing..." : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  )
}
