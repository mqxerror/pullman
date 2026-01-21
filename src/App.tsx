import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/PageTransition'

// Public Pages
import LandingPage from './pages/LandingPage'
import BuildingExplorer from './pages/BuildingExplorer'
import BuildingExplorerV2 from './pages/BuildingExplorerV2'
import BuildingExplorerV3 from './pages/BuildingExplorerV3'
import BuildingExplorerDual from './pages/BuildingExplorerDual'
import BuildingExplorerDualAB from './pages/BuildingExplorerDualAB'
import SuiteDetailPage from './pages/SuiteDetailPage'
import SuitesExplorer from './pages/SuitesExplorer'
import AboutPage from './pages/AboutPage'
import LocationPage from './pages/LocationPage'
import ApartmentsPage from './pages/ApartmentsPage'

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
        <Route path="/building" element={<BuildingExplorerDualAB />} />
        <Route path="/building-classic" element={<BuildingExplorer />} />
        <Route path="/building-v2" element={<BuildingExplorerV2 />} />
        <Route path="/building-v3" element={<BuildingExplorerV3 />} />
        <Route path="/building-dual" element={<BuildingExplorerDual />} />
        <Route path="/suite/:floor/:unit" element={<SuiteDetailPage />} />
        <Route path="/suites" element={<SuitesExplorer />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/apartments" element={<ApartmentsPage />} />
        <Route path="/location" element={<LocationPage />} />

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
