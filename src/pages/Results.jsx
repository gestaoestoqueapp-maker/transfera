import { useState } from 'react'
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
}