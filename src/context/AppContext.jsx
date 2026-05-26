import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

const defaultStorages = [
  { id: 1, name: 'Loja', active: true, isDefault: true },
  { id: 2, name: 'Estoque extra', active: true, isDefault: true },
]

const defaultCoverage = {}

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
  const [coverage, setCoverage] = useState(() => loadFromStorage('transfera_coverage', defaultCoverage) || {})
  const [ignoredArticles, setIgnoredArticles] = useState(() => loadFromStorage('transfera_ignoredArticles', {}))

  const [baseData, setBaseData] = useState([])
  const [systemData, setSystemData] = useState([])
  const [inventoryData, setInventoryData] = useState({})
  const [validationErrors, setValidationErrors] = useState([])
  const [ignoredItems, setIgnoredItems] = useState([])
  const [results, setResults] = useState(null)
  const [availableArticles, setAvailableArticles] = useState([])
  const [availableGenders, setAvailableGenders] = useState([])
  const [articlesByGender, setArticlesByGender] = useState({})

  useEffect(() => { saveToStorage('transfera_firstAccess', firstAccess) }, [firstAccess])
  useEffect(() => { saveToStorage('transfera_showTutorial', showTutorial) }, [showTutorial])
  useEffect(() => { saveToStorage('transfera_storages', storages) }, [storages])
  useEffect(() => { saveToStorage('transfera_coverage', coverage) }, [coverage])
  useEffect(() => { saveToStorage('transfera_ignoredArticles', ignoredArticles) }, [ignoredArticles])

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
      availableArticles, setAvailableArticles,
      availableGenders, setAvailableGenders,
      articlesByGender, setArticlesByGender,
      ignoredArticles, setIgnoredArticles,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
