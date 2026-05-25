import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
import { parseBaseData, parseInventoryTxt, parseInventoryExcel } from '../utils/processData'

export default function Validation() {
  const navigate = useNavigate()
  const {
    systemData, inventoryData, storages,
    baseData, setBaseData,
    setValidationErrors, setIgnoredItems,
    setAvailableArticles, setAvailableGenders,
  } = useApp()

  const [errors, setErrors] = useState([])
  const [showAll, setShowAll] = useState(false)
  const [processed, setProcessed] = useState(false)

  useEffect(() => {
    const run = () => {
      const base = Array.isArray(baseData) ? parseBaseData(baseData) : baseData
      if (Array.isArray(baseData)) setBaseData(base)

      const articles = [...new Set(Object.values(base).map(p => p.article).filter(Boolean))]
      const genders = [...new Set(Object.values(base).map(p => p.gender).filter(Boolean))]
      setAvailableArticles(articles.sort())
      setAvailableGenders(genders.sort())

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

  if (!processed) return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-secondary)' }}>Validando arquivos...</p>
    </div>
  )

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
        {errors.length === 0 && (
          <button className="btn-primary" onClick={() => navigate('/coverage')}>
            Configurar cobertura <IconArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}