import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // makes the navbar re-check on every page change
  const token = localStorage.getItem('token');

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/');
  }

  return (
    <nav className="navbar">
      <Link to={token ? '/dashboard' : '/'} className="brand">
        <span className="brand-mark">₹</span>
        <span className="brand-name">Maine to Dediya?</span>
      </Link>

      <div className="nav-links">
        {token ? (
          <>
            <Link
              to="/dashboard"
              className={location.pathname === '/dashboard' ? 'nav-link active' : 'nav-link'}
            >
              👥 Groups
            </Link>
            <button className="nav-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/"
              className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
            >
              Login
            </Link>
            <Link to="/signup" className="nav-cta">
              Sign up ✨
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;