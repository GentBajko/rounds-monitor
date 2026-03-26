import { Layout } from "../components/Layout/Layout"
import { AddAppForm } from "../components/AddAppForm/AddAppForm"
import { AppCard } from "../components/AppCard/AppCard"
import { useApps } from "../hooks/useApps"

export const AppListPage = () => {
  const { data: apps, isLoading, isError } = useApps()

  return (
    <Layout>
      <div className="px-8 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-widest mb-1">Overview</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">Tracked Apps</h1>
        </div>

        {/* Add App Form */}
        <div className="mb-8">
          <AddAppForm />
        </div>

        {/* Apps Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(27,28,28,0.06)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/10">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  App Name &amp; Icon
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Package ID
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Last Scraped
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Captures
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                    Loading...
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-error">
                    Failed to load apps.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && apps !== undefined && apps.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                    No apps tracked yet. Add one above!
                  </td>
                </tr>
              )}
              {!isLoading && !isError && apps !== undefined && apps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
