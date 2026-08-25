import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import HomePage from './pages/HomePage'
import GalleryPage from './pages/GalleryPage'
import AlbumPage from './pages/AlbumPage'
import LoginPage from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import AlbumEditPage from './pages/admin/AlbumEditPage'
import VideosPage from './pages/admin/VideosPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/:slug" element={<AlbumPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="albums/new" element={<AlbumEditPage />} />
          <Route path="albums/:id" element={<AlbumEditPage />} />
          <Route path="videos" element={<VideosPage />} />
        </Route>
        <Route path="*" element={<HomePage />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
