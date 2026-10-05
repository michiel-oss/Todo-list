import { Suspense, lazy } from 'react'
import App from './App.jsx'

const CanvasPage = lazy(() => import('./canvas/CanvasPage.jsx'))
const EmbedFrame = lazy(() => import('./canvas/EmbedFrame.jsx'))

/* `?canvas` opens the design canvas; `?embed=<step>` renders one onboarding step for its artboards. */
export default function Root() {
  const params = new URLSearchParams(window.location.search)
  const embedStep = params.get('embed')

  return (
    <Suspense fallback={null}>
      {embedStep ? <EmbedFrame step={embedStep} /> : params.has('canvas') ? <CanvasPage /> : <App />}
    </Suspense>
  )
}
