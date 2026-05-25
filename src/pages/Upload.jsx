import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight, IconUpload, IconFileSpreadsheet, IconCheck, IconCalculator } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
import * as XLSX from 'xlsx'

export default function Upload() {
  const navigate = useNavigate()
  const { storages, setSystemData, setBaseData, setInventoryData, setValidationErrors, setIgnoredItems } = useApp()
  const [systemFile, setSystemFile] = useState(null)
  const [baseFile, setBaseFile] = useState(null)
  const [inventoryFiles, setInventoryFiles] = useState({})
  const [loading, setLoading] = useState(false)
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

  const handleSystemFile = async (file) => {
    if (!file) return
    const data = await readExcel(file)
    setSystemFile(file)
    setSystemData(data)
  }

  const handleBaseFile = async (file) => {
    if (!file) return
    setBaseFile(file)
    const data = await readExcel(file)
    setBaseData(data)
  }

  const handleInventoryFile = async (file, storageId) => {
    if (!file) return
    const data = file.name.endsWith('.txt') ? await readTxt(file) : await readExcel(file)
    setInventoryFiles(prev => ({ ...prev, [storageId]: file }))
    setInventoryData(prev => ({ ...prev, [storageId]: data }))
  }

  const canProcess = systemFile && baseFile && uploadStorages.every(s => inventoryFiles[s.id])

  const handleProcess = async () => {
    setLoading(true)
    setValidationErrors([])
    setIgnoredItems([])
    setTimeout(() => { setLoading(false); navigate('/validation') }, 800)
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

      <div className={'upload-zone ' + (systemFile ? 'filled' : '')} onClick={() => systemRef.current.click()}>
        <div className="upload-label">Relatório do sistema</div>
        {systemFile ? <IconCheck size={22} color="#185FA5" /> : <IconUpload size={22} color="#999" />}
        <div className="upload-hint">{systemFile ? systemFile.name : '.xlsx'}</div>
        <input ref={systemRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => handleSystemFile(e.target.files[0])} />
      </div>

      <div className={'upload-zone ' + (baseFile ? 'filled' : '')} onClick={() => baseRef.current.click()}>
        <div className="upload-label">Base de produtos</div>
        {baseFile ? <IconCheck size={22} color="#185FA5" /> : <IconFileSpreadsheet size={22} color="#999" />}
        <div className="upload-hint">{baseFile ? baseFile.name : '.xlsx'}</div>
        <input ref={baseRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => handleBaseFile(e.target.files[0])} />
      </div>

      {uploadStorages.map(storage => (
        <div key={storage.id}>
          <div className={'upload-zone ' + (inventoryFiles[storage.id] ? 'filled' : '')} onClick={() => inventoryRefs.current[storage.id]?.click()}>
            <div className="upload-label">Inventário — {storage.name}</div>
            {inventoryFiles[storage.id] ? <IconCheck size={22} color="#185FA5" /> : <IconFileSpreadsheet size={22} color="#999" />}
            <div className="upload-hint">{inventoryFiles[storage.id] ? inventoryFiles[storage.id].name : '.xlsx ou .txt'}</div>
            <input ref={el => inventoryRefs.current[storage.id] = el} type="file" accept=".xlsx,.xls,.txt" style={{ display: 'none' }} onChange={e => handleInventoryFile(e.target.files[0], storage.id)} />
          </div>
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