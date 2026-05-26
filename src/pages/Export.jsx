import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconFileSpreadsheet, IconFileText, IconDownload, IconAlertCircle, IconChevronDown, IconChevronUp, IconRefresh } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
import { exportToExcel } from '../utils/exportExcel'
import { exportToPdf } from '../utils/exportPdf'

export default function Export() {
  const navigate = useNavigate()
  const { results, coverage, ignoredItems } = useApp()
  const [showIgnored, setShowIgnored] = useState(false)
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState(null)

  if (!results) return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Nenhum resultado disponível.</p>
    </div>
  )

  const { grouped } = results
  const allGroupKeys = grouped.map(g => g.key)

  const initSelected = () => {
    if (selectedGroups === null) {
      const sel = {}
      allGroupKeys.forEach(k => sel[k] = true)
      setSelectedGroups(sel)
    }
    setShowPdfPreview(prev => !prev)
  }

  const toggleGroup = (key) => {
    setSelectedGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleAll = (val) => {
    const sel = {}
    allGroupKeys.forEach(k => sel[k] = val)
    setSelectedGroups(sel)
  }

  const handleExportPdf = () => {
    const selected = selectedGroups
      ? allGroupKeys.filter(k => selectedGroups[k])
      : null
    exportToPdf(results, coverage, selected)
  }

  const selectedCount = selectedGroups ? Object.values(selectedGroups).filter(Boolean).length : allGroupKeys.length

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/results')}>
          <IconArrowLeft size={16} /> Voltar
        </button>
        <div className="page-title">Exportar</div>
        <div style={{ width: 60 }} />
      </div>

      {/* Nova reposição no topo */}
      <button
        className="btn-secondary"
        style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        onClick={() => navigate('/home')}
      >
        <IconRefresh size={14} /> Nova reposição
      </button>

      <button className="export-btn" onClick={() => exportToExcel(results, coverage)}>
        <div className="export-icon" style={{ background: 'var(--green-light)' }}>
          <IconFileSpreadsheet size={20} color="#3B6D11" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="export-title">Exportar Excel (.xlsx)</div>
          <div className="export-sub">Todos os grupos — mesmo formato da planilha</div>
        </div>
        <IconDownload size={16} color="#999" />
      </button>

      <div style={{ border: '1px solid var(--gray-border)', borderRadius: 12, marginBottom: 10, overflow: 'hidden' }}>
        <button
          className="export-btn"
          style={{ marginBottom: 0, border: 'none', borderRadius: 0 }}
          onClick={initSelected}
        >
          <div className="export-icon" style={{ background: 'var(--amber-light)' }}>
            <IconFileText size={20} color="#854F0B" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="export-title">Exportar PDF</div>
            <div className="export-sub">
              {showPdfPreview
                ? selectedCount + ' de ' + allGroupKeys.length + ' grupos selecionados'
                : 'Selecione os grupos para impressão'}
            </div>
          </div>
          {showPdfPreview
            ? <IconChevronUp size={16} color="#999" />
            : <IconChevronDown size={16} color="#999" />
          }
        </button>

        {showPdfPreview && (
          <div style={{ borderTop: '1px solid var(--gray-border)', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <button
                onClick={() => toggleAll(true)}
                style={{ fontSize: 12, color: '#185FA5', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Selecionar todos
              </button>
              <button
                onClick={() => toggleAll(false)}
                style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Desmarcar todos
              </button>
            </div>

            {grouped.map(group => {
              const isSelected = selectedGroups ? selectedGroups[group.key] : true
              const title = group.article.charAt(0) + group.article.slice(1).toLowerCase() +
                ' ' + group.gender.charAt(0) + group.gender.slice(1).toLowerCase()
              return (
                <div
                  key={group.key}
                  onClick={() => toggleGroup(group.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 4px', borderBottom: '1px solid var(--gray-border)', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: '1px solid ' + (isSelected ? '#185FA5' : 'var(--gray-border)'),
                    background: isSelected ? '#185FA5' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {isSelected && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{title}</span>
                  <span style={{ fontSize: 12, color: group.total < 0 ? 'var(--amber-dark)' : '#185FA5', fontWeight: 500 }}>
                    {group.total > 0 ? '+' : ''}{group.total}
                  </span>
                </div>
              )
            })}

            <button
              className="btn-primary"
              style={{ marginTop: 12 }}
              onClick={handleExportPdf}
              disabled={selectedCount === 0}
            >
              <IconDownload size={16} /> Gerar PDF ({selectedCount} grupos)
            </button>
          </div>
        )}
      </div>

      {ignoredItems.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div className="ignored-note">
            {ignoredItems.length} {ignoredItems.length === 1 ? 'item ignorado' : 'itens ignorados'} no processamento.{' '}
            <button className="ignored-link" onClick={() => setShowIgnored(!showIgnored)}>
              {showIgnored ? 'Ocultar' : 'Ver lista'}
            </button>
          </div>
          {showIgnored && (
            <div style={{ background: 'var(--gray-bg)', borderRadius: 8, padding: 10, marginTop: 6 }}>
              {ignoredItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '3px 0', borderBottom: '1px solid var(--gray-border)', fontSize: 12 }}>
                  <IconAlertCircle size={14} color="#999" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {item.storage} L{item.line} — {item.reason}: <strong>{item.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
