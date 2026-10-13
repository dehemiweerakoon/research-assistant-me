import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { paperService } from '../services/api';
import PaperCard from '../components/PaperCard';
import PaperModal from '../components/PaperModal';
import {
  Search,
  Loader2,
  BookOpen,
  Filter,
  Database,
  AlertCircle,
  Brain,
  Minus,
  Plus,
  CheckCircle,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const PAPERS_PER_PAGE = 9;
const PAGE_BUTTONS_LIMIT = 10;

export default function PapersPage({ onNavigateToIngest, externalQuery }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [sortBy, setSortBy] = useState('citations');
  const [searched, setSearched] = useState(false);

  // Interactive filter state
  const [minCitations, setMinCitations] = useState(0);
  const [yearFilter, setYearFilter] = useState(2020);
  const [onlyDoi, setOnlyDoi] = useState(false);
  const [onlyAbstract, setOnlyAbstract] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const displayName = user?.name || user?.email?.split('@')[0] || 'Researcher';

  const handleSearch = async (searchTerm) => {
    const term = searchTerm !== undefined ? searchTerm : query;
    if (!term || !term.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await paperService.searchPapers(term.trim());
      setPapers(res.data?.papers || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to search papers:', err);
      setError(err.response?.data?.message || err.message || 'Failed to search papers');
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch('learning');
    setQuery('learning');
  }, []);

  useEffect(() => {
    if (externalQuery && externalQuery !== query) {
      setQuery(externalQuery);
      handleSearch(externalQuery);
    }
  }, [externalQuery]);

  // Filter + sort
  const filteredPapers = papers.filter((p) => {
    const c = Number(p.citation_count || p.cited_by_count || 0);
    const y = Number(p.publication_year || p.year || 0);
    if (minCitations > 0 && c < minCitations) return false;
    if (yearFilter > 1980 && y < yearFilter) return false;
    if (onlyDoi && !p.doi) return false;
    if (onlyAbstract && !p.abstract) return false;
    return true;
  });

  const sortedPapers = [...filteredPapers].sort((a, b) => {
    if (sortBy === 'citations') return (Number(b.citation_count || b.cited_by_count || 0)) - (Number(a.citation_count || a.cited_by_count || 0));
    if (sortBy === 'year') return (Number(b.publication_year || b.year || 0)) - (Number(a.publication_year || a.year || 0));
    if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
    return 0;
  });
  const totalPages = Math.ceil(sortedPapers.length / PAPERS_PER_PAGE);
  const firstVisiblePage = Math.floor((currentPage - 1) / PAGE_BUTTONS_LIMIT) * PAGE_BUTTONS_LIMIT + 1;
  const lastVisiblePage = Math.min(firstVisiblePage + PAGE_BUTTONS_LIMIT - 1, totalPages);
  const paginatedPapers = sortedPapers.slice(
    (currentPage - 1) * PAPERS_PER_PAGE,
    currentPage * PAPERS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [minCitations, yearFilter, onlyDoi, onlyAbstract]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 28px' }}>

      {/* Hero Welcome Banner */}
      <div className="hero-banner animate-fade-in">
        <div style={{ maxWidth: '540px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Welcome, {displayName}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            Explore scientific literature indexed from OpenAlex. Query inverted index abstracts, inspect citations, and discover AI research breakthroughs.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo" style={{ padding: '6px 12px', fontSize: '12px' }}>
              <Layers size={13} /> {papers.length.toLocaleString()} Papers Indexed
            </span>
            <span className="badge badge-emerald" style={{ padding: '6px 12px', fontSize: '12px' }}>
              <CheckCircle size={13} /> Database Online
            </span>
            {searched && (
              <span className="badge badge-coral" style={{ padding: '6px 12px', fontSize: '12px' }}>
                Query: "{query}"
              </span>
            )}
          </div>
        </div>
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #a855f7, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', boxShadow: '0 10px 25px rgba(168, 85, 247, 0.3)', flexShrink: 0
        }}>
          <Brain size={46} />
        </div>
      </div>

      {/* Research Controls */}
      <div className="dash-card animate-fade-in" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-main)' }}>
            RESEARCH CONTROLS & STATUS
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Active Filter: <strong>{filteredPapers.length}</strong> matching
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f0fb' }}>
          {/* Min Citations */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Min Citations</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Filter papers by impact</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button type="button" onClick={() => setMinCitations(Math.max(0, minCitations - 50))}
                style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Minus size={14} />
              </button>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', minWidth: '54px', textAlign: 'center' }}>
                {minCitations}+
              </span>
              <button type="button" onClick={() => setMinCitations(minCitations + 50)}
                style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Published Since */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Published Since</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Year range filter</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button type="button" onClick={() => setYearFilter(Math.max(1990, yearFilter - 2))}
                style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ede9fe', color: '#7c3aed', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Minus size={14} />
              </button>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', minWidth: '54px', textAlign: 'center' }}>
                {yearFilter}
              </span>
              <button type="button" onClick={() => setYearFilter(Math.min(2026, yearFilter + 2))}
                style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ffe4e6', color: '#e11d48', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
              <input type="checkbox" checked={onlyDoi} onChange={(e) => setOnlyDoi(e.target.checked)} style={{ accentColor: 'var(--accent-purple)' }} />
              Must have DOI link
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
              <input type="checkbox" checked={onlyAbstract} onChange={(e) => setOnlyAbstract(e.target.checked)} style={{ accentColor: 'var(--accent-purple)' }} />
              Has Abstract Text
            </label>
          </div>
          {(minCitations > 0 || yearFilter !== 2020 || onlyDoi || onlyAbstract) && (
            <button onClick={() => { setMinCitations(0); setYearFilter(2020); setOnlyDoi(false); setOnlyAbstract(false); }}
              style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results header + sort */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
          {sortedPapers.length} {sortedPapers.length === 1 ? 'Paper found' : 'Papers found'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} /> Sort by:
          </span>
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, borderRadius: 'var(--radius-sm)', background: '#ffffff', border: '1px solid #e2e8f0', color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}>
            <option value="citations">Most Cited</option>
            <option value="year">Newest First</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#991b1b' }}>
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 14px auto', color: 'var(--accent-purple)' }} />
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>Searching database...</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Querying Supabase PostgreSQL tables</div>
        </div>
      )}

      {/* Paper Grid */}
      {!loading && sortedPapers.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {paginatedPapers.map((paper, idx) => (
            <PaperCard key={paper.id || paper.paper_id || idx} paper={paper} onOpenModal={(p) => setSelectedPaper(p)} />
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <nav aria-label="Paper pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'nowrap', overflowX: 'auto', maxWidth: '100%', padding: '2px 0' }}>
          <button
            type="button"
            className="btn btn-secondary"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            style={{ padding: '8px 10px' }}
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: lastVisiblePage - firstVisiblePage + 1 }, (_, index) => firstVisiblePage + index).map((page) => (
            <button
              key={page}
              type="button"
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
              onClick={() => setCurrentPage(page)}
              style={{
                minWidth: '36px',
                height: '36px',
                padding: '0 10px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${currentPage === page ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                background: currentPage === page ? 'var(--accent-purple)' : '#ffffff',
                color: currentPage === page ? '#ffffff' : 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            aria-label="Next page"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            style={{ padding: '8px 10px' }}
          >
            <ChevronRight size={15} />
          </button>
        </nav>
      )}

      {/* Empty state */}
      {!loading && searched && sortedPapers.length === 0 && (
        <div className="dash-card" style={{ textAlign: 'center', padding: '50px 24px' }}>
          <BookOpen size={44} style={{ margin: '0 auto 14px auto', color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>No papers matched your search</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 18px auto' }}>
            Try adjusting your search query, clearing filters, or ingesting fresh research papers from OpenAlex.
          </p>
          <button onClick={onNavigateToIngest} className="btn btn-primary btn-pill" style={{ fontSize: '13px', padding: '8px 20px' }}>
            <Database size={15} /> Go to Ingestion Tool
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedPaper && <PaperModal paper={selectedPaper} onClose={() => setSelectedPaper(null)} />}
    </div>
  );
}
