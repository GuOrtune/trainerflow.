import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle, Dumbbell } from 'lucide-react';

export function InviteRegistration() {
  const { id } = useParams();
  const { students, updateStudent } = useData();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const studentProfile = students.find(s => s.id === id);

  useEffect(() => {
    if (studentProfile) {
      setName(studentProfile.name);
      setEmail(studentProfile.email || '');
    }
  }, [studentProfile]);

  if (!studentProfile) {
    return (
      <div className="auth-container">
        <div className="auth-card card text-center">
          <h2 className="text-danger">Convite Inválido</h2>
          <p className="mt-4 text-muted">Este link de convite parece estar expirado ou é inválido. Por favor, solicite um novo link ao seu treinador.</p>
          <Link to="/login" className="btn btn-secondary mt-6 w-full">Ir para Login</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Register user in Auth system (this also creates the profile)
      await register(name, email, password, 'student');
      
      // 2. Update Student profile with the actual email (if different)
      await updateStudent(studentProfile.id, { email });

      setIsSuccess(true);
      setTimeout(() => navigate('/aluno/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card card text-center p-8">
          <div className="flex justify-center mb-6">
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', padding: '1rem', borderRadius: '50%' }}>
              <CheckCircle size={48} />
            </div>
          </div>
          <h2>Tudo pronto, {name}!</h2>
          <p className="text-muted mt-2">Sua conta foi criada e vinculada com sucesso. Estamos te levando para o seu painel de treinos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="auth-card card" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <div className="logo-icon pulse" style={{ backgroundColor: 'var(--accent-primary)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-lg)' }}>
                <Dumbbell size={32} />
             </div>
          </div>
          <h1>Bem-vindo ao TrainerFlow</h1>
          <p className="text-muted mt-2">Você foi convidado pelo seu treinador para acessar seu plano de treinamento exclusivo.</p>
        </div>

        {error && (
          <div className="p-3 mb-6 flex items-center gap-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div className="input-group">
            <label className="input-label">Nome Completo</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Crie uma Senha</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-4 py-4"
            disabled={isLoading}
          >
            {isLoading ? 'Cadastrando...' : <span className="flex items-center gap-2 justify-center">Criar Conta e Começar <ArrowRight size={18}/></span>}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-secondary">
          Já tem uma conta? <Link to="/login" className="text-primary font-bold">Faça login aqui</Link>
        </p>
      </div>
    </div>
  );
}
