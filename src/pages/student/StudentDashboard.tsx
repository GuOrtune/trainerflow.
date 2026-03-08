import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Target, Calendar, TrendingUp, PlayCircle, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EvolutionCharts } from '../../components/EvolutionCharts';

// Import Types to fix implicit any
import type { Workout, EvolutionEntry, Student } from '../../context/DataContext';

export function StudentDashboard() {
  const { user } = useAuth();
  const { workouts, exercises, students, evolution, videoReviews } = useData();
  const navigate = useNavigate();

  // Find the student profile that matches this user's email
  const studentProfile = students.find((s: Student) => s.email === user?.email);
  
  if (!studentProfile) {
    return (
      <div className="card p-8 text-center">
        <h2>Seu perfil ainda não foi vinculado por um professor</h2>
        <p className="text-muted mt-2">Fale com seu Personal para que ele vincule seu email ({user?.email}) à sua ficha de treino.</p>
        <button className="btn btn-secondary mt-6" onClick={() => window.location.reload()}>Recarregar Página</button>
      </div>
    );
  }

  const studentWorkouts = workouts.filter((w: Workout) => w.studentId === studentProfile.id);
  const studentEvolutions = evolution.filter((e: EvolutionEntry) => e.studentId === studentProfile.id)
    .sort((a: EvolutionEntry, b: EvolutionEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const studentReviews = videoReviews.filter((r: any) => r.studentId === studentProfile.id)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex-col gap-4">
      <div className="page-header">
        <div>
          <h1>Olá, {user?.name || 'Aluno'}!</h1>
          <p>Bem-vindo ao seu painel de treinamento.</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Target size={24} />
          </div>
          <div className="stat-info">
            <h3>Objetivo</h3>
            <p className="stat-value" style={{ fontSize: '1.25rem' }}>{studentProfile.goal}</p>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>Fichas Ativas</h3>
            <p className="stat-value">{studentWorkouts.length}</p>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(250, 204, 21, 0.15)', color: '#facc15' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>Peso Atual</h3>
            <p className="stat-value">{studentProfile.weight} kg</p>
          </div>
        </div>
      </div>

      <div className="columns-2 mt-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Workouts Section */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.125rem' }}>Meus Treinos</h3>
          <div className="flex-col gap-3">
            {studentWorkouts.map((workout: Workout) => (
              <div key={workout.id} className="p-3 bg-secondary" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div className="flex justify-between items-center mb-2">
                  <h4 style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{workout.name}</h4>
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>{workout.exercises.length} ex</span>
                </div>
                <div className="flex-col gap-2 mt-3">
                  {workout.exercises.slice(0, 3).map((ex: any, i: number) => {
                    const exerciseData = exercises.find(e => e.id === ex.exerciseId);
                    return (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-secondary">• {exerciseData?.name}</span>
                        <span className="text-muted">{ex.sets}x{ex.reps}</span>
                      </div>
                    );
                  })}
                  {workout.exercises.length > 3 && (
                    <div className="text-center mt-2">
                       <span className="text-muted text-sm">+ {workout.exercises.length - 3} exercícios</span>
                    </div>
                  )}
                </div>
                <button 
                  className="btn btn-primary w-full mt-3" 
                  onClick={() => navigate(`/aluno/treino/${workout.id}`)}
                >
                  <PlayCircle size={16} /> Iniciar Treino
                </button>
              </div>
            ))}
            {studentWorkouts.length === 0 && (
              <p className="text-muted text-center py-4">Nenhum treino atribuído a você ainda.</p>
            )}
          </div>
        </div>

        {/* Evolution Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Minha Evolução</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/aluno/evolucao')}>
              Ver tudo
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Peso</th>
                </tr>
              </thead>
              <tbody>
                {studentEvolutions.slice(0, 5).map((ev: EvolutionEntry) => (
                  <tr key={ev.id}>
                    <td>{new Date(ev.date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600 }}>{ev.weight} kg</td>
                  </tr>
                ))}
                {studentEvolutions.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center text-muted py-4">Nenhum registro encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Feedback Section */}
        {studentReviews.length > 0 && (
          <div className="card w-full" style={{ gridColumn: '1 / -1' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Feedback do Professor</h3>
            </div>
            <div className="flex-col gap-3">
              {studentReviews.slice(0, 3).map((review: any) => (
                <div key={review.id} className="p-4 bg-secondary" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', borderLeft: review.status === 'reviewed' ? '4px solid var(--accent-primary)' : '4px solid var(--warning)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{review.exerciseName}</h4>
                      <p className="text-muted text-sm" style={{ margin: 0 }}>Enviado em: {new Date(review.date).toLocaleDateString()}</p>
                    </div>
                    <span className="badge" style={{ backgroundColor: review.status === 'reviewed' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(250, 204, 21, 0.1)', color: review.status === 'reviewed' ? '#38bdf8' : '#facc15' }}>
                      {review.status === 'reviewed' ? 'Avaliado' : 'Em Análise'}
                    </span>
                  </div>
                  
                  {review.status === 'reviewed' ? (
                    <div className="mt-3 p-3 text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                      <strong className="text-secondary" style={{ display: 'block', marginBottom: '0.25rem' }}>O que o professor disse:</strong>
                      <p className="m-0" style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>"{review.feedback}"</p>
                    </div>
                  ) : (
                     <p className="mt-2 text-sm text-secondary m-0">O professor está analisando seu vídeo e em breve deixará um comentário aqui.</p>
                  )}
                </div>
              ))}
              {studentReviews.length > 3 && (
                <div className="text-center mt-2">
                   <button className="btn btn-sm btn-secondary">Ver Histórico Completo</button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <div className="card mt-4">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="text-primary" size={24} />
          <h2 style={{ margin: 0 }}>Análise de Desempenho</h2>
        </div>
        <EvolutionCharts studentId={studentProfile.id} />
      </div>
    </div>
  );
}
