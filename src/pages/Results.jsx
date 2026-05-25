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
  const [expandedProducts, setExpandedProducts] = useState({})
  const [showFilters, setShowFilters] = useState(false)

  if (!results) return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Nenhum resultado disponível.</p>
    </div>
  )

  const { grouped } = results

  const totalTransfer = grouped.reduce((sum, g) => sum + (g.total > 0 ? g.total : 0), 0)
  const totalExcess = grouped.reduce((sum, g) =>
    sum + g.items.reduce((s, p) =>
      s + p.items.filter(i => i.replenish < 0).reduce((x, i) => x + Math.abs(i.replenish), 0), 0), 0)
  const totalFem = grouped.filter(g => ['FEMININA', 'KIDS', 'UNISSEX'].includes(g.gender))
    .reduce((sum, g) => sum + (g.total > 0 ? g.total : 0), 0)
  const totalMasc = grouped.filter(g => g.gender === 'MASCULINA')
    .reduce((sum, g) => sum + (g.total > 0 ? g.total : 0), 0)

  const articles = [...new Set(grouped.map(g => g.article))]
  const genders = [...new Set(grouped.map(g => g.gender))]

  const toggleGroup = (key) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }))
  const toggleProduct = (key) => setExpandedProducts(prev => ({ ...prev, [key]: !prev[key] }))

  const getFilteredProducts = (group) => {
    return group.items.filter(product => {
      const productItems = getProductItems(product)
      if (productItems.length === 0) return false
      if (search) {
        const s = search.toLowerCase()
        return product.name.toLowerCase().includes(s) ||
          product.items.some(i => i.description.toLowerCase().includes(s))
      }
      return true
    })
  }

  const getProductItems = (product) => {
    if (activeFilter === 'excesso') return product.items.filter(i => i.replenish < 0)
    if (activeFilter === 'transferir') return product.items.filter(i => i.replenish > 0)
    return product.items
  }

  const getProductTotal = (product) => {
    return getProductItems(product).reduce((s, i) => s + i.replenish, 0)
  }

  const getGroupDisplayTotal = (group) => {
    const products = search ? getFilteredProducts(group) : group.items
    if (activeFilter === 'excesso') {
      return products.reduce((sum, p) =>
        sum + p.items.filter(i => i.replenish < 0).reduce((s, i) => s + i.replenish, 0), 0)
    }
    if (activeFilter === 'transferir') {
      return products.reduce((sum, p) =>
        sum + p.items.filter(i => i.replenish > 0).reduce((s, i) => s + i.replenish, 0), 0)
    }
    return products.reduce((sum, p) => sum + p.total, 0)
  }

  const filtered = grouped.filter(g => {
    if (activeFilter === 'transferir' && !g.items.some(p => p.items.some(i => i.replenish > 0))) return false
    if (activeFilter === 'excesso' && !g.items.some(p => p.items.some(i => i.replenish < 0))) return false
    if (activeGender && g.gender !== activeGender) return false
    if (activeArticle && g.article !== activeArticle) return false
    if (search) {
      const s = search.toLowerCase()
      const hasMatch = g.items.some(p =>
        p.name.toLowerCase().includes(s) ||
        p.items.some(i => i.description.toLowerCase().includes(s))
      )
      if (!hasMatch && !g.article.toLowerCase().includes(s)) return false
    }
    return true
  })

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/coverage')}>
          <IconArrowLeft size={16} /> Voltar
        </button>
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
        {[['todos', 'Todos'], ['transferir', 'A transferir'], ['excesso', 'Excesso']].map(([key, label]) => (
          <button key={key} className={'filter-tab ' + (activeFilter === key ? 'active' : '')} onClick={() => setActiveFilter(key)}>{label}</button>
        ))}
      </div>

      <div className="search-row">
        <div style={{ position: 'relative', flex: 1 }}>
          <IconSearch size={14} color="#999" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="search-input"
            style={{ paddingLeft: 30 }}
            placeholder="Buscar produto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--gray-border)', background: showFilters ? 'var(--blue-light)' : 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <IconAdjustmentsHorizontal size={16} color={showFilters ? '#185FA5' : '#999'} />
        </button>
      </div>

      {showFilters && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>Gênero</p>
          <div className="filter-chips" style={{ marginBottom: 8 }}>
            {genders.map(g => (
              <button key={g} className={'chip ' + (activeGender === g ? 'active' : '')} onClick={() => setActiveGender(activeGender === g ? null : g)}>
                {g.charAt(0) + g.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>Artigo</p>
          <div className="filter-chips">
            {articles.map(a => (
              <button key={a} className={'chip ' + (activeArticle === a ? 'active' : '')} onClick={() => setActiveArticle(activeArticle === a ? null : a)}>
                {a.charAt(0) + a.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }}>
        {filtered.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' }}>
            Nenhum resultado para os filtros selecionados.
          </p>
        ) : filtered.map(group => {
          const displayTotal = getGroupDisplayTotal(group)
          const filteredProducts = getFilteredProducts(group)

          return (
            <div className="result-item" key={group.key}>
              <div className="result-item-header" onClick={() => toggleGroup(group.key)}>
                <div>
                  <div className="result-item-name">
                    {group.article.charAt(0) + group.article.slice(1).toLowerCase()} {group.gender.charAt(0) + group.gender.slice(1).toLowerCase()}
                  </div>
                  <div className="result-item-sub">{filteredProducts.length} produtos</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={'result-item-qty ' + (displayTotal < 0 ? 'excess' : '')}>
                    {displayTotal > 0 ? '+' : ''}{displayTotal.toLocaleString('pt-BR')}
                  </span>
                  {expandedGroups[group.key] ? <IconChevronUp size={16} color="#999" /> : <IconChevronDown size={16} color="#999" />}
                </div>
              </div>

              {expandedGroups[group.key] && (
                <div className="result-item-body">
                  {filteredProducts.map(product => {
                    const productTotal = getProductTotal(product)
                    const productItems = getProductItems(product)
                    if (productItems.length === 0) return null
                    const prodKey = group.key + '|' + product.key

                    return (
                      <div key={product.key} style={{ marginBottom: 4 }}>
                        <div
                          onClick={() => toggleProduct(prodKey)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#f0f4f8', borderRadius: 6, cursor: 'pointer' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {expandedProducts[prodKey]
                              ? <IconChevronUp size={13} color="#888" />
                              : <IconChevronDown size={13} color="#888" />
                            }
                            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{product.name}</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 500, color: productTotal < 0 ? 'var(--amber-dark)' : '#185FA5' }}>
                            {productTotal > 0 ? '+' : ''}{productTotal}
                          </span>
                        </div>

                        {expandedProducts[prodKey] && (
                          <div style={{ paddingLeft: 16 }}>
                            {productItems.map((item, i) => (
                              <div className="sku-row" key={i}>
                                <span className="sku-name">{item.description}</span>
                                <span className={'sku-qty ' + (item.replenish < 0 ? 'excess' : '')}>
                                  {item.replenish > 0 ? '+' : ''}{item.replenish}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-auto" style={{ paddingTop: 12 }}>
        <button className="btn-primary" onClick={() => navigate('/export')}>
          Exportar <IconArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}