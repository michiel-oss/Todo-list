import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  Hand, Cursor01, Minus, Plus, Maximize01, RefreshCw01, LinkExternal01,
  Copy01, Download01, Upload01, Check,
} from 'untitledui-js/react'
import { ONBOARDING_COPY } from '../onboardingCopy'
import {
  ARTBOARDS, COLOR_GROUPS, COPY_SECTIONS_BY_STEP, FONTS, MESSAGE_TYPE,
  brandScale, changedCopy, computeVars, defaultTweaks, exportCss,
  loadTweaks, normalizeTweaks, saveTweaks, toHex,
} from './tokens'

const FRAME_W = 390
const FRAME_H = 844
const GAP = 96
const LABEL_H = 36
const MIN_SCALE = 0.1
const MAX_SCALE = 2
const PANEL_W = 340

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

/* Keeps artboard titles readable when zoomed out, without growing them past 1:1 when zoomed in. */
const labelScale = scale => 1 / clamp(scale, 0.3, 1)

export default function CanvasPage() {
  const [tweaks, setTweaksState] = useState(loadTweaks)
  const [view, setView]         = useState({ x: 0, y: 0, scale: 0.5 })
  const [tool, setTool]         = useState('hand')
  const [spaceHeld, setSpace]   = useState(false)
  const [selected, setSelected] = useState(ARTBOARDS[0].step)
  const [tab, setTab]           = useState('style')
  const [dragging, setDragging] = useState(false)
  const canvasRef = useRef(null)
  const frames    = useRef({})
  const drag      = useRef(null)

  const panning = tool === 'hand' || spaceHeld

  const setTweaks = setTweaksState

  const post = useCallback((iframe, payload) => {
    iframe?.contentWindow?.postMessage({ type: MESSAGE_TYPE, ...payload }, window.location.origin)
  }, [])

  useEffect(() => {
    saveTweaks(tweaks)
    for (const iframe of Object.values(frames.current)) post(iframe, { tweaks })
  }, [tweaks, post])

  /* ── View ── */

  const fit = useCallback(() => {
    const el = canvasRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const totalW = ARTBOARDS.length * FRAME_W + (ARTBOARDS.length - 1) * GAP
    const totalH = FRAME_H + LABEL_H
    const scale = clamp(Math.min((width - 96) / totalW, (height - 96) / totalH), MIN_SCALE, MAX_SCALE)
    setView({ scale, x: (width - totalW * scale) / 2, y: (height - totalH * scale) / 2 })
  }, [])

  useLayoutEffect(() => { fit() }, [fit])

  const zoomAt = useCallback((factor, cx, cy) => {
    setView(v => {
      const scale = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE)
      const k = scale / v.scale
      return { scale, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k }
    })
  }, [])

  const zoomCenter = useCallback(factor => {
    const rect = canvasRef.current.getBoundingClientRect()
    zoomAt(factor, rect.width / 2, rect.height / 2)
  }, [zoomAt])

  const zoomToCenter = useCallback(target => {
    const rect = canvasRef.current.getBoundingClientRect()
    setView(v => {
      const k = target / v.scale
      const cx = rect.width / 2, cy = rect.height / 2
      return { scale: target, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k }
    })
  }, [])

  useEffect(() => {
    const el = canvasRef.current
    function onWheel(e) {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) {
        zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - rect.left, e.clientY - rect.top)
      } else {
        setView(v => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }))
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  useEffect(() => {
    const typing = () => ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
    function onKeyDown(e) {
      if (typing()) return
      if (e.code === 'Space') { e.preventDefault(); setSpace(true) }
      else if (e.key === 'h') setTool('hand')
      else if (e.key === 'v') setTool('interact')
      else if (e.key === '!' || (e.shiftKey && e.key === '1')) fit()
      else if (e.key === '=' || e.key === '+') zoomCenter(1.2)
      else if (e.key === '-') zoomCenter(1 / 1.2)
      else if (e.key === '0') zoomToCenter(1)
    }
    function onKeyUp(e) { if (e.code === 'Space') setSpace(false) }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp) }
  }, [fit, zoomCenter, zoomToCenter])

  function onPointerDown(e) {
    if (!panning || e.button !== 0) return
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function onPointerMove(e) {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x, dy = e.clientY - d.y
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true
    setView(v => ({ ...v, x: d.vx + dx, y: d.vy + dy }))
  }
  function onPointerUp(e) {
    const d = drag.current
    drag.current = null
    setDragging(false)
    if (d && !d.moved) {
      const step = document.elementsFromPoint(e.clientX, e.clientY)
        .map(el => el.closest?.('[data-artboard]')?.dataset.artboard)
        .find(Boolean)
      if (step) selectArtboard(step)
    }
  }

  function selectArtboard(step) {
    setSelected(step)
  }

  const base = import.meta.env.BASE_URL

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', background: '#0E1015', fontFamily: 'var(--font-family-body)' }}>
      {/* ── Canvas ── */}
      <div
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position: 'relative', flex: 1, overflow: 'hidden',
          cursor: panning ? (dragging ? 'grabbing' : 'grab') : 'default',
          backgroundImage: 'radial-gradient(circle, #2A2F3A 1px, transparent 1px)',
          backgroundSize: `${24 * view.scale}px ${24 * view.scale}px`,
          backgroundPosition: `${view.x}px ${view.y}px`,
          touchAction: 'none',
        }}
      >
        <div style={{
          position: 'absolute', left: 0, top: 0,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          transformOrigin: '0 0',
        }}>
          {ARTBOARDS.map(({ step, title }, i) => (
            <div
              key={step}
              data-artboard={step}
              style={{ position: 'absolute', left: i * (FRAME_W + GAP), top: LABEL_H, width: FRAME_W }}
            >
              <div style={{
                position: 'absolute', left: 0, bottom: '100%',
                width: FRAME_W / labelScale(view.scale), height: LABEL_H,
                transform: `scale(${labelScale(view.scale)})`, transformOrigin: 'bottom left',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13,
                color: selected === step ? 'var(--color-brand-300)' : '#94969C',
                whiteSpace: 'nowrap',
              }}>
                <span
                  onClick={() => selectArtboard(step)}
                  style={{ cursor: 'pointer', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {String(i + 1).padStart(2, '0')} {title}
                </span>
                <span style={{ marginLeft: 'auto', display: FRAME_W / labelScale(view.scale) >= 200 ? 'flex' : 'none', gap: 2 }}>
                  <FrameButton label="Restart this screen" onClick={() => post(frames.current[step], { reset: true })}>
                    <RefreshCw01 size={14} color="currentColor" />
                  </FrameButton>
                  <FrameButton label="Open in new tab" onClick={() => window.open(`${base}?embed=${step}`, '_blank')}>
                    <LinkExternal01 size={14} color="currentColor" />
                  </FrameButton>
                </span>
              </div>
              <div style={{
                width: FRAME_W, height: FRAME_H,
                borderRadius: 28, overflow: 'hidden',
                outline: selected === step ? `${2 / view.scale}px solid var(--color-brand-500)` : '1px solid #1F242F',
                outlineOffset: selected === step ? 4 / view.scale : 0,
                boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
                background: '#0A0A0F',
              }}>
                <iframe
                  ref={el => { frames.current[step] = el }}
                  title={title}
                  src={`${base}?embed=${step}`}
                  onLoad={e => post(e.currentTarget, { tweaks })}
                  style={{ width: FRAME_W, height: FRAME_H, border: 0, display: 'block', pointerEvents: panning ? 'none' : 'auto' }}
                />
              </div>
            </div>
          ))}
        </div>

        <Toolbar
          tool={tool}
          setTool={setTool}
          scale={view.scale}
          onZoomIn={() => zoomCenter(1.2)}
          onZoomOut={() => zoomCenter(1 / 1.2)}
          onFit={fit}
        />
      </div>

      {/* ── Panel ── */}
      <Panel
        tab={tab}
        setTab={setTab}
        tweaks={tweaks}
        setTweaks={setTweaks}
        selected={selected}
      />
    </div>
  )
}

/* ── Toolbar ── */

function Toolbar({ tool, setTool, scale, onZoomIn, onZoomOut, onFit }) {
  return (
    <div
      onPointerDown={e => e.stopPropagation()}
      style={{
        position: 'absolute', left: 16, bottom: 16,
        display: 'flex', alignItems: 'center', gap: 4, padding: 4,
        background: '#161B26', border: '1px solid #262B36', borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        color: '#CECFD2', fontSize: 13,
      }}
    >
      <ToolButton active={tool === 'hand'} onClick={() => setTool('hand')} title="Pan (H) · hold Space anywhere">
        <Hand size={16} color="currentColor" />
      </ToolButton>
      <ToolButton active={tool === 'interact'} onClick={() => setTool('interact')} title="Interact with screens (V)">
        <Cursor01 size={16} color="currentColor" />
      </ToolButton>
      <Divider />
      <ToolButton onClick={onZoomOut} title="Zoom out (−)"><Minus size={16} color="currentColor" /></ToolButton>
      <span style={{ width: 44, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{Math.round(scale * 100)}%</span>
      <ToolButton onClick={onZoomIn} title="Zoom in (+)"><Plus size={16} color="currentColor" /></ToolButton>
      <ToolButton onClick={onFit} title="Fit all (Shift+1)"><Maximize01 size={16} color="currentColor" /></ToolButton>
      <Divider />
      <span style={{ padding: '0 8px', color: '#61656C', fontSize: 12 }}>
        {tool === 'hand' ? 'Drag to pan · ⌘/Ctrl + scroll to zoom' : 'Click through the screens · Space to pan'}
      </span>
    </div>
  )
}

function ToolButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      style={{
        width: 32, height: 32, borderRadius: 8, border: 0, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'var(--color-brand-600)' : 'transparent',
        color: active ? '#fff' : '#CECFD2',
      }}
    >
      {children}
    </button>
  )
}

function FrameButton({ children, label, onClick }) {
  const size = 26
  return (
    <button
      title={label}
      aria-label={label}
      onPointerDown={e => e.stopPropagation()}
      onClick={onClick}
      style={{
        width: size, height: size, border: 0, borderRadius: 6, cursor: 'pointer',
        background: 'transparent', color: '#61656C',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div style={{ width: 1, height: 20, background: '#262B36', margin: '0 4px' }} />
}

/* ── Panel ── */

function Panel({ tab, setTab, tweaks, setTweaks, selected }) {
  return (
    <aside style={{
      width: PANEL_W, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: '#11141B', borderLeft: '1px solid #1F242F', color: '#CECFD2',
      fontSize: 13, lineHeight: '18px',
    }}>
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F6', marginBottom: 2 }}>Onboarding canvas</div>
        <div style={{ fontSize: 12, color: '#61656C', marginBottom: 14 }}>Changes apply live to every screen and are saved in this browser.</div>
        <div style={{ display: 'flex', gap: 4, background: '#0C0F15', padding: 3, borderRadius: 10, border: '1px solid #1F242F' }}>
          {[['style', 'Style'], ['copy', 'Copy'], ['export', 'Export']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1, padding: '6px 0', borderRadius: 7, border: 0, cursor: 'pointer',
                fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                background: tab === id ? '#1F242F' : 'transparent',
                color: tab === id ? '#F5F5F6' : '#94969C',
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {tab === 'style'  && <StyleTab tweaks={tweaks} setTweaks={setTweaks} />}
        {tab === 'copy'   && <CopyTab tweaks={tweaks} setTweaks={setTweaks} selected={selected} />}
        {tab === 'export' && <ExportTab tweaks={tweaks} setTweaks={setTweaks} />}
      </div>
    </aside>
  )
}

function StyleTab({ tweaks, setTweaks }) {
  const baseValues = useMemo(() => {
    const cs = getComputedStyle(document.documentElement)
    const out = {}
    for (const g of COLOR_GROUPS) for (const [token] of g.tokens) out[token] = toHex(cs.getPropertyValue(token))
    return out
  }, [])
  const generated = computeVars({ ...defaultTweaks, brandBase: tweaks.brandBase })
  const valueOf = token => tweaks.colors[token] ?? generated[token] ?? baseValues[token]

  function setColor(token, value) {
    setTweaks(t => ({ ...t, colors: { ...t.colors, [token]: value } }))
  }
  function resetColor(token) {
    setTweaks(t => {
      const colors = { ...t.colors }
      delete colors[token]
      return { ...t, colors }
    })
  }

  const scale = tweaks.brandBase ? brandScale(tweaks.brandBase) : null

  return (
    <>
      <Section title="Brand colour" onReset={tweaks.brandBase ? () => setTweaks(t => ({ ...t, brandBase: '' })) : null}>
        <ColorField
          label="Base · generates the full scale"
          value={tweaks.brandBase || baseValues['--color-brand-600']}
          onChange={v => setTweaks(t => ({ ...t, brandBase: v }))}
        />
        <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', marginTop: 8, height: 16 }}>
          {[25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(step => (
            <div
              key={step}
              title={`brand-${step}`}
              style={{ flex: 1, background: scale ? scale[`--color-brand-${step}`] : `var(--color-brand-${step})` }}
            />
          ))}
        </div>
      </Section>

      {COLOR_GROUPS.map(group => (
        <Section key={group.title} title={group.title}>
          {group.tokens.map(([token, label]) => (
            <ColorField
              key={token}
              label={label}
              hint={token}
              value={valueOf(token)}
              changed={token in tweaks.colors}
              onChange={v => setColor(token, v)}
              onReset={() => resetColor(token)}
            />
          ))}
        </Section>
      ))}

      <Section title="Shape & size">
        <Slider label="Corner radius" value={tweaks.radiusScale} min={0} max={2} step={0.05}
          format={v => `${Math.round(12 * v)}px cards`} onChange={v => setTweaks(t => ({ ...t, radiusScale: v }))} />
        <Slider label="Spacing" value={tweaks.spacingScale} min={0.6} max={1.5} step={0.05}
          format={v => `${Math.round(v * 100)}%`} onChange={v => setTweaks(t => ({ ...t, spacingScale: v }))} />
        <Slider label="Heading size" value={tweaks.displayScale} min={0.75} max={1.35} step={0.05}
          format={v => `${Math.round(30 * v)}px`} onChange={v => setTweaks(t => ({ ...t, displayScale: v }))} />
      </Section>

      <Section title="Typeface">
        <select
          value={tweaks.font}
          onChange={e => setTweaks(t => ({ ...t, font: e.target.value }))}
          style={inputStyle}
        >
          {FONTS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
      </Section>
    </>
  )
}

function CopyTab({ tweaks, setTweaks, selected }) {
  const [scope, setScope] = useState('selected')
  const sections = scope === 'all' ? Object.keys(ONBOARDING_COPY) : COPY_SECTIONS_BY_STEP[selected]
  const title = ARTBOARDS.find(a => a.step === selected)?.title

  function setString(section, key, value) {
    setTweaks(t => ({ ...t, copy: { ...t.copy, [section]: { ...t.copy[section], [key]: value } } }))
  }
  function resetString(section, key) {
    setTweaks(t => {
      const sectionCopy = { ...t.copy[section] }
      delete sectionCopy[key]
      return { ...t, copy: { ...t.copy, [section]: sectionCopy } }
    })
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <Pill active={scope === 'selected'} onClick={() => setScope('selected')}>Selected: {title}</Pill>
        <Pill active={scope === 'all'} onClick={() => setScope('all')}>All screens</Pill>
      </div>
      <p style={{ fontSize: 12, color: '#61656C', marginBottom: 16, lineHeight: '18px' }}>
        Click a screen's title on the canvas to select it. <code style={codeStyle}>{'{name}'}</code> is replaced with the user's name.
      </p>

      {sections.map(section => (
        <Section key={section} title={section === 'common' ? 'Shared (header & buttons)' : ARTBOARDS.find(a => a.step === section)?.title ?? section}>
          {Object.entries(ONBOARDING_COPY[section]).map(([key, original]) => {
            const value = tweaks.copy[section]?.[key] ?? original
            const changed = value !== original
            return (
              <label key={key} style={{ display: 'block', marginBottom: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: '#94969C', marginBottom: 4 }}>
                  {humanize(key)}
                  {changed && <ResetLink onClick={() => resetString(section, key)} />}
                </span>
                <textarea
                  value={value}
                  rows={value.length > 38 ? 2 : 1}
                  onChange={e => setString(section, key, e.target.value)}
                  style={{ ...inputStyle, resize: 'vertical', borderColor: changed ? 'var(--color-brand-700)' : '#262B36' }}
                />
              </label>
            )
          })}
        </Section>
      ))}
    </>
  )
}

function ExportTab({ tweaks, setTweaks }) {
  const css = exportCss(tweaks)
  const copyJson = JSON.stringify(changedCopy(tweaks), null, 2)
  const fileInput = useRef(null)

  function download() {
    const blob = new Blob([JSON.stringify(tweaks, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'onboarding-tweaks.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function importFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setTweaks(normalizeTweaks(JSON.parse(await file.text())))
    } catch {
      alert('That file is not a valid tweaks JSON.')
    }
    e.target.value = ''
  }

  return (
    <>
      <Section title="CSS tokens" action={<CopyButton text={css} />}>
        <p style={helpText}>Paste into <code style={codeStyle}>:root</code> in <code style={codeStyle}>src/index.css</code>.</p>
        <pre style={preStyle}>{css}</pre>
      </Section>

      <Section title="Copy changes" action={<CopyButton text={copyJson} />}>
        <p style={helpText}>Overrides for <code style={codeStyle}>src/onboardingCopy.js</code>.</p>
        <pre style={preStyle}>{copyJson === '{}' ? '// No copy changes yet' : copyJson}</pre>
      </Section>

      <Section title="Tweaks file">
        <p style={helpText}>Save everything as one file to share it, or send it to Indent to apply it to the code.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <PanelButton onClick={download}><Download01 size={14} color="currentColor" /> Download</PanelButton>
          <PanelButton onClick={() => fileInput.current?.click()}><Upload01 size={14} color="currentColor" /> Import</PanelButton>
          <input ref={fileInput} type="file" accept="application/json" onChange={importFile} style={{ display: 'none' }} />
        </div>
      </Section>

      <Section title="Start over">
        <PanelButton danger onClick={() => confirm('Reset all style and copy changes?') && setTweaks(defaultTweaks)}>
          <RefreshCw01 size={14} color="currentColor" /> Reset all changes
        </PanelButton>
      </Section>
    </>
  )
}

/* ── Panel controls ── */

function Section({ title, children, onReset, action }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#61656C' }}>{title}</h3>
        <span style={{ marginLeft: 'auto' }}>{action}{onReset && <ResetLink onClick={onReset} />}</span>
      </div>
      {children}
    </section>
  )
}

function ColorField({ label, hint, value, changed, onChange, onReset }) {
  const [draft, setDraft] = useState(null)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <label style={{
        position: 'relative', width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: value, border: '1px solid #333741', cursor: 'pointer', overflow: 'hidden',
      }}>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value.toUpperCase())}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
        />
      </label>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#CECFD2' }}>
          {label}
          {changed && <ResetLink onClick={onReset} />}
        </div>
        {hint && <div style={{ fontSize: 11, color: '#4B4F58', fontFamily: 'var(--font-family-mono)' }}>{hint}</div>}
      </div>
      <input
        value={draft ?? value}
        onFocus={() => setDraft(value)}
        onChange={e => {
          setDraft(e.target.value)
          if (/^#[0-9a-f]{6}$/i.test(e.target.value)) onChange(e.target.value.toUpperCase())
        }}
        onBlur={() => setDraft(null)}
        spellCheck={false}
        style={{ ...inputStyle, width: 84, fontFamily: 'var(--font-family-mono)', fontSize: 12, padding: '5px 8px' }}
      />
    </div>
  )
}

function Slider({ label, value, min, max, step, format, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span>{label}</span>
        <span style={{ color: '#94969C', fontVariantNumeric: 'tabular-nums' }}>
          {format(value)}
          {value !== 1 && <ResetLink onClick={() => onChange(1)} />}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--color-brand-500)' }}
      />
    </div>
  )
}

function ResetLink({ onClick }) {
  return (
    <button
      onClick={e => { e.preventDefault(); onClick() }}
      title="Reset to default"
      style={{
        marginLeft: 8, border: 0, background: 'transparent', cursor: 'pointer',
        color: 'var(--color-brand-400)', fontSize: 11, fontFamily: 'inherit', padding: 0,
      }}
    >reset</button>
  )
}

function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 10px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
        border: `1px solid ${active ? 'var(--color-brand-600)' : '#262B36'}`,
        background: active ? 'color-mix(in srgb, var(--color-brand-600) 15%, transparent)' : 'transparent',
        color: active ? '#F5F5F6' : '#94969C',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180,
      }}
    >{children}</button>
  )
}

function PanelButton({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
        border: '1px solid #262B36', background: '#161B26',
        color: danger ? '#F97066' : '#CECFD2',
      }}
    >{children}</button>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, border: 0, background: 'transparent',
        cursor: 'pointer', color: 'var(--color-brand-400)', fontSize: 12, fontFamily: 'inherit',
      }}
    >
      {copied ? <Check size={13} color="currentColor" /> : <Copy01 size={13} color="currentColor" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

const FIELD_LABELS = { cta: 'Button', skip: 'Skip link', edit: 'Secondary link', badge: 'Badge', hint: 'Option hint' }

function humanize(key) {
  return FIELD_LABELS[key] ?? key.replace(/([A-Z]+|[0-9]+)/g, ' $1').replace(/^./, c => c.toUpperCase())
}

const inputStyle = {
  width: '100%', padding: '7px 10px', borderRadius: 8,
  background: '#0C0F15', border: '1px solid #262B36', color: '#F5F5F6',
  fontSize: 13, fontFamily: 'inherit', lineHeight: '18px', outline: 'none',
}

const preStyle = {
  background: '#0C0F15', border: '1px solid #1F242F', borderRadius: 8,
  padding: 10, fontSize: 11, lineHeight: '16px', color: '#CECFD2',
  fontFamily: 'var(--font-family-mono)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
  maxHeight: 260, overflow: 'auto',
}

const helpText = { fontSize: 12, color: '#61656C', marginBottom: 8, lineHeight: '18px' }
const codeStyle = { fontFamily: 'var(--font-family-mono)', fontSize: 11, color: '#94969C' }
