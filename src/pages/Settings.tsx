import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Save, AlertTriangle, Trash2 } from 'lucide-react';

export function Settings() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const { students } = useData();
  const navigate = useNavigate();

  return (
    <div className="settings-container flex-col gap-4">
      <div className="page-header">
        <div>
          <h1>Configurações da Conta</h1>
          <p>Ajuste suas preferências, dados do perfil e notificações.</p>
        </div>
      </div>

      <div className="card mt-4" style={{ maxWidth: 800 }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Perfil do Personal Trainer</h3>
        
        <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row columns-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label">Nome Completo</label>
              <input type="text" className="input-field" defaultValue={user?.name} />
            </div>
            <div className="input-group">
              <label className="input-label">E-mail</label>
              <input type="email" className="input-field" defaultValue={user?.email} disabled />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Biografia / Especialidade</label>
            <textarea className="input-field" rows={4} defaultValue="Especialista em hipertrofia e emagrecimento funcional."></textarea>
          </div>

          <div className="flex justify-end">
            <button className="btn btn-primary">
              <Save size={18} /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      <div className="card mt-4" style={{ maxWidth: 800 }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Plano e Faturamento</h3>
        
        <div className="subscription-status p-4" style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="badge" style={{ backgroundColor: user?.subscriptionTier === 'pro' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)', color: user?.subscriptionTier === 'pro' ? '#3b82f6' : '#6b7280', fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
                Plano {user?.subscriptionTier === 'pro' ? 'PRO (Ilimitado)' : 'FREE (Até 5 alunos)'}
              </span>
            </div>
            {user?.subscriptionTier === 'free' && (
              <button 
                className="btn btn-primary" 
                onClick={() => updateProfile({ subscriptionTier: 'pro' })}
                style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
              >
                Fazer Upgrade para PRO
              </button>
            )}
          </div>

          <div className="usage-indicator">
            <div className="flex justify-between text-sm mb-1">
              <span>Alunos Cadastrados</span>
              <span>{students.length} / {user?.subscriptionTier === 'pro' ? '∞' : '5'}</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min((students.length / 5) * 100, 100)}%`, 
                height: '100%', 
                backgroundColor: students.length >= 5 && user?.subscriptionTier === 'free' ? '#ef4444' : 'var(--accent-primary)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            {user?.subscriptionTier === 'free' && students.length >= 5 && (
              <p className="text-sm mt-2" style={{ color: '#ef4444' }}>
                Você atingiu o limite do plano gratuito. Faça upgrade para adicionar mais alunos.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="card mt-4 border-danger" style={{ maxWidth: 800, borderColor: '#fee2e2', backgroundColor: 'rgba(254, 226, 226, 0.2)' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} /> Zona de Perigo
        </h3>
        
        <div className="delete-account-section p-4" style={{ borderRadius: 'var(--radius-md)' }}>
          <div className="flex justify-between items-center">
            <div>
              <h4 style={{ color: '#dc2626', marginBottom: '0.25rem' }}>Excluir Conta</h4>
              <p className="text-sm" style={{ color: '#7f1d1d' }}>
                Esta ação é permanente e removerá todos os seus dados, alunos e treinos do nosso sistema.
              </p>
            </div>
            <button 
              className="btn btn-danger" 
              onClick={async () => {
                if (window.confirm('TEM CERTEZA? Esta ação não pode ser desfeita. Todos os seus alunos e treinos serão apagados para sempre.')) {
                  try {
                    await deleteAccount();
                    navigate('/login');
                  } catch (err: any) {
                    alert('Erro ao excluir conta: ' + err.message);
                  }
                }
              }}
              style={{ backgroundColor: '#dc2626', color: 'white', border: 'none' }}
            >
              <Trash2 size={18} /> Excluir Minha Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
