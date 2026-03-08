import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function VerifyEmail() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <div className="login-card" style={{ textAlign: 'center', maxWidth: '450px' }}>
        <div className="success-icon-container" style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: 'rgba(234, 179, 8, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1.5rem',
          border: '1px solid rgba(234, 179, 8, 0.2)'
        }}>
          <Mail className="text-warning" size={40} style={{ color: '#eab308' }} />
        </div>
        
        <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Confirmação de Identidade</h2>
        
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Para garantir a integridade da plataforma, o acesso ao **TrainerFlow** requer a validação prévia de e-mail.
        </p>
        
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          padding: '1rem', 
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem'
        }}>
          <p style={{ color: '#fff', fontSize: '0.9rem', margin: 0 }}>
            Enviamos um link para:<br/>
            <strong style={{ color: 'var(--accent-primary)' }}>{user?.email}</strong>
          </p>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Já confirmou? Tente atualizar a página ou faça login novamente.
        </p>

        <div className="flex-col gap-3">
          <button 
            className="btn btn-primary w-full" 
            onClick={() => window.location.reload()}
          >
            Já confirmei, atualizar página
          </button>
          
          <button 
            className="toggle-mode-btn" 
            style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
            onClick={() => logout().then(() => navigate('/login'))}
          >
            <ArrowLeft size={16} /> Voltar e usar outro e-mail
          </button>
        </div>
      </div>
    </div>
  );
}
