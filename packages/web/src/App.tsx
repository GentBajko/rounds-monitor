import { Routes, Route } from "react-router-dom"
import { AppListPage } from "./pages/AppListPage"
import { AppDetailPage } from "./pages/AppDetailPage"

export const App = () => (
  <Routes>
    <Route path="/" element={<AppListPage />} />
    <Route path="/apps/:id" element={<AppDetailPage />} />
  </Routes>
)
