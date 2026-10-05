import { ONBOARDING_COPY } from '../onboardingCopy'

export const STORAGE_KEY = 'onboarding-canvas.tweaks.v1'
export const MESSAGE_TYPE = 'onboarding-canvas:tweaks'

export const ARTBOARDS = [
  { step: 'welcome',     title: 'Welcome' },
  { step: 'intro',       title: 'How it works' },
  { step: 'name',        title: 'Name' },
  { step: 'goals',       title: 'Goals' },
  { step: 'household',   title: 'Household' },
  { step: 'preferences', title: 'Preferences' },
  { step: 'done',        title: 'Done' },
]

export const COPY_SECTIONS_BY_STEP = {
  welcome: ['welcome'],
  intro: ['intro'],
  name: ['name', 'common'],
  goals: ['goals', 'common'],
  household: ['household', 'common'],
  preferences: ['preferences', 'common'],
  done: ['done'],
}

export const COLOR_GROUPS = [
  { title: 'Brand', tokens: [
    ['--color-brand-300', 'Brand 300'],
    ['--color-brand-400', 'Brand 400 · highlight text'],
    ['--color-brand-500', 'Brand 500 · indicators'],
    ['--color-brand-600', 'Brand 600 · buttons, borders'],
    ['--color-brand-700', 'Brand 700 · gradient end'],
    ['--color-brand-800', 'Brand 800'],
  ] },
  { title: 'Surfaces', tokens: [
    ['--colors-bg-app',       'App background'],
    ['--colors-bg-secondary', 'Card'],
    ['--colors-bg-tertiary',  'Card inset'],
  ] },
  { title: 'Text', tokens: [
    ['--colors-fg-primary',    'Primary'],
    ['--colors-fg-secondary',  'Secondary'],
    ['--colors-fg-tertiary',   'Tertiary'],
    ['--colors-fg-quaternary', 'Muted'],
    ['--colors-fg-quinary',    'Faint'],
  ] },
  { title: 'Borders', tokens: [
    ['--colors-border-primary',   'Strong'],
    ['--colors-border-secondary', 'Subtle'],
    ['--colors-border-brand',     'Selected'],
  ] },
]

const RADIUS = { xxs: 2, xs: 4, sm: 6, md: 8, lg: 10, xl: 12, '2xl': 16, '3xl': 20, '4xl': 24 }
const SPACING = {
  xxs: 2, xs: 4, sm: 6, md: 8, lg: 12, xl: 16, '2xl': 20, '3xl': 24, '4xl': 32,
  '5xl': 40, '6xl': 48, '7xl': 64, '8xl': 80, '9xl': 96, '10xl': 128, '11xl': 160,
}
const DISPLAY = {
  '2xl': [72, 90], xl: [60, 72], lg: [48, 60], md: [36, 44], sm: [30, 38], xs: [24, 32],
}

export const FONTS = [
  { id: 'default',       label: 'Current (system fallback)', stack: null, href: null },
  { id: 'inter',         label: 'Inter',          stack: "'Inter', sans-serif",          href: 'Inter:wght@400;500;600;700' },
  { id: 'dm-sans',       label: 'DM Sans',        stack: "'DM Sans', sans-serif",        href: 'DM+Sans:wght@400;500;600;700' },
  { id: 'manrope',       label: 'Manrope',        stack: "'Manrope', sans-serif",        href: 'Manrope:wght@400;500;600;700' },
  { id: 'space-grotesk', label: 'Space Grotesk',  stack: "'Space Grotesk', sans-serif",  href: 'Space+Grotesk:wght@400;500;600;700' },
  { id: 'plus-jakarta',  label: 'Plus Jakarta Sans', stack: "'Plus Jakarta Sans', sans-serif", href: 'Plus+Jakarta+Sans:wght@400;500;600;700' },
  { id: 'fraunces',      label: 'Fraunces (serif headings)', stack: "'Fraunces', serif", href: 'Fraunces:wght@400;500;600;700', displayOnly: true },
]

export const defaultTweaks = {
  brandBase: '',
  colors: {},
  radiusScale: 1,
  spacingScale: 1,
  displayScale: 1,
  font: 'default',
  copy: {},
}

export function loadTweaks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? normalizeTweaks(JSON.parse(raw)) : defaultTweaks
  } catch {
    return defaultTweaks
  }
}

export function saveTweaks(tweaks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tweaks))
  } catch {
    // Non-fatal: tweaks just won't survive a reload.
  }
}

export function normalizeTweaks(t) {
  return { ...defaultTweaks, ...t, colors: { ...t?.colors }, copy: { ...t?.copy } }
}

/* ── Brand scale ── */

const BRAND_LIGHTNESS = {
  25: 98.5, 50: 97, 100: 94, 200: 89, 300: 81, 400: 71, 500: 62,
  600: 54, 700: 46, 800: 37, 900: 30, 950: 20,
}

/* Builds brand-25…950 around the picked colour, which becomes brand-600 exactly. */
export function brandScale(baseHex) {
  const [h, s, baseL] = hexToHsl(baseHex)
  const shift = baseL - BRAND_LIGHTNESS[600]
  const scale = {}
  for (const [step, l] of Object.entries(BRAND_LIGHTNESS)) {
    const sat = step >= 900 ? s * 0.8 : s
    const t = step < 600 ? (100 - l) / (100 - BRAND_LIGHTNESS[600]) : l / BRAND_LIGHTNESS[600]
    scale[`--color-brand-${step}`] = hslToHex(h, sat, clamp(l + shift * t, 2, 99))
  }
  scale['--color-brand-600'] = toHex(baseHex)
  return scale
}

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

function brandSemantics(c) {
  return {
    '--colors-fg-brand-primary':   c['--color-brand-400'],
    '--colors-fg-brand-secondary': c['--color-brand-500'],
    '--colors-border-brand':       c['--color-brand-600'],
    '--colors-border-brand-solid': c['--color-brand-700'],
    '--colors-bg-brand-primary':   c['--color-brand-600'],
    '--colors-bg-brand-secondary': c['--color-brand-700'],
    '--colors-bg-brand-section':   c['--color-brand-950'],
  }
}

/* Turns tweak settings into the CSS custom properties to set on :root. */
export function computeVars(tweaks) {
  const vars = {}

  if (tweaks.brandBase) {
    const scale = brandScale(tweaks.brandBase)
    Object.assign(vars, scale, brandSemantics(scale))
  }
  Object.assign(vars, tweaks.colors)

  if (tweaks.radiusScale !== 1) {
    for (const [k, v] of Object.entries(RADIUS)) vars[`--radius-${k}`] = px(v * tweaks.radiusScale)
  }
  if (tweaks.spacingScale !== 1) {
    for (const [k, v] of Object.entries(SPACING)) vars[`--spacing-${k}`] = px(v * tweaks.spacingScale)
  }
  if (tweaks.displayScale !== 1) {
    for (const [k, [size, lh]] of Object.entries(DISPLAY)) {
      vars[`--font-size-display-${k}`]   = px(size * tweaks.displayScale)
      vars[`--line-height-display-${k}`] = px(lh * tweaks.displayScale)
    }
  }

  const font = FONTS.find(f => f.id === tweaks.font)
  if (font?.stack) {
    vars['--font-family-display'] = font.stack
    if (!font.displayOnly) vars['--font-family-body'] = font.stack
  }

  return vars
}

export function fontHref(tweaks) {
  const font = FONTS.find(f => f.id === tweaks.font)
  return font?.href ? `https://fonts.googleapis.com/css2?family=${font.href}&display=swap` : null
}

/* Applies vars to a document, removing ones set previously but no longer present. */
export function applyVars(doc, vars) {
  const root = doc.documentElement
  const previous = (root.dataset.canvasVars ?? '').split(',').filter(Boolean)
  for (const key of previous) if (!(key in vars)) root.style.removeProperty(key)
  for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, value)
  root.dataset.canvasVars = Object.keys(vars).join(',')
}

export function applyFont(doc, tweaks) {
  const href = fontHref(tweaks)
  let link = doc.getElementById('canvas-font')
  if (!href) { link?.remove(); return }
  if (!link) {
    link = doc.createElement('link')
    link.id = 'canvas-font'
    link.rel = 'stylesheet'
    doc.head.appendChild(link)
  }
  if (link.href !== href) link.href = href
}

/* ── Export ── */

export function exportCss(tweaks) {
  const vars = computeVars(tweaks)
  const lines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`)
  const fontNote = fontHref(tweaks) ? `/* Font: add <link rel="stylesheet" href="${fontHref(tweaks)}"> to index.html */\n` : ''
  return lines.length ? `${fontNote}:root {\n${lines.join('\n')}\n}\n` : '/* No style changes yet */\n'
}

export function changedCopy(tweaks) {
  const out = {}
  for (const [section, strings] of Object.entries(tweaks.copy)) {
    for (const [key, value] of Object.entries(strings)) {
      if (ONBOARDING_COPY[section]?.[key] !== undefined && ONBOARDING_COPY[section][key] !== value) {
        out[section] = { ...out[section], [key]: value }
      }
    }
  }
  return out
}

/* ── Colour helpers ── */

function px(n) {
  return `${Math.round(n * 2) / 2}px`
}

export function toHex(color) {
  const c = color.trim()
  if (/^#[0-9a-f]{6}$/i.test(c)) return c.toUpperCase()
  if (/^#[0-9a-f]{3}$/i.test(c)) return ('#' + c.slice(1).split('').map(x => x + x).join('')).toUpperCase()
  const m = c.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const [r, g, b] = m[1].split(/[ ,]+/).map(Number)
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()
  }
  return '#000000'
}

function hexToHsl(hex) {
  const n = parseInt(toHex(hex).slice(1), 16)
  const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l * 100]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s * 100, l * 100]
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('').toUpperCase()
}
