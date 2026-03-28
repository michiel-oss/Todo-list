import { useState, useRef, useEffect } from 'react'
import { Plus, Send01, Trash01, CheckCircle, List } from 'untitledui-js/react'

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100svh',
      maxWidth: '448px',
      margin: '0 auto',
      width: '100%',
      padding: `var(--spacing-7xl) var(--spacing-2xl) var(--spacing-4xl)`,
    }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 'var(--spacing-5xl)' }}>
        {/* Badge */}
        <div className="uui-badge uui-badge-brand" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <span style={{
            width: '6px', height: '6px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--colors-fg-brand-primary)',
            animation: 'uui-pulse-brand 2s ease-in-out infinite',
            flexShrink: 0,
          }} />
          AI-powered
        </div>

        {/* Display heading */}
        <h1 style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'var(--font-size-display-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          lineHeight: 'var(--line-height-display-sm)',
          letterSpacing: 'var(--letter-spacing-display)',
          color: 'var(--colors-fg-primary)',
          marginBottom: 'var(--spacing-lg)',
        }}>
          What's on your{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>mind today?</span>
        </h1>

        <p style={{
          fontSize: 'var(--font-size-text-md)',
          fontWeight: 'var(--font-weight-regular)',
          lineHeight: 'var(--line-height-text-md)',
          color: 'var(--colors-fg-tertiary)',
        }}>
          Add your tasks — AI will help you refine each one
        </p>
      </div>

      {/* ── Quick-add input ── */}
      <div className="uui-input-wrapper" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <button
          onClick={addItem}
          style={{
            width: '32px', height: '32px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-700))',
            border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          aria-label="Add task"
        >
          <Plus size={16} color="var(--colors-fg-white)" strokeWidth={2.5} />
        </button>

        <input
          ref={inputRef}
          className="uui-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task..."
        />

        {input.trim() && (
          <kbd style={{
            fontSize: 'var(--font-size-text-xs)',
            color: 'var(--colors-fg-quinary)',
            background: 'var(--colors-bg-tertiary)',
            border: '1px solid var(--colors-border-secondary)',
            borderRadius: 'var(--radius-xs)',
            padding: '2px 6px',
            fontFamily: 'var(--font-family-mono)',
            flexShrink: 0,
          }}>↵</kbd>
        )}
      </div>

      {/* ── Items list ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: `var(--spacing-8xl) 0`,
            gap: 'var(--spacing-lg)',
          }}>
            <div style={{
              width: '56px', height: '56px',
              borderRadius: 'var(--radius-2xl)',
              background: 'var(--colors-bg-secondary)',
              border: '1px solid var(--colors-border-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <List size={24} color="var(--colors-fg-quinary)" />
            </div>
            <p style={{
              fontSize: 'var(--font-size-text-sm)',
              color: 'var(--colors-fg-quinary)',
              textAlign: 'center',
            }}>Your tasks will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {items.map((item, index) => (
              <TodoItem
                key={item.id}
                item={item}
                index={index}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer / Send CTA ── */}
      <div style={{ marginTop: 'var(--spacing-3xl)', paddingTop: 'var(--spacing-xl)' }}>
        {items.length > 0 && (
          <p style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-text-xs)',
            color: 'var(--colors-fg-quinary)',
            marginBottom: 'var(--spacing-lg)',
          }}>
            {items.length} task{items.length !== 1 ? 's' : ''} ready · AI will refine each one
          </p>
        )}

        <SendButton canSend={canSend} onClick={() => canSend && onSend(items)} />
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function TodoItem({ item, index, onRemove }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="uui-fade-in"
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)',
        background: 'var(--colors-bg-secondary)',
        border: `1px solid ${hovered ? 'var(--colors-border-primary)' : 'var(--colors-border-secondary)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--spacing-lg) var(--spacing-xl)',
        transition: 'border-color 0.15s ease',
        animationDelay: `${index * 30}ms`,
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Circle indicator */}
      <div style={{
        width: '20px', height: '20px',
        borderRadius: 'var(--radius-full)',
        border: '2px solid var(--colors-border-brand)',
        flexShrink: 0,
      }} />

      <span style={{
        flex: 1,
        fontSize: 'var(--font-size-text-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--colors-fg-secondary)',
      }}>
        {item.text}
      </span>

      <button
        onClick={() => onRemove(item.id)}
        style={{
          width: '28px', height: '28px',
          borderRadius: 'var(--radius-sm)',
          background: hovered ? 'var(--colors-bg-tertiary)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s ease, background 0.15s ease',
        }}
        aria-label="Remove task"
      >
        <Trash01 size={14} color="var(--colors-fg-tertiary)" />
      </button>
    </div>
  )
}

function SendButton({ canSend, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={!canSend}
      className={canSend ? 'uui-pulse-brand' : ''}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-lg) var(--spacing-3xl)',
        borderRadius: 'var(--radius-xl)',
        border: 'none',
        cursor: canSend ? 'pointer' : 'not-allowed',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--font-size-text-md)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: 'var(--line-height-text-md)',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        background: canSend
          ? `linear-gradient(135deg, var(--color-brand-600), var(--color-brand-700))`
          : 'var(--colors-bg-secondary)',
        color: canSend ? 'var(--colors-fg-white)' : 'var(--colors-fg-disabled)',
        ...(canSend && hovered ? { opacity: 0.9, transform: 'translateY(-1px)' } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {canSend ? (
        <>
          Send List
          <Send01 size={18} color="var(--colors-fg-white)" />
        </>
      ) : (
        <>
          <List size={18} color="var(--colors-fg-disabled)" />
          Add tasks to continue
        </>
      )}
    </button>
  )
}
