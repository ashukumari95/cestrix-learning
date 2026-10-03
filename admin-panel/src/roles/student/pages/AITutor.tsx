import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, Loader2, MessageSquarePlus } from 'lucide-react';
import api from '../../../api';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  messages?: ChatMessage[];
  createdAt: string;
}

export const AITutor = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const res = await api.get('/coaching/ai/chat/sessions');
      setSessions(res.data.sessions || []);
      if (res.data.sessions?.length > 0 && !activeSessionId) {
        setActiveSessionId(res.data.sessions[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      setIsLoadingMessages(true);
      const res = await api.get(`/coaching/ai/chat/sessions/${sessionId}/messages`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    const messageText = input;
    setInput('');
    setIsSending(true);

    try {
      const res = await api.post('/coaching/ai/chat', {
        message: messageText,
        sessionId: activeSessionId
      });

      if (!activeSessionId) {
        setActiveSessionId(res.data.sessionId);
        fetchSessions(); // Refresh sidebar
      }

      const botMsg: ChatMessage = {
        id: Date.now().toString() + 'bot',
        role: 'model',
        content: res.data.reply,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat failed', err);
      // Optional: Add error message visually
    } finally {
      setIsSending(false);
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Sidebar for Sessions */}
      <div className="w-1/4 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            AI Tutor History
          </h2>
          <button 
            onClick={startNewChat}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="New Chat"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingSessions ? (
            <div className="flex justify-center p-4">
               <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center p-4">No past sessions.</p>
          ) : (
            sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors truncate text-sm ${
                  activeSessionId === session.id 
                    ? 'bg-indigo-100 text-indigo-900 font-medium' 
                    : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                {session.messages && session.messages.length > 0 
                  ? session.messages[0].content.substring(0, 30) + '...'
                  : 'Empty Chat'}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-4 border-b border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">DK Mishra's Math Assistant</h2>
            <p className="text-xs text-emerald-600 font-medium">Online • Ready to help</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !isLoadingMessages && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <Bot className="w-16 h-16 text-indigo-200 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">How can I help you today?</h3>
              <p className="text-slate-500 text-sm">Ask me any mathematics question, doubt, or request a hint for a problem you are stuck on.</p>
            </div>
          )}

          {isLoadingMessages && (
             <div className="flex justify-center p-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
             </div>
          )}

          {!isLoadingMessages && messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                }`}>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-slate-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or explain your doubt..." 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              disabled={isSending}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isSending}
              className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
