import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight, IconX } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
import { parseSystemData, parseBaseData, parseInventoryTxt, parseInventoryExcel, calculateResults, groupResults } from '../utils/processData'

export default function Coverage() {
  const navigate = useNavigate()
  const {
    coverage, setCoverage,
    systemData, inventoryData, storages,
    baseData, setResults,
    availableArticles, availableGenders,
  } = useApp()

  const [activeGender, setActiveGender] = useState(null)

  const safeCoverage = coverage || {}

  const genders = availableGenders.length > 0
    ? availableGenders
    : ['FEMININA', 'MASCULINA']

  const articles = availableArticles.length > 0
    ? availableArticles
    : ['SAPATO', 'BOLSA', 'CINTO', 'CARTEIRA', 'MEIA', 'MOCHILA', 'OUTROS']

  const activeTab = activeGender || genders[0]

  const updateCoverage = (gender, article, delta) => {
    setCoverage(prev => {
      const p = prev || {}
      return { ...p, [gender]: { ...(p[gender] || {}), [article]: Math.max(0, (p[gender]?.[article] || 0) + delta) } }
    })
  }

  const clearArticle = (gender, article) => {
    setCoverage(prev => {
      const p = prev || {}
      return { ...p, [gender]: { ...(p[gender] || {}), [article]: 0 } }
    })
  }

  const clearAll = () => {
    const newCov = {}
    genders.forEach(gender => {
      newCov[gender] = {}
      articles.forEach(article => { newCov[gender][article] = 0 })
    })
    setCoverage(newCov)
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

    const raw = calculateResults(systemParsed, base, inventoryByStorage, storages, safeCoverage)
    const grouped = groupResults(raw)
    setResults({ raw, grouped })
    navigate('/results')
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/validation')}>
          <IconArrowLeft size={16} /> Voltar
        </button>
        <div className="page-title">Cobertura mínima</div>
        <div style={{ width: 60 }} />
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
        Defina quantas peças manter na loja por artigo.
      </p>

      <div className="gender-tabs" style={{ flexWrap: 'wrap', gap: 6 }}>
        {genders.map(g => (
          <button
            key={g}
            className={'gender-tab ' + (activeTab === g ? 'active' : '')}
            onClick={() => setActiveGender(g)}
          >
            {g.charAt(0) + g.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--gray-bg)', borderRadius: 10, padding: '4px 12px', marginBottom: 10 }}>
        {articles.map(article => (
          <div className="coverage-row" key={article}>
            <span className="coverage-name">
              {article.charAt(0) + article.slice(1).toLowerCase()}
            </span>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => updateCoverage(activeTab, article, -1)}>−</button>
              <span className="qty-value">{safeCoverage[activeTab]?.[article] || 0}</span>
              <button className="qty-btn" onClick={() => updateCoverage(activeTab, article, 1)}>+</button>
              <button onClick={() => clearArticle(activeTab, article)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', marginLeft: 4, display: 'flex', alignItems: 'center' }}>
                <IconX size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={clearAll} style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid var(--gray-border)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <IconX size={14} /> Limpar tudo (todos os gêneros)
      </button>

      <div className="mt-auto">
        <button className="btn-primary" onClick={handleCalculate}>
          Ver resultado <IconArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}