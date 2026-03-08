import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const { login, register, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setResetSent(true);
      } else if (isRegister) {
        await register(name, email, password, isStudent ? 'student' : 'admin');
        // Success only if no error was thrown
        setError(null);
        setShowSuccess(true);
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.message?.includes('Email not confirmed')) {
        setError('Acesso restrito: Sua conta aguarda confirmação de e-mail. Por favor, valide seu endereço através do link enviado para sua caixa de entrada.');
      } else if (err.message?.includes('Invalid login credentials') || err.status === 400) {
        setError('E-mail ou senha incorretos. Por favor, verifique suas informações ou utilize a recuperação de senha caso tenha esquecido seu acesso.');
      } else if (err.message?.includes('User already registered')) {
        setError('O e-mail selecionado já está em uso. Por favor, utilize suas credenciais no Painel de Login.');
      } else if (err.message?.includes('email rate limit exceeded')) {
        setError('Muitas solicitações em curto espaço de tempo. Por favor, aguarde alguns minutos antes de tentar realizar um novo cadastro por segurança.');
      } else {
        setError(err.message || 'Ocorreu um erro inesperado no sistema. Por favor, tente novamente em alguns instantes.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="success-icon-container" style={{ 
            width: '100px', 
            height: '100px', 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 2rem',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <Mail className="text-primary" size={48} style={{ color: '#3b82f6' }} />
          </div>
          <h2 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1.75rem', fontWeight: '800' }}>Validação Pendente</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
            Um link de ativação foi encaminhado para o endereço <strong>{email}</strong>. 
            Para garantir a segurança de seus dados, confirme seu acesso antes de prosseguir para o painel do TrainerFlow.
          </p>
          <button 
            className="login-btn w-full" 
            onClick={() => {
              setShowSuccess(false);
              setIsRegister(false);
            }}
          >
            Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Dumbbell className="login-logo-icon" size={48} />
          <h2>TrainerFlow {isStudent ? 'Aluno' : 'Pro'}</h2>
          <p>
            {isForgotPassword 
              ? 'Recupere seu acesso' 
              : isRegister ? 'Crie sua conta premium' : 'Acesse seu painel de performance'}
          </p>
        </div>

        {!isForgotPassword && (
          <div className="role-toggle">
            <button 
              type="button" 
              className={!isStudent ? 'active' : ''}
              onClick={() => setIsStudent(false)}
            >SOU PROFESSOR</button>
            <button 
              type="button" 
              className={isStudent ? 'active' : ''}
              onClick={() => setIsStudent(true)}
            >SOU ALUNO</button>
          </div>
        )}

        {isForgotPassword ? (
          <div className="login-form">
            {resetSent ? (
              <div className="success-alert" style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                color: '#22c55e', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                ✅ Solicitação processada. Enviamos as instruções de recuperação para o seu e-mail.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>E-mail da conta</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" size={20} />
                    <input 
                      type="email" 
                      className="input-field" 
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="login-btn w-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </button>
              </form>
            )}
            
            <button 
              className="toggle-mode-btn w-full mt-4"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => {
                setIsForgotPassword(false);
                setResetSent(false);
                setError(null);
              }}
            >
              <ArrowLeft size={16} /> Voltar para o Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-alert">
                <span>{error}</span>
                {error.includes('já está cadastrado') && (
                  <button type="button" onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}>
                    Ir para Login agora →
                  </button>
                )}
              </div>
            )}
            
            {isRegister && (
              <div className="input-group">
                <label>Nome Completo</label>
                <div className="input-with-icon">
                  <UserIcon className="input-icon" size={20} />
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Como quer ser chamado?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isRegister}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>E-mail</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={20} />
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: isRegister ? '1.5rem' : '0.5rem' }}>
              <label>Senha Secreta</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={20} />
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {!isRegister && (
              <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                <button 
                  type="button" 
                  className="toggle-mode-btn" 
                  style={{ fontSize: '0.8rem', opacity: 0.7 }}
                  onClick={() => setIsForgotPassword(true)}
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Preparando seu ambiente...' : (isRegister ? 'Iniciar Jornada' : 'Entrar no Painel')}
            </button>
          </form>
        )}

        {!isForgotPassword && (
          <div className="login-footer">
            <p>
              {isRegister ? 'Já é de casa?' : 'Novo por aqui?'}
              <button 
                type="button" 
                className="toggle-mode-btn"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                }}
              >
                {isRegister ? 'Fazer login' : 'Começar agora!'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
