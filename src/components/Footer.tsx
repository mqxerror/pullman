import { Link } from 'react-router-dom'
import { projectConfig } from '@/config/project'
import { Phone, Mail, MapPin, Download, Briefcase } from 'lucide-react'
import { useState } from 'react'
import LegalModal from './LegalModal'

export default function Footer() {
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null)

  return (
    <>
      <footer className="bg-stone-950" role="contentinfo">
        <div className="page-container py-10 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png"
                  alt="Mercan Group"
                  className="h-16 w-auto"
                />
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Premium residential tower in the heart of {projectConfig.location.city}.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wide mb-4">Contact</h4>
              <div className="space-y-3">
                <a href={`tel:${projectConfig.contact.phone}`} className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors focus:outline-none focus:text-white">
                  <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  {projectConfig.contact.phone}
                </a>
                <a href={`mailto:${projectConfig.contact.email}`} className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors focus:outline-none focus:text-white">
                  <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{projectConfig.contact.email}</span>
                </a>
                <p className="flex items-start gap-2 text-white/70 text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{projectConfig.location.address}</span>
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wide mb-4">Explore</h4>
              <nav className="space-y-3" aria-label="Footer navigation">
                <Link to="/building" className="block text-white/70 hover:text-white text-sm transition-colors focus:outline-none focus:text-white">
                  Available Units
                </Link>
                <Link to="/location" className="block text-white/70 hover:text-white text-sm transition-colors focus:outline-none focus:text-white">
                  Location
                </Link>
                <Link to="/about" className="block text-white/70 hover:text-white text-sm transition-colors focus:outline-none focus:text-white">
                  About
                </Link>
                <Link to="/contact" className="block text-white/70 hover:text-white text-sm transition-colors focus:outline-none focus:text-white">
                  Contact Us
                </Link>
                <a
                  href="/Floor_Plan_Santa_Maria.pdf"
                  download="Santa-Maria-Residences-Brochure.pdf"
                  className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors focus:outline-none focus:text-white"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  Brochure
                </a>
              </nav>
            </div>

            {/* Legal & Agent */}
            <div>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wide mb-4">Resources</h4>
              <div className="space-y-3">
                <Link to="/login" className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors focus:outline-none focus:text-white">
                  <Briefcase className="w-4 h-4" aria-hidden="true" />
                  Agent Login
                </Link>
                <button
                  onClick={() => setLegalModal('privacy')}
                  className="block text-white/70 hover:text-white text-sm transition-colors focus:outline-none focus:text-white text-left"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setLegalModal('terms')}
                  className="block text-white/70 hover:text-white text-sm transition-colors focus:outline-none focus:text-white text-left"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm order-2 sm:order-1">
              © {new Date().getFullYear()} {projectConfig.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 order-1 sm:order-2">
              {projectConfig.social.instagram && (
                <a href={projectConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors p-2 focus:outline-none focus:text-white" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              )}
              {projectConfig.social.facebook && (
                <a href={projectConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors p-2 focus:outline-none focus:text-white" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <LegalModal
        type="privacy"
        isOpen={legalModal === 'privacy'}
        onClose={() => setLegalModal(null)}
      />
      <LegalModal
        type="terms"
        isOpen={legalModal === 'terms'}
        onClose={() => setLegalModal(null)}
      />
    </>
  )
}
