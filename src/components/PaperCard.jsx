import React, { useState } from 'react';
import { Calendar, Quote, ExternalLink, FileText, ChevronDown, ChevronUp, Tag } from 'lucide-react';

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

export default function PaperCard({ paper, onOpenModal }) {
  const [expanded, setExpanded] = useState(false);

  // Extract author names safely
  const rawAuthors = safeParseArray(paper.authors || paper.authorships);
  const authorNames = rawAuthors
    .map((a) => (typeof a === 'string' ? a : a?.author?.display_name || a?.display_name || a?.raw_author_name || a?.name))
    .filter(Boolean);

  // Extract topic names safely
  const rawTopics = safeParseArray(paper.topics);
  const topicNames = rawTopics
    .map((t) => (typeof t === 'string' ? t : t?.display_name || t?.name || t?.subfield?.display_name))
    .filter(Boolean)
    .slice(0, 3);

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

  return (
    <div className="glass-panel glass-panel-hover animate-fade-in" style={{ height: '100%', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Top Meta Badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {publicationYear && (
            <span className="badge badge-indigo">
              <Calendar size={12} />
              {publicationYear}
            </span>
          )}
          {citationCount !== null && (
            <span className="badge badge-emerald">
              <Quote size={12} />
              {citationCount.toLocaleString()} citations
            </span>
          )}
        </div>

        {paper.doi && (
          <a
            href={paper.doi.startsWith('http') ? paper.doi : `https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}
          >
            <ExternalLink size={12} />
            DOI
          </a>
        )}
      </div>

      {/* Paper Title */}
      <h3 style={{ minHeight: '45px', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4, cursor: 'pointer' }} onClick={() => onOpenModal(paper)}>
        {paper.title || 'Untitled Research Paper'}
      </h3>

      {/* Authors list */}
      {authorNames.length > 0 && (
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-muted)' }}>Authors:</span>
          <span>{authorNames.slice(0, 4).join(', ')}{authorNames.length > 4 ? ` +${authorNames.length - 4} more` : ''}</span>
        </div>
      )}

      {/* Abstract preview */}
      {paper.abstract && (
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ lineHeight: 1.5 }}>
            {expanded ? paper.abstract : `${paper.abstract.slice(0, 180)}...`}
          </p>
          {paper.abstract.length > 180 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {expanded ? <>Show less <ChevronUp size={12} /></> : <>Read more <ChevronDown size={12} /></>}
            </button>
          )}
        </div>
      )}

      {/* Topics / Keywords */}
      {topicNames.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
          {topicNames.map((topic, i) => (
            <span key={i} className="badge badge-amber" style={{ fontSize: '11px', padding: '3px 8px' }}>
              <Tag size={10} />
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* View full details button */}
      <button
        type="button"
        onClick={() => onOpenModal(paper)}
        className="btn btn-secondary"
        style={{ width: '100%', fontSize: '13px', marginTop: 'auto' }}
      >
        <FileText size={14} />
        View Full Details
      </button>

    </div>
  );
}
