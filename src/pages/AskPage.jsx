import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  Bot,
  Check,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Plus,
  Send,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';

const GEMINI_MODEL = 'gemini-3.8-flash';
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = '.txt,.md,.pdf,.csv,.json,.js,.jsx,.ts,.tsx,.py,.java,.html,.css,.png,.jpg,.jpeg,.webp';

const starterPrompts = [
  'Summarize the key ideas in my uploaded files',
  'Compare the approaches described in these documents',
  'Help me prepare interview questions from this material',
];

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
  reader.readAsDataURL(file);
});

const readFileAsText = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
  reader.readAsText(file);
});

const isTextFile = (file) => file.type.startsWith('text/')
  || /\.(md|csv|json|js|jsx|ts|tsx|py|java|html|css)$/i.test(file.name);

export default function AskPage() {
  const fileInputRef = useRef(null);
  const [prompt, setPrompt] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (fileList) => {
    const incomingFiles = Array.from(fileList);
    const validFiles = incomingFiles.filter((file) => file.size <= MAX_FILE_SIZE);
    if (validFiles.length !== incomingFiles.length) {
      setError('Each file must be smaller than 20 MB.');
    }
    setAttachments((current) => [
      ...current,
      ...validFiles.filter((file) => !current.some((existing) => existing.name === file.name && existing.size === file.size)),
    ]);
  };

  const removeAttachment = (fileToRemove) => {
    setAttachments((current) => current.filter((file) => file !== fileToRemove));
  };

  const buildContentParts = async (text) => {
    const parts = [{ text }];
    for (const file of attachments) {
      if (isTextFile(file)) {
        parts.push({ text: `\n\n--- ${file.name} ---\n${await readFileAsText(file)}` });
      } else {
        parts.push({
          inline_data: {
            mime_type: file.type || 'application/octet-stream',
            data: await readFileAsBase64(file),
          },
        });
      }
    }
    return parts;
  };

  const sendMessage = async (event) => {
    event?.preventDefault();
    const text = prompt.trim();
    if (!text || loading) return;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError('Add your Gemini key to VITE_GEMINI_API_KEY in a local .env file before sending a message.');
      return;
    }

    const currentAttachments = [...attachments];
    setError('');
    setPrompt('');
    setAttachments([]);
    setMessages((current) => [...current, {
      role: 'user',
      text,
      files: currentAttachments.map((file) => file.name),
    }]);
    setLoading(true);

    try {
      const userParts = await buildContentParts(text);
      const conversation = messages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.text }],
      }));
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{
                text: 'You are Ask, a thoughtful research assistant. Use the provided files as context when available. Be clear, accurate, and concise. If the files do not contain enough information, say so.',
              }],
            },
            contents: [...conversation, { role: 'user', parts: userParts }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Gemini could not complete the request.');
      }

      const reply = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        .join('')
        .trim();
      if (!reply) throw new Error('Gemini returned an empty response. Try rephrasing your question.');
      setMessages((current) => [...current, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error('Ask request failed:', err);
      setError(err.message || 'Something went wrong while contacting Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  return (
    <div className="ask-page">
      <div className="ask-header">
        <div>
          <div className="ask-eyebrow"><Sparkles size={14} /> RESEARCH COPILOT</div>
          <h1>Ask anything about your research</h1>
          <p>Upload papers, notes, or code and get grounded answers from Gemini.</p>
        </div>
        <button type="button" className="ask-new-chat" onClick={() => { setMessages([]); setError(''); }}>
          <Plus size={16} /> New chat
        </button>
      </div>

      <div className="ask-workspace">
        {messages.length === 0 ? (
          <div className="ask-empty-state">
            <div className="ask-orb"><Bot size={34} /></div>
            <h2>What would you like to explore?</h2>
            <p>Start a conversation or drop files below to give your AI research partner more context.</p>
            <div className="ask-starters">
              {starterPrompts.map((starter) => (
                <button key={starter} type="button" onClick={() => setPrompt(starter)}>
                  <Sparkles size={14} /> {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="ask-messages">
            {messages.map((message, index) => (
              <div className={`ask-message ${message.role}`} key={`${message.role}-${index}`}>
                <div className="ask-message-icon">{message.role === 'assistant' ? <Bot size={16} /> : <Check size={16} />}</div>
                <div className="ask-message-body">
                  <div className="ask-message-author">{message.role === 'assistant' ? 'Ask AI' : 'You'}</div>
                  <div className="ask-message-text">{message.text}</div>
                  {message.files?.length > 0 && (
                    <div className="ask-message-files">{message.files.map((file) => <span key={file}><FileText size={12} /> {file}</span>)}</div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="ask-message assistant">
                <div className="ask-message-icon"><Bot size={16} /></div>
                <div className="ask-message-body"><div className="ask-message-author">Ask AI</div><div className="ask-thinking"><span /><span /><span /></div></div>
              </div>
            )}
          </div>
        )}

        <div className={`ask-composer ${isDragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
          {attachments.length > 0 && (
            <div className="ask-attachments">
              {attachments.map((file) => (
                <div className="ask-attachment" key={`${file.name}-${file.size}`}>
                  {file.type.startsWith('image/') ? <ImageIcon size={15} /> : <FileText size={15} />}
                  <span>{file.name}</span>
                  <button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeAttachment(file)}><X size={13} /></button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={sendMessage}>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(event); } }}
              placeholder="Ask a question about your research..."
              rows={2}
              disabled={loading}
            />
            <div className="ask-composer-actions">
              <div className="ask-upload-hint">
                <button type="button" className="ask-attach-button" onClick={() => fileInputRef.current?.click()} aria-label="Attach files">
                  <Paperclip size={18} />
                </button>
                <span>Drop files here or click to upload</span>
                <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_FILE_TYPES} hidden onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />
              </div>
              <button className="ask-send-button" type="submit" disabled={!prompt.trim() || loading}>
                {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
              </button>
            </div>
          </form>
        </div>
        {error && <div className="ask-error"><AlertCircle size={16} /> {error}</div>}
        <div className="ask-disclaimer"><UploadCloud size={13} /> Files are sent to Gemini only when you submit a message. Maximum file size: 20 MB.</div>
      </div>
    </div>
  );
}
