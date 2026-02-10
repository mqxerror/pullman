import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MainNavProps {
  variant?: 'transparent' | 'solid'
  className?: string
}

const navItems = [
  { label: 'Interactive Map', href: '/building' },
  { label: 'Apartments', href: '/apartments' },
  { label: '360° Tour', href: '/virtual-tour' },
  { label: 'Location', href: '/location' },
  { label: 'About', href: '/about' },
]

export default function MainNav({ variant = 'solid', className }: MainNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isTransparent = variant === 'transparent'

  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        isTransparent
          ? 'absolute top-0 left-0 right-0 bg-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm',
        className
      )}
    >
      <div className="page-container py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg',
              isTransparent
                ? 'focus:ring-white/50 focus:ring-offset-transparent'
                : 'focus:ring-primary/50 focus:ring-offset-white'
            )}
          >
            <img
              src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png"
              alt="Mercan Group"
              className={cn('w-auto', isTransparent ? 'h-20' : 'h-16 lg:h-18')}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'text-sm font-medium py-2 transition-colors focus:outline-none focus:underline underline-offset-4',
                    isTransparent
                      ? isActive
                        ? 'text-white'
                        : 'text-white/80 hover:text-white'
                      : isActive
                        ? 'text-primary'
                        : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              'md:hidden p-2 rounded-lg transition-colors focus:outline-none focus:ring-2',
              isTransparent
                ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 focus:ring-white/50'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 focus:ring-primary/50'
            )}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <nav
            className={cn(
              'md:hidden mt-4 p-4 rounded-xl border',
              isTransparent
                ? 'bg-white/10 backdrop-blur-md border-white/20'
                : 'bg-white border-slate-200 shadow-lg'
            )}
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-4 py-3 rounded-lg transition-colors font-medium focus:outline-none',
                      isTransparent
                        ? isActive
                          ? 'bg-white/20 text-white'
                          : 'text-white hover:bg-white/10'
                        : isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
