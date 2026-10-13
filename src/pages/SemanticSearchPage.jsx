import React, { useState } from 'react';
import { AlertCircle, Brain, Loader2, Search, Sparkles } from 'lucide-react';
import { paperService } from '../services/api';
import PaperCard from '../components/PaperCard';
import PaperModal from '../components/PaperModal';

function parseObject(value) {
  if (!value || typeof value !== 'string') return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : value;
  } catch {
    return value;
  }
}

function getResults(data) {
  const response = parseObject(data);
  const container = parseObject(response?.data);
  const items = Array.isArray(response)
    ? response
    : Array.isArray(response?.papers)
      ? response.papers
      : Array.isArray(response?.results)
        ? response.results
        : Array.isArray(container?.papers)
          ? container.papers
          : Array.isArray(container?.results)
            ? container.results
            : Array.isArray(container)
              ? container
              : [];

  return items.map((item) => {
    const parsedItem = parseObject(item);
    if (!parsedItem || typeof parsedItem !== 'object') return null;

    const nestedPaper = [parsedItem.paper, parsedItem.paper_data, parsedItem.document, parsedItem.metadata]
      .map(parseObject)
      .find((value) => value && typeof value === 'object' && !Array.isArray(value)) || {};
    const paper = { ...parsedItem, ...nestedPaper };

    return {
      ...paper,
      paper_id: paper.paper_id ?? paper.paperId ?? paper.openalex_id ?? paper.openAlexId ?? paper.id,
      title: paper.title ?? paper.paper_title ?? paper.name,
      abstract: paper.abstract ?? paper.abstract_text ?? paper.abstractText ?? paper.content,
      authors: paper.authors ?? paper.authorships ?? paper.author_names,
      topics: paper.topics ?? paper.research_topics,
      keywords: paper.keywords ?? paper.key_words,
      publication_year: paper.publication_year ?? paper.publicationYear ?? paper.published_year,
      publication_date: paper.publication_date ?? paper.publicationDate,
      citation_count: paper.citation_count ?? paper.citations ?? paper.cited_by_count,
      doi: paper.doi ?? paper.DOI,
      similarity: paper.similarity ?? paper.score ?? parsedItem.similarity ?? parsedItem.score
    };
  }).filter(Boolean);
}

export default function SemanticSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchedQuery, setSearchedQuery] = useState('');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (event) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;

    setLoading(true);
    setError(null);
    setSearchedQuery(term);

    try {
      const response = await paperService.semanticSearch(term);
      setResults(getResults(response.data));
    } catch (err) {
      console.error('Semantic search failed:', err);
      setResults([]);
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to run semantic search');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (paper) => {
    setSelectedPaper(paper);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 28px' }}>
      <div className="hero-banner animate-fade-in">
        <div style={{ maxWidth: '600px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #ede9fe, #fce7f3)',
            color: 'var(--accent-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Brain size={24} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Semantic Search
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Find papers by meaning and research context instead of exact keyword matches.
          </p>
        </div>
        <Brain size={56} style={{ color: '#a855f7', opacity: 0.8, flexShrink: 0 }} />
      </div>

      <div className="dash-card animate-fade-in" style={{ padding: '22px 24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={17} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Describe the research you want to find..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              disabled={loading}
              style={{ height: '46px', paddingLeft: '42px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-pill" disabled={loading || !query.trim()} style={{ minWidth: '130px' }}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Searching...</> : <><Search size={16} /> Search</>}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', color: '#991b1b' }}>
          <AlertCircle size={22} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '2px' }}>Semantic Search Error</div>
            <div style={{ fontSize: '13px' }}>{error}</div>
          </div>
        </div>
      )}

      {searchedQuery && !loading && !error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
            Results for "{searchedQuery}"
          </h2>
          <span className="badge badge-indigo">{results.length} papers found</span>
        </div>
      )}

      {loading && (
        <div className="dash-card" style={{ padding: '44px 24px', textAlign: 'center' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-purple)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Finding semantically related papers...</p>
        </div>
      )}

      {!loading && searchedQuery && !error && results.length === 0 && (
        <div className="dash-card" style={{ padding: '44px 24px', textAlign: 'center' }}>
          <Brain size={42} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>No related papers found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Try describing the topic with different terms.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', alignItems: 'stretch' }}>
          {results.map((paper, index) => (
            <div key={paper.paper_id || paper.id || index} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ minHeight: '24px', marginBottom: '6px', display: 'flex', justifyContent: 'flex-end' }}>
                {paper.similarity !== undefined && paper.similarity !== null && (
                  <span className="badge badge-pink">
                    {`Similarity: ${(Number(paper.similarity) * 100).toFixed(1)}%`}
                  </span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <PaperCard paper={paper} onOpenModal={handleOpenModal} />
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPaper && <PaperModal paper={selectedPaper} onClose={() => setSelectedPaper(null)} />}
    </div>
  );
}
