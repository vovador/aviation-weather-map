import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { LoginPage } from './pages/Login/LoginPage'
import { MapPage } from './pages/Map/MapPage'
import { useAuth } from './hooks/useAuth'

// --- Protected Route ---
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected area */}
        <Route element={<ProtectedRoute />}>
          <Route path="/map" element={<MapPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/map" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff' },
          success: { duration: 3000 },
          error: { duration: 4000 },
        }}
      />
    </BrowserRouter>
  )
}

export default App

