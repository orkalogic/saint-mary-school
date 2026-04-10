// src/components/AIChat.tsx
import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const WELCOME_MSG = `Welcome! I'm your Saint Mary Church School assistant. I can help you with:\n\n• Questions about Orthodox faith\n• School schedule information\n• How to enroll as student or teacher\n• Navigating the app\n\nHow can I help you today?`

const MOCK_RESPONSES: Record<string, string> = {
  'enroll': 'To enroll, sign in and click "Enroll Student" or "Apply Teacher" from the Join Us menu. An admin will review your application.',
  'schedule': 'Sunday School runs from 9:00 AM to 10:30 AM. Liturgy is from 8:00 AM to 11:00 AM. Check the schedule tab in your dashboard for your specific assignments.',
  'teacher': 'To apply as a teacher, sign in and go to "Apply Teacher" from the Join Us menu. Select your preferred subjects and describe your qualifications.',
  'parent': 'Parent accounts are created by administrators. Contact the school admin to get linked with your children.',
  'grade': 'Students can view their grades in the Grades tab. Teachers grade submissions with scores and feedback.',
  'fast': 'Major fasting seasons include Hudade (Great Lent), the Fast of the Apostles, and the Fast of the Assumption. Check the homepage for current fasting schedules.',
  'liturgy': 'The Divine Liturgy of the Eritrean Orthodox Tewahdo Church is celebrated every Sunday. Students learn about its meaning and structure in their classes.',
  'zema': 'Zema is the sacred hymnology tradition of our church, originating from St. Yared. It is taught as part of our curriculum.',
  'default': `Thank you for your question! For specific inquiries, please contact the school office at school@saintmarychurch.org or speak with an administrator after Liturgy.`,
}

export default function AIChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: 'assistant', content: WELCOME_MSG }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getResponse = (userMsg: string): string => {
    const lower = userMsg.toLowerCase()
    for (const [key, response] of Object.entries(MOCK_RESPONSES)) {
      if (lower.includes(key)) return response
    }
    return MOCK_RESPONSES.default
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Simulate AI response delay
    setTimeout(() => {
      const response = getResponse(userMsg.content)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: response }])
      setLoading(false)
    }, 800)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1E3A5F, #2C5282)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: 24,
          boxShadow: '0 4px 20px rgba(30,58,95,0.3)',
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 90,
          right: 24,
          width: 380,
          height: 520,
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #1E3A5F, #2C5282)',
            color: 'white',
          }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>🏛️ School Assistant</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, opacity: 0.8 }}>Ask about faith, school, or navigation</p>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(m => (
              <div key={m.id} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.role === 'user' ? '#1E3A5F' : '#F3F4F6',
                color: m.role === 'user' ? 'white' : '#1E3A5F',
                fontSize: 13,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: '#F3F4F6', fontSize: 13, color: '#6B7280' }}>
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..."
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 20,
                border: '1px solid #D1D5DB',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                background: input.trim() && !loading ? '#C9A84C' : '#D1D5DB',
                color: input.trim() && !loading ? '#1E3A5F' : '#9CA3AF',
                border: 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
