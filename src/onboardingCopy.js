export const QUESTION_STEPS = ['name', 'goals', 'household', 'preferences']
export const ONBOARDING_STEPS = ['welcome', 'intro', ...QUESTION_STEPS, 'done']

/* Default onboarding copy. `{name}` is replaced with the user's name; when no name is set,
   the placeholder and the comma/space before it are dropped. */
export const ONBOARDING_COPY = {
  common: {
    stepLabel: 'Step {current} of {total}',
    skip: 'Skip',
    continue: 'Continue',
  },
  welcome: {
    badge: 'AI-powered',
    titleStart: 'Shopping lists that',
    titleHighlight: 'think ahead',
    body: "Jot down what you need. We'll ask the quick questions so nothing on your list stays vague.",
    cta: 'Get started',
    skip: 'Skip setup',
  },
  intro: {
    title: 'How it works',
    subtitle: 'Three steps, about a minute per list.',
    step1Title: 'Jot it down',
    step1Body: 'Type items as they come to mind. "Milk" is enough.',
    step2Title: 'Answer quick questions',
    step2Body: 'AI asks which type and how many. One tap each.',
    step3Title: 'Get a clean list',
    step3Body: 'Every item refined and ready for your shopper.',
    cta: 'Personalise my lists',
  },
  name: {
    title: 'What should we call you?',
    subtitle: "We'll use it to make your lists feel like yours.",
    placeholder: 'Your first name',
  },
  goals: {
    title: 'What will you use it for, {name}?',
    subtitle: 'Pick as many as you like.',
  },
  household: {
    title: 'Who are you shopping for?',
    subtitle: "We'll suggest quantities that fit your household.",
    hint: 'Suggests {quantities}',
  },
  preferences: {
    title: 'Any preferences?',
    subtitle: 'AI will put these options first when it asks about an item.',
    productLabel: 'When choosing products, I go for',
    dietLabel: 'Dietary needs',
    optional: 'optional',
    cta: 'Finish setup',
  },
  done: {
    title: "You're all set, {name}!",
    subtitle: 'Suggestions will now match how you shop.',
    rowGoals: 'Using it for',
    rowHousehold: 'Shopping for',
    rowProduct: 'Product pick',
    rowDiet: 'Diet',
    noDiet: 'No restrictions',
    cta: 'Create my first list',
    edit: 'Change answers',
  },
}

export function mergeCopy(overrides) {
  const merged = {}
  for (const [section, strings] of Object.entries(ONBOARDING_COPY)) {
    merged[section] = { ...strings, ...overrides?.[section] }
  }
  return merged
}

export function fill(template, values = {}) {
  let out = template
  for (const [key, value] of Object.entries(values)) {
    out = value
      ? out.replaceAll(`{${key}}`, value)
      : out.replace(new RegExp(`,?\\s*\\{${key}\\}`, 'g'), '')
  }
  return out
}
