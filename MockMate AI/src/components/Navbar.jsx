import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  Menu,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Search,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const routeLabels = {
    '/dashboard': 'Dashboard',
    '/resume': 'Resume Analysis',
    '/interview-setup': 'Interview Setup',
    '/mock-interview': 'Mock Interview',
    '/evaluation': 'Evaluation',
    '/progress': 'Progress',
    '/profile': 'Profile',
  };

  const currentBreadcrumb = routeLabels[location.pathname] || 'Dashboard';

  return (
    <header className="app-navbar">
      <div className="app-navbar-left">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="app-navbar-icon-btn"
          title="Toggle menu"
        >
          <Menu size={20} />
        </button>

        <div className="app-navbar-crumb">
          <span>MockMate</span>
          <ChevronRight size={14} />
          <strong>{currentBreadcrumb}</strong>
        </div>
      </div>

      <div className="app-navbar-search">
        <Search size={16} className="app-navbar-search-icon" />
        <input
          type="search"
          placeholder="Search topics or questions…"
          aria-label="Search topics or questions"
        />
      </div>

      <div className="app-navbar-right">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="app-navbar-icon-btn relative"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="app-navbar-dot" />
          </button>

          {showNotifications && (
            <div className="app-navbar-dropdown app-navbar-dropdown-wide">
              <div className="app-navbar-dropdown-head">
                <h4>Notifications</h4>
              </div>
              <div className="app-navbar-dropdown-item">
                <Sparkles size={16} className="text-teal-600" />
                <div>
                  <p>Resume analysis ready</p>
                  <span>Skills were extracted from your uploaded resume.</span>
                </div>
              </div>
              <div className="app-navbar-dropdown-item">
                <ShieldAlert size={16} className="text-teal-600" />
                <div>
                  <p>Backend connected</p>
                  <span>API is available at 127.0.0.1:5000</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="app-navbar-divider" />

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="app-navbar-user"
          >
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
              }
              alt={user?.name || 'User'}
            />
            <div className="app-navbar-user-text">
              <p>{user?.name || 'User'}</p>
              <span>{user?.targetRole || 'Candidate'}</span>
            </div>
            <ChevronDown size={16} className="text-slate-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="app-navbar-dropdown">
              <div className="app-navbar-dropdown-profile">
                <p>{user?.name}</p>
                <span>{user?.email}</span>
              </div>
              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="app-navbar-dropdown-link"
              >
                <User size={16} />
                Profile & settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="app-navbar-dropdown-link is-danger"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
