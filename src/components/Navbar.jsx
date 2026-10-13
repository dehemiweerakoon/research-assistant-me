import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, Database, Users, LogOut, User, Brain } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
        
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('papers')} 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 14px var(--accent-glow)'
          }}>
            <Brain size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Research RAG
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Scientific Paper Engine
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('papers')}
            className="btn"
            style={{
              background: activeTab === 'papers' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'papers' ? '#a5b4fc' : 'var(--text-secondary)',
              border: activeTab === 'papers' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
              padding: '8px 14px',
              fontSize: '13px'
            }}
          >
            <Search size={16} />
            <span>Explore Papers</span>
          </button>

          <button
            onClick={() => setActiveTab('ingest')}
            className="btn"
            style={{
              background: activeTab === 'ingest' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'ingest' ? '#a5b4fc' : 'var(--text-secondary)',
              border: activeTab === 'ingest' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
              padding: '8px 14px',
              fontSize: '13px'
            }}
          >
            <Database size={16} />
            <span>Ingest & Collect</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className="btn"
              style={{
                background: activeTab === 'users' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'users' ? '#a5b4fc' : 'var(--text-secondary)',
                border: activeTab === 'users' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                padding: '8px 14px',
                fontSize: '13px'
              }}
            >
              <Users size={16} />
              <span>User Admin</span>
            </button>
          )}
        </nav>

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            fontSize: '13px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#a5b4fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name || 'User'}
            </span>
            {isAdmin && (
              <span className="badge badge-pink" style={{ fontSize: '10px', padding: '2px 6px' }}>
                Admin
              </span>
            )}
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary"
            title="Log Out"
            style={{ padding: '8px', borderRadius: '8px' }}
          >
            <LogOut size={16} />
          </button>
        </div>

      </div>
    </header>
  );
}

