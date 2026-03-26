import { useState } from "react"
import { useCreateApp } from "../../hooks/useApps"

const INTERVAL_OPTIONS: { value: number; label: string }[] = [
  { value: 15, label: "Every 15 min" },
  { value: 30, label: "Every 30 min" },
  { value: 45, label: "Every 45 min" },
  { value: 60, label: "Every hour" },
  { value: 120, label: "Every 2 hours" },
  { value: 360, label: "Every 6 hours" },
  { value: 720, label: "Every 12 hours" },
  { value: 1440, label: "Daily" },
]

export const AddAppForm = () => {
  const [url, setUrl] = useState("")
  const [intervalMinutes, setIntervalMinutes] = useState(60)
  const createApp = useCreateApp()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!url.trim()) return
    createApp.mutate(
      { url: url.trim(), intervalMinutes },
      {
        onSuccess: () => {
          setUrl("")
        },
      },
    )
  }

  return (
    <div className="bg-surface-container-low rounded-xl p-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-primary text-[22px]">bolt</span>
        <h2 className="text-base font-semibold text-on-surface">Quick Add</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Google Play Store URL here..."
            className="flex-1 bg-surface-container-lowest border border-outline-variant/10 rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
          <select
            value={intervalMinutes}
            onChange={(e) => setIntervalMinutes(Number(e.target.value))}
            className="bg-surface-container-lowest border border-outline-variant/10 rounded-lg px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-shadow cursor-pointer"
          >
            {INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={createApp.isPending || !url.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createApp.isPending ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Adding...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add App
              </>
            )}
          </button>
        </div>

        {createApp.isError && (
          <p className="text-sm text-error">
            {createApp.error instanceof Error ? createApp.error.message : "Failed to add app. Please try again."}
          </p>
        )}

        <p className="text-xs text-on-surface-variant">
          Supported: play.google.com/store/apps/details?id=...
        </p>
      </form>
    </div>
  )
}
