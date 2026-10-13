import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  LayoutGrid, 
  Database, 
  Users, 
  BarChart3, 
  Brain,
  MessageCircle,
  FileSearch,
  LogOut 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { id: 'ask', label: 'ASK', icon: MessageCircle },
    { id: 'research-assistant', label: 'RESEARCH', icon: FileSearch },
    { id: 'papers', label: 'EXPLORE', icon: Search },
    { id: 'semantic-search', label: 'SEMANTIC', icon: Brain },
    { id: 'ingest', label: 'INGEST', icon: Database },
    ...(isAdmin ? [{ id: 'users', label: 'MEMBERS', icon: Users }] : []),
  ];

  return (
    <aside style={{
      width: '90px',
      backgroundColor: '#4a159d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 0 18px 0',
      userSelect: 'none',
      flexShrink: 0
    }}>
      {/* Top Brand Logo */}
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '14px',
        background: 'rgba(255, 255, 255, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <Brain  size={22} />
      </div>

      {/* Nav items list */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.55)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '12px 0',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)';
              }}
            >
              {/* Active Tab Line indicator on the right edge */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '18%',
                  bottom: '18%',
                  width: '3.5px',
                  borderRadius: '4px 0 0 4px',
                  backgroundColor: '#f43f5e',
                  boxShadow: '0 0 10px rgba(244, 63, 94, 0.7)'
                }} />
              )}

              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{
                fontSize: '9px',
                fontWeight: isActive ? 800 : 600,
                letterSpacing: '0.06em',
                lineHeight: 1
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Logout button at bottom */}
      <button
        onClick={logout}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px',
          cursor: 'pointer',
          padding: '10px 0',
          transition: 'all 0.2s ease',
          width: '100%'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#fda4af'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
        title="Log Out"
      >
        <LogOut size={18} />
        <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.04em' }}>
          LOG OUT
        </span>
      </button>
    </aside>
  );
}
