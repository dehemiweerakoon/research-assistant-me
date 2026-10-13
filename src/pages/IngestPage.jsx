import React, { useState } from 'react';
import { paperService } from '../services/api';
import { Database, Brain, CheckCircle2, AlertCircle, Loader2, ArrowRight, BookOpen, Layers } from 'lucide-react';

export default function IngestPage({ onNavigateToPapers }) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const suggestedTopics = [
    'Retrieval Augmented Generation',
    'Reinforcement Learning from Human Feedback',
    'Graph Neural Networks',
    'Quantum Computing',
    'Diffusion Models',
    'Autonomous Agents'
  ];

  const handleIngest = async (searchTopic) => {
    const targetTopic = searchTopic || topic;
    if (!targetTopic.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await paperService.collectPapers(targetTopic.trim());
      setResult(res.data);
    } catch (err) {
      console.error('Ingestion failed:', err);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to collect papers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent-purple)', marginBottom: '12px'
        }}>
          <Database size={24} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Ingest Scientific Papers
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '6px auto 0 auto' }}>
          Fetch academic works from OpenAlex API and store metadata, inverted index abstracts, and citation counts into Supabase PostgreSQL.
        </p>
      </div>

      {/* Ingestion Card */}
      <div className="dash-card animate-fade-in" style={{ padding: '30px' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleIngest(); }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            Research Topic or Keyword Query
          </label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="e.g. 'Transformer Attention', 'CRISPR Gene Editing'..."
              className="input-field" style={{ flex: 1, height: '46px', fontSize: '14px' }}
              value={topic} onChange={(e) => setTopic(e.target.value)} disabled={loading} />
            <button type="submit" className="btn btn-primary btn-pill" style={{ height: '46px', padding: '0 24px', fontSize: '13px' }}
              disabled={loading || !topic.trim()}>
              {loading ? (<><Loader2 size={16} className="animate-spin" /><span>Ingesting...</span></>) :
                (<><Brain size={16} /><span>Fetch & Index</span></>)}
            </button>
          </div>
        </form>

        {/* Quick topics */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Try Quick Topics:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {suggestedTopics.map((t) => (
              <button key={t} type="button" onClick={() => { setTopic(t); handleIngest(t); }}
                disabled={loading}
                style={{
                  padding: '6px 12px', fontSize: '11.5px', fontWeight: 600,
                  borderRadius: 'var(--radius-full)', background: '#f8fafc',
                  border: '1px solid #e2e8f0', color: 'var(--text-main)',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ede9fe'; e.currentTarget.style.borderColor = '#c4b5fd'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                + {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="dash-card animate-fade-in" style={{ padding: '24px', textAlign: 'center', borderColor: '#c4b5fd' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-purple)', margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>Collecting and Indexing Papers...</h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
            Paginating through OpenAlex works, reconstructing inverted index abstracts, and upserting into Supabase.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', color: '#991b1b' }}>
          <AlertCircle size={22} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '2px' }}>Ingestion Error</div>
            <div style={{ fontSize: '13px' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="dash-card animate-fade-in" style={{ padding: '26px', border: '1px solid #a7f3d0', background: '#ecfdf5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <CheckCircle2 size={24} style={{ color: '#059669' }} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#065f46' }}>{result.response || 'Papers Ingested Successfully!'}</h3>
              <div style={{ fontSize: '13px', color: '#047857' }}>Total papers collected: <strong>{result.totalPapers || 0}</strong></div>
            </div>
          </div>
          <button onClick={onNavigateToPapers} className="btn btn-primary btn-pill" style={{ width: '100%', fontSize: '13px', padding: '10px' }}>
            <BookOpen size={16} /> <span>View & Search Indexed Papers</span> <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Pipeline info */}
      <div className="dash-card" style={{ padding: '22px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={15} style={{ color: 'var(--accent-purple)' }} /> How the Pipeline Works
        </h3>
        <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'grid', gap: '8px' }}>
          <div>1. <strong>OpenAlex API Query</strong>: Calls works endpoint with search terms and cursor pagination.</div>
          <div>2. <strong>Inverted Index Parsing</strong>: Transforms word position arrays into readable scientific abstracts.</div>
          <div>3. <strong>PostgreSQL Upsert</strong>: Stores unique paper_ids, titles, authors, and citation counts into Supabase.</div>
        </div>
      </div>
    </div>
  );
}
