import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-muted-foreground">Esta página no existe.</p>
      <Button asChild>
        <Link to="/dashboard">Volver al dashboard</Link>
      </Button>
    </div>
  )
}
