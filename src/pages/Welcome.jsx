import { useNavigate } from 'react-router-dom'
import { IconArrowRight, IconUpload, IconAdjustmentsHorizontal, IconFileExport } from '@tabler/icons-react'
export default function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="page">
      <div className="page-header">
        <div className="logo">Trans<span>fera</span></div>
      </div>
      <div className="hero-icon">
        <IconFileExport size={28} color="#185FA5" />
      </div>
      <div className="hero-title">Bem-vindo ao Transfera</div>
      <div className="hero-sub">Equalize o estoque físico da sua loja com rapidez e sem erros.</div>
      <div style={{ marginBottom: 24 }}>
        <div className="feature-item">
          <IconUpload size={20} className="feature-icon" />
          <div className="feature-text">
            <strong>Importe os relatórios</strong>
            <span>Relatório do sistema e inventário físico em Excel ou .txt</span>
          </div>
        </div>
        <div className="feature-item">
          <IconAdjustmentsHorizontal size={20} className="feature-icon" />
          <div className="feature-text">
            <strong>Configure a cobertura</strong>
            <span>Defina quantas peças manter por artigo em cada estoque</span>
          </div>
        </div>
        <div className="feature-item">
          <IconFileExport size={20} className="feature-icon" />
          <div className="feature-text">
            <strong>Exporte o resultado</strong>
            <span>Lista de reposição em Excel ou PDF para impressão</span>
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <button className="btn-primary" onClick={() => navigate('/setup/storages')}>
          Configurar o app <IconArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}