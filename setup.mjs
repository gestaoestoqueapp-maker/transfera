import { writeFileSync } from 'fs'

const files = {
'src/context/AppContext.jsx': `import { createContext, useContext, useState } from 'react'
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
}`,

'src/pages/Welcome.jsx': `import { useNavigate } from 'react-router-dom'
import { IconArrowRight, IconUpload, IconAdjustmentsHorizontal, IconFileExport } from '@tabler/icons-react'
export default function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="page">
      <div className="page-header">
        <div className="logo">Trans<span>fera</span></div>
      </div>
      <div className="hero-icon">
        <IconFileExport size={28} color="#185FA5" />
      </div>
      <div className="hero-title">Bem-vindo ao Transfera</div>
      <div className="hero-sub">Equalize o estoque fisico da sua loja com rapidez e sem erros.</div>
      <div style={{ marginBottom: 24 }}>
        <div className="feature-item">
          <IconUpload size={20} className="feature-icon" />
          <div className="feature-text">
            <strong>Importe os relatorios</strong>
            <span>Relatorio do sistema e inventario fisico em Excel ou .txt</span>
          </div>
        </div>
        <div className="feature-item">
          <IconAdjustmentsHorizontal size={20} className="feature-icon" />
          <div className="feature-text">
            <strong>Configure a cobertura</strong>
            <span>Defina quantas pecas manter por artigo em cada estoque</span>
          </div>
        </div>
        <div className="feature-item">
          <IconFileExport size={20} className="feature-icon" />
          <div className="feature-text">
            <strong>Exporte o resultado</strong>
            <span>Lista de reposicao em Excel ou PDF para impressao</span>
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <button className="btn-primary" onClick={() => navigate('/setup/storages')}>
          Configurar o app <IconArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}`,

'src/pages/WelcomeReturn.jsx': `import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowRight, IconInfoCircle, IconSettings } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
export default function WelcomeReturn() {
  const navigate = useNavigate()
  const { showTutorial, setShowTutorial } = useApp()
  const [dontShow, setDontShow] = useState(false)
  const handleStart = () => {
    if (dontShow) setShowTutorial(false)
    navigate('/upload')
  }
  const handleTutorial = () => {
    if (dontShow) setShowTutorial(false)
    navigate('/setup/tutorial')
  }
  return (
    <div className="page">
      <div className="page-header">
        <div className="logo">Trans<span>fera</span></div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => navigate('/setup/storages')}>
          <IconSettings size={20} />
        </button>
      </div>
      {showTutorial && (
        <div className="info-banner">
          <IconInfoCircle size={18} color="#185FA5" style={{ flexShrink: 0, marginTop: 1 }} />
          <div className="info-banner-text">Quer rever o tutorial de uso antes de comecar?</div>
        </div>
      )}
      <div className="checkbox-row">
        <input type="checkbox" id="dontShow" checked={dontShow} onChange={e => setDontShow(e.target.checked)} />
        <label htmlFor="dontShow">Nao mostrar novamente</label>
      </div>
      <div className="mt-auto">
        <button className="btn-primary" onClick={handleStart}>
          Iniciar nova reposicao <IconArrowRight size={16} />
        </button>
        {showTutorial && (
          <button className="btn-secondary" onClick={handleTutorial}>Ver tutorial de uso</button>
        )}
      </div>
    </div>
  )
}`,

'src/pages/SetupTutorial.jsx': `import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconBrandAndroid, IconBrandApple, IconDeviceDesktop, IconDeviceLaptop } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
const tutorials = {
  android: { label: 'Android', steps: [
    { title: 'Abra o Chrome', desc: 'e acesse o link do Transfera' },
    { title: 'Toque no menu', desc: '(3 pontos no canto superior direito)' },
    { title: 'Toque em Instalar app', desc: 'ou Adicionar a tela inicial' },
    { title: 'Confirme', desc: 'o icone aparecera na sua tela inicial' },
  ]},
  iphone: { label: 'iPhone', steps: [
    { title: 'Abra o Safari', desc: 'e acesse o link do Transfera' },
    { title: 'Toque no botao compartilhar', desc: 'icone de quadrado com seta para cima' },
    { title: 'Role a lista e toque em', desc: 'Adicionar a Tela de Inicio' },
    { title: 'Toque em Adicionar', desc: 'o icone aparecera na sua tela inicial' },
  ]},
  windows: { label: 'Windows', steps: [
    { title: 'Abra o Chrome ou Edge', desc: 'e acesse o link do Transfera' },
    { title: 'Clique no icone de instalar', desc: 'na barra de enderecos' },
    { title: 'Clique em Instalar', desc: 'na janela que aparecer' },
    { title: 'Pronto', desc: 'o app aparecera no menu iniciar' },
  ]},
  mac: { label: 'Mac', steps: [
    { title: 'Abra o Chrome ou Safari', desc: 'e acesse o link do Transfera' },
    { title: 'No Chrome', desc: 'clique no icone de instalar na barra de enderecos' },
    { title: 'No Safari', desc: 'clique em Arquivo e Adicionar ao Dock' },
    { title: 'Confirme', desc: 'o app aparecera no Launchpad' },
  ]},
}
export default function SetupTutorial() {
  const navigate = useNavigate()
  const { setFirstAccess } = useApp()
  const [selected, setSelected] = useState('android')
  const finish = () => { setFirstAccess(false); navigate('/home') }
  const devices = [
    { key: 'android', icon: <IconBrandAndroid size={22} color="#185FA5" /> },
    { key: 'iphone', icon: <IconBrandApple size={22} color="#185FA5" /> },
    { key: 'windows', icon: <IconDeviceDesktop size={22} color="#185FA5" /> },
    { key: 'mac', icon: <IconDeviceLaptop size={22} color="#185FA5" /> },
  ]
  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/setup/storages')}><IconArrowLeft size={16} /> Voltar</button>
        <div className="page-title">Instalacao</div>
        <div style={{ width: 60 }} />
      </div>
      <div className="step-indicator">
        <div className="step-dot" />
        <div className="step-dot active" />
        <div className="step-dot" />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>Selecione o dispositivo que voce esta usando agora.</p>
      <div className="device-grid">
        {devices.map(d => (
          <div key={d.key} className={"device-card " + (selected === d.key ? 'active' : '')} onClick={() => setSelected(d.key)}>
            {d.icon}<span>{tutorials[d.key].label}</span>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--gray-bg)', borderRadius: 10, padding: 12, marginBottom: 20 }}>
        {tutorials[selected].steps.map((step, i) => (
          <div className="tut-step" key={i}>
            <div className="tut-num">{i + 1}</div>
            <div className="tut-text"><strong>{step.title}</strong> {step.desc}</div>
          </div>
        ))}
      </div>
      <div className="mt-auto">
        <button className="btn-primary" onClick={finish}>Concluir configuracao</button>
      </div>
    </div>
  )
}`,

'src/pages/SetupStorages.jsx': `import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowRight, IconArrowLeft, IconBuildingStore, IconBox, IconPencil, IconCheck, IconPlus, IconTrash } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
export default function SetupStorages() {
  const navigate = useNavigate()
  const { storages, addStorage, updateStorage, removeStorage } = useApp()
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [newStorageName, setNewStorageName] = useState('')
  const [showAddInput, setShowAddInput] = useState(false)
  const startEdit = (storage) => { setEditingId(storage.id); setEditingName(storage.name) }
  const saveEdit = (id) => { if (editingName.trim()) updateStorage(id, { name: editingName.trim() }); setEditingId(null) }
  const handleAdd = () => { if (newStorageName.trim()) { addStorage(newStorageName.trim()); setNewStorageName(''); setShowAddInput(false) } }
  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}><IconArrowLeft size={16} /> Voltar</button>
        <div className="page-title">Estoques fisicos</div>
        <div style={{ width: 60 }} />
      </div>
      <div className="step-indicator">
        <div className="step-dot active" />
        <div className="step-dot" />
        <div className="step-dot" />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>Confirme ou renomeie os estoques. Ative apenas os que existem na sua operacao.</p>
      {storages.map(storage => (
        <div className="storage-item" key={storage.id}>
          {storage.id === 1 ? <IconBuildingStore size={18} color="#185FA5" /> : <IconBox size={18} color={storage.active ? '#185FA5' : '#999'} />}
          {editingId === storage.id ? (
            <input className="edit-input" value={editingName} onChange={e => setEditingName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit(storage.id)} autoFocus />
          ) : (
            <span className="storage-name">{storage.name}</span>
          )}
          {storage.isDefault && <span className="badge-default">padrao</span>}
          {editingId === storage.id ? (
            <button onClick={() => saveEdit(storage.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#185FA5' }}><IconCheck size={16} /></button>
          ) : (
            <button onClick={() => startEdit(storage)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><IconPencil size={15} /></button>
          )}
          {!storage.isDefault && (
            <button onClick={() => removeStorage(storage.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><IconTrash size={15} /></button>
          )}
          <button className={"toggle " + (storage.active ? 'on' : 'off')} onClick={() => updateStorage(storage.id, { active: !storage.active })} />
        </div>
      ))}
      {showAddInput ? (
        <div className="storage-item">
          <IconBox size={18} color="#999" />
          <input className="edit-input" placeholder="Nome do estoque" value={newStorageName} onChange={e => setNewStorageName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} autoFocus />
          <button onClick={handleAdd} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#185FA5' }}><IconCheck size={16} /></button>
        </div>
      ) : (
        <button className="add-storage-btn" onClick={() => setShowAddInput(true)}><IconPlus size={16} /> Adicionar estoque</button>
      )}
      <div className="mt-auto">
        <button className="btn-primary" onClick={() => navigate('/setup/tutorial')}>Proximo <IconArrowRight size={16} /></button>
      </div>
    </div>
  )
}`,

'src/pages/Upload.jsx': `import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight, IconUpload, IconFileSpreadsheet, IconCheck } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
import * as XLSX from 'xlsx'
export default function Upload() {
  const navigate = useNavigate()
  const { storages, setSystemData, setBaseData, setInventoryData, setValidationErrors, setIgnoredItems } = useApp()
  const [systemFile, setSystemFile] = useState(null)
  const [inventoryFiles, setInventoryFiles] = useState({})
  const [loading, setLoading] = useState(false)
  const systemRef = useRef()
  const activeStorages = storages.filter(s => s.active)
  const inventoryRefs = useRef({})
  const readExcel = (file) => new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      resolve(XLSX.utils.sheet_to_json(ws, { header: 1 }))
    }
    reader.readAsArrayBuffer(file)
  })
  const readTxt = (file) => new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result.split('\\n').map(l => l.trim()).filter(l => l))
    reader.readAsText(file)
  })
  const handleSystemFile = async (file) => {
    if (!file) return
    const data = await readExcel(file)
    setSystemFile(file)
    setSystemData(data)
  }
  const handleInventoryFile = async (file, storageId) => {
    if (!file) return
    const data = file.name.endsWith('.txt') ? await readTxt(file) : await readExcel(file)
    setInventoryFiles(prev => ({ ...prev, [storageId]: file }))
    setInventoryData(prev => ({ ...prev, [storageId]: data }))
  }
  const canProcess = systemFile && activeStorages.every(s => inventoryFiles[s.id])
  const handleProcess = async () => {
    setLoading(true)
    setValidationErrors([])
    setIgnoredItems([])
    setTimeout(() => { setLoading(false); navigate('/validation') }, 800)
  }
  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/home')}><IconArrowLeft size={16} /> Voltar</button>
        <div className="page-title">Carregar arquivos</div>
        <div style={{ width: 60 }} />
      </div>
      <div className={"upload-zone " + (systemFile ? 'filled' : '')} onClick={() => systemRef.current.click()}>
        <div className="upload-label">Relatorio do sistema</div>
        {systemFile ? <IconCheck size={22} color="#185FA5" /> : <IconUpload size={22} color="#999" />}
        <div className="upload-hint">{systemFile ? systemFile.name : '.xlsx'}</div>
        <input ref={systemRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => handleSystemFile(e.target.files[0])} />
      </div>
      {activeStorages.map(storage => (
        <div key={storage.id}>
          <div className={"upload-zone " + (inventoryFiles[storage.id] ? 'filled' : '')} onClick={() => inventoryRefs.current[storage.id]?.click()}>
            <div className="upload-label">Inventario - {storage.name}</div>
            {inventoryFiles[storage.id] ? <IconCheck size={22} color="#185FA5" /> : <IconFileSpreadsheet size={22} color="#999" />}
            <div className="upload-hint">{inventoryFiles[storage.id] ? inventoryFiles[storage.id].name : '.xlsx ou .txt'}</div>
            <input ref={el => inventoryRefs.current[storage.id] = el} type="file" accept=".xlsx,.xls,.txt" style={{ display: 'none' }} onChange={e => handleInventoryFile(e.target.files[0], storage.id)} />
          </div>
        </div>
      ))}
      <div className="mt-auto">
        <button className="btn-primary" onClick={handleProcess} disabled={!canProcess || loading} style={{ opacity: canProcess ? 1 : 0.5 }}>
          {loading ? 'Processando...' : <span>Processar <IconArrowRight size={16} /></span>}
        </button>
      </div>
    </div>
  )
}`,

'src/pages/Validation.jsx': `import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
import { parseSystemData, parseBaseData, parseInventoryTxt, parseInventoryExcel } from '../utils/processData'
export default function Validation() {
  const navigate = useNavigate()
  const { systemData, inventoryData, storages, setBaseData, setValidationErrors, setIgnoredItems } = useApp()
  const [errors, setErrors] = useState([])
  const [showAll, setShowAll] = useState(false)
  const [processed, setProcessed] = useState(false)
  useEffect(() => {
    const run = async () => {
      const base = parseBaseData(systemData)
      setBaseData(base)
      const allErrors = []
      const activeStorages = storages.filter(s => s.active)
      activeStorages.forEach(storage => {
        const data = inventoryData[storage.id]
        if (!data) return
        const isTxt = Array.isArray(data) && typeof data[0] === 'string'
        if (isTxt) {
          const { errors: errs } = parseInventoryTxt(data, base)
          errs.forEach(e => allErrors.push({ ...e, storage: storage.name }))
        } else {
          const counts = parseInventoryExcel(data)
          Object.keys(counts).forEach(barcode => {
            if (!base[barcode]) allErrors.push({ line: '-', value: barcode, reason: 'Codigo nao encontrado na base', storage: storage.name })
          })
        }
      })
      setErrors(allErrors)
      setValidationErrors(allErrors)
      setProcessed(true)
    }
    run()
  }, [])
  const handleIgnoreAll = () => { setIgnoredItems(errors); navigate('/coverage') }
  const visibleErrors = showAll ? errors : errors.slice(0, 10)
  if (!processed) return <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-secondary)' }}>Validando arquivos...</p></div>
  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/upload')}><IconArrowLeft size={16} /> Voltar</button>
        <div className="page-title">Validacao</div>
        <div style={{ width: 60 }} />
      </div>
      {errors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <IconCircleCheck size={48} color="#3B6D11" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>Nenhum erro encontrado</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Todos os arquivos foram validados com sucesso.</p>
        </div>
      ) : (
        <div className="error-banner">
          <div className="error-title">
            <IconAlertTriangle size={16} />
            {errors.length <= 10 ? errors.length + " erro(s) encontrado(s)" : (
              <button onClick={() => setShowAll(!showAll)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#791F1F', fontWeight: 500, fontSize: 13, textDecoration: 'underline' }}>
                {errors.length} erros encontrados - ver lista completa
              </button>
            )}
          </div>
          {visibleErrors.map((err, i) => (
            <div className="error-item" key={i}>
              <span style={{ color: '#E24B4A', minWidth: 60 }}>{err.storage} L{err.line}</span>
              <span>{err.reason}: <strong>{err.value}</strong></span>
            </div>
          ))}
          {errors.length > 10 && !showAll && (
            <button onClick={() => setShowAll(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A32D2D', fontSize: 12, marginTop: 6, textDecoration: 'underline' }}>
              Ver todos os {errors.length} erros
            </button>
          )}
          <div className="error-actions">
            <button className="btn-danger" onClick={handleIgnoreAll}>Ignorar todos</button>
            <button className="btn-outline-danger" onClick={() => navigate('/upload')}>Corrigir arquivo</button>
          </div>
        </div>
      )}
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 8 }}>
        {errors.length > 0 ? 'Itens ignorados nao entram no calculo. Um resumo aparecera ao exportar.' : 'Prossiga para configurar a cobertura minima.'}
      </div>
      <div className="mt-auto">
        {errors.length === 0 && <button className="btn-primary" onClick={() => navigate('/coverage')}>Configurar cobertura <IconArrowRight size={16} /></button>}
      </div>
    </div>
  )
}`,

'src/pages/Coverage.jsx': `import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
import { parseSystemData, parseInventoryTxt, parseInventoryExcel, calculateResults, groupResults } from '../utils/processData'
const ARTICLES = ['SAPATO', 'BOLSA', 'CINTO', 'CARTEIRA', 'MEIA', 'MOCHILA', 'OUTROS']
export default function Coverage() {
  const navigate = useNavigate()
  const { coverage, setCoverage, systemData, inventoryData, storages, baseData, setResults } = useApp()
  const [activeGender, setActiveGender] = useState('FEMININA')
  const updateCoverage = (gender, article, delta) => {
    setCoverage(prev => ({ ...prev, [gender]: { ...prev[gender], [article]: Math.max(0, (prev[gender]?.[article] || 0) + delta) } }))
  }
  const handleCalculate = () => {
    const activeStorages = storages.filter(s => s.active)
    const systemParsed = parseSystemData(systemData)
    const totalInventory = {}
    activeStorages.forEach(storage => {
      const data = inventoryData[storage.id]
      if (!data) return
      const isTxt = Array.isArray(data) && typeof data[0] === 'string'
      const counts = isTxt ? parseInventoryTxt(data, baseData).counts : parseInventoryExcel(data)
      Object.entries(counts).forEach(([code, qty]) => { totalInventory[code] = (totalInventory[code] || 0) + qty })
    })
    const raw = calculateResults(systemParsed, baseData, totalInventory, coverage)
    const grouped = groupResults(raw)
    setResults({ raw, grouped })
    navigate('/results')
  }
  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/validation')}><IconArrowLeft size={16} /> Voltar</button>
        <div className="page-title">Cobertura minima</div>
        <div style={{ width: 60 }} />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>Defina quantas pecas manter na loja por artigo.</p>
      <div className="gender-tabs">
        {['FEMININA', 'MASCULINA'].map(g => (
          <button key={g} className={"gender-tab " + (activeGender === g ? 'active' : '')} onClick={() => setActiveGender(g)}>
            {g.charAt(0) + g.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      <div style={{ background: 'var(--gray-bg)', borderRadius: 10, padding: '4px 12px', marginBottom: 20 }}>
        {ARTICLES.map(article => (
          <div className="coverage-row" key={article}>
            <span className="coverage-name">{article.charAt(0) + article.slice(1).toLowerCase()}</span>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => updateCoverage(activeGender, article, -1)}>-</button>
              <span className="qty-value">{coverage[activeGender]?.[article] || 0}</span>
              <button className="qty-btn" onClick={() => updateCoverage(activeGender, article, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto">
        <button className="btn-primary" onClick={handleCalculate}>Ver resultado <IconArrowRight size={16} /></button>
      </div>
    </div>
  )
}`,

'src/pages/Results.jsx': `import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight, IconChevronDown, IconChevronUp, IconSearch, IconAdjustmentsHorizontal } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
export default function Results() {
  const navigate = useNavigate()
  const { results } = useApp()
  const [activeFilter, setActiveFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const [activeGender, setActiveGender] = useState(null)
  const [activeArticle, setActiveArticle] = useState(null)
  const [expandedGroups, setExpandedGroups] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  if (!results) return <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-secondary)' }}>Nenhum resultado disponivel.</p></div>
  const { grouped } = results
  const totalTransfer = grouped.reduce((sum, g) => sum + (g.total > 0 ? g.total : 0), 0)
  const totalExcess = grouped.reduce((sum, g) => sum + (g.total < 0 ? Math.abs(g.total) : 0), 0)
  const totalFem = grouped.filter(g => ['FEMININA','KIDS','UNISSEX'].includes(g.gender)).reduce((sum, g) => sum + (g.total > 0 ? g.total : 0), 0)
  const totalMasc = grouped.filter(g => g.gender === 'MASCULINA').reduce((sum, g) => sum + (g.total > 0 ? g.total : 0), 0)
  const articles = [...new Set(grouped.map(g => g.article))]
  const genders = [...new Set(grouped.map(g => g.gender))]
  const toggleGroup = (key) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }))
  const filtered = grouped.filter(g => {
    if (activeFilter === 'transferir' && g.total <= 0) return false
    if (activeFilter === 'excesso' && g.total >= 0) return false
    if (activeGender && g.gender !== activeGender) return false
    if (activeArticle && g.article !== activeArticle) return false
    if (search) {
      const s = search.toLowerCase()
      if (!g.items.some(item => item.description.toLowerCase().includes(s)) && !g.article.toLowerCase().includes(s)) return false
    }
    return true
  })
  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/coverage')}><IconArrowLeft size={16} /> Voltar</button>
        <div className="page-title">Resultado</div>
        <div style={{ width: 60 }} />
      </div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Total a transferir</div><div className="stat-value info">{totalTransfer.toLocaleString('pt-BR')}</div></div>
        <div className="stat-card"><div className="stat-label">Excesso na loja</div><div className="stat-value warn">{totalExcess.toLocaleString('pt-BR')}</div></div>
        <div className="stat-card"><div className="stat-label">Feminina</div><div className="stat-value">{totalFem.toLocaleString('pt-BR')}</div></div>
        <div className="stat-card"><div className="stat-label">Masculina</div><div className="stat-value">{totalMasc.toLocaleString('pt-BR')}</div></div>
      </div>
      <div className="filter-tabs">
        {[['todos','Todos'],['transferir','A transferir'],['excesso','Excesso']].map(([key, label]) => (
          <button key={key} className={"filter-tab " + (activeFilter === key ? 'active' : '')} onClick={() => setActiveFilter(key)}>{label}</button>
        ))}
      </div>
      <div className="search-row">
        <div style={{ position: 'relative', flex: 1 }}>
          <IconSearch size={14} color="#999" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="search-input" style={{ paddingLeft: 30 }} placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--gray-border)', background: showFilters ? 'var(--blue-light)' : 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <IconAdjustmentsHorizontal size={16} color={showFilters ? '#185FA5' : '#999'} />
        </button>
      </div>
      {showFilters && (
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>Genero</p>
          <div className="filter-chips" style={{ marginBottom: 8 }}>
            {genders.map(g => <button key={g} className={"chip " + (activeGender === g ? 'active' : '')} onClick={() => setActiveGender(activeGender === g ? null : g)}>{g.charAt(0) + g.slice(1).toLowerCase()}</button>)}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>Artigo</p>
          <div className="filter-chips">
            {articles.map(a => <button key={a} className={"chip " + (activeArticle === a ? 'active' : '')} onClick={() => setActiveArticle(activeArticle === a ? null : a)}>{a.charAt(0) + a.slice(1).toLowerCase()}</button>)}
          </div>
        </div>
      )}
      <div style={{ flex: 1 }}>
        {filtered.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' }}>Nenhum resultado para os filtros selecionados.</p>
        ) : filtered.map(group => (
          <div className="result-item" key={group.key}>
            <div className="result-item-header" onClick={() => toggleGroup(group.key)}>
              <div>
                <div className="result-item-name">{group.article.charAt(0) + group.article.slice(1).toLowerCase()} {group.gender.charAt(0) + group.gender.slice(1).toLowerCase()}</div>
                <div className="result-item-sub">{group.items.length} SKUs</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={"result-item-qty " + (group.total < 0 ? 'excess' : '')}>{group.total > 0 ? '+' : ''}{group.total.toLocaleString('pt-BR')}</span>
                {expandedGroups[group.key] ? <IconChevronUp size={16} color="#999" /> : <IconChevronDown size={16} color="#999" />}
              </div>
            </div>
            {expandedGroups[group.key] && (
              <div className="result-item-body">
                {group.items.slice(0, 20).map((item, i) => (
                  <div className="sku-row" key={i}>
                    <span className="sku-name">{item.description}</span>
                    <span className={"sku-qty " + (item.replenish < 0 ? 'excess' : '')}>{item.replenish > 0 ? '+' : ''}{item.replenish}</span>
                  </div>
                ))}
                {group.items.length > 20 && <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', padding: '6px 0' }}>e mais {group.items.length - 20} itens no Excel/PDF</p>}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-auto" style={{ paddingTop: 12 }}>
        <button className="btn-primary" onClick={() => navigate('/export')}>Exportar <IconArrowRight size={16} /></button>
      </div>
    </div>
  )
}`,

'src/pages/Export.jsx': `import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconFileSpreadsheet, IconFileText, IconDownload, IconAlertCircle } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
import { exportToExcel } from '../utils/exportExcel'
import { exportToPdf } from '../utils/exportPdf'
export default function Export() {
  const navigate = useNavigate()
  const { results, coverage, ignoredItems } = useApp()
  const [showIgnored, setShowIgnored] = useState(false)
  if (!results) return <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-secondary)' }}>Nenhum resultado disponivel.</p></div>
  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/results')}><IconArrowLeft size={16} /> Voltar</button>
        <div className="page-title">Exportar</div>
        <div style={{ width: 60 }} />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>Escolha o formato para exportar a lista de reposicao.</p>
      <button className="export-btn" onClick={() => exportToExcel(results, coverage)}>
        <div className="export-icon" style={{ background: 'var(--green-light)' }}><IconFileSpreadsheet size={20} color="#3B6D11" /></div>
        <div style={{ flex: 1 }}><div className="export-title">Exportar Excel (.xlsx)</div><div className="export-sub">Mesmo formato da planilha atual</div></div>
        <IconDownload size={16} color="#999" />
      </button>
      <button className="export-btn" onClick={() => exportToPdf(results, coverage)}>
        <div className="export-icon" style={{ background: 'var(--amber-light)' }}><IconFileText size={20} color="#854F0B" /></div>
        <div style={{ flex: 1 }}><div className="export-title">Exportar PDF</div><div className="export-sub">Layout compacto para impressao</div></div>
        <IconDownload size={16} color="#999" />
      </button>
      {ignoredItems.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div className="ignored-note">
            {ignoredItems.length} {ignoredItems.length === 1 ? 'item ignorado' : 'itens ignorados'} no processamento.{' '}
            <button className="ignored-link" onClick={() => setShowIgnored(!showIgnored)}>{showIgnored ? 'Ocultar' : 'Ver lista'}</button>
          </div>
          {showIgnored && (
            <div style={{ background: 'var(--gray-bg)', borderRadius: 8, padding: 10, marginTop: 6 }}>
              {ignoredItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '3px 0', borderBottom: '1px solid var(--gray-border)', fontSize: 12 }}>
                  <IconAlertCircle size={14} color="#999" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{item.storage} L{item.line} - {item.reason}: <strong>{item.value}</strong></span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mt-auto" style={{ paddingTop: 16 }}>
        <button className="btn-secondary" onClick={() => navigate('/home')}>Nova reposicao</button>
      </div>
    </div>
  )
}`,

'src/utils/processData.js': `export function parseSystemData(rawData) {
  const products = []
  let headerRow = -1
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i]
    if (row && row[0] && String(row[0]).toLowerCase().includes('codigo')) { headerRow = i; break }
  }
  if (headerRow === -1) return products
  for (let i = headerRow + 1; i < rawData.length; i++) {
    const row = rawData[i]
    if (!row || !row[0]) continue
    const code = String(row[0]).trim()
    const saldo = Number(row[5]) || 0
    if (!isNaN(Number(code)) && saldo >= 0) products.push({ code, saldo })
  }
  return products
}
export function parseBaseData(rawData) {
  const base = {}
  if (!rawData || rawData.length < 2) return base
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i]
    if (!row || !row[0]) continue
    const code = String(row[0]).trim()
    const description = String(row[1] || '').trim()
    const barcode = String(row[12] || row[0]).trim()
    const group = String(row[14] || '').trim().toUpperCase()
    const gender = String(row[15] || '').trim().toUpperCase()
    const article = String(row[17] || '').trim().toUpperCase()
    base[code] = { code, description, barcode, group, gender, article }
    if (barcode !== code) base[barcode] = { code, description, barcode, group, gender, article }
  }
  return base
}
export function parseInventoryExcel(rawData) {
  const counts = {}
  if (!rawData || rawData.length < 2) return counts
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i]
    if (!row || !row[0]) continue
    const barcode = String(row[0]).trim()
    if (!barcode || isNaN(Number(barcode))) continue
    counts[barcode] = (counts[barcode] || 0) + 1
  }
  return counts
}
export function parseInventoryTxt(lines, baseData) {
  const counts = {}
  const errors = []
  lines.forEach((line, index) => {
    const clean = line.trim()
    if (!clean) { errors.push({ line: index + 1, value: '', reason: 'Linha vazia' }); return }
    if (!/^\\d+$/.test(clean)) { errors.push({ line: index + 1, value: clean, reason: 'Caractere invalido' }); return }
    if (!baseData[clean]) { errors.push({ line: index + 1, value: clean, reason: 'Codigo nao encontrado na base' }); return }
    counts[clean] = (counts[clean] || 0) + 1
  })
  return { counts, errors }
}
export function calculateResults(systemData, baseData, inventoryCounts, coverage) {
  const results = []
  systemData.forEach(({ code, saldo }) => {
    const product = baseData[code]
    if (!product || !product.article || !product.gender) return
    const storeCount = inventoryCounts[code] || inventoryCounts[product.barcode] || 0
    const extra = Math.max(saldo - storeCount, 0)
    const genderKey = ['FEMININA', 'KIDS', 'UNISSEX'].includes(product.gender) ? 'FEMININA' : 'MASCULINA'
    const target = coverage[genderKey]?.[product.article] || 0
    let replenish = 0
    if (extra + storeCount === 0) replenish = 0
    else if (target - storeCount > 0) replenish = Math.min(extra, target - storeCount)
    else replenish = target - storeCount
    if (replenish !== 0) results.push({ code, description: product.description, gender: product.gender, group: product.group, article: product.article, storeCount, extra, target, replenish })
  })
  return results
}
export function groupResults(results) {
  const groups = {}
  results.forEach(item => {
    const key = item.article + ' ' + item.gender
    if (!groups[key]) groups[key] = { key, article: item.article, gender: item.gender, total: 0, items: [] }
    groups[key].total += item.replenish
    groups[key].items.push(item)
  })
  return Object.values(groups).sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
}`,

'src/utils/exportExcel.js': `import * as XLSX from 'xlsx'
export function exportToExcel(results, coverage) {
  const wb = XLSX.utils.book_new()
  const repData = [['Produto', 'Genero', 'Grupo', 'Artigo', 'Qtd. Loja', 'Estoque Extra', 'Meta', 'Reposicao']]
  results.raw.forEach(item => { if (item.replenish > 0) repData.push([item.description, item.gender, item.group, item.article, item.storeCount, item.extra, item.target, item.replenish]) })
  const wsRep = XLSX.utils.aoa_to_sheet(repData)
  wsRep['!cols'] = [{ wch: 35 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, wsRep, 'Reposicao')
  const excData = [['Produto', 'Genero', 'Artigo', 'Qtd. Loja', 'Meta', 'Excesso']]
  results.raw.forEach(item => { if (item.replenish < 0) excData.push([item.description, item.gender, item.article, item.storeCount, item.target, Math.abs(item.replenish)]) })
  const wsExc = XLSX.utils.aoa_to_sheet(excData)
  wsExc['!cols'] = [{ wch: 35 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, wsExc, 'Excesso')
  const cobData = [['Artigo', 'Feminina', 'Masculina']]
  const articles = [...new Set([...Object.keys(coverage.FEMININA || {}), ...Object.keys(coverage.MASCULINA || {})])]
  articles.forEach(a => cobData.push([a, coverage.FEMININA?.[a] || 0, coverage.MASCULINA?.[a] || 0]))
  const wsCob = XLSX.utils.aoa_to_sheet(cobData)
  wsCob['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, wsCob, 'Coberturas')
  XLSX.writeFile(wb, 'transfera_' + new Date().toISOString().slice(0, 10) + '.xlsx')
}`,

'src/utils/exportPdf.js': `import jsPDF from 'jspdf'
export function exportToPdf(results, coverage) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 10
  const colW = pageW - margin * 2
  let y = margin
  const checkPage = (needed = 6) => { if (y + needed > pageH - margin) { doc.addPage(); y = margin } }
  doc.setFillColor(24, 95, 165)
  doc.rect(0, 0, pageW, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('TRANSFERA', margin, 8)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Gerado em: ' + new Date().toLocaleDateString('pt-BR'), pageW - margin, 8, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  y = 16
  const toTransfer = results.raw.filter(r => r.replenish > 0)
  const excess = results.raw.filter(r => r.replenish < 0)
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text('RESUMO', margin, y); y += 5
  doc.setFontSize(8); doc.setFont('helvetica', 'normal')
  doc.text('Total a transferir: ' + toTransfer.reduce((s, r) => s + r.replenish, 0) + ' pecas', margin, y); y += 4
  doc.text('Excesso na loja: ' + excess.reduce((s, r) => s + Math.abs(r.replenish), 0) + ' pecas', margin, y); y += 8
  const groups = {}
  toTransfer.forEach(item => {
    const key = item.article + ' ' + item.gender
    if (!groups[key]) groups[key] = { article: item.article, gender: item.gender, items: [], total: 0 }
    groups[key].items.push(item); groups[key].total += item.replenish
  })
  Object.values(groups).sort((a, b) => b.total - a.total).forEach(group => {
    checkPage(10)
    doc.setFillColor(230, 241, 251); doc.rect(margin, y, colW, 6, 'F')
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(12, 68, 124)
    doc.text(group.article.charAt(0) + group.article.slice(1).toLowerCase() + ' ' + group.gender.charAt(0) + group.gender.slice(1).toLowerCase(), margin + 2, y + 4)
    doc.text('Total: ' + group.total, pageW - margin, y + 4, { align: 'right' })
    doc.setTextColor(0, 0, 0); y += 7
    doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    group.items.forEach((item, i) => {
      checkPage(5)
      if (i % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(margin, y - 1, colW, 5, 'F') }
      doc.text(item.description, margin + 2, y + 3)
      doc.text('+' + item.replenish, pageW - margin, y + 3, { align: 'right' }); y += 5
    }); y += 3
  })
  if (excess.length > 0) {
    checkPage(10)
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(133, 79, 11)
    doc.text('EXCESSO NA LOJA', margin, y); doc.setTextColor(0, 0, 0); y += 5
    doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    excess.forEach((item, i) => {
      checkPage(5)
      if (i % 2 === 0) { doc.setFillColor(250, 238, 218); doc.rect(margin, y - 1, colW, 5, 'F') }
      doc.text(item.description, margin + 2, y + 3)
      doc.text(String(item.replenish), pageW - margin, y + 3, { align: 'right' }); y += 5
    })
  }
  doc.save('transfera_' + new Date().toISOString().slice(0, 10) + '.pdf')
}`
}

for (const [path, content] of Object.entries(files)) {
  writeFileSync(path, content, { encoding: 'utf8' })
  console.log('Criado: ' + path)
}
console.log('Todos os arquivos criados com sucesso!')