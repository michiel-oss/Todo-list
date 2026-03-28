import { useState, useRef, useEffect } from 'react'

export default function TodoScreen({ onSend }) {
  const [items, setItems] = useState([])
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function addItem() {
    const text = input.trim()
    if (!text) return
    setItems(prev => [...prev, { id: Date.now(), text }])
    setInput('')
    inputRef.current?.focus()
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') addItem()
  }

  const canSend = items.length > 0

  return (
    <div className="flex flex-col min-h-svh max-w-md mx-auto w-full px-5 pt-14 pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-violet-300 text-xs font-medium tracking-wide">AI-powered</span>
        </div>
        <h1 className="text-3xl font-bold text-white leading-tight">
          What's on your<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">mind today?</span>
        </h1>
        <p className="text-white/40 text-sm mt-2">Add your tasks — AI will help you refine them</p>
      </div>

      {/* Quick add input */}
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-4 focus-within:border-violet-500/50 focus-within:bg-white/8 transition-all duration-200">
        <button
          onClick={addItem}
          className="w-7 h-7 rounded-lg bg-violet-500 hover:bg-violet-400 flex items-center justify-center flex-shrink-0 transition-colors duration-150"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task..."
          className="flex-1 bg-transparent text-white placeholder-white/30 text-base"
        />
        {input.trim() && (
          <kbd className="text-white/25 text-xs bg-white/5 border border-white/10 rounded px-1.5 py-0.5 hidden sm:block">↵</kbd>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="7" width="20" height="2.5" rx="1.25" fill="white" fillOpacity="0.2"/>
                <rect x="4" y="13" width="14" height="2.5" rx="1.25" fill="white" fillOpacity="0.2"/>
                <rect x="4" y="19" width="17" height="2.5" rx="1.25" fill="white" fillOpacity="0.2"/>
              </svg>
            </div>
            <p className="text-white/25 text-sm">Your tasks will appear here</p>
          </div>
        )}

        {items.map((item, index) => (
          <div
            key={item.id}
            className="todo-item group flex items-center gap-3 bg-white/5 border border-white/8 hover:border-white/15 rounded-xl px-4 py-3.5 transition-all duration-150"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="w-5 h-5 rounded-full border-2 border-violet-500/50 flex-shrink-0" />
            <span className="flex-1 text-white/85 text-sm">{item.text}</span>
            <button
              onClick={() => removeItem(item.id)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/8 opacity-0 group-hover:opacity-100 transition-all duration-150"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Send CTA */}
      <div className="mt-6 pt-4">
        {items.length > 0 && (
          <p className="text-center text-white/30 text-xs mb-3">
            {items.length} task{items.length !== 1 ? 's' : ''} ready · AI will help refine each one
          </p>
        )}
        <button
          onClick={() => canSend && onSend(items)}
          disabled={!canSend}
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
            canSend
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white send-btn cursor-pointer'
              : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/8'
          }`}
        >
          {canSend ? (
            <span className="flex items-center justify-center gap-2">
              Send List
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          ) : (
            'Add tasks to continue'
          )}
        </button>
      </div>
    </div>
  )
}
