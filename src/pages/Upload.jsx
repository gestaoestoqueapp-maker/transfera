import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight, IconUpload, IconFileSpreadsheet, IconCheck, IconCalculator, IconAlertTriangle } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
import * as XLSX from 'xlsx'

const SYSTEM_COLUMNS = [
  { key: 'code', label: 'Código do produto' },
  { key: 'saldo', label: 'Saldo' },
]

const BASE_COLUMNS = [
  { key: 'code', label: 'Código' },
  { key: 'description', label: 'Nome + tamanho' },
  { key: 'nameColor', label: 'Nome + cor' },
  { key: 'barcode', label: 'Código de barras' },
  { key: 'group', label: 'Grupo' },
  { key: 'gender', label: 'Gênero' },
  { key: 'article', label: 'Artigo' },
]

const INVENTORY_COLUMNS = [
  { key: 'barcode', label: 'Código de barras' },
  { key: 'qty', label: 'Quantidade' },
]

function colLetter(i) {
  let s = ''
  let n = i + 1
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

function getSignature(headers) {
  return headers.map(h => String(h || '').trim().toLowerCase()).join('|')
}

function detectHeaderRow(rows, minCells = 3) {
  for (let i = 0; i < rows.length; i++) {
    const filled = (rows[i] || []).filter(c => c !== null && c !== undefined && String(c).trim() !== '').length
    if (filled >= minCells) return i
  }
  return 0
}

function loadMapping(storageKey) {
  try {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

function saveMapping(storageKey, mapping, signature) {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ mapping, signature }))
  } catch {}
}

function MappingPanel({ preview, columns, onConfirm, onCancel }) {
  const headerRowIndex = detectHeaderRow(preview)
  const maxCols = Math.max(...preview.map(r => (r || []).length))

  const colOptions = Array.from({ length: maxCols }, (_, i) => ({
    value: i,
    label: `Coluna ${colLetter(i)}`,
  }))

  const [mapping, setMapping] = useState(() => {
    const m = {}
    columns.forEach(col => { m[col.key] = '' })
    return m
  })

  const tableRef = useRef()

  useEffect(() => {
    if (tableRef.current && headerRowIndex > 0) {
      const rows = tableRef.current.querySelectorAll('tr')
      if (rows[headerRowIndex + 1]) { // +1 por causa do thead
        rows[headerRowIndex + 1].scrollIntoView({ block: 'center' })
      }
    }
  }, [headerRowIndex])

  const allMapped = columns.every(col => mapping[col.key] !== '')

  return (
    <div style={{
      background: '#FFF8E7', border: '1px solid #F5C842', borderRadius: 10,
      padding: 14, marginTop: 8, marginBottom: 10
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#7A5500', marginBottom: 10 }}>
        Identifique as colunas do arquivo
      </div>

      {/* Preview scrollável */}
      <div style={{
        overflowX: 'auto', overflowY: 'auto',
        maxHeight: 180, marginBottom: 12,
        border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff'
      }}>
        <table ref={tableRef} style={{ fontSize: 11, borderCollapse: 'collapse', minWidth: '100%' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', position: 'sticky', top: 0 }}>
              <th style={{ padding: '3px 6px', borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd', color: '#aaa', fontSize: 10, fontWeight: 400 }}>#</th>
              {Array.from({ length: maxCols }, (_, i) => (
                <th key={i} style={{
                  padding: '3px 8px', borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd',
                  color: '#185FA5', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap'
                }}>
                  {colLetter(i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, ri) => (
              <tr key={ri} style={{ background: ri === headerRowIndex ? '#EAF3DE' : ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{
                  padding: '3px 6px', borderBottom: '1px solid #f0f0f0',
                  borderRight: '1px solid #f0f0f0', color: '#aaa', fontSize: 10,
                  background: ri === headerRowIndex ? '#d4edba' : '#f8f8f8',
                  userSelect: 'none', whiteSpace: 'nowrap'
                }}>
                  {ri + 1}
                </td>
                {Array.from({ length: maxCols }, (_, ci) => (
                  <td key={ci} style={{
                    padding: '3px 8px',
                    borderBottom: '1px solid #f0f0f0',
                    borderRight: '1px solid #f0f0f0',
                    whiteSpace: 'nowrap',
                    fontWeight: ri === headerRowIndex ? 600 : 400,
                    color: ri === headerRowIndex ? '#27500A' : '#333',
                  }}>
                    {String((row || [])[ci] ?? '').trim().slice(0, 24)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropdowns */}
      {columns.map(col => (
        <div key={col.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#555', flex: 1 }}>{col.label}</span>
          <select
            value={mapping[col.key]}
            onChange={e => setMapping(prev => ({ ...prev, [col.key]: e.target.value }))}
            style={{
              width: 110, fontSize: 12, padding: '4px 6px',
              border: '1px solid #ddd', borderRadius: 6, background: '#fff',
              flexShrink: 0
            }}
          >
            <option value="">— selecionar —</option>
            {colOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={() => onConfirm(mapping)}
          disabled={!allMapped}
          style={{
            flex: 1, padding: '8px', borderRadius: 8, border: 'none',
            background: allMapped ? '#185FA5' : '#ccc',
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: allMapped ? 'pointer' : 'default'
          }}
        >
          Confirmar mapeamento
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 14px', borderRadius: 8,
            border: '1px solid #ddd', background: '#fff',
            fontSize: 13, cursor: 'pointer', color: '#555'
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function Upload() {
  const navigate = useNavigate()
  const { storages, setSystemData, setBaseData, setInventoryData, setValidationErrors, setIgnoredItems } = useApp()

  const [systemFile, setSystemFile] = useState(null)
  const [baseFile, setBaseFile] = useState(null)
  const [inventoryFiles, setInventoryFiles] = useState({})
  const [loading, setLoading] = useState(false)

  const [systemStatus, setSystemStatus] = useState(null)
  const [baseStatus, setBaseStatus] = useState(null)
  const [inventoryStatus, setInventoryStatus] = useState({})

  const [systemPreview, setSystemPreview] = useState(null)
  const [basePreview, setBasePreview] = useState(null)
  const [inventoryPreviews, setInventoryPreviews] = useState({})

  const [openPanel, setOpenPanel] = useState(null)

  const systemRef = useRef()
  const baseRef = useRef()
  const inventoryRefs = useRef({})

  const activeStorages = storages.filter(s => s.active)
  const uploadStorages = activeStorages.slice(0, -1)
  const calculatedStorage = activeStorages[activeStorages.length - 1]

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
    reader.onload = (e) => resolve(e.target.result.split('\n').map(l => l.trim()).filter(l => l))
    reader.readAsText(file)
  })

  function remapSystemData(rawData, mapping) {
    return rawData.map((row) => {
      const newRow = [...(row || [])]
      newRow[0] = row[Number(mapping.code)] ?? row[0]
      newRow[5] = row[Number(mapping.saldo)] ?? row[5]
      return newRow
    })
  }

  function remapBaseData(rawData, mapping) {
    return rawData.map((row) => {
      const newRow = [...(row || [])]
      newRow[0] = row[Number(mapping.code)] ?? row[0]
      newRow[1] = row[Number(mapping.description)] ?? row[1]
      newRow[2] = row[Number(mapping.nameColor)] ?? row[2]
      newRow[12] = row[Number(mapping.barcode)] ?? row[12]
      newRow[14] = row[Number(mapping.group)] ?? row[14]
      newRow[15] = row[Number(mapping.gender)] ?? row[15]
      newRow[17] = row[Number(mapping.article)] ?? row[17]
      return newRow
    })
  }

  function remapInventoryData(rawData, mapping) {
    return rawData.map((row) => {
      const newRow = [...(row || [])]
      newRow[0] = row[Number(mapping.barcode)] ?? row[0]
      return newRow
    })
  }

  const handleSystemFile = async (file) => {
    if (!file) return
    const data = await readExcel(file)
    setSystemFile(file)
    setSystemPreview(data.slice(0, 50))
    const headerIdx = detectHeaderRow(data)
    const signature = getSignature(data[headerIdx] || [])
    const saved = loadMapping('transfera_map_system')
    if (saved && saved.signature === signature) {
      setSystemStatus('ok')
      setSystemData(remapSystemData(data, saved.mapping))
      setOpenPanel(null)
    } else {
      setSystemStatus('warning')
      setSystemData(data)
      setOpenPanel('system')
    }
  }

  const handleBaseFile = async (file) => {
    if (!file) return
    setBaseFile(file)
    const data = await readExcel(file)
    setBasePreview(data.slice(0, 50))
    const headerIdx = detectHeaderRow(data)
    const signature = getSignature(data[headerIdx] || [])
    const saved = loadMapping('transfera_map_base')
    if (saved && saved.signature === signature) {
      setBaseStatus('ok')
      setBaseData(remapBaseData(data, saved.mapping))
      setOpenPanel(null)
    } else {
      setBaseStatus('warning')
      setBaseData(data)
      setOpenPanel('base')
    }
  }

  const handleInventoryFile = async (file, storageId) => {
    if (!file) return
    if (file.name.endsWith('.txt')) {
      const data = await readTxt(file)
      setInventoryFiles(prev => ({ ...prev, [storageId]: file }))
      setInventoryData(prev => ({ ...prev, [storageId]: data }))
      setInventoryStatus(prev => ({ ...prev, [storageId]: 'ok' }))
      setOpenPanel(null)
      return
    }
    const data = await readExcel(file)
    setInventoryFiles(prev => ({ ...prev, [storageId]: file }))
    setInventoryPreviews(prev => ({ ...prev, [storageId]: data.slice(0, 50) }))
    const headerIdx = detectHeaderRow(data)
    const signature = getSignature(data[headerIdx] || [])
    const saved = loadMapping(`transfera_map_inventory_${storageId}`)
    if (saved && saved.signature === signature) {
      setInventoryStatus(prev => ({ ...prev, [storageId]: 'ok' }))
      setInventoryData(prev => ({ ...prev, [storageId]: remapInventoryData(data, saved.mapping) }))
      setOpenPanel(null)
    } else {
      setInventoryStatus(prev => ({ ...prev, [storageId]: 'warning' }))
      setInventoryData(prev => ({ ...prev, [storageId]: data }))
      setOpenPanel(storageId)
    }
  }

  const handleSystemMappingConfirm = async (mapping) => {
    const data = await readExcel(systemFile)
    const headerIdx = detectHeaderRow(data)
    const signature = getSignature(data[headerIdx] || [])
    saveMapping('transfera_map_system', mapping, signature)
    setSystemData(remapSystemData(data, mapping))
    setSystemStatus('ok')
    setOpenPanel(null)
  }

  const handleBaseMappingConfirm = async (mapping) => {
    const data = await readExcel(baseFile)
    const headerIdx = detectHeaderRow(data)
    const signature = getSignature(data[headerIdx] || [])
    saveMapping('transfera_map_base', mapping, signature)
    setBaseData(remapBaseData(data, mapping))
    setBaseStatus('ok')
    setOpenPanel(null)
  }

  const handleInventoryMappingConfirm = async (mapping, storageId) => {
    const file = inventoryFiles[storageId]
    const data = await readExcel(file)
    const headerIdx = detectHeaderRow(data)
    const signature = getSignature(data[headerIdx] || [])
    saveMapping(`transfera_map_inventory_${storageId}`, mapping, signature)
    setInventoryData(prev => ({ ...prev, [storageId]: remapInventoryData(data, mapping) }))
    setInventoryStatus(prev => ({ ...prev, [storageId]: 'ok' }))
    setOpenPanel(null)
  }

  const canProcess = systemFile && systemStatus === 'ok'
    && baseFile && baseStatus === 'ok'
    && uploadStorages.every(s => inventoryFiles[s.id] && inventoryStatus[s.id] === 'ok')

  const handleProcess = async () => {
    setLoading(true)
    setValidationErrors([])
    setIgnoredItems([])
    setTimeout(() => { setLoading(false); navigate('/validation') }, 800)
  }

  function StatusIcon({ status }) {
    if (status === 'ok') return <IconCheck size={22} color="#185FA5" />
    if (status === 'warning') return <IconAlertTriangle size={22} color="#E6A817" />
    return <IconUpload size={22} color="#999" />
  }

  function zoneClass(status, hasFile) {
    if (status === 'warning') return 'upload-zone warning'
    if (status === 'ok' || hasFile) return 'upload-zone filled'
    return 'upload-zone'
  }

  // Clique na zona só abre o file picker se não há painel aberto para AQUELA zona
  function handleZoneClick(panelId, ref) {
    if (openPanel && openPanel !== panelId) return // outro painel aberto, ignora
    if (openPanel === panelId) return // painel desta zona está aberto, ignora
    ref.current?.click()
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/home')}>
          <IconArrowLeft size={16} /> Voltar
        </button>
        <div className="page-title">Carregar arquivos</div>
        <div style={{ width: 60 }} />
      </div>

      {/* Relatório do sistema */}
      <div
        className={zoneClass(systemStatus, systemFile)}
        onClick={() => handleZoneClick('system', systemRef)}
        style={{ cursor: openPanel === 'system' || (openPanel && openPanel !== 'system') ? 'default' : 'pointer' }}
      >
        <div className="upload-label">Relatório do sistema</div>
        <StatusIcon status={systemStatus} />
        <div className="upload-hint">
          {systemStatus === 'warning' ? 'Formato novo — identifique as colunas abaixo'
            : systemFile ? systemFile.name : '.xlsx'}
        </div>
        <input ref={systemRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
          onChange={e => { handleSystemFile(e.target.files[0]); e.target.value = '' }} />
      </div>
      {openPanel === 'system' && systemPreview && (
        <MappingPanel
          preview={systemPreview}
          columns={SYSTEM_COLUMNS}
          onConfirm={handleSystemMappingConfirm}
          onCancel={() => { setOpenPanel(null); setSystemStatus(null); setSystemFile(null) }}
        />
      )}

      {/* Base de produtos */}
      <div
        className={zoneClass(baseStatus, baseFile)}
        onClick={() => handleZoneClick('base', baseRef)}
        style={{ cursor: openPanel === 'base' || (openPanel && openPanel !== 'base') ? 'default' : 'pointer' }}
      >
        <div className="upload-label">Base de produtos</div>
        <StatusIcon status={baseStatus} />
        <div className="upload-hint">
          {baseStatus === 'warning' ? 'Formato novo — identifique as colunas abaixo'
            : baseFile ? baseFile.name : '.xlsx'}
        </div>
        <input ref={baseRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
          onChange={e => { handleBaseFile(e.target.files[0]); e.target.value = '' }} />
      </div>
      {openPanel === 'base' && basePreview && (
        <MappingPanel
          preview={basePreview}
          columns={BASE_COLUMNS}
          onConfirm={handleBaseMappingConfirm}
          onCancel={() => { setOpenPanel(null); setBaseStatus(null); setBaseFile(null) }}
        />
      )}

      {/* Inventários */}
      {uploadStorages.map(storage => (
        <div key={storage.id}>
          <div
            className={zoneClass(inventoryStatus[storage.id], inventoryFiles[storage.id])}
            onClick={() => handleZoneClick(storage.id, { current: inventoryRefs.current[storage.id] })}
            style={{ cursor: openPanel === storage.id || (openPanel && openPanel !== storage.id) ? 'default' : 'pointer' }}
          >
            <div className="upload-label">Inventário — {storage.name}</div>
            <StatusIcon status={inventoryStatus[storage.id]} />
            <div className="upload-hint">
              {inventoryStatus[storage.id] === 'warning' ? 'Formato novo — identifique as colunas abaixo'
                : inventoryFiles[storage.id] ? inventoryFiles[storage.id].name : '.xlsx ou .txt'}
            </div>
            <input
              ref={el => inventoryRefs.current[storage.id] = el}
              type="file" accept=".xlsx,.xls,.txt" style={{ display: 'none' }}
              onChange={e => { handleInventoryFile(e.target.files[0], storage.id); e.target.value = '' }}
            />
          </div>
          {openPanel === storage.id && inventoryPreviews[storage.id] && (
            <MappingPanel
              preview={inventoryPreviews[storage.id]}
              columns={INVENTORY_COLUMNS}
              onConfirm={(mapping) => handleInventoryMappingConfirm(mapping, storage.id)}
              onCancel={() => {
                setOpenPanel(null)
                setInventoryStatus(prev => ({ ...prev, [storage.id]: null }))
                setInventoryFiles(prev => { const p = { ...prev }; delete p[storage.id]; return p })
              }}
            />
          )}
        </div>
      ))}

      {calculatedStorage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#EAF3DE', borderRadius: 10, marginBottom: 10 }}>
          <IconCalculator size={18} color="#3B6D11" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#27500A' }}>{calculatedStorage.name}</div>
            <div style={{ fontSize: 11, color: '#3B6D11', marginTop: 1 }}>Calculado automaticamente: sistema menos os demais estoques</div>
          </div>
        </div>
      )}

      <div className="mt-auto">
        <button
          className="btn-primary"
          onClick={handleProcess}
          disabled={!canProcess || loading}
          style={{ opacity: canProcess ? 1 : 0.5 }}
        >
          {loading ? 'Processando...' : <span>Processar <IconArrowRight size={16} /></span>}
        </button>
      </div>
    </div>
  )
}
