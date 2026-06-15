import { Bot, Send, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { quickAiService, type QuickActivity, type QuickParseResult } from '../services/quickAiService'
import { AiClarificationSheet } from './AiClarificationSheet'
import { AiParseConfirmSheet } from './AiParseConfirmSheet'
import { AnimatedPlaceholder } from './AnimatedPlaceholder'
import { appendClarification } from '../utils/quickAiInput'

export function QuickAiInputCard({ babyId, onSaved }: { babyId: number; onSaved: () => Promise<unknown> }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<QuickParseResult | null>(null)

  const parse = async (input: string) => {
    if (!input.trim()) return
    setLoading(true)
    setResult(null)
    try {
      setResult(await quickAiService.parseQuickInput(input.trim(), babyId))
    } catch {
      toast('AI đang hơi bận, anh thử lại sau nhé.')
    } finally {
      setLoading(false)
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void parse(text)
  }

  const clarify = (suggestion: string) => {
    const clarifiedText = appendClarification(text, suggestion)
    setText(clarifiedText)
    void parse(clarifiedText)
  }

  const save = async () => {
    if (!result?.activity) return
    setSaving(true)
    try {
      await quickAiService.createActivityFromAi(result.activity, text, babyId)
      setText('')
      setResult(null)
      toast('Đã lưu nhật ký cho bé 💗')
      await onSaved()
    } catch {
      toast('AI đang hơi bận, anh thử lại sau nhé.')
    } finally {
      setSaving(false)
    }
  }

  const edit = () => {
    if (!result?.activity) return
    sessionStorage.setItem('sushi_ai_activity_draft', JSON.stringify({
      ...result.activity,
      meta_json: { ...result.activity.meta_json, source: 'ai_quick_input', original_text: text },
    }))
    const route = formRoute(result.activity)
    setResult(null)
    navigate(route)
  }

  const manual = () => {
    const route = result?.activity ? formRoute(result.activity) : '/add/note'
    setResult(null)
    navigate(route)
  }

  return <>
    <section className="card quick-ai-card">
      <div className="quick-ai-heading"><div className="quick-ai-orb"><Sparkles /></div><div><h2>Ghi nhanh bằng AI</h2><p>Nhập như đang nhắn tin, app sẽ tự hiểu và lưu nhật ký cho bé.</p></div></div>
      <form onSubmit={submit}>
        <div className="quick-ai-input-wrap">
          <textarea aria-label="Nội dung ghi nhanh bằng AI" rows={1} value={text} onChange={(event) => setText(event.target.value)} />
          <AnimatedPlaceholder hidden={text.length > 0} />
          <button aria-label="Gửi cho AI" disabled={loading || !text.trim()}>{loading ? <Bot className="is-thinking" /> : <Send />}</button>
        </div>
      </form>
      {loading && <div className="quick-ai-footer"><span>AI đang đọc nhật ký...</span></div>}
    </section>
    {result?.success && result.activity && <AiParseConfirmSheet activity={result.activity} summary={result.human_summary} warning={result.warning} saving={saving} onSave={save} onEdit={edit} onCancel={() => setResult(null)} />}
    {result?.needs_clarification && <AiClarificationSheet question={result.question ?? 'Anh bổ sung thêm chút nhé.'} suggestions={result.suggestions ?? []} onSuggestion={clarify} onCancel={() => setResult(null)} onManual={manual} />}
  </>
}

function formRoute(activity: QuickActivity) {
  if (activity.type === 'health') return '/health'
  if (activity.type === 'pumping') return '/add/feeding'
  return `/add/${activity.type}`
}
