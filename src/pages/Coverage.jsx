import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
import { parseSystemData, parseBaseData, parseInventoryTxt, parseInventoryExcel, calculateResults, groupResults } from '../utils/processData'

const ARTICLES = ['SAPATO', 'BOLSA', 'CINTO', 'CARTEIRA', 'MEIA', 'MOCHILA', 'OUTROS']

export default function Coverage() {
  const navigate = useNavigate()
  const { coverage, setCoverage, systemData, inventoryData, storages, baseData, setResults } = useApp()
  const [activeGender, setActiveGender] = useState('FEMININA')

  const updateCoverage = (gender, article, delta) => {
    setCoverage(prev => ({
      ...prev,
      [gender]: {
        ...prev[gender],
        [article]: Math.max(0, (prev[gender]?.[article] || 0) + delta)
      }
    }))
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
      const counts = isTxt
        ? parseInventoryTxt(data, base).counts
        : parseInventoryExcel(data)
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
        <button className="back-btn" onClick={() => navigate('/validation')}>
          <IconArrowLeft size={16} /> Voltar
        </button>
        <div className="page-title">Cobertura minima</div>
        <div style={{ width: 60 }} />
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
        Defina quantas pecas manter na loja por artigo.
      </p>

      <div className="gender-tabs">
        {['FEMININA', 'MASCULINA'].map(g => (
          <button
            key={g}
            className={'gender-tab ' + (activeGender === g ? 'active' : '')}
            onClick={() => setActiveGender(g)}
          >
            {g.charAt(0) + g.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--gray-bg)', borderRadius: 10, padding: '4px 12px', marginBottom: 20 }}>
        {ARTICLES.map(article => (
          <div className="coverage-row" key={article}>
            <span className="coverage-name">
              {article.charAt(0) + article.slice(1).toLowerCase()}
            </span>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => updateCoverage(activeGender, article, -1)}>-</button>
              <span className="qty-value">{coverage[activeGender]?.[article] || 0}</span>
              <button className="qty-btn" onClick={() => updateCoverage(activeGender, article, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <button className="btn-primary" onClick={handleCalculate}>
          Ver resultado <IconArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}