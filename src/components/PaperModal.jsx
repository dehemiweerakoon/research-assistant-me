import React, { useEffect } from 'react';
import { X, Calendar, Quote, ExternalLink, BookOpen, Layers, Tag, User, Building, Info } from 'lucide-react';

function safeParseArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return [parsed];
      return [val];
    } catch {
      return [val];
    }
  }
  if (typeof val === 'object') return [val];
  return [];
}

export default function PaperModal({ paper, onClose }) {
  // Lock body scroll while modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  if (!paper) return null;

  // Extract author names & affiliations safely
  const rawAuthors = safeParseArray(paper.authors || paper.authorships);
  const authorsList = rawAuthors
    .map((a) => {
      if (typeof a === 'string') return { name: a, institutions: [] };
      const name = a?.author?.display_name || a?.display_name || a?.raw_author_name || a?.name || '';
      const institutions = safeParseArray(a?.institutions)
        .map((inst) => (typeof inst === 'string' ? inst : inst?.display_name || inst?.name))
        .filter(Boolean);
      return { name, institutions };
    })
    .filter((a) => a.name);

  // Extract topics safely
  const rawTopics = safeParseArray(paper.topics);
  const topicNames = rawTopics
    .map((t) => (typeof t === 'string' ? t : t?.display_name || t?.name || t?.subfield?.display_name || ''))
    .filter(Boolean);

  // Extract keywords safely
  const rawKeywords = safeParseArray(paper.keywords);
  const keywordNames = rawKeywords
    .map((k) => (typeof k === 'string' ? k : k?.display_name || k?.keyword || k?.name || ''))
    .filter(Boolean);

  // Normalizing identifiers & meta
  const publicationYear =
    paper.publication_year ||
    paper.year ||
    (paper.publication_date ? new Date(paper.publication_date).getFullYear() : null);

  const citationCount =
    typeof paper.citation_count === 'number'
      ? paper.citation_count
      : typeof paper.cited_by_count === 'number'
      ? paper.cited_by_count
      : paper.citation_count !== undefined && paper.citation_count !== null && !isNaN(Number(paper.citation_count))
      ? Number(paper.citation_count)
      : null;

  const rawIdValue = paper.paper_id || paper.id || '';
  const rawId = typeof rawIdValue === 'string' ? rawIdValue : String(rawIdValue);
  const doiValue = paper.doi || '';
  const doi = typeof doiValue === 'string' ? doiValue : String(doiValue);
  const openAlexUrl = rawId.startsWith('http') ? rawId : rawId ? `https://openalex.org/${rawId}` : null;
  const doiUrl = doi ? (doi.startsWith('http') ? doi : `https://doi.org/${doi}`) : null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '88vh',
          overflowY: 'auto',
          padding: '32px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(74, 21, 157, 0.25)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '22px',
            right: '22px',
            padding: '8px',
            borderRadius: '50%',
            background: '#f1f5f9',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          aria-label="Close modal"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
        >
          <X size={18} />
        </button>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', paddingRight: '40px' }}>
          {publicationYear && (
            <span className="badge badge-indigo">
              <Calendar size={12} />
              Published in {publicationYear}
            </span>
          )}
          {citationCount !== null && (
            <span className="badge badge-emerald">
              <Quote size={12} />
              {citationCount.toLocaleString()} Citations
            </span>
          )}
          {rawId && (
            <span className="badge badge-amber">
              <Layers size={12} />
              {rawId.replace('https://openalex.org/', 'OpenAlex: ')}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.4, marginBottom: '20px' }}>
          {paper.title || 'Untitled Research Paper'}
        </h2>

        {/* Authors & Affiliations */}
        {authorsList.length > 0 && (
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={13} style={{ color: 'var(--accent-purple)' }} />
              Authors & Affiliations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {authorsList.map((author, idx) => (
                <div key={idx} style={{ fontSize: '13px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700 }}>{author.name}</span>
                  {author.institutions.length > 0 && (
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building size={11} style={{ opacity: 0.7 }} />
                      {author.institutions.join(', ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Abstract */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={13} style={{ color: 'var(--accent-purple)' }} />
            Abstract
          </div>
          {paper.abstract ? (
            <div style={{
              fontSize: '13.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              background: '#f8fafc',
              padding: '18px',
              borderRadius: '14px',
              border: '1px solid #f1f5f9',
              whiteSpace: 'pre-line'
            }}>
              {paper.abstract}
            </div>
          ) : (
            <div style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              background: '#f8fafc',
              padding: '16px 18px',
              borderRadius: '14px',
              border: '1px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Info size={16} style={{ flexShrink: 0, color: 'var(--accent-purple)' }} />
              <span>
                No abstract text was indexed for this paper in OpenAlex. You can access the full publication via the DOI or OpenAlex source links below.
              </span>
            </div>
          )}
        </div>

        {/* Topics */}
        {topicNames.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={13} style={{ color: 'var(--accent-cyan)' }} />
              Research Topics
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {topicNames.map((topic, i) => (
                <span key={i} className="badge badge-amber" style={{ fontSize: '12px', padding: '4px 10px' }}>
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Keywords */}
        {keywordNames.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Keywords
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {keywordNames.map((keyword, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: '#f1f5f9',
                    color: 'var(--text-main)',
                    border: '1px solid #e2e8f0',
                    fontWeight: 600
                  }}
                >
                  #{keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions / External Links */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '18px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
          {openAlexUrl && (
            <a
              href={openAlexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '13px', borderRadius: '10px' }}
            >
              <ExternalLink size={14} />
              View on OpenAlex
            </a>
          )}
          {doiUrl && (
            <a
              href={doiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ fontSize: '13px', borderRadius: '10px' }}
            >
              <ExternalLink size={14} />
              Open Publisher (DOI)
            </a>
          )}
          <button 
            onClick={onClose} 
            className="btn btn-secondary" 
            style={{ fontSize: '13px', borderRadius: '10px' }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
