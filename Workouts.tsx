import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Plus, Search, Dumbbell, Trash2, CalendarDays } from 'lucide-react';
import './Workouts.css';

export function Workouts() {
  const { workouts, students, exercises, addWorkout } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [workoutExercises, setWorkoutExercises] = useState<{ exerciseId: string; sets: number; reps: string; notes: string }[]>([]);

  const filteredWorkouts = workouts.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    students.find(s => s.id === w.studentId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddExercise = () => {
    if (exercises.length > 0) {
      setWorkoutExercises([...workoutExercises, { exerciseId: exercises[0].id, sets: 3, reps: '10-12', notes: '' }]);
    }
  };

  const handleRemoveExercise = (index: number) => {
    const newExercises = [...workoutExercises];
    newExercises.splice(index, 1);
    setWorkoutExercises(newExercises);
  };

  const handleExerciseChange = (index: number, field: string, value: any) => {
    const newExercises = [...workoutExercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setWorkoutExercises(newExercises);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !workoutName || workoutExercises.length === 0) return;
    
    addWorkout({
      studentId: selectedStudentId,
      name: workoutName,
      exercises: workoutExercises
    });
    
    setIsModalOpen(false);
    setSelectedStudentId('');
    setWorkoutName('');
    setWorkoutExercises([]);
  };

  const handleGenerateWeeklyRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const studentId = (form.elements.namedItem('genStudentId') as HTMLSelectElement).value;
    const level = (form.elements.namedItem('genLevel') as HTMLSelectElement).value;
    const goal = (form.elements.namedItem('genGoal') as HTMLSelectElement).value;
    
    if (!studentId) return;

    // Helper to pick random exercises from a muscle group
    const pickExercises = (groups: string[], count: number) => {
      const candidates = exercises.filter(ex => groups.includes(ex.muscleGroup));
      const shuffled = candidates.sort(() => 0.5 - Math.random());
      
      return shuffled.slice(0, count).map(ex => {
        let sets = 3;
        let reps = '10-12';
        let notes = '';

        switch(goal) {
          case 'Hipertrofia':
            sets = level === 'Iniciante' ? 3 : 4;
            reps = '8-12';
            notes = 'Foco em carga e controle da fase excêntrica.';
            break;
          case 'Emagrecimento':
            sets = 3;
            reps = '15-20';
            notes = 'Intervalo curto (45s). Foco em densidade e queima calórica.';
            break;
          case 'Resistencia':
            sets = 3;
            reps = '20-30';
            notes = 'Cadência controlada, foco em endurance muscular.';
            break;
          case 'ForcaMaxima':
            sets = level === 'Iniciante' ? 3 : 5;
            reps = '1-5';
            notes = 'Carga máxima. Intervalo longo (2-3 min). Foco em explosão.';
            break;
          case 'Mobilidade':
            sets = 2;
            reps = '10-12 (lento)';
            notes = 'Foco na amplitude máxima do movimento. Sem pressa.';
            break;
        }

        return { exerciseId: ex.id, sets, reps, notes };
      });
    };

    // Routine A: Peito, Ombro, Tríceps
    const routineA = [
      ...pickExercises(['Peito'], goal === 'Hipertrofia' ? 3 : 2),
      ...pickExercises(['Ombros'], 2),
      ...pickExercises(['Tríceps'], 2)
    ];

    // Routine B: Costas, Bíceps, Abdômen
    const routineB = [
      ...pickExercises(['Costas'], goal === 'Hipertrofia' ? 3 : 2),
      ...pickExercises(['Bíceps'], 2),
      ...pickExercises(['Abdômen'], 2)
    ];

    // Routine C: Pernas, Glúteos, Panturrilhas
    const routineC = [
      ...pickExercises(['Pernas'], goal === 'Hipertrofia' ? 4 : 3),
      ...pickExercises(['Panturrilhas'], 2)
    ];

    // Add them to Context
    const finalStudentId = studentId === 'template' ? undefined : studentId;
    
    await addWorkout({ studentId: finalStudentId, name: `Treino A (${goal}) - Peito/Ombro/Tríceps`, exercises: routineA });
    await addWorkout({ studentId: finalStudentId, name: `Treino B (${goal}) - Costas/Bíceps/Abd`, exercises: routineB });
    await addWorkout({ studentId: finalStudentId, name: `Treino C (${goal}) - Pernas Completas`, exercises: routineC });

    setIsGenerateModalOpen(false);
  };

  return (
    <div className="workouts-container">
      <div className="page-header">
        <div>
          <h1>Treinos</h1>
          <p>Gerenciamento de fichas de treino dos alunos.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user?.role === 'admin' && (
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                if (students.length === 0) return alert('Cadastre um aluno primeiro!');
                setIsGenerateModalOpen(true);
              }}
            >
              <CalendarDays size={18} />
              <span>Gerar Rotina Semanal</span>
            </button>
          )}
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => {
              setSelectedStudentId('');
              setWorkoutName('');
              setWorkoutExercises([]);
              setIsModalOpen(true);
            }}>
              <Plus size={18} />
              <span>Criar Treino Manual</span>
            </button>
          )}
        </div>
      </div>

      <div className="card list-wrapper mt-4">
        <div className="list-toolbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por treino ou aluno..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="workouts-list">
          {filteredWorkouts.length > 0 ? filteredWorkouts.map(workout => {
            const student = students.find(s => s.id === workout.studentId);
            return (
              <div key={workout.id} className="workout-row">
                <div className="workout-info">
                  <div className="avatar sm bg-primary"><Dumbbell size={16}/></div>
                  <div>
                    <h3 className="workout-name">{workout.name}</h3>
                    <p className="workout-meta">Aluno: {student?.name || 'Desconhecido'} • {workout.exercises.length} Exercícios</p>
                  </div>
                </div>
                <div className="workout-actions">
                  <button className="btn btn-secondary btn-sm">Ver Detalhes</button>
                </div>
              </div>
            );
          }) : (
            <div className="empty-state p-8">
              <p>Nenhum treino encontrado. Que tal criar um novo?</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card modal-lg">
            <div className="modal-header">
              <h2>Criar Novo Treino</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row columns-2">
                <div className="input-group">
                  <label className="input-label">Aluno</label>
                  <select required className="input-field" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
                    <option value="">Selecione o aluno...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Nome do Treino (ex: Treino A, Costas/Bíceps)</label>
                  <input required type="text" className="input-field" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} />
                </div>
              </div>

              <div className="exercises-section mt-6">
                <div className="section-header-inline">
                  <h3>Exercícios</h3>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddExercise}>
                    <Plus size={16}/> Adicionar Exercício
                  </button>
                </div>

                <div className="exercises-list-builder mt-4">
                  {workoutExercises.map((ex, index) => (
                    <div key={index} className="exercise-builder-row">
                      <div className="ex-number">{index + 1}</div>
                      <div className="ex-fields-grid">
                        <select 
                          className="input-field" 
                          value={ex.exerciseId}
                          onChange={(e) => handleExerciseChange(index, 'exerciseId', e.target.value)}
                        >
                          {exercises.map(libraryEx => (
                            <option key={libraryEx.id} value={libraryEx.id}>{libraryEx.name}</option>
                          ))}
                        </select>
                        <input 
                          type="number" 
                          placeholder="Séries" 
                          className="input-field"
                          value={ex.sets}
                          onChange={(e) => handleExerciseChange(index, 'sets', Number(e.target.value))}
                        />
                        <input 
                          type="text" 
                          placeholder="Repetições (ex: 10-12)" 
                          className="input-field"
                          value={ex.reps}
                          onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                        />
                        <input 
                          type="text" 
                          placeholder="Obs" 
                          className="input-field ex-obs"
                          value={ex.notes}
                          onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                        />
                        <button type="button" className="icon-btn-sm text-danger" onClick={() => handleRemoveExercise(index)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {workoutExercises.length === 0 && (
                    <p className="text-muted text-center p-4">Adicione exercícios ao treino para prosseguir.</p>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={workoutExercises.length === 0}>Salvar Treino</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Weekly Routine Modal */}
      {isGenerateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Gerar Rotina ABC</h2>
              <button className="close-btn" onClick={() => setIsGenerateModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleGenerateWeeklyRoutine} className="modal-form mt-4">
              <p className="text-muted mb-4 text-sm">O sistema criará automaticamente 3 fichas completas (A, B e C) agrupando os músculos de forma otimizada para a semana.</p>
              
              <div className="input-group">
                <label className="input-label">Aluno</label>
                <select name="genStudentId" required className="input-field">
                  <option value="">Selecione o aluno...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Objetivo: {s.goal})</option>
                  ))}
                  <option value="template">Nenhum (Criar como Modelo)</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Nível de Experiência</label>
                <select name="genLevel" required className="input-field">
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediario">Intermediário/Avançado</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Objetivo do Treino</label>
                <select name="genGoal" required className="input-field">
                  <option value="Hipertrofia">Hipertrofia (Massa Muscular)</option>
                  <option value="Emagrecimento">Emagrecimento (Queima Calórica)</option>
                  <option value="Resistencia">Resistência Muscular</option>
                  <option value="ForcaMaxima">Força Máxima (Powerlifting style)</option>
                  <option value="Mobilidade">Mobilidade e Flexibilidade</option>
                </select>
              </div>

              <div className="modal-footer mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setIsGenerateModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Gerar Fichas Agora</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
