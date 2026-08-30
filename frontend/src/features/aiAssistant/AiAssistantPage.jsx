import { useState } from 'react';
import { Bot, Send, Sparkles, Trash2, User } from 'lucide-react';

import { aiApi } from '../../api/ai.api.js';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';

const welcome = {
  role: 'assistant',
  content: 'How can I help? I can use your authorized MediCore data for appointments, lab reports, prescriptions, bills, records, doctors, and notifications.',
};

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([welcome]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activity, setActivity] = useState('');

  async function submit(event) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;
    setMessages((items) => [...items, { role: 'user', content: message }]);
    setInput('');
    setError('');
    setActivity('Checking whether authorized hospital data is needed…');
    setLoading(true);
    try {
      const { data } = await aiApi.chat(message);
      setMessages((items) => [...items, { role: 'assistant', content: data.data.reply }]);
      setActivity(data.data.toolUsed ? `Used authorized ${data.data.intent} data` : 'Answered without hospital data');
    } catch (err) {
      setError(err?.response?.data?.message || 'The assistant is unavailable right now.');
      setActivity('');
    } finally {
      setLoading(false);
    }
  }

  async function clear() {
    try { await aiApi.clear(); } catch { /* local clear still protects the visible session */ }
    setMessages([welcome]);
    setActivity('');
    setError('');
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
            <Sparkles className="h-6 w-6 text-pulse-500" /> AI Assistant
          </h1>
          <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">Qwen-powered guidance with MCP-scoped access.</p>
        </div>
        <Button type="button" variant="secondary" onClick={clear}><Trash2 className="h-4 w-4" /> Clear</Button>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'assistant' && <Bot className="mt-1 h-5 w-5 shrink-0 text-clinical-600" />}
              <div className={`max-w-[80%] whitespace-pre-wrap rounded-xl px-4 py-3 text-sm ${message.role === 'user' ? 'bg-clinical-600 text-white' : 'bg-clinical-50 text-ink-light dark:bg-clinical-800 dark:text-ink-dark'}`}>
                {message.content}
              </div>
              {message.role === 'user' && <User className="mt-1 h-5 w-5 shrink-0 text-clinical-600" />}
            </div>
          ))}
          {loading && <p className="flex items-center gap-2 text-sm text-clinical-600"><span className="h-2 w-2 animate-pulse rounded-full bg-pulse-500" /> {activity}</p>}
          {error && <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">{error}</p>}
        </div>

        <form onSubmit={submit} className="flex gap-3 border-t border-clinical-100 p-4 dark:border-clinical-800">
          <label htmlFor="ai-message" className="sr-only">Message</label>
          <input id="ai-message" value={input} onChange={(event) => setInput(event.target.value)} maxLength={2000}
            placeholder="Ask about your appointments, labs, or records…"
            className="min-w-0 flex-1 rounded-lg border border-clinical-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-clinical-500 dark:border-clinical-700 dark:bg-clinical-900 dark:text-ink-dark" />
          <Button type="submit" loading={loading} disabled={!input.trim()}><Send className="h-4 w-4" /> Send</Button>
        </form>
      </Card>
      <p className="text-center text-xs text-ink-light/50 dark:text-ink-dark/50">MediCore AI is not a doctor. Confirm medical decisions with a qualified clinician.</p>
    </div>
  );
}
