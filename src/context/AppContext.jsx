import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

const defaultStorages = [
  { id: 1, name: 'Loja', active: true, isDefault: true },
  { id: 2, name: 'Estoque extra', active: true, isDefault: true },
]

const defaultCoverage = {
  FEMININA: { SAPATO: 3, BOLSA: 1, CINTO: 0, CARTEIRA: 0, MEIA: 0, MOCHILA: 0, OUTROS: 0 },
  MASCULINA: { SAPATO: 3, BOLSA: 2, CINTO: 5, CARTEIRA: 5, MEIA: 3, MOCHILA: 2, OUTROS: 0 },
}

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function AppProvider({ children }) {
  const [firstAccess, setFirstAccess] = useState(() => loadFromStorage('transfera_firstAccess', true))
  const [showTutorial, setShowTutorial] = useState(() => loadFromStorage('transfera_showTutorial', true))
  const [storages, setStorages] = useState(() => loadFromStorage('transfera_storages', defaultStorages))
  const [coverage, setCoverage] = useState(() => loadFromStorage('transfera_coverage', defaultCoverage))

  const [baseData, setBaseData] = useState([])
  const [systemData, setSystemData] = useState([])
  const [inventoryData, setInventoryData] = useState({})
  const [validationErrors, setValidationErrors] = useState([])
  const [ignoredItems, setIgnoredItems] = useState([])
  const [results, setResults] = useState(null)

  useEffect(() => { saveToStorage('transfera_firstAccess', firstAccess) }, [firstAccess])
  useEffect(() => { saveToStorage('transfera_showTutorial', showTutorial) }, [showTutorial])
  useEffect(() => { saveToStorage('transfera_storages', storages) }, [storages])
  useEffect(() => { saveToStorage('transfera_coverage', coverage) }, [coverage])

  const addStorage = (name) => {
    setStorages(prev => [...prev, { id: Date.now(), name, active: false, isDefault: false }])
  }

  const updateStorage = (id, changes) => {
    setStorages(prev => prev.map(s => s.id === id ? { ...s, ...changes } : s))
  }

  const removeStorage = (id) => {
    setStorages(prev => prev.filter(s => s.id !== id))
  }

  return (
    <AppContext.Provider value={{
      firstAccess, setFirstAccess,
      showTutorial, setShowTutorial,
      storages, addStorage, updateStorage, removeStorage,
      baseData, setBaseData,
      systemData, setSystemData,
      inventoryData, setInventoryData,
      validationErrors, setValidationErrors,
      ignoredItems, setIgnoredItems,
      coverage, setCoverage,
      results, setResults,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}