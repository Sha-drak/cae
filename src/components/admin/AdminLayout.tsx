import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/admin.css'

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <Link to="/admin" className="admin-topbar__brand">
          CAE · Admin
        </Link>
        <nav className="admin-topbar__nav" aria-label="Admin navigation">
          <NavLink to="/admin" end>
            Albums
          </NavLink>
          <NavLink to="/admin/videos">Videos</NavLink>
        </nav>
        <div className="admin-topbar__right">
          {user?.email && <span className="admin-topbar__user">{user.email}</span>}
          <button type="button" className="btn btn--small" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
