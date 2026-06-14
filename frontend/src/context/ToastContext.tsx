import { createContext, useContext, useState, type ReactNode } from 'react'

const ToastContext = createContext<(message: string) => void>(() => undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const show = (next: string) => {
    setMessage(next)
    window.setTimeout(() => setMessage(''), 2600)
  }
  return (
    <ToastContext.Provider value={show}>
      {children}
      {message && <div className="toast">{message}</div>}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
