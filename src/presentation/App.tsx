import { useState } from 'react'

import reactLogo from './shared/assets/icons/react.svg'
import { Button } from './shared/components/ui/button'
import './shared/styles/app.css'

function App(): React.JSX.Element {
  const [count, setCount]: [number, React.Dispatch<React.SetStateAction<number>>] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className='bg-red-500'>Vite + React</h1>
      <div className="card">
        <Button onClick={() => { setCount((count: number) => count + 1); }}>
          count is {count}
        </Button>
        <p>
          Edit <code>src/presentation/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

