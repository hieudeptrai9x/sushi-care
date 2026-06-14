import { ArrowLeft, Bot, Send, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const chips = ['Bé bú ít', 'Bé ngủ không sâu', 'Tã lẫn nhiều', 'Bé ọc sữa', 'Có dấu hiệu nguy hiểm không?']
type Message = { role: 'user' | 'assistant'; content: string }

export function AiChatPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Chào mẹ, mình có thể cùng xem lại việc bú, ngủ, tã và những băn khoăn khi chăm bé. Mẹ muốn hỏi điều gì?' }])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const send = async (event?: FormEvent, quick?: string) => {
    event?.preventDefault()
    const message = (quick ?? text).trim()
    if (!message || busy) return
    setMessages((current) => [...current, { role: 'user', content: message }]); setText(''); setBusy(true)
    try {
      const result = await api.post<{ reply: string }>('/api/ai/chat.php', { message, include_context: true })
      setMessages((current) => [...current, { role: 'assistant', content: result.reply }])
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'AI đang bận, mẹ thử lại nhé.' }])
    } finally { setBusy(false) }
  }
  return <div className="chat-page">
    <header className="chat-header"><button className="icon-button glass" onClick={() => navigate(-1)}><ArrowLeft /></button><div className="robot-orb"><Bot /></div><div><small>TRỢ LÝ CHĂM BÉ</small><h1>Sushi AI</h1><span className="online-dot">Đang sẵn sàng</span></div></header>
    <div className="chat-disclaimer"><Sparkles /> AI chỉ mang tính tham khảo, không thay thế chẩn đoán của bác sĩ.</div>
    <div className="messages">{messages.map((message, index) => <div className={`bubble ${message.role}`} key={index}>{message.role === 'assistant' && <Bot />}{message.content}</div>)}{busy && <div className="bubble assistant typing">● ● ●</div>}</div>
    <div className="quick-chips">{chips.map((chip) => <button onClick={() => send(undefined, chip)} key={chip}>{chip}</button>)}</div>
    <form className="chat-input" onSubmit={send}><input placeholder="Hỏi một điều về bé..." value={text} onChange={(e) => setText(e.target.value)} /><button disabled={!text.trim() || busy}><Send /></button></form>
  </div>
}
