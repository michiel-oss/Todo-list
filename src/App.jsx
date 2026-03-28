import { useState, Component } from 'react'
import TodoScreen from './components/TodoScreen'
import RefinementScreen from './components/RefinementScreen'
import './index.css'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  componentDidCatch(error) { this.setState({ error }) }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '24px', color: '#f87171', fontFamily: 'monospace', background: '#0a0a0f', minHeight: '100svh' }}>
          <strong>App error:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '8px', fontSize: '13px' }}>{this.state.error.toString()}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [screen, setScreen] = useState('todo')
  const [items, setItems] = useState([])

  function handleSend(todoItems) {
    setItems(todoItems)
    setScreen('refine')
  }

  function handleBack() {
    setScreen('todo')
  }

  return (
    <ErrorBoundary>
      <div className="min-h-svh flex flex-col bg-[#0a0a0f]">
        {screen === 'todo' && <TodoScreen onSend={handleSend} />}
        {screen === 'refine' && <RefinementScreen items={items} onBack={handleBack} />}
      </div>
    </ErrorBoundary>
  )
}
