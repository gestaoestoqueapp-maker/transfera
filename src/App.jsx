import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Welcome from './pages/Welcome'
import SetupStorages from './pages/SetupStorages'
import SetupTutorial from './pages/SetupTutorial'
import WelcomeReturn from './pages/WelcomeReturn'
import Upload from './pages/Upload'
import Validation from './pages/Validation'
import Coverage from './pages/Coverage'
import Results from './pages/Results'
import Export from './pages/Export'
import './App.css'

function AppRoutes() {
  const { firstAccess } = useApp()

  return (
    <Routes>
      <Route path="/" element={firstAccess ? <Welcome /> : <Navigate to="/home" />} />
      <Route path="/setup/storages" element={<SetupStorages />} />
      <Route path="/setup/tutorial" element={<SetupTutorial />} />
      <Route path="/home" element={<WelcomeReturn />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/validation" element={<Validation />} />
      <Route path="/coverage" element={<Coverage />} />
      <Route path="/results" element={<Results />} />
      <Route path="/export" element={<Export />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-container">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App