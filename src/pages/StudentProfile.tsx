import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, Edit2, Play, Plus, CheckCircle, Video, Trash2, Dumbbell } from 'lucide-react';
import { EvolutionCharts } from '../components/EvolutionCharts';
import type { Student, Workout, EvolutionEntry, VideoReview, WorkoutLog } from '../context/DataContext';
import './StudentProfile.css';

export function StudentProfile() {
  const { id } = useParams();
  const { students, workouts, evolution, videoReviews, workoutLogs, updateVideoReview, assignWorkout, removeWorkout, addEvolutionEntry } = useData();
  const [activeTab, setActiveTab] = useState<'info' | 'workouts' | 'evolution' | 'charts'>('info');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
  const [assignSelectedWorkoutId, setAssignSelectedWorkoutId] = useState('');
  const [evolutionFormData, setEvolutionFormData] = useState({
    weight: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmittingEvolution, setIsSubmittingEvolution] = useState(false);

  const student = students.find((s: Student) => s.id === id);
  const studentWorkouts = workouts.filter((w: Workout) => w.studentId === id);
  const studentLogs = workoutLogs.filter((l: WorkoutLog) => l.studentId === id).sort((a: WorkoutLog, b: WorkoutLog) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // For the assign modal, show unique names of all workouts in the system
  const allUniqueWorkouts = Array.from(new Map(workouts.map((w: Workout) => [w.name, w])).values());
  const studentEvolution = evolution.filter((e: EvolutionEntry) => e.studentId === id).sort((a: EvolutionEntry, b: EvolutionEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const studentVideos = videoReviews.filter((r: VideoReview) => r.studentId === id).sort((a: VideoReview, b: VideoReview) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEvolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    
    setIsSubmittingEvolution(true);
    try {
      await addEvolutionEntry({
        studentId: student.id,
        weight: Number(evolutionFormData.weight),
        notes: evolutionFormData.notes,
        date: evolutionFormData.date
      });
      
      setIsEvolutionModalOpen(false);
      setEvolutionFormData({ ...evolutionFormData, weight: '', notes: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingEvolution(false);
    }
  };

  if (!student) {
    return <div className="p-4"><p>Aluno não encontrado.</p><Link to="/alunos" className="btn btn-secondary mt-4">Voltar</Link></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <Link to="/alunos" className="back-link">
          <ArrowLeft size={16} /> Voltar para Alunos
        </Link>
        <div className="profile-header-main">
          <div className="profile-title">
            <div className="avatar lg">{student.name.charAt(0)}</div>
            <div>
              <h1>{student.name}</h1>
              <span className="badge tag-goal">{student.goal}</span>
            </div>
          </div>
          <button className="btn btn-secondary">
            <Edit2 size={16} /> Editar Perfil
          </button>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Informações Gerais</button>
        <button className={`tab-btn ${activeTab === 'workouts' ? 'active' : ''}`} onClick={() => setActiveTab('workouts')}>Treinos</button>
        <button className={`tab-btn ${activeTab === 'evolution' ? 'active' : ''}`} onClick={() => setActiveTab('evolution')}>Evolução Física</button>
        <button className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`} onClick={() => setActiveTab('charts')}>Análise Visual</button>
      </div>

      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="info-grid">
            <div className="card">
              <h3>Dados Físicos</h3>
              <div className="data-list mt-4">
                <div className="data-item">
                  <span className="data-label">Idade</span>
                  <span className="data-value">{student.age} anos</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Peso Atual</span>
                  <span className="data-value">{student.weight} kg</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Altura</span>
                  <span className="data-value">{student.height} m</span>
                </div>
                <div className="data-item">
                  <span className="data-label">IMC</span>
                  <span className="data-value">{(student.weight / (student.height * student.height)).toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Observações e Restrições</h3>
              <div className="notes-content mt-4">
                {student.notes ? <p>{student.notes}</p> : <p className="text-muted">Nenhuma observação registrada.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workouts' && (
          <div className="workouts-section">
            <div className="section-header">
              <h3>Treinos Atribuídos</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => setIsAssignModalOpen(true)}
                >
                  <Dumbbell size={16}/> Atribuir Treino Existente
                </button>
                <Link to="/treinos" className="btn btn-secondary btn-sm"><Plus size={16}/> Novo</Link>
              </div>
            </div>
            
            {studentWorkouts.length > 0 ? (
              <div className="workouts-grid mt-4">
                {studentWorkouts.map((w: Workout) => (
                  <div key={w.id} className="card workout-card" style={{ position: 'relative' }}>
                    <button 
                      className="icon-btn-sm text-danger" 
                      style={{ position: 'absolute', top: '1rem', right: '1rem' }}
                      onClick={() => {
                        if (confirm('Tem certeza que deseja remover este treino do aluno?')) {
                          removeWorkout(w.id);
                        }
                      }}
                      title="Remover Treino"
                    >
                      <Trash2 size={18} />
                    </button>
                    <h4>{w.name}</h4>
                    <p className="text-muted">{w.exercises.length} exercícios</p>
                    <div className="mt-4">
                      <button className="btn btn-secondary w-full"><Play size={16}/> Iniciar</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state card mt-4">
                <p>Nenhum treino atribuído ainda.</p>
              </div>
            )}

            <div className="section-header mt-8">
              <h3>Histórico de treinos</h3>
            </div>
            <div className="card mt-4 p-0">
              <div className="list-content">
                {studentLogs.length > 0 ? studentLogs.map((log: WorkoutLog) => {
                  const dateStr = new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                  return (
                    <div key={log.id} className="list-item" style={{ borderBottom: '1px solid var(--border-color)', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span className="text-secondary font-medium" style={{ minWidth: '50px' }}>{dateStr}</span>
                      <span style={{ fontWeight: 500 }}>- {log.workoutName}</span>
                    </div>
                  );
                }) : (
                  <div className="p-4 text-center text-muted">Ainda não há treinos concluídos.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evolution' && (
          <div className="evolution-section">
            <div className="section-header">
              <h3>Histórico de Medidas e Peso</h3>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEvolutionFormData({ ...evolutionFormData, weight: student.weight?.toString() || '', notes: '' });
                  setIsEvolutionModalOpen(true);
                }}
              >
                <Plus size={16}/> Registrar Evolução
              </button>
            </div>

            {studentVideos.length > 0 && (
              <div className="card mt-4 p-4" style={{ borderLeft: '4px solid var(--accent-warning)' }}>
                <h3 className="mb-4 flex items-center gap-2"><Video size={20} /> Avaliações Pendentes (Vídeo)</h3>
                <div className="flex-col gap-4">
                  {studentVideos.map((v: VideoReview) => (
                    <div key={v.id} className="p-4" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                      <p className="font-semibold">{v.workoutName}</p>
                      <p className="text-sm text-secondary mb-2">{v.exerciseName}</p>
                      
                      {v.videoUrl && (
                        <div style={{ maxWidth: '300px', margin: '1rem 0' }}>
                           <video src={v.videoUrl} controls style={{ width: '100%', borderRadius: '8px', backgroundColor: '#000' }}></video>
                        </div>
                      )}
                      
                      {v.status === 'pending' ? (
                        <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
                          <label className="text-sm font-medium mb-2 block">Enviar Feedback</label>
                          <textarea 
                            id={`feedback-${v.id}`} 
                            className="input-field" 
                            placeholder="Descreva a correção técnica aqui..." 
                            rows={2}
                          ></textarea>
                          <button 
                            className="btn btn-primary btn-sm mt-2" 
                            onClick={() => {
                              const el = document.getElementById(`feedback-${v.id}`) as HTMLTextAreaElement;
                              if (el && el.value.trim()) {
                                updateVideoReview(v.id, el.value);
                              }
                            }}
                          >
                            Concluir Avaliação
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 p-3" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                          <p className="text-sm font-medium text-success flex items-center gap-2">
                            <CheckCircle size={16} /> Avaliado
                          </p>
                          <p className="text-sm text-secondary mt-1">{v.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {studentEvolution.filter((e: EvolutionEntry) => e.photoUrl).length > 0 && (
              <div className="card mt-4 p-4">
                <h3 className="mb-4">Galeria de Fotos do Aluno</h3>
                <div className="flex gap-4" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {studentEvolution.filter((e: EvolutionEntry) => e.photoUrl).map((entry: EvolutionEntry) => (
                    <div key={entry.id} className="card p-0 overflow-hidden relative" style={{ minWidth: '150px', width: '150px', height: '200px', flexShrink: 0 }}>
                      <div className="absolute top-2 left-2 badge text-xs bg-dark text-white">{new Date(entry.date).toLocaleDateString()}</div>
                      <img src={entry.photoUrl} alt="Evolução" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card mt-4 p-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Peso (kg)</th>
                    <th>Variação</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {studentEvolution.length > 0 ? studentEvolution.map((entry: EvolutionEntry, idx: number) => {
                    const prevEntry = studentEvolution[idx + 1];
                    let diff = 0;
                    if (prevEntry) diff = entry.weight - prevEntry.weight;
                    
                    return (
                      <tr key={entry.id}>
                        <td>{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="font-bold">{entry.weight}</td>
                        <td>
                          {prevEntry ? (
                            <span className={diff > 0 ? 'text-danger' : diff < 0 ? 'text-success' : ''}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>{entry.notes}</td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="text-center p-8 text-muted">Ainda não há registros de evolução.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="charts-section">
            <div className="section-header">
              <h3>Análise de Desempenho</h3>
            </div>
            <EvolutionCharts studentId={id!} />
          </div>
        )}
      </div>

      {/* Assign Workout Modal */}
      {isAssignModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Atribuir Treino</h2>
              <button className="close-btn" onClick={() => setIsAssignModalOpen(false)}>&times;</button>
            </div>
            
            <div className="modal-body mt-4">
              <p className="text-muted mb-4">Selecione um treino existente no sistema para atribuir ao {student.name}. Uma cópia independente será criada para ele.</p>
              
              <div className="input-group">
                <label className="input-label">Selecionar Treino Base</label>
                <select 
                  className="input-field" 
                  value={assignSelectedWorkoutId}
                  onChange={(e) => setAssignSelectedWorkoutId(e.target.value)}
                >
                  <option value="">Selecione um treino...</option>
                  {allUniqueWorkouts.map((w: Workout) => (
                    <option key={w.id} value={w.id}>{w.name} (Modelo de {students.find((s: Student) => s.id === w.studentId)?.name || 'Outro'})</option>
                  ))}
                </select>
                {allUniqueWorkouts.length === 0 && (
                  <p className="text-danger text-sm mt-2">Nenhum treino encontrado no sistema. Crie um treino primeiro.</p>
                )}
              </div>
            </div>

            <div className="modal-footer mt-6">
              <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>Cancelar</button>
              <button 
                className="btn btn-primary" 
                disabled={!assignSelectedWorkoutId}
                onClick={() => {
                  if (assignSelectedWorkoutId) {
                    assignWorkout(student.id, assignSelectedWorkoutId);
                    setIsAssignModalOpen(false);
                    setAssignSelectedWorkoutId('');
                  }
                }}
              >
                Atribuir Treino Copiado
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Evolution Modal */}
      {isEvolutionModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Nova Avaliação para {student.name}</h2>
              <button className="close-btn" onClick={() => setIsEvolutionModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleEvolutionSubmit} className="modal-form">
              <div className="form-row columns-2">
                <div className="input-group">
                  <label className="input-label">Data</label>
                  <input 
                    required 
                    type="date" 
                    className="input-field" 
                    value={evolutionFormData.date} 
                    onChange={(e) => setEvolutionFormData({...evolutionFormData, date: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Peso (kg)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.1" 
                    className="input-field" 
                    value={evolutionFormData.weight} 
                    onChange={(e) => setEvolutionFormData({...evolutionFormData, weight: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Observações</label>
                  <textarea 
                    className="input-field" 
                    rows={3} 
                    value={evolutionFormData.notes} 
                    onChange={(e) => setEvolutionFormData({...evolutionFormData, notes: e.target.value})}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEvolutionModalOpen(false)} disabled={isSubmittingEvolution}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingEvolution}>
                  {isSubmittingEvolution ? 'Salvando...' : 'Salvar Evolução'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
