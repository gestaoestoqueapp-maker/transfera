import { useState } from 'react'
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
}