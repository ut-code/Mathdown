import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import App from './App.tsx'
import Plntxt from './Plntxt.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Plntxt />
  </StrictMode>,
)
