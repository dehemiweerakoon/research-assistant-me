import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RightPanel from './components/RightPanel';
import AuthPage from './pages/AuthPage';
import PapersPage from './pages/PapersPage';
import SemanticSearchPage from './pages/SemanticSearchPage';
import IngestPage from './pages/IngestPage';
import UsersPage from './pages/UsersPage';
import AskPage from './pages/AskPage';
import ResearchAssistantPage from './pages/ResearchAssistantPage';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('papers');
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        backgroundColor: 'var(--app-bg)',
        color: 'var(--text-secondary)'
      }}>
        <Loader2 size={42} className="animate-spin" style={{ color: 'var(--accent-purple)' }} />
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>Loading Research RAG...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleTriggerSearch = (term) => {
    setActiveTab('papers');
    setSearchQuery(term);
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-shell">

        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Center + Right */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Top Header */}
          <Header onSearch={handleTriggerSearch} defaultQuery={searchQuery} />

          {/* Main workspace + right rail */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

            {/* Center scrollable workspace */}
            <main style={{ flex: 1, overflowY: 'auto', background: 'var(--content-bg)' }}>
              {activeTab === 'papers' && (
                <PapersPage
                  onNavigateToIngest={() => setActiveTab('ingest')}
                  externalQuery={searchQuery}
                />
              )}
              {activeTab === 'semantic-search' && (
                <SemanticSearchPage />
              )}
              {activeTab === 'ingest' && (
                <IngestPage onNavigateToPapers={() => setActiveTab('papers')} />
              )}
              {activeTab === 'users' && (
                <UsersPage />
              )}
              {activeTab === 'ask' && (
                <AskPage />
              )}
              {activeTab === 'research-assistant' && (
                <ResearchAssistantPage />
              )}
            </main>

            {/* Right information rail */}
            <RightPanel
              onSelectTopic={handleTriggerSearch}
              onSelectAuthor={handleTriggerSearch}
            />

          </div>
        </div>

      </div>
    </div>
  );
}
