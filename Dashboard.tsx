import { Users, Dumbbell, Activity, Calendar, Video, Plus, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export function Dashboard() {
  const { user } = useAuth();
  const { students, workouts, evolution, videoReviews, workoutLogs } = useData();
  const navigate = useNavigate();
  
  const pendingReviews = videoReviews.filter(v => v.status === 'pending');
  const recentLogs = [...workoutLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const recentEvolutions = [...evolution].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const stats = [
    { label: 'Total de Alunos', value: students.length, icon: Users, color: 'blue' },
    { label: 'Treinos Ativos', value: workouts.length, icon: Dumbbell, color: 'emerald' },
    { label: 'Vídeos Pendentes', value: pendingReviews.length, icon: Video, color: 'orange' },
    { label: 'Treinos Concluídos', value: workoutLogs.length, icon: Calendar, color: 'purple' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Olá, {user?.name}!</h1>
          <p>Aqui está o resumo das atividades dos seus alunos.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/treinos')}>
            <Wand2 size={18} /> Gerar Rotina
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/alunos')}>
            <Plus size={18} /> Novo Aluno
          </button>
        </div>
      </div>

      {pendingReviews.length > 0 && (
        <div className="card mb-6" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', animation: 'pulse 2s infinite' }}>
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <Video className="text-warning" size={24} />
              <div>
                <h4 style={{ margin: 0 }}>Você tem {pendingReviews.length} vídeos para avaliar</h4>
                <p className="text-sm text-secondary m-0">Alunos enviaram execuções para correção técnica.</p>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/alunos')}>Ver Alunos</button>
          </div>
        </div>
      )}

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card card">
            <div className={`stat-icon-wrapper bg-${stat.color}`}>
              <stat.icon className={`icon-${stat.color}`} size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="card list-card">
          <div className="card-header">
            <h3>Atividade Recente dos Alunos</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/alunos')}>Ver Todos</button>
          </div>
          <div className="list-content">
            {recentLogs.map(log => {
              const student = students.find(s => s.id === log.studentId);
              return (
                <div key={log.id} className="list-item">
                  <div className="item-avatar">{student?.name.charAt(0) || '?'}</div>
                  <div className="item-details">
                    <span className="item-title">{student?.name || 'Aluno Removido'}</span>
                    <span className="item-subtitle">Concluiu {log.workoutName} • {new Date(log.date).toLocaleDateString()}</span>
                  </div>
                  <span className="badge tag-goal">{log.entries.length} exs</span>
                </div>
              );
            })}
            {workoutLogs.length === 0 && (
              <div className="empty-state">
                <Calendar size={32} className="empty-icon" />
                <p>Nenhum treino concluído recentemente.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card list-card">
          <div className="card-header">
            <h3>Últimas Atualizações de Peso</h3>
          </div>
          <div className="list-content">
            {recentEvolutions.map(ev => {
              const student = students.find(s => s.id === ev.studentId);
              return (
                <div key={ev.id} className="list-item">
                  <div className="item-details">
                    <span className="item-title">{student?.name}</span>
                    <span className="item-subtitle">{new Date(ev.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold" style={{ fontSize: '1.1rem' }}>{ev.weight} kg</span>
                  </div>
                </div>
              );
            })}
            {evolution.length === 0 && (
              <div className="empty-state">
                <Activity size={32} className="empty-icon" />
                <p>Nenhuma atualização de peso registrada.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
