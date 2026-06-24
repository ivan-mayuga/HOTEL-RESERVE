import { useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function MainLayout({ children, staffAuthed, logout, navigate, toast }) {
  const location = useLocation()

  return (
    <div className="app-shell">
      <Navbar path={location.pathname} navigate={navigate} staffAuthed={staffAuthed} logout={logout} />
      <main>{children}</main>
      <Footer navigate={navigate} />
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}

function Navbar({ path, navigate, staffAuthed, logout }) {
  const [open, setOpen] = useState(false)
  const links = [
    ['/', 'Availability'],
    ['/rooms', 'Rooms'],
    ['/reserve', 'Reserve'],
    ['/booking', 'Booking'],
    ['/staff', 'Staff'],
  ]

  return (
    <header className="nav">
      <button className="brand" type="button" onClick={() => navigate('/')}>
        <span className="brand-mark">E</span>
        <span>
          <strong>Esplenin Hotel</strong>
          <small>Reservation Management</small>
        </span>
      </button>
      <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
        <span></span><span></span><span></span>
      </button>
      <nav className={open ? 'nav-links open' : 'nav-links'}>
        {links.map(([href, label]) => (
          <button
            className={path === href || (href !== '/' && path.startsWith(href)) ? 'active' : ''}
            key={href}
            type="button"
            onClick={() => { setOpen(false); navigate(href) }}
          >
            {label}
          </button>
        ))}
        {staffAuthed ? (
          <button className="outline-button small" type="button" onClick={() => { logout(); navigate('/staff/login') }}>Sign Out</button>
        ) : (
          <button className="primary-button small" type="button" onClick={() => navigate('/staff/login')}>Staff Login</button>
        )}
      </nav>
    </header>
  )
}

function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div>
        <strong>Esplenin Hotel</strong>
        <p>Front desk operations, booking visibility, payment previews, and staff workflows.</p>
      </div>
      <div className="footer-links">
        <button type="button" onClick={() => navigate('/reserve')}>Reserve</button>
        <button type="button" onClick={() => navigate('/booking')}>Lookup</button>
        <button type="button" onClick={() => navigate('/staff/inquiry')}>Inquiry</button>
      </div>
    </footer>
  )
}
