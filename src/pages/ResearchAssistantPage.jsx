import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  FileText,
  Loader2,
  MessageCircle,
  Paperclip,
  Send,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { suggestionService } from '../services/api';

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const renderInlineMarkdown = (text) => text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => (
  part.startsWith('**') && part.endsWith('**')
    ? <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    : <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
));

const ResearchAnswer = ({ text }) => {
  const lines = text.split(/\r?\n/);
  const content = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    content.push(
      <ul key={`list-${content.length}`}>
        {listItems.map((item, index) => <li key={`${item}-${index}`}>{renderInlineMarkdown(item)}</li>)}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const heading = trimmedLine.match(/^#{1,6}\s+(.+)$/);
    const bullet = trimmedLine.match(/^(?:[*-])\s+(.+)$/);

    if (!trimmedLine) {
      flushList();
      return;
    }
    if (bullet) {
      listItems.push(bullet[1]);
      return;
    }

    flushList();
    if (heading) {
      content.push(<h3 key={`heading-${index}`}>{renderInlineMarkdown(heading[1])}</h3>);
    } else {
      content.push(<p key={`paragraph-${index}`}>{renderInlineMarkdown(trimmedLine)}</p>);
    }
  });
  flushList();

  return <div className="research-answer">{content}</div>;
};

export default function ResearchAssistantPage() {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [querying, setQuerying] = useState(false);
  const [error, setError] = useState('');

  const addFiles = (fileList) => {
    const pdfs = Array.from(fileList).filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    if (pdfs.length !== Array.from(fileList).length) {
      setError('Research Assistant accepts PDF files only.');
    }
    const oversized = pdfs.some((file) => file.size > MAX_FILE_SIZE);
    if (oversized) setError('Each PDF must be smaller than 25 MB.');
    setFiles((current) => [
      ...current,
      ...pdfs.filter((file) => file.size <= MAX_FILE_SIZE && !current.some((existing) => existing.name === file.name && existing.size === file.size)),
    ]);
  };

  const uploadFiles = async () => {
    if (!files.length || uploading) return;
    setError('');
    setUploading(true);
    const nextStatuses = {};

    for (const file of files) {
      const key = `${file.name}-${file.size}`;
      nextStatuses[key] = 'uploading';
      setStatuses((current) => ({ ...current, [key]: 'uploading' }));
      try {
        await suggestionService.uploadResearch(file);
        nextStatuses[key] = 'uploaded';
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
        nextStatuses[key] = 'failed';
        setError(err.response?.data?.message || err.response?.data?.error || `Failed to upload ${file.name}.`);
      }
      setStatuses((current) => ({ ...current, [key]: nextStatuses[key] }));
    }
    setUploading(false);
  };

  const submitQuestion = async (event) => {
    event.preventDefault();
    const text = question.trim();
    if (!text || uploading || querying) return;
    setMessages((current) => [...current, { role: 'user', text }]);
    setQuestion('');
    setError('');
    setQuerying(true);

    try {
      const response = await suggestionService.queryResearch(text);
      const result = response.data;
      setMessages((current) => [...current, {
        role: 'assistant',
        text: result.answer || 'The research assistant returned no answer.',
        sources: Array.isArray(result.sources) ? result.sources : [],
      }]);
    } catch (err) {
      console.error('Research query failed:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to answer your question.');
    } finally {
      setQuerying(false);
    }
  };

  const removeFile = (file) => {
    const key = `${file.name}-${file.size}`;
    setFiles((current) => current.filter((item) => item !== file));
    setStatuses((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  return (
    <div className="research-assistant-page">
      <div className="ask-header">
        <div>
          <div className="ask-eyebrow"><Sparkles size={14} /> RAG WORKSPACE</div>
          <h1>Research Assistant</h1>
          <p>Upload your research papers, then ask questions across your private research library.</p>
        </div>
        <div className="research-ready-badge"><span /> Uploads ready</div>
      </div>

      <div className="research-assistant-grid">
        <section className="research-upload-card">
          <div className="research-card-heading">
            <div className="research-card-icon"><UploadCloud size={20} /></div>
            <div><h2>Add research papers</h2><p>PDF files up to 25 MB each</p></div>
          </div>
          <button
            type="button"
            className={`research-dropzone ${isDragging ? 'is-dragging' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => { event.preventDefault(); setIsDragging(false); addFiles(event.dataTransfer.files); }}
          >
            <Paperclip size={22} />
            <strong>Drop PDFs here</strong>
            <span>or click to browse your computer</span>
            <input ref={inputRef} type="file" accept=".pdf,application/pdf" multiple hidden onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />
          </button>

          {files.length > 0 && (
            <div className="research-file-list">
              {files.map((file) => {
                const status = statuses[`${file.name}-${file.size}`];
                return (
                  <div className="research-file-row" key={`${file.name}-${file.size}`}>
                    <div className="research-file-name"><FileText size={17} /><span>{file.name}</span></div>
                    <div className={`research-file-status ${status || ''}`}>
                      {status === 'uploading' && <Loader2 size={14} className="animate-spin" />}
                      {status === 'uploaded' && <CheckCircle2 size={14} />}
                      {status === 'failed' && <AlertCircle size={14} />}
                      {!status && `${(file.size / 1024 / 1024).toFixed(1)} MB`}
                      {status === 'uploading' && 'Uploading'}
                      {status === 'uploaded' && 'Uploaded'}
                      {status === 'failed' && 'Failed'}
                    </div>
                    {!status && <button type="button" onClick={() => removeFile(file)} aria-label={`Remove ${file.name}`}><X size={15} /></button>}
                  </div>
                );
              })}
              <button type="button" className="research-upload-button" onClick={uploadFiles} disabled={uploading || files.every((file) => statuses[`${file.name}-${file.size}`] === 'uploaded')}>
                {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading papers...</> : <><UploadCloud size={16} /> Upload {files.length} {files.length === 1 ? 'paper' : 'papers'}</>}
              </button>
            </div>
          )}
          {error && <div className="ask-error"><AlertCircle size={16} /> {error}</div>}
          <div className="research-upload-note"><CheckCircle2 size={14} /> Papers are uploaded one at a time for reliable processing.</div>
        </section>

        <section className="research-chat-card">
          <div className="research-chat-title"><div className="research-card-icon"><Bot size={20} /></div><div><h2>Ask your research</h2><p>Answers grounded in your uploaded papers</p></div></div>
          <div className="research-chat-body">
            {messages.length === 0 ? (
              <div className="research-chat-empty"><MessageCircle size={28} /><strong>Your research conversation starts here</strong><span>Upload papers, then ask a question to search across the indexed research.</span></div>
            ) : messages.map((message, index) => (
              <div className={`research-message ${message.role}`} key={`${message.role}-${index}`}>
                <div className="research-message-label">{message.role === 'assistant' ? 'Research Assistant' : 'You'}</div>
                <div className="research-message-text">
                  {message.role === 'assistant' ? <ResearchAnswer text={message.text} /> : message.text}
                </div>
                {message.sources?.length > 0 && (
                  <div className="research-sources">
                    <div className="research-sources-title">Sources</div>
                    {message.sources.map((source, sourceIndex) => (
                      <details key={`${source.chunk_id || source.paper_id}-${sourceIndex}`}>
                        <summary>
                          <FileText size={13} />
                          {source.source || `Source ${sourceIndex + 1}`}
                          {typeof source.similarity === 'number' && ` · ${(source.similarity * 100).toFixed(0)}% match`}
                        </summary>
                        <p>{source.content}</p>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {querying && (
              <div className="research-message assistant">
                <div className="research-message-label">Research Assistant</div>
                <div className="research-query-loading"><Loader2 size={15} className="animate-spin" /> Searching your research...</div>
              </div>
            )}
          </div>
          <form className="research-question-form" onSubmit={submitQuestion}>
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question about your uploaded papers..." rows={2} disabled={querying} />
            <button type="submit" disabled={!question.trim() || querying} aria-label="Send question">
              {querying ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            </button>
          </form>
          <div className="research-coming-soon"><Sparkles size={13} /> Answers cite the most relevant chunks from your uploaded research.</div>
        </section>
      </div>
    </div>
  );
}
