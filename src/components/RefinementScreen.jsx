import { useState, useRef, useEffect, useCallback } from 'react'

// AI question + suggestions per item based on keywords
function getAIPrompt(itemText) {
  const text = itemText.toLowerCase()

  if (text.includes('buy') || text.includes('shop') || text.includes('get') || text.includes('purchase')) {
    return {
      question: `How urgent is "${itemText}"?`,
      suggestions: ['Today', 'This week', 'Whenever', 'Running low'],
    }
  }
  if (text.includes('email') || text.includes('message') || text.includes('call') || text.includes('contact') || text.includes('reply')) {
    return {
      question: `Who's the priority for "${itemText}"?`,
      suggestions: ['Client', 'Boss', 'Team', 'Personal'],
    }
  }
  if (text.includes('fix') || text.includes('bug') || text.includes('error') || text.includes('issue') || text.includes('broken')) {
    return {
      question: `How critical is "${itemText}"?`,
      suggestions: ['Blocking', 'High priority', 'Low priority', 'Nice to have'],
    }
  }
  if (text.includes('meet') || text.includes('call') || text.includes('schedule') || text.includes('appointment')) {
    return {
      question: `When for "${itemText}"?`,
      suggestions: ['Today', 'Tomorrow', 'This week', 'Next week'],
    }
  }
  if (text.includes('read') || text.includes('learn') || text.includes('study') || text.includes('research')) {
    return {
      question: `How much time for "${itemText}"?`,
      suggestions: ['15 min', '1 hour', 'Deep dive', 'Just overview'],
    }
  }
  if (text.includes('clean') || text.includes('tidy') || text.includes('organize') || text.includes('sort')) {
    return {
      question: `What area for "${itemText}"?`,
      suggestions: ['Quick tidy', 'Deep clean', 'Specific spot', 'Full room'],
    }
  }

  // Default
  return {
    question: `How should you approach "${itemText}"?`,
    suggestions: ['Do it first', 'Batch with others', 'Delegate', 'Schedule it'],
  }
}

const STEPS_PER_ITEM = 1

export default function RefinementScreen({ items, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [customInput, setCustomInput] = useState('')
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [done, setDone] = useState(false)
  const inputRef = useRef(null)

  const total = items.length
  const progress = Math.round(((currentIndex) / total) * 100)
  const progressFinal = done ? 100 : progress

  const currentItem = items[currentIndex]
  const prompt = currentItem ? getAIPrompt(currentItem.text) : null

  useEffect(() => {
    const timer = setTimeout(() => setDrawerVisible(true), 300)
    return () => clearTimeout(timer)
  }, [currentIndex])

  useEffect(() => {
    if (drawerVisible) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [drawerVisible])

  function handleAnswer(answer) {
    const newAnswers = { ...answers, [currentItem.id]: answer }
    setAnswers(newAnswers)
    setDrawerVisible(false)

    if (currentIndex + 1 >= total) {
      setTimeout(() => setDone(true), 400)
    } else {
      setTimeout(() => {
        setCurrentIndex(i => i + 1)
        setCustomInput('')
        setDrawerVisible(true)
      }, 350)
    }
  }

  function handleCustomSubmit(e) {
    e.preventDefault()
    if (customInput.trim()) handleAnswer(customInput.trim())
  }

  // Done screen
  if (done) {
    return (
      <div className="flex flex-col min-h-svh max-w-md mx-auto w-full px-5 pt-14 pb-8">
        {/* Progress — full */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-xs">All done</span>
            <span className="text-violet-400 text-xs font-semibold">100%</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700 ease-out w-full" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center mb-6">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M8 18l7 7 13-13" stroke="url(#g)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="g" x1="8" y1="18" x2="28" y2="18" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8b5cf6"/>
                  <stop offset="1" stopColor="#d946ef"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Your list is refined!</h2>
          <p className="text-white/40 text-sm mb-8">Here's your prioritized task list</p>

          <div className="w-full space-y-2 text-left">
            {items.map((item, i) => (
              <div key={item.id} className="fade-in flex items-start gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3.5" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/85 text-sm">{item.text}</p>
                  {answers[item.id] && (
                    <p className="text-violet-400/70 text-xs mt-0.5">{answers[item.id]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button className="w-full py-4 rounded-2xl font-semibold text-base bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white transition-all duration-200">
            Save & Export
          </button>
          <button
            onClick={onBack}
            className="w-full py-3 rounded-2xl font-medium text-sm text-white/40 hover:text-white/70 transition-colors duration-150"
          >
            Start over
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-svh max-w-md mx-auto w-full relative">
      {/* Main content */}
      <div className="flex-1 px-5 pt-14 pb-60">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-xs">
              {currentIndex + 1} of {total}
            </span>
            <span
              className="text-xs font-semibold transition-colors duration-300"
              style={{ color: `hsl(${260 + progressFinal * 0.6}, 80%, ${65 + progressFinal * 0.1}%)` }}
            >
              {progressFinal}%
            </span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressFinal}%`,
                background: `linear-gradient(90deg, #8b5cf6 0%, #d946ef ${progressFinal}%)`,
                boxShadow: `0 0 ${8 + progressFinal * 0.2}px rgba(139,92,246,${0.3 + progressFinal * 0.004})`,
              }}
            />
          </div>
          {progressFinal >= 50 && (
            <p className="text-violet-400/60 text-xs mt-1.5 text-right fade-in">Almost there!</p>
          )}
        </div>

        {/* Items overview */}
        <div className="space-y-2">
          {items.map((item, i) => {
            const isDone = i < currentIndex
            const isCurrent = i === currentIndex
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                  isCurrent
                    ? 'bg-violet-500/10 border border-violet-500/30'
                    : isDone
                    ? 'bg-white/3 border border-white/5 opacity-50'
                    : 'bg-white/3 border border-white/5 opacity-30'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                  isDone
                    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                    : isCurrent
                    ? 'border-2 border-violet-400 animate-pulse'
                    : 'border-2 border-white/15'
                }`}>
                  {isDone && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={`text-sm flex-1 ${isCurrent ? 'text-white' : 'text-white/50'}`}>{item.text}</span>
                {isDone && answers[item.id] && (
                  <span className="text-violet-400/60 text-xs">{answers[item.id]}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Drawer */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md transition-all duration-400 ease-out ${
          drawerVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{ transform: `translateX(-50%) translateY(${drawerVisible ? '0' : '100%'})` }}
      >
        <div className="bg-[#13131a] border-t border-white/10 rounded-t-3xl px-5 pt-5 pb-6 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
          {/* Drag indicator */}
          <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-5" />

          {/* AI Label */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M5.5 1.5c0 0 .8 2 2 2.5s2.5.5 2.5.5-2 .8-2.5 2-0.5 2.5-.5 2.5-.8-2-2-2.5S3 6 3 6s2-.8 2.5-2 0-2.5 0-2.5z" fill="white"/>
              </svg>
            </div>
            <span className="text-white/50 text-xs font-medium">AI suggestion</span>
          </div>

          {/* Question */}
          {prompt && (
            <p className="text-white font-medium text-base mb-4 leading-snug">
              {prompt.question}
            </p>
          )}

          {/* Suggestion buttons grid */}
          {prompt && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {prompt.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleAnswer(suggestion)}
                  className="py-2.5 px-4 rounded-xl bg-white/6 border border-white/10 hover:bg-violet-500/15 hover:border-violet-500/40 text-white/80 hover:text-white text-sm font-medium transition-all duration-150 text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/25 text-xs">or type your own</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Custom input */}
          <form onSubmit={handleCustomSubmit}>
            <div className="flex items-center gap-3 bg-white/6 border border-white/12 focus-within:border-violet-500/50 focus-within:bg-white/8 rounded-xl px-4 py-3 transition-all duration-200">
              <input
                ref={inputRef}
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder="Custom answer..."
                className="flex-1 bg-transparent text-white placeholder-white/25 text-sm"
              />
              <button
                type="submit"
                disabled={!customInput.trim()}
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                  customInput.trim()
                    ? 'bg-violet-500 hover:bg-violet-400 text-white'
                    : 'bg-white/5 text-white/20'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
