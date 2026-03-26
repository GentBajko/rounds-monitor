import { useParams } from "react-router-dom"
import { Layout } from "../components/Layout/Layout"
import { AppHeader } from "../components/AppHeader/AppHeader"
import { ScreenshotTimeline } from "../components/ScreenshotTimeline/ScreenshotTimeline"
import { useApp } from "../hooks/useApps"

export const AppDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data: app, isLoading, isError } = useApp(id ?? "")

  return (
    <Layout>
      <div className="px-8 py-8 max-w-4xl">
        {isLoading && (
          <div className="py-12 text-center text-sm text-on-surface-variant">
            Loading...
          </div>
        )}
        {isError && (
          <div className="py-12 text-center text-sm text-error">
            App not found.
          </div>
        )}
        {!isLoading && !isError && app !== undefined && (
          <>
            <AppHeader app={app} />
            <ScreenshotTimeline appId={app.id} />
          </>
        )}
      </div>
    </Layout>
  )
}
