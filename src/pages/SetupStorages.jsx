import { useState } from 'react'
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
        <div className="page-title">Estoques fisicos</div>
        <div style={{ width: 60 }} />
      </div>
      <div className="step-indicator">
        <div className="step-dot active" />
        <div className="step-dot" />
        <div className="step-dot" />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>Confirme ou renomeie os estoques. Ative apenas os que existem na sua operacao.</p>
      {storages.map(storage => (
        <div className="storage-item" key={storage.id}>
          {storage.id === 1 ? <IconBuildingStore size={18} color="#185FA5" /> : <IconBox size={18} color={storage.active ? '#185FA5' : '#999'} />}
          {editingId === storage.id ? (
            <input className="edit-input" value={editingName} onChange={e => setEditingName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit(storage.id)} autoFocus />
          ) : (
            <span className="storage-name">{storage.name}</span>
          )}
          {storage.isDefault && <span className="badge-default">padrao</span>}
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
        <button className="btn-primary" onClick={() => navigate('/setup/tutorial')}>Proximo <IconArrowRight size={16} /></button>
      </div>
    </div>
  )
}