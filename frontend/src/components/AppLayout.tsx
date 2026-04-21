import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { LogOut, Moon, Sun, Zap, Shield, Workflow } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { isDark, toggle: toggleTheme } = useTheme()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-3 flex items-center justify-between sticky top-0 bg-background z-10">
        <div className="flex items-center gap-6">
          <Link to="/n8n" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity">
            <Zap className="w-5 h-5" />
            AutoDash
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/n8n"
              className={cn(
                'text-sm px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5',
                location.pathname === '/n8n'
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Workflow className="w-3.5 h-3.5" />
              n8n
            </Link>
            <Link
              to="/dashboard"
              className={cn(
                'text-sm px-3 py-1.5 rounded-md transition-colors',
                location.pathname === '/dashboard'
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              Automations
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={cn(
                  'text-sm px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5',
                  location.pathname === '/admin'
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
          <Button variant="ghost" size="icon" onClick={toggleTheme} title={isDark ? 'Modo claro' : 'Modo oscuro'}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} title="Cerrar sesión">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <main className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  )
}
