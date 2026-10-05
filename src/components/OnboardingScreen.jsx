import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion as Motion } from 'motion/react'
import {
  ArrowLeft, ArrowRight, Check, CheckDone01, List, Stars01,
  ShoppingCart01, Calendar, Home02, Gift01, Zap,
  User01, Users01, Users03,
} from 'untitledui-js/react'
import {
  GOALS, HOUSEHOLD_SIZES, PRODUCT_PREFS, DIETS,
  emptyProfile, labelFor, quantitySuggestions,
} from '../profile'
import { mergeCopy, fill, ONBOARDING_STEPS as STEPS, QUESTION_STEPS } from '../onboardingCopy'


const GOAL_ICONS = {
  groceries: ShoppingCart01,
  'meal-prep': Calendar,
  household: Home02,
  events: Gift01,
  errands: Zap,
}

const HOUSEHOLD_ICONS = {
  '1': User01,
  '2': Users01,
  '3-4': Users03,
  '5+': Home02,
}

const arrowIcon = <ArrowRight size={18} color="var(--colors-fg-white)" />

const slide = {
  enter:  dir => ({ opacity: 0, x: dir * 32 }),
  center: { opacity: 1, x: 0 },
  exit:   dir => ({ opacity: 0, x: dir * -32 }),
}

export default function OnboardingScreen({ initialProfile, initialStep, copy: copyOverrides, embedded, onComplete }) {
  const [stepIndex, setStepIndex] = useState(() => {
    const start = initialStep ?? (initialProfile ? 'name' : 'welcome')
    return Math.max(STEPS.indexOf(start), 0)
  })
  const [direction, setDirection] = useState(1)
  const [profile, setProfile]     = useState({ ...emptyProfile, ...initialProfile })

  const copy = mergeCopy(copyOverrides)
  const name = profile.name.trim()
  const step = STEPS[stepIndex]
  const questionIndex = QUESTION_STEPS.indexOf(step)

  function go(delta) {
    setDirection(delta)
    setStepIndex(i => Math.min(Math.max(i + delta, 0), STEPS.length - 1))
  }

  function update(patch) {
    setProfile(p => ({ ...p, ...patch }))
  }

  function toggle(key, id) {
    setProfile(p => ({
      ...p,
      [key]: p[key].includes(id) ? p[key].filter(x => x !== id) : [...p[key], id],
    }))
  }

  function finish() {
    onComplete({ ...profile, name: profile.name.trim(), completedAt: new Date().toISOString() })
  }

  const canContinue = {
    name: profile.name.trim().length > 0,
    goals: profile.goals.length > 0,
    household: !!profile.household,
    preferences: !!profile.productPref,
  }[step] ?? true

  return (
    <div style={pageStyle}>
      {questionIndex >= 0 && (
        <StepHeader
          current={questionIndex}
          total={QUESTION_STEPS.length}
          copy={copy.common}
          onBack={() => go(-1)}
          onSkip={finish}
        />
      )}

      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <Motion.div
          key={step}
          custom={direction}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {step === 'welcome' && (
            <WelcomeStep copy={copy.welcome} onStart={() => go(1)} onSkip={finish} />
          )}

          {step === 'intro' && (
            <IntroStep copy={copy.intro} onContinue={() => go(1)} onBack={() => go(-1)} />
          )}

          {step === 'name' && (
            <QuestionLayout
              title={fill(copy.name.title, { name })}
              subtitle={fill(copy.name.subtitle, { name })}
              footer={<PrimaryButton disabled={!canContinue} onClick={() => go(1)} icon={arrowIcon}>{copy.common.continue}</PrimaryButton>}
            >
              <NameInput
                autoFocus={!embedded}
                placeholder={copy.name.placeholder}
                value={profile.name}
                onChange={name => update({ name })}
                onSubmit={() => canContinue && go(1)}
              />
            </QuestionLayout>
          )}

          {step === 'goals' && (
            <QuestionLayout
              title={fill(copy.goals.title, { name })}
              subtitle={fill(copy.goals.subtitle, { name })}
              footer={<PrimaryButton disabled={!canContinue} onClick={() => go(1)} icon={arrowIcon}>{copy.common.continue}</PrimaryButton>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {GOALS.map((goal, i) => (
                  <OptionRow
                    key={goal.id}
                    index={i}
                    icon={GOAL_ICONS[goal.id]}
                    label={goal.label}
                    selected={profile.goals.includes(goal.id)}
                    multi
                    onClick={() => toggle('goals', goal.id)}
                  />
                ))}
              </div>
            </QuestionLayout>
          )}

          {step === 'household' && (
            <QuestionLayout
              title={fill(copy.household.title, { name })}
              subtitle={fill(copy.household.subtitle, { name })}
              footer={<PrimaryButton disabled={!canContinue} onClick={() => go(1)} icon={arrowIcon}>{copy.common.continue}</PrimaryButton>}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                {HOUSEHOLD_SIZES.map((size, i) => (
                  <OptionTile
                    key={size.id}
                    index={i}
                    icon={HOUSEHOLD_ICONS[size.id]}
                    label={size.label}
                    hint={fill(copy.household.hint, { quantities: quantitySuggestions({ household: size.id }).join(', ') })}
                    selected={profile.household === size.id}
                    onClick={() => update({ household: size.id })}
                  />
                ))}
              </div>
            </QuestionLayout>
          )}

          {step === 'preferences' && (
            <QuestionLayout
              title={fill(copy.preferences.title, { name })}
              subtitle={fill(copy.preferences.subtitle, { name })}
              footer={<PrimaryButton disabled={!canContinue} onClick={() => go(1)}>{copy.preferences.cta}</PrimaryButton>}
            >
              <FieldLabel>{copy.preferences.productLabel}</FieldLabel>
              <div style={chipWrap}>
                {PRODUCT_PREFS.map(pref => (
                  <Chip
                    key={pref.id}
                    label={pref.label}
                    selected={profile.productPref === pref.id}
                    onClick={() => update({ productPref: pref.id })}
                  />
                ))}
              </div>

              <FieldLabel optional={copy.preferences.optional}>{copy.preferences.dietLabel}</FieldLabel>
              <div style={chipWrap}>
                {DIETS.map(diet => (
                  <Chip
                    key={diet.id}
                    label={diet.label}
                    selected={profile.diet.includes(diet.id)}
                    multi
                    onClick={() => toggle('diet', diet.id)}
                  />
                ))}
              </div>
            </QuestionLayout>
          )}

          {step === 'done' && (
            <DoneStep copy={copy.done} profile={profile} onFinish={finish} onEdit={() => go(-QUESTION_STEPS.length)} />
          )}
        </Motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ── Steps ── */

function WelcomeStep({ copy, onStart, onSkip }) {
  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <HeroPreview />

        <div className="uui-badge uui-badge-brand" style={{ marginBottom: 'var(--spacing-xl)', alignSelf: 'flex-start' }}>
          <span style={pulseDot} />
          {copy.badge}
        </div>

        <h1 style={displayHeading}>
          {copy.titleStart}{' '}
          <span style={gradientText}>{copy.titleHighlight}</span>
        </h1>

        <p style={bodyText}>{copy.body}</p>
      </div>

      <div style={footerStyle}>
        <PrimaryButton pulse onClick={onStart} icon={<ArrowRight size={18} color="var(--colors-fg-white)" />}>
          {copy.cta}
        </PrimaryButton>
        <GhostButton onClick={onSkip}>{copy.skip}</GhostButton>
      </div>
    </>
  )
}

function IntroStep({ copy, onContinue, onBack }) {
  const points = [
    { icon: List,        title: copy.step1Title, body: copy.step1Body },
    { icon: Stars01,     title: copy.step2Title, body: copy.step2Body },
    { icon: CheckDone01, title: copy.step3Title, body: copy.step3Body },
  ]

  return (
    <>
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <IconButton onClick={onBack} label="Back"><ArrowLeft size={18} color="var(--colors-fg-tertiary)" /></IconButton>
      </div>

      <div style={{ flex: 1 }}>
        <h1 style={{ ...displayHeading, marginBottom: 'var(--spacing-md)' }}>{copy.title}</h1>
        <p style={{ ...bodyText, marginBottom: 'var(--spacing-5xl)' }}>{copy.subtitle}</p>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3xl)' }}>
          {/* Connector line between the step icons */}
          <div style={{
            position: 'absolute', left: '23px', top: '48px', bottom: '48px', width: '2px',
            background: 'linear-gradient(180deg, var(--color-brand-700), var(--colors-border-secondary))',
          }} />

          {points.map(({ icon: pointIcon, title, body }, i) => (
            <Motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
              style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'flex-start', position: 'relative' }}
            >
              <div style={{
                width: '48px', height: '48px', flexShrink: 0,
                borderRadius: 'var(--radius-xl)',
                background: 'var(--colors-bg-secondary)',
                border: '1px solid var(--colors-border-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <StepIcon icon={pointIcon} />
              </div>
              <div style={{ paddingTop: 'var(--spacing-xs)' }}>
                <p style={{
                  fontSize: 'var(--font-size-text-md)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--colors-fg-primary)',
                  marginBottom: 'var(--spacing-xxs)',
                }}>
                  <span style={{ color: 'var(--colors-fg-quaternary)', marginRight: 'var(--spacing-md)' }}>{i + 1}</span>
                  {title}
                </p>
                <p style={{ fontSize: 'var(--font-size-text-sm)', lineHeight: 'var(--line-height-text-sm)', color: 'var(--colors-fg-tertiary)' }}>
                  {body}
                </p>
              </div>
            </Motion.div>
          ))}
        </div>
      </div>

      <div style={footerStyle}>
        <PrimaryButton onClick={onContinue} icon={<ArrowRight size={18} color="var(--colors-fg-white)" />}>
          {copy.cta}
        </PrimaryButton>
      </div>
    </>
  )
}

function DoneStep({ copy, profile, onFinish, onEdit }) {
  const name = profile.name.trim()
  const rows = [
    [copy.rowGoals,     profile.goals.map(id => labelFor(GOALS, id)).join(', ')],
    [copy.rowHousehold, labelFor(HOUSEHOLD_SIZES, profile.household)],
    [copy.rowProduct,   labelFor(PRODUCT_PREFS, profile.productPref)],
    [copy.rowDiet,      profile.diet.map(id => labelFor(DIETS, id)).join(', ') || copy.noDiet],
  ].filter(([, value]) => value)

  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          style={{
            width: '80px', height: '80px',
            borderRadius: 'var(--radius-3xl)',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-brand-600) 15%, transparent), color-mix(in srgb, var(--color-brand-700) 15%, transparent))',
            border: '1px solid color-mix(in srgb, var(--color-brand-600) 25%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 'var(--spacing-3xl)',
          }}
        >
          <CheckDone01 size={36} color="var(--color-brand-400)" />
        </Motion.div>

        <h1 style={{ ...displayHeading, fontSize: 'var(--font-size-display-xs)', lineHeight: 'var(--line-height-display-xs)', textAlign: 'center' }}>
          {fill(copy.title, { name })}
        </h1>
        <p style={{ ...bodyText, textAlign: 'center', marginBottom: 'var(--spacing-4xl)' }}>
          {fill(copy.subtitle, { name })}
        </p>

        {rows.length > 0 && (
          <div style={{
            width: '100%',
            background: 'var(--colors-bg-secondary)',
            border: '1px solid var(--colors-border-secondary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-xs) var(--spacing-xl)',
          }}>
            {rows.map(([label, value], i) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-xl)',
                padding: 'var(--spacing-lg) 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--colors-border-secondary)',
                fontSize: 'var(--font-size-text-sm)',
              }}>
                <span style={{ color: 'var(--colors-fg-quaternary)', flexShrink: 0 }}>{label}</span>
                <span style={{ color: 'var(--colors-fg-secondary)', fontWeight: 'var(--font-weight-medium)', textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={footerStyle}>
        <PrimaryButton pulse onClick={onFinish} icon={<ArrowRight size={18} color="var(--colors-fg-white)" />}>
          {copy.cta}
        </PrimaryButton>
        <GhostButton onClick={onEdit}>{copy.edit}</GhostButton>
      </div>
    </>
  )
}

/* ── Building blocks ── */

function StepIcon({ icon }) {
  const Icon = icon
  return <Icon size={22} color="var(--color-brand-400)" />
}

function HeroPreview() {
  return (
    <div style={{ position: 'relative', height: '200px', marginBottom: 'var(--spacing-5xl)' }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', inset: '20px 40px',
        background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-brand-600) 35%, transparent), transparent)',
        filter: 'blur(20px)',
      }} />

      {/* Back card: raw list */}
      <Motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ ...previewCard, top: 0, left: 0, right: '64px', transform: 'rotate(-2deg)', opacity: 0.7 }}
      >
        {['milk', 'tomatoes', 'coffee'].map(item => (
          <div key={item} style={previewRow}>
            <span style={previewCircle} />
            <span style={{ color: 'var(--colors-fg-tertiary)' }}>{item}</span>
          </div>
        ))}
      </Motion.div>

      {/* Front card: AI question */}
      <Motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        style={{ ...previewCard, top: '72px', left: '56px', right: 0, boxShadow: 'var(--shadow-2xl)', borderColor: 'var(--colors-border-primary)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
          <div style={{
            width: '18px', height: '18px', borderRadius: 'var(--radius-xs)',
            background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-800))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Stars01 size={10} color="var(--colors-fg-white)" />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--colors-fg-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Which milk?
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
          {['Oat milk', 'Semi-skimmed', 'Full fat'].map((s, i) => (
            <span key={s} style={{
              fontSize: 'var(--font-size-text-xs)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${i === 0 ? 'var(--colors-border-brand)' : 'var(--colors-border-primary)'}`,
              background: i === 0 ? 'color-mix(in srgb, var(--color-brand-600) 15%, transparent)' : 'var(--colors-bg-tertiary)',
              color: i === 0 ? 'var(--colors-fg-primary)' : 'var(--colors-fg-tertiary)',
            }}>{s}</span>
          ))}
        </div>
      </Motion.div>
    </div>
  )
}

function StepHeader({ current, total, copy, onBack, onSkip }) {
  return (
    <div style={{ marginBottom: 'var(--spacing-4xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)' }}>
        <IconButton onClick={onBack} label="Back"><ArrowLeft size={18} color="var(--colors-fg-tertiary)" /></IconButton>
        <span style={{ fontSize: 'var(--font-size-text-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--colors-fg-quinary)' }}>
          {fill(copy.stepLabel, { current: String(current + 1), total: String(total) })}
        </span>
        <GhostButton onClick={onSkip} compact>{copy.skip}</GhostButton>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{
            flex: 1, height: '4px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--colors-bg-tertiary)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: i <= current ? '100%' : '0%',
              background: 'linear-gradient(90deg, var(--color-brand-700), var(--color-brand-500))',
              boxShadow: i === current ? '0 0 8px color-mix(in srgb, var(--color-brand-600) 50%, transparent)' : 'none',
              transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function QuestionLayout({ title, subtitle, children, footer }) {
  return (
    <>
      <div style={{ flex: 1 }}>
        <h1 style={{ ...displayHeading, fontSize: 'var(--font-size-display-xs)', lineHeight: 'var(--line-height-display-xs)' }}>
          {title}
        </h1>
        <p style={{ ...bodyText, marginBottom: 'var(--spacing-4xl)' }}>{subtitle}</p>
        {children}
      </div>
      <div style={footerStyle}>{footer}</div>
    </>
  )
}

function NameInput({ value, placeholder, autoFocus, onChange, onSubmit }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!autoFocus) return
    const t = setTimeout(() => ref.current?.focus(), 300)
    return () => clearTimeout(t)
  }, [autoFocus])

  return (
    <div className="uui-input-wrapper" style={{ padding: 'var(--spacing-lg) var(--spacing-xl)' }}>
      <User01 size={20} color="var(--colors-fg-quaternary)" />
      <input
        ref={ref}
        className="uui-input"
        value={value}
        maxLength={40}
        autoComplete="given-name"
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit()}
        placeholder={placeholder}
      />
    </div>
  )
}

function OptionRow({ icon, label, selected, multi, onClick, index }) {
  const Icon = icon
  const [hovered, setHovered] = useState(false)
  return (
    <Motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-pressed={selected}
      style={{
        ...optionBase(selected, hovered),
        display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)',
        padding: 'var(--spacing-lg) var(--spacing-xl)',
      }}
    >
      <div style={iconTile(selected)}>
        <Icon size={18} color={selected ? 'var(--color-brand-300)' : 'var(--colors-fg-tertiary)'} />
      </div>
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      <SelectIndicator selected={selected} multi={multi} />
    </Motion.button>
  )
}

function OptionTile({ icon, label, hint, selected, onClick, index }) {
  const Icon = icon
  const [hovered, setHovered] = useState(false)
  return (
    <Motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-pressed={selected}
      style={{
        ...optionBase(selected, hovered),
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--spacing-lg)',
        padding: 'var(--spacing-xl)',
        position: 'relative',
      }}
    >
      <div style={iconTile(selected)}>
        <Icon size={18} color={selected ? 'var(--color-brand-300)' : 'var(--colors-fg-tertiary)'} />
      </div>
      <div style={{ textAlign: 'left' }}>
        <div>{label}</div>
        <div style={{ fontSize: 'var(--font-size-text-xs)', color: 'var(--colors-fg-quaternary)', fontWeight: 'var(--font-weight-regular)', marginTop: 'var(--spacing-xxs)' }}>
          {hint}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 'var(--spacing-lg)', right: 'var(--spacing-lg)' }}>
        <SelectIndicator selected={selected} />
      </div>
    </Motion.button>
  )
}

function SelectIndicator({ selected, multi }) {
  return (
    <div style={{
      width: '20px', height: '20px', flexShrink: 0,
      borderRadius: multi ? 'var(--radius-xs)' : 'var(--radius-full)',
      border: `2px solid ${selected ? 'var(--color-brand-500)' : 'var(--colors-border-primary)'}`,
      background: selected ? 'var(--color-brand-600)' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s ease',
    }}>
      {selected && <Check size={12} color="var(--colors-fg-white)" strokeWidth={3} />}
    </div>
  )
}

function Chip({ label, selected, multi, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-pressed={selected}
      style={{
        ...optionBase(selected, hovered),
        width: 'auto',
        display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)',
        padding: 'var(--spacing-md) var(--spacing-xl)',
        borderRadius: 'var(--radius-full)',
      }}
    >
      {multi && selected && <Check size={14} color="var(--color-brand-300)" strokeWidth={2.5} />}
      {label}
    </Motion.button>
  )
}

function FieldLabel({ children, optional }) {
  return (
    <p style={{
      fontSize: 'var(--font-size-text-sm)',
      fontWeight: 'var(--font-weight-medium)',
      color: 'var(--colors-fg-secondary)',
      marginBottom: 'var(--spacing-lg)',
    }}>
      {children}
      {optional && <span style={{ color: 'var(--colors-fg-quinary)', fontWeight: 'var(--font-weight-regular)' }}> · {optional}</span>}
    </p>
  )
}

function PrimaryButton({ children, icon, onClick, disabled, pulse }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={pulse && !disabled ? 'uui-pulse-brand' : ''}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-lg) var(--spacing-3xl)',
        borderRadius: 'var(--radius-xl)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--font-size-text-md)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: 'var(--line-height-text-md)',
        color: disabled ? 'var(--colors-fg-disabled)' : 'var(--colors-fg-white)',
        background: disabled
          ? 'var(--colors-bg-secondary)'
          : 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-700))',
        opacity: !disabled && hovered ? 0.9 : 1,
        transform: !disabled && hovered ? 'translateY(-1px)' : 'none',
        transition: 'opacity 0.15s ease, transform 0.15s ease, background 0.2s ease',
      }}
    >
      {children}
      {!disabled && icon}
    </button>
  )
}

function GhostButton({ children, onClick, compact }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--font-size-text-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--colors-fg-quaternary)',
        padding: compact ? 'var(--spacing-xs) var(--spacing-md)' : 'var(--spacing-md)',
        borderRadius: 'var(--radius-sm)',
        transition: 'color 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--colors-fg-secondary)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--colors-fg-quaternary)'}
    >
      {children}
    </button>
  )
}

function IconButton({ children, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: '36px', height: '36px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--colors-bg-secondary)',
        border: '1px solid var(--colors-border-secondary)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--colors-border-primary)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--colors-border-secondary)'}
    >
      {children}
    </button>
  )
}

/* ── Styles ── */

const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100svh',
  maxWidth: '448px',
  margin: '0 auto',
  width: '100%',
  padding: `var(--spacing-5xl) var(--spacing-2xl) var(--spacing-4xl)`,
  overflowX: 'hidden',
}

const footerStyle = {
  display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)',
  paddingTop: 'var(--spacing-3xl)',
}

const displayHeading = {
  fontFamily: 'var(--font-family-display)',
  fontSize: 'var(--font-size-display-sm)',
  fontWeight: 'var(--font-weight-semibold)',
  lineHeight: 'var(--line-height-display-sm)',
  letterSpacing: 'var(--letter-spacing-display)',
  color: 'var(--colors-fg-primary)',
  marginBottom: 'var(--spacing-lg)',
}

const bodyText = {
  fontSize: 'var(--font-size-text-md)',
  lineHeight: 'var(--line-height-text-md)',
  color: 'var(--colors-fg-tertiary)',
}

const gradientText = {
  background: 'linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}

const pulseDot = {
  width: '6px', height: '6px',
  borderRadius: 'var(--radius-full)',
  backgroundColor: 'var(--colors-fg-brand-primary)',
  animation: 'uui-pulse-brand 2s ease-in-out infinite',
  flexShrink: 0,
}

const chipWrap = {
  display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)',
  marginBottom: 'var(--spacing-4xl)',
}

const previewCard = {
  position: 'absolute',
  background: 'var(--colors-bg-secondary)',
  border: '1px solid var(--colors-border-secondary)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--spacing-lg) var(--spacing-xl)',
}

const previewRow = {
  display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)',
  fontSize: 'var(--font-size-text-sm)',
  padding: 'var(--spacing-xs) 0',
}

const previewCircle = {
  width: '14px', height: '14px', flexShrink: 0,
  borderRadius: 'var(--radius-full)',
  border: '2px solid var(--colors-border-brand)',
}

function optionBase(selected, hovered) {
  return {
    width: '100%',
    cursor: 'pointer',
    fontFamily: 'var(--font-family-body)',
    fontSize: 'var(--font-size-text-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: selected ? 'var(--colors-fg-primary)' : 'var(--colors-fg-secondary)',
    background: selected ? 'color-mix(in srgb, var(--color-brand-600) 10%, transparent)' : 'var(--colors-bg-secondary)',
    border: `1px solid ${selected ? 'var(--colors-border-brand)' : hovered ? 'var(--colors-border-primary)' : 'var(--colors-border-secondary)'}`,
    borderRadius: 'var(--radius-xl)',
    boxShadow: selected ? 'var(--shadow-brand)' : 'none',
    transition: 'background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease',
  }
}

function iconTile(selected) {
  return {
    width: '36px', height: '36px', flexShrink: 0,
    borderRadius: 'var(--radius-md)',
    background: selected ? 'color-mix(in srgb, var(--color-brand-600) 18%, transparent)' : 'var(--colors-bg-tertiary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s ease',
  }
}
