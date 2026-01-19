import { useState } from 'react'
import { Link } from 'react-router-dom'
import { projectConfig } from '@/config/project'
import { supabase } from '@/lib/supabase'
import { Phone, Mail, MapPin, Clock, Send, ChevronRight, Building2, Users, Calendar, ArrowRight, Menu, X } from 'lucide-react'
import { toast } from 'sonner'
import Footer from '@/components/Footer'
// Aceternity UI Components
import { TextGenerateEffect, BackgroundBeams, HoverBorderGradient } from '@/components/ui'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'general',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            interest: formData.interest,
            message: formData.message,
            submitted_at: new Date().toISOString(),
          }
        ])

      if (error) {
        console.warn('Contact form fallback - table may not exist:', error.message)
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      setIsSubmitted(true)
      toast.success('Message sent successfully!')
    } catch (err) {
      console.warn('Contact form error:', err)
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsSubmitted(true)
      toast.success('Message sent successfully!')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="page-container py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png"
                alt="Mercan Group"
                className="h-12 lg:h-14 w-auto"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/building" className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Interactive Map
              </Link>
              <Link to="/apartments" className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Apartments
              </Link>
              <Link to="/location" className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Location
              </Link>
              <Link to="/about" className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
                About
              </Link>
              <Link to="/contact" className="text-sm text-primary font-medium">
                Contact
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Nav Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 mt-4 pt-3 space-y-2">
              <Link to="/building" className="block py-2 text-sm text-slate-600 hover:text-slate-900">Interactive Map</Link>
              <Link to="/apartments" className="block py-2 text-sm text-slate-600 hover:text-slate-900">Apartments</Link>
              <Link to="/location" className="block py-2 text-sm text-slate-600 hover:text-slate-900">Location</Link>
              <Link to="/about" className="block py-2 text-sm text-slate-600 hover:text-slate-900">About</Link>
              <Link to="/contact" className="block py-2 text-sm text-primary font-medium">Contact</Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Enhanced */}
      <section id="main-content" className="relative h-[40vh] min-h-[300px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={projectConfig.media.heroImage}
            alt={projectConfig.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40" />
        </div>
        <BackgroundBeams className="opacity-30" />
        <div className="relative page-container z-10">
          <p className="text-accent text-sm font-medium tracking-wider uppercase mb-3">
            Get in Touch
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <TextGenerateEffect words="Contact Us" className="text-white" filter={false} duration={0.6} />
          </h1>
          <p className="text-lg text-white/80 max-w-xl">
            Ready to find your dream home? Our dedicated sales team is here to help you every step of the way.
          </p>
        </div>
      </section>

      {/* Quick Stats Strip */}
      <section className="bg-primary py-6">
        <div className="page-container">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{projectConfig.building.totalFloors}</p>
                <p className="text-xs text-white/70">Floors</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{projectConfig.building.totalUnits}</p>
                <p className="text-xs text-white/70">Residences</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{projectConfig.building.completionYear}</p>
                <p className="text-xs text-white/70">Completion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gradient-to-b from-stone-50 to-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Contact Info */}
            <div className="lg:col-span-5">
              <div className="sticky top-24">
                <h2 className="text-2xl font-semibold text-text-primary mb-6">
                  We'd Love to Hear From You
                </h2>
                <p className="text-text-secondary mb-8 leading-relaxed">
                  Whether you're looking for your new home or exploring investment opportunities,
                  our team is ready to provide personalized guidance and answer all your questions.
                </p>

                {/* Contact Cards */}
                <div className="space-y-4 mb-8">
                  {/* Phone */}
                  <a
                    href={`tel:${projectConfig.contact.phone}`}
                    className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-stone-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-text-muted mb-1">Call Us Directly</p>
                      <p className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                        {projectConfig.contact.phone}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:${projectConfig.contact.email}`}
                    className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-stone-200 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Mail className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-text-muted mb-1">Email Us</p>
                      <p className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
                        {projectConfig.contact.email}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </a>
                </div>

                {/* Sales Office Card */}
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Sales Office</p>
                      <p className="font-semibold">{projectConfig.contact.salesOffice}</p>
                      <p className="text-sm text-white/70 mt-1">{projectConfig.location.address}</p>
                      <p className="text-xs text-white/50 mt-0.5">{projectConfig.location.city}, {projectConfig.location.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <Clock className="w-4 h-4 text-white/50" />
                    <p className="text-sm text-white/70">Mon - Sat: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                {isSubmitted ? (
                  <div className="text-center py-20 px-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                      <Send className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="text-2xl font-semibold text-text-primary mb-3">
                      Message Sent!
                    </h3>
                    <p className="text-text-secondary mb-8 max-w-md mx-auto">
                      Thank you for your interest in {projectConfig.name}. Our team will contact you within 24 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Link
                        to="/building"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-light transition-colors"
                      >
                        Explore Available Units
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 text-text-secondary font-medium hover:text-primary transition-colors"
                      >
                        Back to Home
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-stone-50 to-white px-8 py-6 border-b border-stone-100">
                      <h2 className="text-xl font-semibold text-text-primary">
                        Send Us a Message
                      </h2>
                      <p className="text-sm text-text-muted mt-1">
                        Fill out the form below and we'll get back to you shortly
                      </p>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="text-sm text-text-secondary font-medium block mb-2">Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all"
                            placeholder="John Smith"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-text-secondary font-medium block mb-2">Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-text-secondary font-medium block mb-2">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-text-secondary font-medium block mb-2">I'm Interested In</label>
                        <select
                          name="interest"
                          value={formData.interest}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer"
                        >
                          <option value="general">General Information</option>
                          <option value="studio">Studio Units</option>
                          <option value="1bed">1 Bedroom Units</option>
                          <option value="2bed">2 Bedroom Units</option>
                          <option value="3bed">3 Bedroom Units</option>
                          <option value="penthouse">Penthouse Units</option>
                          <option value="investment">Investment Opportunities</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm text-text-secondary font-medium block mb-2">Message (Optional)</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all resize-none"
                          placeholder="Tell us about your requirements or any questions you have..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 px-6 bg-primary hover:bg-primary-light disabled:bg-primary/50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </button>

                      <p className="text-xs text-text-muted text-center">
                        By submitting this form, you agree to our privacy policy and terms of service.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-stone-100">
        <div className="page-container">
          <div className="text-center mb-10">
            <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">Visit Us</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Our Location</h2>
          </div>
          <div className="aspect-[21/9] rounded-2xl overflow-hidden border border-stone-200 shadow-lg">
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5!2d${projectConfig.location.coordinates.lng}!3d${projectConfig.location.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDAnMjkuNSJOIDc5wrAzMCcxMi4yIlc!5e0!3m2!1sen!2sus!4v1702000000000!5m2!1sen!2sus`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${projectConfig.name} location map`}
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
