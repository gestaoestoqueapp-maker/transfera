import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowRight, IconInfoCircle, IconSettings } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
export default function WelcomeReturn() {
  const navigate = useNavigate()
  const { showTutorial, setShowTutorial } = useApp()
  const [dontShow, setDontShow] = useState(false)
  const handleStart = () => {
    if (dontShow) setShowTutorial(false)
    navigate('/upload')
  }
  const handleTutorial = () => {
    if (dontShow) setShowTutorial(false)
    navigate('/setup/tutorial')
  }
  return (
    <div className="page">
      <div className="page-header">
        <div className="logo">Trans<span>fera</span></div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => navigate('/setup/storages')}>
          <IconSettings size={20} />
        </button>
      </div>
      {showTutorial && (
        <div className="info-banner">
          <IconInfoCircle size={18} color="#185FA5" style={{ flexShrink: 0, marginTop: 1 }} />
          <div className="info-banner-text">Quer rever o tutorial de uso antes de começar?</div>
        </div>
      )}
      <div className="checkbox-row">
        <input type="checkbox" id="dontShow" checked={dontShow} onChange={e => setDontShow(e.target.checked)} />
        <label htmlFor="dontShow">Não mostrar novamente</label>
      </div>
      <div className="mt-auto">
        <button className="btn-primary" onClick={handleStart}>
          Iniciar nova reposição <IconArrowRight size={16} />
        </button>
        {showTutorial && (
          <button className="btn-secondary" onClick={handleTutorial}>Ver tutorial de uso</button>
        )}
      </div>
    </div>
  )
}