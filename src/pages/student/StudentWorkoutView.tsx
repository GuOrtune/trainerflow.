import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { ArrowLeft, CheckCircle2, Info, Video, Check, Dumbbell, Hash } from 'lucide-react';

export function StudentWorkoutView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workouts, exercises, addVideoReview, logWorkout } = useData();
  

  const [completedExercises, setCompletedExercises] = useState<Record<string, { weight: number, reps: number }>>({});
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);

  const workout = workouts.find(w => w.id === id);

  if (!workout) {
    return (
      <div className="card p-8 text-center">
        <h2>Treino não encontrado</h2>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>Voltar ao Início</button>
      </div>
    );
  }

  const handleToggleExercise = (exerciseId: string, isCompleted: boolean) => {
    if (isCompleted) {
      // Uncheck
      const newCompleted = { ...completedExercises };
      delete newCompleted[exerciseId];
      setCompletedExercises(newCompleted);
    } else {
      // Check (defaults to 0 if inputs are empty)
      setCompletedExercises({
        ...completedExercises,
        [exerciseId]: { weight: 0, reps: 0 }
      });
    }
  };

  const updateExerciseLog = (exerciseId: string, field: 'weight' | 'reps', value: number) => {
    setCompletedExercises({
      ...completedExercises,
      [exerciseId]: {
        ...(completedExercises[exerciseId] || { weight: 0, reps: 0 }),
        [field]: value
      }
    });
  };

  const handleFinishWorkout = () => {
    const entries = Object.keys(completedExercises).map(exId => ({
      exerciseId: exId,
      weight: completedExercises[exId].weight,
      repsDone: completedExercises[exId].reps
    }));

    logWorkout({
      studentId: workout.studentId!,
      workoutId: workout.id,
      workoutName: workout.name,
      date: new Date().toISOString(),
      entries
    });

    setIsWorkoutCompleted(true);
  };

  if (isWorkoutCompleted) {
    return (
      <div className="flex-col gap-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card mt-4 text-center p-8 flex flex-col items-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <CheckCircle2 size={64} className="text-success mb-4" style={{ color: '#22c55e' }}/>
          <h2 className="mb-2">Treino Registrado!</h2>
          <p className="text-muted mb-8 text-lg">Excelente trabalho! Seus resultados foram salvos no histórico.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>Voltar ao Início</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col gap-4 pb-[100px]" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex items-center gap-4 mb-2">
        <button className="icon-btn-sm" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{workout.name}</h1>
          <p className="text-muted m-0">Acompanhe seu treino, veja as instruções e registre suas cargas.</p>
        </div>
      </div>

      <div className="flex-col gap-4 mb-8">
        {workout.exercises.map((ex, index) => {
          const exerciseData = exercises.find(e => e.id === ex.exerciseId);
          if (!exerciseData) return null;


          const isCompleted = !!completedExercises[ex.exerciseId];
          const logData = completedExercises[ex.exerciseId] || { weight: 0, reps: 0 };

          return (
            <div 
              key={index} 
              className="card p-0 overflow-hidden" 
              style={{ 
                borderLeft: `4px solid ${isCompleted ? '#22c55e' : 'var(--accent-primary)'}`,
                opacity: isCompleted ? 0.9 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              <div className="p-4">
                <div className="flex justify-between items-start gap-4" style={{ flexWrap: 'wrap' }}>
                  <div className="flex-1" style={{ minWidth: '200px' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {index + 1}. {exerciseData.name}
                      {isCompleted && <CheckCircle2 size={18} color="#22c55e" />}
                    </h3>
                    <div className="flex gap-4 mb-2" style={{ flexWrap: 'wrap' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <strong>Alvo:</strong> {ex.sets}x{ex.reps}
                      </span>
                    </div>
                    {ex.notes && (
                      <p className="text-sm text-secondary flex gap-2 items-start mt-2 p-2" style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)', borderRadius: 'var(--radius-sm)' }}>
                        <Info size={16} className="text-warning" style={{ flexShrink: 0, marginTop: '2px' }}/> 
                        {ex.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <button 
                      className={`btn btn-sm ${isCompleted ? 'btn-secondary' : 'btn-primary'} w-full sm:w-auto`}
                      style={isCompleted ? { backgroundColor: '#22c55e20', color: '#22c55e', borderColor: '#22c55e50', justifyContent: 'center' } : { justifyContent: 'center' }}
                      onClick={() => handleToggleExercise(ex.exerciseId, isCompleted)}
                    >
                      <Check size={16} /> 
                      {isCompleted ? 'Feito' : 'Marcar Feito'}
                    </button>

                  </div>
                </div>

                {isCompleted && (
                  <div className="mt-4 pt-4 border-t flex gap-4" style={{ borderColor: 'var(--border-color)', animation: 'slideDown 0.3s ease' }}>
                    <div className="flex-1">
                      <label className="text-sm text-secondary flex items-center gap-1 mb-1"><Dumbbell size={14}/> Carga (Kg)</label>
                      <input 
                        type="number" 
                        min="0"
                        className="input" 
                        placeholder="Ex: 20"
                        value={logData.weight || ''}
                        onChange={(e) => updateExerciseLog(ex.exerciseId, 'weight', Number(e.target.value))}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-secondary flex items-center gap-1 mb-1"><Hash size={14}/> Reps Reais</label>
                      <input 
                        type="number" 
                        min="0"
                        className="input" 
                        placeholder="Ex: 12"
                        value={logData.reps || ''}
                        onChange={(e) => updateExerciseLog(ex.exerciseId, 'reps', Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
                
                {/* Premium feature: Upload execution video */}
                <div className="mt-3 pt-3 border-t flex justify-end" style={{ borderColor: 'var(--border-color)' }}>
                   <label className="text-sm cursor-pointer flex items-center gap-1 hover:underline" style={{ margin: 0, color: 'var(--accent-primary)' }}>
                      <Video size={14} /> Solicitar Avaliação de Movimento (Gravar)
                      <input 
                        type="file" 
                        accept="video/*" 
                        capture="environment"
                        style={{ display: 'none' }} 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              addVideoReview({
                                studentId: workout.studentId!,
                                workoutName: workout.name,
                                exerciseName: exerciseData.name,
                                videoUrl: reader.result as string
                              });
                              alert('Vídeo enviado! Seu professor avaliará a execução em breve.');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      <div className="card text-center p-6 flex flex-col items-center" style={{ backgroundColor: 'var(--bg-secondary)', position: 'fixed', bottom: '0', left: 0, right: 0, zIndex: 10, borderRadius: '24px 24px 0 0', boxShadow: '0 -4px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '800px', width: '100%' }}>
           <h3 className="mb-4 m-0">Finalizou o treino?</h3>
           <button 
             className="btn btn-primary btn-lg w-full" 
             onClick={handleFinishWorkout}
             disabled={Object.keys(completedExercises).length === 0}
             style={{ justifyContent: 'center' }}
           >
             Salvar Treino e Cargas
           </button>
           {Object.keys(completedExercises).length === 0 && (
             <p className="text-sm text-secondary mt-2 m-0">Marque pelo menos um exercício como feito para salvar.</p>
           )}
        </div>
      </div>

    </div>
  );
}
