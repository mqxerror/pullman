import { X } from 'lucide-react'
import { projectConfig } from '@/config/project'

interface LegalModalProps {
  type: 'privacy' | 'terms'
  isOpen: boolean
  onClose: () => void
}

export default function LegalModal({ type, isOpen, onClose }: LegalModalProps) {
  if (!isOpen) return null

  const content = type === 'privacy' ? privacyContent : termsContent

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">
            {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="prose prose-sm max-w-none text-text-secondary">
            {content}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-background/50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-primary hover:bg-primary-light text-white font-medium rounded-lg transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  )
}

const privacyContent = (
  <>
    <p className="text-sm text-text-muted mb-4">Last updated: December 2024</p>

    <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">1. Information We Collect</h3>
    <p>
      When you use our website or contact us about {projectConfig.name}, we may collect:
    </p>
    <ul className="list-disc pl-5 mt-2 space-y-1">
      <li>Contact information (name, email, phone number)</li>
      <li>Inquiry details and preferences</li>
      <li>Usage data and analytics</li>
    </ul>

    <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">2. How We Use Your Information</h3>
    <p>We use your information to:</p>
    <ul className="list-disc pl-5 mt-2 space-y-1">
      <li>Respond to your inquiries about available units</li>
      <li>Provide information about {projectConfig.name}</li>
      <li>Send updates about availability and pricing (with consent)</li>
      <li>Improve our website and services</li>
    </ul>

    <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">3. Information Sharing</h3>
    <p>
      We do not sell your personal information. We may share information with:
    </p>
    <ul className="list-disc pl-5 mt-2 space-y-1">
      <li>Our sales team and authorized representatives</li>
      <li>Service providers who assist our operations</li>
      <li>Legal authorities when required by law</li>
    </ul>

    <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">4. Contact Us</h3>
    <p>
      For privacy-related questions, contact us at {projectConfig.contact.email}
    </p>
  </>
)

const termsContent = (
  <>
    <p className="text-sm text-text-muted mb-4">Last updated: December 2024</p>

    <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">1. Acceptance of Terms</h3>
    <p>
      By accessing and using the {projectConfig.name} website, you accept and agree to be bound by these Terms of Service.
    </p>

    <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">2. Property Information</h3>
    <p>
      All information regarding {projectConfig.name}, including but not limited to:
    </p>
    <ul className="list-disc pl-5 mt-2 space-y-1">
      <li>Unit availability and pricing</li>
      <li>Floor plans and specifications</li>
      <li>Amenities and features</li>
      <li>Completion dates</li>
    </ul>
    <p className="mt-2">
      is provided for informational purposes only and is subject to change without notice. Actual details may vary.
    </p>

    <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">3. No Binding Offers</h3>
    <p>
      Information displayed on this website does not constitute a binding offer. All purchases are subject to formal agreements and legal documentation.
    </p>

    <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">4. Intellectual Property</h3>
    <p>
      All content, images, and materials on this website are the property of {projectConfig.name} and may not be reproduced without permission.
    </p>

    <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">5. Investment Disclaimer</h3>
    <p>
      Information about investment programs, residency, and citizenship pathways is provided for general informational purposes.
      Eligibility and timelines depend on individual circumstances. This is not immigration or investment advice.
    </p>

    <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">6. Contact</h3>
    <p>
      For questions about these terms, contact us at {projectConfig.contact.email}
    </p>
  </>
)
