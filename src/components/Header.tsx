import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          {/* Logo placeholder */}
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">PH</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Panama City Central</h1>
            <p className="text-xs text-text-muted -mt-0.5">Executive Suites</p>
          </div>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/login"
            className="text-sm text-text-secondary hover:text-primary transition-colors font-medium"
          >
            Agent Login
          </Link>
        </nav>
      </div>
    </header>
  )
}
