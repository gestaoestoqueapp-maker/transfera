import { writeFileSync } from 'fs'

const files = {
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
      <div className="hero-sub">Equalize o estoque físico da sua loja com rapidez e sem erros.</div>
      <div style={{ marginBottom: 24 }}>
        <div className="feature-item">
          <IconUpload size={20} className="feature-icon" />
          <div className="feature-text">
            <strong>Importe os relatórios</strong>
            <span>Relatório do sistema e inventário físico em Excel ou .txt</span>
          </div>
        </div>
        <div className="feature-item">
          <IconAdjustmentsHorizontal size={20} className="feature-icon" />
          <div className="feature-text">
            <strong>Configure a cobertura</strong>
            <span>Defina quantas peças manter por artigo em cada estoque</span>
          </div>
        </div>
        <div className="feature-item">
          <IconFileExport size={20} className="feature-icon" />
          <div className="feature-text">
            <strong>Exporte o resultado</strong>
            <span>Lista de reposição em Excel ou PDF para impressão</span>
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
          <div className="info-banner-text">Quer rever o tutorial de uso antes de começar?</div>
        </div>
      )}
      <div className="checkbox-row">
        <input type="checkbox" id="dontShow" checked={dontShow} onChange={e => setDontShow(e.target.checked)} />
        <label htmlFor="dontShow">Não mostrar novamente</label>
      </div>
      <div className="mt-auto">
        <button className="btn-primary" onClick={handleStart}>
          Iniciar nova reposição <IconArrowRight size={16} />
        </button>
        {showTutorial && (
          <button className="btn-secondary" onClick={handleTutorial}>Ver tutorial de uso</button>
        )}
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
        <div className="page-title">Estoques físicos</div>
        <div style={{ width: 60 }} />
      </div>
      <div className="step-indicator">
        <div className="step-dot active" />
        <div className="step-dot" />
        <div className="step-dot" />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>Confirme ou renomeie os estoques. Ative apenas os que existem na sua operação.</p>
      {storages.map(storage => (
        <div className="storage-item" key={storage.id}>
          {storage.id === 1 ? <IconBuildingStore size={18} color="#185FA5" /> : <IconBox size={18} color={storage.active ? '#185FA5' : '#999'} />}
          {editingId === storage.id ? (
            <input className="edit-input" value={editingName} onChange={e => setEditingName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit(storage.id)} autoFocus />
          ) : (
            <span className="storage-name">{storage.name}</span>
          )}
          {storage.isDefault && <span className="badge-default">padrão</span>}
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
        <button className="btn-primary" onClick={() => navigate('/setup/tutorial')}>Próximo <IconArrowRight size={16} /></button>
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
    { title: 'Toque em "Instalar app"', desc: 'ou "Adicionar à tela inicial"' },
    { title: 'Confirme', desc: '— o ícone aparecerá na sua tela inicial' },
  ]},
  iphone: { label: 'iPhone', steps: [
    { title: 'Abra o Safari', desc: 'e acesse o link do Transfera' },
    { title: 'Toque no botão compartilhar', desc: '(ícone de quadrado com seta para cima)' },
    { title: 'Role a lista e toque em', desc: '"Adicionar à Tela de Início"' },
    { title: 'Toque em "Adicionar"', desc: '— o ícone aparecerá na sua tela inicial' },
  ]},
  windows: { label: 'Windows', steps: [
    { title: 'Abra o Chrome ou Edge', desc: 'e acesse o link do Transfera' },
    { title: 'Clique no ícone de instalar', desc: 'na barra de endereços' },
    { title: 'Clique em "Instalar"', desc: 'na janela que aparecer' },
    { title: 'Pronto', desc: '— o app aparecerá no menu iniciar' },
  ]},
  mac: { label: 'Mac', steps: [
    { title: 'Abra o Chrome ou Safari', desc: 'e acesse o link do Transfera' },
    { title: 'No Chrome', desc: 'clique no ícone de instalar na barra de endereços' },
    { title: 'No Safari', desc: 'clique em Arquivo → Adicionar ao Dock' },
    { title: 'Confirme', desc: '— o app aparecerá no Launchpad' },
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
        <div className="page-title">Instalação</div>
        <div style={{ width: 60 }} />
      </div>
      <div className="step-indicator">
        <div className="step-dot" />
        <div className="step-dot active" />
        <div className="step-dot" />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>Selecione o dispositivo que você está usando agora.</p>
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
        <button className="btn-primary" onClick={finish}>Concluir configuração</button>
      </div>
    </div>
  )
}`,

'src/pages/Validation.jsx': `import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
import { parseBaseData, parseInventoryTxt, parseInventoryExcel } from '../utils/processData'
export default function Validation() {
  const navigate = useNavigate()
  const { systemData, inventoryData, storages, baseData, setBaseData, setValidationErrors, setIgnoredItems } = useApp()
  const [errors, setErrors] = useState([])
  const [showAll, setShowAll] = useState(false)
  const [processed, setProcessed] = useState(false)
  useEffect(() => {
    const run = () => {
      const base = Array.isArray(baseData) ? parseBaseData(baseData) : baseData
      if (Array.isArray(baseData)) setBaseData(base)
      const allErrors = []
      const activeStorages = storages.filter(s => s.active)
      const uploadStorages = activeStorages.slice(0, -1)
      uploadStorages.forEach(storage => {
        const data = inventoryData[storage.id]
        if (!data) return
        const isTxt = Array.isArray(data) && typeof data[0] === 'string'
        if (isTxt) {
          const { errors: errs } = parseInventoryTxt(data, base)
          errs.forEach(e => allErrors.push({ ...e, storage: storage.name }))
        } else {
          const counts = parseInventoryExcel(data)
          Object.keys(counts).forEach(barcode => {
            if (!base[barcode]) allErrors.push({ line: '-', value: barcode, reason: 'Código não encontrado na base', storage: storage.name })
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
        <div className="page-title">Validação</div>
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
                {errors.length} erros encontrados — ver lista completa
              </button>
            )}
          </div>
          {visibleErrors.map((err, i) => (
            <div className="error-item" key={i}>
              <span style={{ color: '#E24B4A', minWidth: 70 }}>{err.storage} L{err.line}</span>
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
        {errors.length > 0 ? 'Itens ignorados não entram no cálculo. Um resumo aparecerá ao exportar.' : 'Prossiga para configurar a cobertura mínima.'}
      </div>
      <div className="mt-auto">
        {errors.length === 0 && <button className="btn-primary" onClick={() => navigate('/coverage')}>Configurar cobertura <IconArrowRight size={16} /></button>}
      </div>
    </div>
  )
}`,

'src/pages/Coverage.jsx': `import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight, IconX } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
import { parseSystemData, parseBaseData, parseInventoryTxt, parseInventoryExcel, calculateResults, groupResults } from '../utils/processData'
const ARTICLES = ['SAPATO', 'BOLSA', 'CINTO', 'CARTEIRA', 'MEIA', 'MOCHILA', 'OUTROS']
export default function Coverage() {
  const navigate = useNavigate()
  const { coverage, setCoverage, systemData, inventoryData, storages, baseData, setResults } = useApp()
  const [activeGender, setActiveGender] = useState('FEMININA')
  const updateCoverage = (gender, article, delta) => {
    setCoverage(prev => ({ ...prev, [gender]: { ...prev[gender], [article]: Math.max(0, (prev[gender]?.[article] || 0) + delta) } }))
  }
  const clearArticle = (gender, article) => {
    setCoverage(prev => ({ ...prev, [gender]: { ...prev[gender], [article]: 0 } }))
  }
  const clearAll = () => {
    setCoverage(prev => {
      const newCov = { ...prev }
      Object.keys(newCov).forEach(gender => {
        ARTICLES.forEach(article => { newCov[gender] = { ...newCov[gender], [article]: 0 } })
      })
      return newCov
    })
  }
  const handleCalculate = () => {
    const base = Array.isArray(baseData) ? parseBaseData(baseData) : baseData
    const activeStorages = storages.filter(s => s.active)
    const uploadStorages = activeStorages.slice(0, -1)
    const systemParsed = parseSystemData(systemData)
    const inventoryByStorage = {}
    uploadStorages.forEach(storage => {
      const data = inventoryData[storage.id]
      if (!data) return
      const isTxt = Array.isArray(data) && typeof data[0] === 'string'
      const counts = isTxt ? parseInventoryTxt(data, base).counts : parseInventoryExcel(data)
      inventoryByStorage[storage.id] = counts
    })
    const raw = calculateResults(systemParsed, base, inventoryByStorage, storages, coverage)
    const grouped = groupResults(raw)
    setResults({ raw, grouped })
    navigate('/results')
  }
  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/validation')}><IconArrowLeft size={16} /> Voltar</button>
        <div className="page-title">Cobertura mínima</div>
        <div style={{ width: 60 }} />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>Defina quantas peças manter na loja por artigo.</p>
      <div className="gender-tabs">
        {['FEMININA', 'MASCULINA'].map(g => (
          <button key={g} className={"gender-tab " + (activeGender === g ? 'active' : '')} onClick={() => setActiveGender(g)}>
            {g.charAt(0) + g.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      <div style={{ background: 'var(--gray-bg)', borderRadius: 10, padding: '4px 12px', marginBottom: 12 }}>
        {ARTICLES.map(article => (
          <div className="coverage-row" key={article}>
            <span className="coverage-name">{article.charAt(0) + article.slice(1).toLowerCase()}</span>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => updateCoverage(activeGender, article, -1)}>−</button>
              <span className="qty-value">{coverage[activeGender]?.[article] || 0}</span>
              <button className="qty-btn" onClick={() => updateCoverage(activeGender, article, 1)}>+</button>
              <button onClick={() => clearArticle(activeGender, article)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', marginLeft: 4, display: 'flex', alignItems: 'center' }} title="Limpar">
                <IconX size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={clearAll} style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid var(--gray-border)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <IconX size={14} /> Limpar tudo (ambos os gêneros)
      </button>
      <div className="mt-auto">
        <button className="btn-primary" onClick={handleCalculate}>Ver resultado <IconArrowRight size={16} /></button>
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
  if (!results) return <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-secondary)' }}>Nenhum resultado disponível.</p></div>
  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/results')}><IconArrowLeft size={16} /> Voltar</button>
        <div className="page-title">Exportar</div>
        <div style={{ width: 60 }} />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>Escolha o formato para exportar a lista de reposição.</p>
      <button className="export-btn" onClick={() => exportToExcel(results, coverage)}>
        <div className="export-icon" style={{ background: 'var(--green-light)' }}><IconFileSpreadsheet size={20} color="#3B6D11" /></div>
        <div style={{ flex: 1 }}><div className="export-title">Exportar Excel (.xlsx)</div><div className="export-sub">Mesmo formato da planilha atual</div></div>
        <IconDownload size={16} color="#999" />
      </button>
      <button className="export-btn" onClick={() => exportToPdf(results, coverage)}>
        <div className="export-icon" style={{ background: 'var(--amber-light)' }}><IconFileText size={20} color="#854F0B" /></div>
        <div style={{ flex: 1 }}><div className="export-title">Exportar PDF</div><div className="export-sub">Layout compacto para impressão</div></div>
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
                  <span style={{ color: 'var(--text-secondary)' }}>{item.storage} L{item.line} — {item.reason}: <strong>{item.value}</strong></span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mt-auto" style={{ paddingTop: 16 }}>
        <button className="btn-secondary" onClick={() => navigate('/home')}>Nova reposição</button>
      </div>
    </div>
  )
}`
}

for (const [path, content] of Object.entries(files)) {
  writeFileSync(path, content, { encoding: 'utf8' })
  console.log('Atualizado: ' + path)
}
console.log('Concluído!')