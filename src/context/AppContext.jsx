import { createContext, useContext, useState } from 'react'
const AppContext = createContext()
const defaultStorages = [
  { id: 1, name: 'Loja', active: true, isDefault: true },
  { id: 2, name: 'Estoque extra', active: true, isDefault: true },
]
const defaultCoverage = {
  FEMININA: { SAPATO: 3, BOLSA: 1, CINTO: 0, CARTEIRA: 0, MEIA: 0, MOCHILA: 0, OUTROS: 0 },
  MASCULINA: { SAPATO: 3, BOLSA: 2, CINTO: 5, CARTEIRA: 5, MEIA: 3, MOCHILA: 2, OUTROS: 0 },
}
export function AppProvider({ children }) {
  const [firstAccess, setFirstAccess] = useState(true)
  const [showTutorial, setShowTutorial] = useState(true)
  const [storages, setStorages] = useState(defaultStorages)
  const [baseData, setBaseData] = useState([])
  const [systemData, setSystemData] = useState([])
  const [inventoryData, setInventoryData] = useState({})
  const [validationErrors, setValidationErrors] = useState([])
  const [ignoredItems, setIgnoredItems] = useState([])
  const [coverage, setCoverage] = useState(defaultCoverage)
  const [results, setResults] = useState(null)
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