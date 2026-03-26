interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-surface font-sans">
      <main className="min-h-screen bg-surface">
        {children}
      </main>
    </div>
  )
}
