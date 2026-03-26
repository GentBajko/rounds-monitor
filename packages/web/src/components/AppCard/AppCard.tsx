import { useNavigate } from "react-router-dom"
import { useDeleteApp } from "../../hooks/useApps"
import type { App } from "../../types"

interface AppCardProps {
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

const formatLastScraped = (app: App): string => {
  const latest = app.screenshots?.[0]
  if (!latest) return "Never"
  const diff = Date.now() - new Date(latest.capturedAt).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? "1 day ago" : `${days} days ago`
}

export const AppCard = ({ app }: AppCardProps) => {
  const navigate = useNavigate()
  const deleteApp = useDeleteApp()

  const handleRowClick = () => {
    navigate(`/apps/${app.id}`)
  }

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    const name = app.appName ?? app.packageId
    if (window.confirm(`Delete "${name}"? This will remove all captured screenshots.`)) {
      deleteApp.mutate(app.id)
    }
  }

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
  }

  const screenshotCount = app._count?.screenshots ?? 0
  const isPaused = app.status === "PAUSED"

  return (
    <tr
      onClick={handleRowClick}
      className="border-t border-outline-variant/10 hover:bg-surface-container-low cursor-pointer transition-colors group"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm text-on-surface">
            {app.appName ?? app.packageId}
          </span>
          {isPaused && (
            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
              Paused
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <code className="text-xs font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
          {app.packageId}
        </code>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-on-surface-variant">{formatInterval(app.intervalMinutes)}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-on-surface-variant">{formatLastScraped(app)}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs text-on-surface-variant">{screenshotCount} captures</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
            title="Edit"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteApp.isPending}
            className="p-1.5 rounded-lg hover:bg-error-container text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
            title="Delete"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  )
}
