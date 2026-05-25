import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconBrandAndroid, IconBrandApple, IconDeviceDesktop, IconDeviceLaptop } from '@tabler/icons-react'
import { useApp } from '../context/AppContext'
const tutorials = {
  android: { label: 'Android', steps: [
    { title: 'Abra o Chrome', desc: 'e acesse o link do Transfera' },
    { title: 'Toque no menu', desc: '(3 pontos no canto superior direito)' },
    { title: 'Toque em "Instalar app"', desc: 'ou "Adicionar à tela inicial"' },
    { title: 'Confirme', desc: '— o ícone aparecerá na sua tela inicial' },
  ]},
  iphone: { label: 'iPhone', steps: [
    { title: 'Abra o Safari', desc: 'e acesse o link do Transfera' },
    { title: 'Toque no botão compartilhar', desc: '(ícone de quadrado com seta para cima)' },
    { title: 'Role a lista e toque em', desc: '"Adicionar à Tela de Início"' },
    { title: 'Toque em "Adicionar"', desc: '— o ícone aparecerá na sua tela inicial' },
  ]},
  windows: { label: 'Windows', steps: [
    { title: 'Abra o Chrome ou Edge', desc: 'e acesse o link do Transfera' },
    { title: 'Clique no ícone de instalar', desc: 'na barra de endereços' },
    { title: 'Clique em "Instalar"', desc: 'na janela que aparecer' },
    { title: 'Pronto', desc: '— o app aparecerá no menu iniciar' },
  ]},
  mac: { label: 'Mac', steps: [
    { title: 'Abra o Chrome ou Safari', desc: 'e acesse o link do Transfera' },
    { title: 'No Chrome', desc: 'clique no ícone de instalar na barra de endereços' },
    { title: 'No Safari', desc: 'clique em Arquivo → Adicionar ao Dock' },
    { title: 'Confirme', desc: '— o app aparecerá no Launchpad' },
  ]},
}
export default function SetupTutorial() {
  const navigate = useNavigate()
  const { setFirstAccess } = useApp()
  const [selected, setSelected] = useState('android')
  const finish = () => { setFirstAccess(false); navigate('/home') }
  const devices = [
    { key: 'android', icon: <IconBrandAndroid size={22} color="#185FA5" /> },
    { key: 'iphone', icon: <IconBrandApple size={22} color="#185FA5" /> },
    { key: 'windows', icon: <IconDeviceDesktop size={22} color="#185FA5" /> },
    { key: 'mac', icon: <IconDeviceLaptop size={22} color="#185FA5" /> },
  ]
  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/setup/storages')}><IconArrowLeft size={16} /> Voltar</button>
        <div className="page-title">Instalação</div>
        <div style={{ width: 60 }} />
      </div>
      <div className="step-indicator">
        <div className="step-dot" />
        <div className="step-dot active" />
        <div className="step-dot" />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>Selecione o dispositivo que você está usando agora.</p>
      <div className="device-grid">
        {devices.map(d => (
          <div key={d.key} className={"device-card " + (selected === d.key ? 'active' : '')} onClick={() => setSelected(d.key)}>
            {d.icon}<span>{tutorials[d.key].label}</span>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--gray-bg)', borderRadius: 10, padding: 12, marginBottom: 20 }}>
        {tutorials[selected].steps.map((step, i) => (
          <div className="tut-step" key={i}>
            <div className="tut-num">{i + 1}</div>
            <div className="tut-text"><strong>{step.title}</strong> {step.desc}</div>
          </div>
        ))}
      </div>
      <div className="mt-auto">
        <button className="btn-primary" onClick={finish}>Concluir configuração</button>
      </div>
    </div>
  )
}