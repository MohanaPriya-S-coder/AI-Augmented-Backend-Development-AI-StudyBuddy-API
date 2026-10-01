import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const styles = {
  nav: {
    background: '#2c3e50',
    color: '#fff',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '56px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  },
  brand: {
    fontWeight: '700',
    fontSize: '20px',
    color: '#fff',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  link: {
    color: '#bdc3cb',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'background 0.2s',
  },
  activeLink: {
    color: '#fff',
    background: '#3d5166',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userName: {
    fontSize: '14px',
    color: '#bdc3cb',
  },
  logoutBtn: {
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
};

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/materials', label: 'Materials' },
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/study-plans', label: 'Study Plans' },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>📚 StudyBuddy</Link>
      <div style={styles.links}>
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{
              ...styles.link,
              ...(location.pathname === to ? styles.activeLink : {}),
            }}
          >
            {label}
          </Link>
        ))}
      </div>
      <div style={styles.right}>
        {user.name && <span style={styles.userName}>👤 {user.name}</span>}
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
