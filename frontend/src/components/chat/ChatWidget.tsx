'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { apiRequests } from '@/lib/api'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory()
    }
  }, [isOpen])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function loadHistory() {
    try {
      const history = await apiRequests.get('/api/chat/history/')
      const formatted = history.data.flatMap((h: any) => [
        { id: h.id * 2 - 1, role: 'user' as const, content: h.user_message, created_at: h.created_at },
        { id: h.id * 2, role: 'assistant' as const, content: h.ai_response, created_at: h.created_at },
      ]).reverse()
      setMessages(formatted)
    } catch (error) { /* ignore */ }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await apiRequests.post('/api/chat/', { message: input })
      const aiMessage: Message = {
        id: response.data.id,
        role: 'assistant',
        content: response.data.ai_response,
        created_at: response.data.created_at,
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all hover:scale-110"
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[32rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col z-50 animate-slide-up">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Product Assistant</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ask about our approved products</p>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 text-sm mt-8">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                <p>Ask me anything about our products!</p>
                <p className="text-xs mt-2">Try: "What products are under $50?"</p>
              </div>
            )}

            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-500 text-white rounded-br-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                  <Loader2 size={16} className="animate-spin text-slate-400" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about products..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}