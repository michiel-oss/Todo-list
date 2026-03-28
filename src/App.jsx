import { useState } from 'react'
import TodoScreen from './components/TodoScreen'
import RefinementScreen from './components/RefinementScreen'
import './index.css'

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
    <div className="min-h-svh flex flex-col bg-[#0a0a0f]">
      {screen === 'todo' && <TodoScreen onSend={handleSend} />}
      {screen === 'refine' && <RefinementScreen items={items} onBack={handleBack} />}
    </div>
  )
}
