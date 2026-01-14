import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/PageTransition'

// Public Pages
import LandingPage from './pages/LandingPage'
import BuildingExplorer from './pages/BuildingExplorer'
import SuitesExplorer from './pages/SuitesExplorer'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LocationPage from './pages/LocationPage'

// Admin Pages
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'

function AppRoutes() {
  const location = useLocation()

  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/building" element={<BuildingExplorer />} />
        <Route path="/suites" element={<SuitesExplorer />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/location" element={<LocationPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Admin Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </PageTransition>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
