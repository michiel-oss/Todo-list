const STORAGE_KEY = 'todo-list.profile.v1'

export const GOALS = [
  { id: 'groceries', label: 'Weekly groceries' },
  { id: 'meal-prep', label: 'Meal prep' },
  { id: 'household', label: 'Household supplies' },
  { id: 'events',    label: 'Parties & events' },
  { id: 'errands',   label: 'Quick errands' },
]

export const HOUSEHOLD_SIZES = [
  { id: '1',   label: 'Just me' },
  { id: '2',   label: '2 people' },
  { id: '3-4', label: '3–4 people' },
  { id: '5+',  label: '5 or more' },
]

export const PRODUCT_PREFS = [
  { id: 'price',   label: 'Best price' },
  { id: 'organic', label: 'Organic' },
  { id: 'store',   label: 'Store brand' },
  { id: 'none',    label: 'No preference' },
]

export const DIETS = [
  { id: 'vegetarian',   label: 'Vegetarian' },
  { id: 'vegan',        label: 'Vegan' },
  { id: 'gluten-free',  label: 'Gluten-free' },
  { id: 'lactose-free', label: 'Lactose-free' },
]

export const emptyProfile = {
  name: '',
  goals: [],
  household: '',
  productPref: '',
  diet: [],
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...emptyProfile, ...JSON.parse(raw) } : null
  } catch {
    return null
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // Storage can be unavailable (private mode); onboarding will simply show again next visit.
  }
}

export function labelFor(options, id) {
  return options.find(o => o.id === id)?.label ?? ''
}

const QUANTITIES_BY_HOUSEHOLD = {
  '1':   ['1', '2', '3', '4'],
  '2':   ['1', '2', '4', '6'],
  '3-4': ['2', '4', '6', '8'],
  '5+':  ['4', '6', '8', '12'],
}

export function quantitySuggestions(profile) {
  return QUANTITIES_BY_HOUSEHOLD[profile?.household] ?? QUANTITIES_BY_HOUSEHOLD['1']
}

const MEAT_PATTERN  = /kip|chicken|gehakt|mince|ground|vlees|beef|steak|worst|sausage|vis|fish|zalm|salmon|tonijn|tuna|garnaal|shrimp|prawn/
const DAIRY_PATTERN = /melk|milk|kaas|cheese|yoghurt|yogurt/

/* Adjusts the detail suggestions for an item to the user's onboarding answers. */
export function personalizeSuggestions(itemText, suggestions, profile) {
  if (!profile) return suggestions
  const text = itemText.toLowerCase()
  const diet = profile.diet ?? []
  let result = [...suggestions]

  if ((diet.includes('vegetarian') || diet.includes('vegan')) && MEAT_PATTERN.test(text)) {
    result = ['Plant-based', ...result.filter(s => s !== 'Veggie')].slice(0, 4)
  }
  if ((diet.includes('vegan') || diet.includes('lactose-free')) && DAIRY_PATTERN.test(text)) {
    const alt = diet.includes('vegan') ? 'Plant-based' : 'Lactose-free'
    result = [alt, ...result.filter(s => s !== alt)].slice(0, 4)
  }

  const preferred = { organic: 'Organic', store: 'Store brand', price: 'Store brand' }[profile.productPref]
  if (preferred && result.includes(preferred)) {
    result = [preferred, ...result.filter(s => s !== preferred)]
  }

  return result
}
