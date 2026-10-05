import { useEffect, useState } from 'react'
import OnboardingScreen from '../components/OnboardingScreen'
import { MESSAGE_TYPE, applyFont, applyVars, computeVars, loadTweaks } from './tokens'

const DEMO_PROFILE = {
  name: 'Michiel',
  goals: ['groceries', 'meal-prep'],
  household: '2',
  productPref: 'organic',
  diet: ['vegetarian'],
}

/* One artboard on the canvas: a single onboarding step rendered in an iframe. */
export default function EmbedFrame({ step }) {
  const [tweaks, setTweaks] = useState(loadTweaks)
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    function onMessage(e) {
      if (e.origin !== window.location.origin || e.data?.type !== MESSAGE_TYPE) return
      if (e.data.tweaks) setTweaks(e.data.tweaks)
      if (e.data.reset) setResetKey(k => k + 1)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    applyVars(document, computeVars(tweaks))
    applyFont(document, tweaks)
  }, [tweaks])

  return (
    <div className="min-h-svh flex flex-col" style={{ background: 'var(--colors-bg-app)' }}>
      <OnboardingScreen
        key={resetKey}
        embedded
        initialStep={step}
        initialProfile={DEMO_PROFILE}
        copy={tweaks.copy}
        onComplete={() => setResetKey(k => k + 1)}
      />
    </div>
  )
}
