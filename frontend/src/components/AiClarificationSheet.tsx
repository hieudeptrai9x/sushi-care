import { Bot, X } from 'lucide-react'

export function AiClarificationSheet({ question, suggestions, onSuggestion, onCancel, onManual }: {
  question: string
  suggestions: string[]
  onSuggestion: (suggestion: string) => void
  onCancel: () => void
  onManual: () => void
}) {
  return <div className="sheet-backdrop ai-sheet-backdrop" onClick={onCancel}>
    <section className="bottom-sheet ai-confirm-sheet" onClick={(event) => event.stopPropagation()}>
      <div className="sheet-handle" />
      <div className="ai-sheet-title"><div className="ai-sheet-icon"><Bot /></div><div><small>EM CẦN HỎI THÊM</small><h2>Chưa đủ thông tin</h2></div><button className="icon-button" onClick={onCancel}><X /></button></div>
      <p className="ai-clarification-copy">Em chưa chắc ý anh muốn ghi gì. Anh bổ sung thêm chút nhé.</p>
      <strong className="ai-question">{question}</strong>
      {!!suggestions.length && <div className="ai-suggestion-list">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => onSuggestion(suggestion)}>{suggestion}</button>)}</div>}
      <button className="secondary-button" onClick={onManual}>Mở form thủ công</button>
      <button className="ai-cancel-button" onClick={onCancel}>Đóng</button>
    </section>
  </div>
}
