import { useState, useRef, useEffect } from 'react'
import {
  CheckCircle, Stars01, ArrowNarrowRight, CheckDone01,
  Send01, RefreshCw01, ZapCircle, ArrowRight
} from 'untitledui-js/react'

/* ── Product-specific suggestion map ── */
const PRODUCT_MAP = [
  // Vegetables
  { match: /paprika|bell pepper|capsicum/,          q: 'Which colour?',        s: ['Red', 'Yellow', 'Green', 'Orange'] },
  { match: /tomaat|tomato|tomaten/,                  q: 'Which type?',          s: ['Cherry', 'Vine', 'Roma', 'Beef'] },
  { match: /sla|lettuce|salade/,                     q: 'Which type?',          s: ['Iceberg', 'Romaine', 'Spinach', 'Rucola'] },
  { match: /ui|onion/,                               q: 'Which onion?',         s: ['Yellow', 'Red', 'White', 'Spring'] },
  { match: /kool|cabbage/,                           q: 'Which type?',          s: ['White', 'Red', 'Broccoli', 'Savoy'] },
  { match: /mushroom|champignon|paddestoel/,         q: 'Which type?',          s: ['Button', 'Portobello', 'Shiitake', 'Oyster'] },
  { match: /courgette|zucchini/,                     q: 'Which size?',          s: ['Small', 'Medium', 'Large', 'Mixed'] },
  { match: /appel|apple/,                            q: 'Which variety?',       s: ['Granny Smith', 'Fuji', 'Gala', 'Golden'] },
  { match: /peer|pear/,                              q: 'Which variety?',       s: ['Conference', 'Doyenné', 'Gieser', 'Williams'] },
  { match: /druif|grape/,                            q: 'Which type?',          s: ['Green', 'Red', 'Blue', 'Seedless'] },
  { match: /aardbei|strawberr/,                      q: 'How much?',            s: ['250g', '500g', '1 kg', 'Punnet'] },
  { match: /banaan|banana/,                          q: 'How ripe?',            s: ['Green', 'Yellow', 'Ripe', 'Organic'] },

  // Dairy
  { match: /melk|milk/,                              q: 'Which milk?',          s: ['Full fat', 'Semi-skimmed', 'Skimmed', 'Oat milk'] },
  { match: /kaas|cheese/,                            q: 'Which cheese?',        s: ['Gouda', 'Edam', 'Brie', 'Mozzarella'] },
  { match: /yoghurt|yogurt/,                         q: 'Which type?',          s: ['Plain', 'Greek', 'Skyr', 'Fruit'] },
  { match: /boter|butter/,                           q: 'Which type?',          s: ['Salted', 'Unsalted', 'Light', 'Plant-based'] },
  { match: /room|cream/,                             q: 'Which cream?',         s: ['Single', 'Double', 'Sour', 'Whipping'] },
  { match: /ei|eggs?/,                               q: 'Which eggs?',          s: ['Free range', 'Organic', 'Medium', 'Large'] },

  // Bread & bakery
  { match: /brood|bread/,                            q: 'Which bread?',         s: ['White', 'Brown', 'Volkoren', 'Vita plus'] },
  { match: /baguette/,                               q: 'How many?',            s: ['1', '2', '3', '4'] },
  { match: /croissant/,                              q: 'Which type?',          s: ['Plain', 'Butter', 'Chocolate', 'Almond'] },
  { match: /beschuit|rusk/,                          q: 'Which type?',          s: ['Regular', 'Wholegrain', 'Mini', 'Gluten-free'] },

  // Meat & fish
  { match: /kip|chicken/,                            q: 'Which cut?',           s: ['Breast', 'Thigh', 'Drumstick', 'Whole'] },
  { match: /gehakt|mince|ground/,                    q: 'Which meat?',          s: ['Beef', 'Pork', 'Mixed', 'Turkey'] },
  { match: /vlees|beef|steak/,                       q: 'Which cut?',           s: ['Sirloin', 'Ribeye', 'Rump', 'Fillet'] },
  { match: /worst|sausage/,                          q: 'Which type?',          s: ['Pork', 'Chicken', 'Veggie', 'Chorizo'] },
  { match: /vis|fish|zalm|salmon/,                   q: 'Which fish?',          s: ['Salmon', 'Cod', 'Tuna', 'Tilapia'] },
  { match: /tonijn|tuna/,                            q: 'Which type?',          s: ['In water', 'In oil', 'Fresh', 'Smoked'] },
  { match: /garnaal|shrimp|prawn/,                   q: 'Which size?',          s: ['Small', 'Medium', 'King', 'Cooked'] },

  // Pasta, rice & grains
  { match: /pasta|spaghetti|penne|fusilli/,          q: 'Which pasta?',         s: ['Spaghetti', 'Penne', 'Fusilli', 'Tagliatelle'] },
  { match: /rijst|rice/,                             q: 'Which rice?',          s: ['Basmati', 'Jasmine', 'Brown', 'Risotto'] },
  { match: /aardappel|potato|aardappelen/,           q: 'Which type?',          s: ['Waxy', 'Floury', 'Sweet potato', 'Baby'] },
  { match: /noedel|noodle/,                          q: 'Which noodle?',        s: ['Egg', 'Rice', 'Udon', 'Soba'] },

  // Drinks
  { match: /sap|juice/,                              q: 'Which juice?',         s: ['Orange', 'Apple', 'Tropical', 'Tomato'] },
  { match: /water/,                                  q: 'Which water?',         s: ['Still', 'Sparkling', 'Flavoured', 'Mineral'] },
  { match: /koffie|coffee/,                          q: 'Which type?',          s: ['Beans', 'Ground', 'Pods', 'Instant'] },
  { match: /thee|tea/,                               q: 'Which tea?',           s: ['Black', 'Green', 'Herbal', 'Fruit'] },
  { match: /bier|beer/,                              q: 'Which beer?',          s: ['Lager', 'IPA', 'Wheat', 'Non-alcoholic'] },
  { match: /wijn|wine/,                              q: 'Which wine?',          s: ['Red', 'White', 'Rosé', 'Sparkling'] },

  // Canned & packaged
  { match: /soep|soup/,                              q: 'Which soup?',          s: ['Tomato', 'Chicken', 'Mushroom', 'Minestrone'] },
  { match: /bonen|beans/,                            q: 'Which beans?',         s: ['White', 'Black', 'Kidney', 'Chickpeas'] },
  { match: /chips|crisps/,                           q: 'Which flavour?',       s: ['Plain', 'Salt & vinegar', 'Paprika', 'Cheese'] },
  { match: /koek|cookie|biscuit/,                    q: 'Which type?',          s: ['Chocolate chip', 'Speculaas', 'Digestive', 'Oreo'] },
  { match: /chocola|chocolate/,                      q: 'Which chocolate?',     s: ['Dark', 'Milk', 'White', 'Baking'] },
  { match: /jam|jelly|confiture/,                    q: 'Which flavour?',       s: ['Strawberry', 'Raspberry', 'Apricot', 'Mixed berry'] },
  { match: /pindakaas|peanut butter/,                q: 'Which type?',          s: ['Smooth', 'Crunchy', 'Light', 'Organic'] },
  { match: /olie|oil/,                               q: 'Which oil?',           s: ['Olive', 'Sunflower', 'Coconut', 'Vegetable'] },

  // Cleaning & household
  { match: /wasmiddel|detergent|laundry/,            q: 'Which format?',        s: ['Liquid', 'Pods', 'Powder', 'Fabric softener'] },
  { match: /shampoo/,                                q: 'Which type?',          s: ['Normal', 'Dry', 'Oily', 'Colour protect'] },
  { match: /tandpasta|toothpaste/,                   q: 'Which type?',          s: ['Whitening', 'Sensitive', 'Fresh mint', 'Total care'] },
]

/* ── AI prompt resolver ── */
function getAIPrompt(itemText) {
  const text = itemText.toLowerCase().trim()

  // Try product-specific match first
  for (const entry of PRODUCT_MAP) {
    if (entry.match.test(text)) {
      return { question: entry.q, suggestions: entry.s }
    }
  }

  // Fallback: ask for quantity/clarification generically
  return {
    question: 'Any details to add?',
    suggestions: ['Small pack', 'Large pack', 'Organic', 'Store brand'],
  }
}

const TOTAL_STEPS = 2
const quantityPrompt = { question: 'How many?', suggestions: ['1', '2', '3', '4'] }

export default function RefinementScreen({ items, onBack }) {
  const [currentIndex, setCurrentIndex]   = useState(0)
  const [currentStep, setCurrentStep]     = useState(0)
  const [answers, setAnswers]             = useState({})
  const [customInput, setCustomInput]     = useState('')
  const [drawerOpen, setDrawerOpen]       = useState(false)
  const [done, setDone]                   = useState(false)
  const inputRef = useRef(null)

  const total        = items.length
  const totalSteps   = total * TOTAL_STEPS
  const stepsCompleted = currentIndex * TOTAL_STEPS + currentStep
  const progress     = done ? 100 : Math.round((stepsCompleted / totalSteps) * 100)
  const currentItem  = items[currentIndex]
  const detailPrompt = currentItem ? getAIPrompt(currentItem.text) : null
  const activePrompt = currentStep === 0 ? detailPrompt : quantityPrompt

  /* Open drawer after mount / step change */
  useEffect(() => {
    const t = setTimeout(() => setDrawerOpen(true), 250)
    return () => clearTimeout(t)
  }, [currentIndex, currentStep])

  /* Focus input when drawer opens */
  useEffect(() => {
    if (drawerOpen) setTimeout(() => inputRef.current?.focus(), 150)
  }, [drawerOpen])

  function handleAnswer(answer) {
    setDrawerOpen(false)
    setCustomInput('')

    if (currentStep === 0) {
      setAnswers(prev => ({ ...prev, [currentItem.id]: { detail: answer, quantity: '' } }))
      setTimeout(() => setCurrentStep(1), 300)
    } else {
      setAnswers(prev => ({ ...prev, [currentItem.id]: { ...prev[currentItem.id], quantity: answer } }))
      if (currentIndex + 1 >= total) {
        setTimeout(() => setDone(true), 350)
      } else {
        setTimeout(() => {
          setCurrentIndex(i => i + 1)
          setCurrentStep(0)
        }, 300)
      }
    }
  }

  function handleCustomSubmit(e) {
    e.preventDefault()
    if (customInput.trim()) handleAnswer(customInput.trim())
  }

  /* ── Done screen ── */
  if (done) {
    return (
      <div style={pageStyle}>
        {/* Progress — full */}
        <ProgressBar progress={100} current={total} total={total} done />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: 'var(--spacing-5xl)' }}>
          {/* Success icon */}
          <div style={{
            width: '80px', height: '80px',
            borderRadius: 'var(--radius-3xl)',
            background: 'linear-gradient(135deg, rgba(127,86,217,0.15), rgba(103,65,198,0.15))',
            border: '1px solid rgba(127,86,217,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 'var(--spacing-3xl)',
          }}>
            <CheckDone01 size={36} color="var(--color-brand-400)" />
          </div>

          <h2 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'var(--font-size-display-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            lineHeight: 'var(--line-height-display-xs)',
            letterSpacing: 'var(--letter-spacing-display)',
            color: 'var(--colors-fg-primary)',
            marginBottom: 'var(--spacing-md)',
            textAlign: 'center',
          }}>Your list is refined!</h2>

          <p style={{
            fontSize: 'var(--font-size-text-md)',
            color: 'var(--colors-fg-tertiary)',
            marginBottom: 'var(--spacing-5xl)',
            textAlign: 'center',
          }}>Here's your prioritised task list</p>

          {/* Refined items */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {items.map((item, i) => (
              <div
                key={item.id}
                className="uui-fade-in"
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-lg)',
                  background: 'var(--colors-bg-secondary)',
                  border: '1px solid var(--colors-border-secondary)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--spacing-lg) var(--spacing-xl)',
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <CheckCircle size={20} color="var(--color-brand-500)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 'var(--font-size-text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--colors-fg-secondary)' }}>
                    {item.text}
                  </p>
                  {answers[item.id] && (
                    <p style={{ fontSize: 'var(--font-size-text-xs)', color: 'var(--colors-fg-brand-secondary)', marginTop: 'var(--spacing-xxs)' }}>
                      {[answers[item.id].detail, answers[item.id].quantity].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <PrimaryButton icon={<Send01 size={18} color="var(--colors-fg-white)" />}>
            Send to Shopper
          </PrimaryButton>
          <button
            onClick={onBack}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--font-size-text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--colors-fg-quinary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--colors-fg-tertiary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--colors-fg-quinary)'}
          >
            <RefreshCw01 size={14} color="currentColor" />
            Start over
          </button>
        </div>
      </div>
    )
  }

  /* ── Refinement screen ── */
  return (
    <div style={{ ...pageStyle, position: 'relative' }}>
      {/* Progress */}
      <ProgressBar progress={progress} current={stepsCompleted + 1} total={totalSteps} />

      {/* Items overview */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '280px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {items.map((item, i) => {
            const isDone    = i < currentIndex
            const isCurrent = i === currentIndex
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--spacing-lg) var(--spacing-xl)',
                  border: '1px solid',
                  borderColor: isCurrent ? 'var(--colors-border-brand)' : 'var(--colors-border-secondary)',
                  background: isCurrent
                    ? 'rgba(127,86,217,0.06)'
                    : isDone
                    ? 'var(--colors-bg-secondary)'
                    : 'var(--colors-bg-tertiary)',
                  opacity: !isCurrent && !isDone ? 0.4 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Status dot */}
                {isDone ? (
                  <CheckCircle size={20} color="var(--color-brand-500)" style={{ flexShrink: 0 }} />
                ) : isCurrent ? (
                  <div style={{
                    width: '20px', height: '20px', flexShrink: 0,
                    borderRadius: 'var(--radius-full)',
                    border: '2px solid var(--color-brand-500)',
                    animation: 'uui-pulse-brand 2s ease-in-out infinite',
                  }} />
                ) : (
                  <div style={{
                    width: '20px', height: '20px', flexShrink: 0,
                    borderRadius: 'var(--radius-full)',
                    border: '2px solid var(--colors-border-primary)',
                  }} />
                )}

                <span style={{
                  flex: 1,
                  fontSize: 'var(--font-size-text-sm)',
                  fontWeight: isCurrent ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                  color: isCurrent ? 'var(--colors-fg-primary)' : isDone ? 'var(--colors-fg-tertiary)' : 'var(--colors-fg-quinary)',
                }}>
                  {item.text}
                </span>

                {isDone && answers[item.id] && (
                  <span style={{
                    fontSize: 'var(--font-size-text-xs)',
                    color: 'var(--colors-fg-brand-secondary)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}>
                    {[answers[item.id].detail, answers[item.id].quantity].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Bottom Drawer ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          width: '100%',
          maxWidth: '448px',
          transform: `translateX(-50%) translateY(${drawerOpen ? '0' : '100%'})`,
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 10,
        }}
      >
        <div style={{
          background: 'var(--colors-bg-secondary)',
          borderTop: '1px solid var(--colors-border-primary)',
          borderRadius: `var(--radius-3xl) var(--radius-3xl) 0 0`,
          padding: 'var(--spacing-2xl) var(--spacing-2xl) var(--spacing-4xl)',
          boxShadow: 'var(--shadow-2xl)',
        }}>
          {/* Handle */}
          <div style={{
            width: '40px', height: '4px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--colors-border-primary)',
            margin: `0 auto var(--spacing-2xl)`,
          }} />

          {/* AI label + product chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)',
          }}>
            <div style={{
              width: '24px', height: '24px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-800))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Stars01 size={13} color="var(--colors-fg-white)" />
            </div>
            <span style={{
              fontSize: 'var(--font-size-text-xs)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--colors-fg-tertiary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              AI suggestion
            </span>
            {currentItem && (
              <span style={{
                fontSize: 'var(--font-size-text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--colors-fg-brand-primary)',
                background: 'rgba(127,86,217,0.12)',
                border: '1px solid rgba(127,86,217,0.2)',
                borderRadius: 'var(--radius-full)',
                padding: '2px 10px',
                marginLeft: 'auto',
              }}>
                {currentItem.text}
              </span>
            )}
          </div>

          {/* Question */}
          {activePrompt && (
            <p style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--font-size-text-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              lineHeight: 'var(--line-height-text-lg)',
              color: 'var(--colors-fg-primary)',
              marginBottom: 'var(--spacing-xl)',
            }}>
              {activePrompt.question}
            </p>
          )}

          {/* Suggestion grid */}
          {activePrompt && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-xl)',
            }}>
              {activePrompt.suggestions.map((suggestion) => (
                <SuggestionButton
                  key={suggestion}
                  label={suggestion}
                  onClick={() => handleAnswer(suggestion)}
                />
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="uui-divider" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div className="uui-divider-line" />
            <span className="uui-divider-label">or type your own</span>
            <div className="uui-divider-line" />
          </div>

          {/* Custom input */}
          <form onSubmit={handleCustomSubmit}>
            <div className="uui-input-wrapper">
              <input
                ref={inputRef}
                className="uui-input"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder="Custom answer..."
                style={{ fontSize: 'var(--font-size-text-sm)' }}
              />
              <button
                type="submit"
                disabled={!customInput.trim()}
                style={{
                  width: '32px', height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: customInput.trim()
                    ? 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-700))'
                    : 'var(--colors-bg-tertiary)',
                  border: 'none',
                  cursor: customInput.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.15s ease',
                }}
                aria-label="Submit"
              >
                <ArrowNarrowRight
                  size={16}
                  color={customInput.trim() ? 'var(--colors-fg-white)' : 'var(--colors-fg-disabled)'}
                />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ── Shared sub-components ── */

function ProgressBar({ progress, current, total, done }) {
  return (
    <div style={{ marginBottom: 'var(--spacing-4xl)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 'var(--spacing-md)',
      }}>
        <span style={{
          fontSize: 'var(--font-size-text-xs)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--colors-fg-quinary)',
        }}>
          {done ? 'All done' : `${current} of ${total}`}
        </span>
        <span style={{
          fontSize: 'var(--font-size-text-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          color: progress >= 50 ? 'var(--color-brand-400)' : 'var(--colors-fg-tertiary)',
          transition: 'color 0.3s ease',
        }}>
          {progress}%
        </span>
      </div>

      {/* Track */}
      <div style={{
        height: '6px',
        background: 'var(--colors-bg-tertiary)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
      }}>
        {/* Fill */}
        <div style={{
          height: '100%',
          width: `${progress}%`,
          borderRadius: 'var(--radius-full)',
          background: `linear-gradient(90deg, var(--color-brand-700) 0%, var(--color-brand-500) 100%)`,
          boxShadow: progress > 0 ? `0 0 ${6 + progress * 0.12}px rgba(127,86,217,${0.3 + progress * 0.003})` : 'none',
          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
      </div>

      {progress >= 50 && !done && (
        <p style={{
          fontSize: 'var(--font-size-text-xs)',
          color: 'var(--color-brand-400)',
          marginTop: 'var(--spacing-sm)',
          textAlign: 'right',
          opacity: 0.8,
        }}
        className="uui-fade-in"
        >
          Almost there!
        </p>
      )}
    </div>
  )
}

function SuggestionButton({ label, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 'var(--spacing-md) var(--spacing-xl)',
        borderRadius: 'var(--radius-xl)',
        background: hovered ? 'rgba(127,86,217,0.12)' : 'var(--colors-bg-tertiary)',
        border: `1px solid ${hovered ? 'var(--colors-border-brand)' : 'var(--colors-border-primary)'}`,
        cursor: 'pointer',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--font-size-text-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color: hovered ? 'var(--colors-fg-primary)' : 'var(--colors-fg-secondary)',
        textAlign: 'left',
        transition: 'all 0.15s ease',
        boxShadow: hovered ? 'var(--shadow-brand)' : 'none',
      }}
    >
      {label}
    </button>
  )
}

function PrimaryButton({ children, icon, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="uui-pulse-brand"
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-lg) var(--spacing-3xl)',
        borderRadius: 'var(--radius-xl)',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--font-size-text-md)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--colors-fg-white)',
        background: `linear-gradient(135deg, var(--color-brand-600), var(--color-brand-700))`,
        opacity: hovered ? 0.9 : 1,
        transform: hovered ? 'translateY(-1px)' : 'none',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
      }}
    >
      {children}
      {icon}
    </button>
  )
}

/* ── Layout helper ── */
const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100svh',
  maxWidth: '448px',
  margin: '0 auto',
  width: '100%',
  padding: `var(--spacing-7xl) var(--spacing-2xl) var(--spacing-4xl)`,
}
