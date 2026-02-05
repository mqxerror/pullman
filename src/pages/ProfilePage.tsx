import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import AdminHeader from '@/components/AdminHeader'
import { ArrowLeft } from 'lucide-react'

export default function ProfilePage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, updatePassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const { error: updateError } = await updatePassword(newPassword)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    toast.success('Password updated successfully')
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-muted hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-surface rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Profile Settings</h2>

          <div className="mb-8">
            <label className="block text-sm font-medium mb-2 text-muted">Email</label>
            <div className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground">
              {user?.email}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold">Change Password</h3>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <p className="text-sm text-muted mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
