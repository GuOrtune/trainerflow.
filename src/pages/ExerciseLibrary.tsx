import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Search, Plus, Filter, Trash2 } from 'lucide-react';
import './ExerciseLibrary.css';

export function ExerciseLibrary() {
  const { exercises, addExercise, deleteExercise } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  
  // New Exercise Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    muscleGroup: 'Peito',
    description: '',
    executionInstructions: ''
  });

  const muscleGroups = ['Todos', ...Array.from(new Set(exercises.map(e => e.muscleGroup)))];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'Todos' || exercise.muscleGroup === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addExercise(newExercise);
      setIsModalOpen(false);
      setNewExercise({
        name: '',
        muscleGroup: 'Peito',
        description: '',
        executionInstructions: ''
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="library-container">
      <div className="page-header">
        <div>
          <h1>Biblioteca de Exercícios</h1>
          <p>Catálogo profissional com instruções detalhadas de execução.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Novo Exercício</span>
        </button>
      </div>

      <div className="library-toolbar card">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar exercício..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={18} className="text-muted" />
          <select 
            value={selectedGroup} 
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="input-field select-filter"
          >
            {muscleGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="exercises-grid">
        {filteredExercises.map(exercise => (
          <div key={exercise.id} className={`exercise-card card p-0 overflow-hidden ${expandedExerciseId === exercise.id ? 'expanded' : ''}`}>
            <div className="exercise-info p-4">
              <div className="exercise-header-row">
                <h3 className="exercise-title">{exercise.name}</h3>
                <span className="badge tag-muscle">{exercise.muscleGroup}</span>
              </div>
              <p className="exercise-desc">{exercise.description}</p>
              
              {expandedExerciseId === exercise.id && (
                <div className="execution-instructions mt-4 p-3 bg-light rounded shadow-inner">
                  <h4 className="text-xs font-bold uppercase text-muted mb-2">Instruções de Execução:</h4>
                  <p className="text-sm leading-relaxed">{exercise.executionInstructions}</p>
                </div>
              )}

              <div className="exercise-footer mt-4" style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={`btn btn-sm ${expandedExerciseId === exercise.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => setExpandedExerciseId(expandedExerciseId === exercise.id ? null : exercise.id)}
                >
                  {expandedExerciseId === exercise.id ? 'Fechar Detalhes' : 'Ver Instruções'}
                </button>
                <button 
                  className="btn btn-sm btn-secondary text-danger"
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja excluir o exercício "${exercise.name}"?`)) {
                      deleteExercise(exercise.id);
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredExercises.length === 0 && (
          <div className="empty-state text-center card p-8" style={{ gridColumn: '1 / -1' }}>
            <p>Nenhum exercício encontrado com esses filtros.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>Novo Exercício</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleAddExercise} className="modal-form">
              <div className="form-row columns-2">
                <div className="input-group">
                  <label className="input-label">Nome do Exercício</label>
                  <input 
                    required 
                    type="text" 
                    className="input-field" 
                    placeholder="Ex: Supino Reto"
                    value={newExercise.name} 
                    onChange={(e) => setNewExercise({...newExercise, name: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Grupo Muscular</label>
                  <select 
                    className="input-field" 
                    value={newExercise.muscleGroup}
                    onChange={(e) => setNewExercise({...newExercise, muscleGroup: e.target.value})}
                  >
                    <option value="Peito">Peito</option>
                    <option value="Costas">Costas</option>
                    <option value="Pernas">Pernas</option>
                    <option value="Ombros">Ombros</option>
                    <option value="Braços">Braços</option>
                    <option value="Abdômen">Abdômen</option>
                    <option value="Cardio">Cardio</option>
                  </select>
                </div>
              </div>

              <div className="input-group mt-4">
                <label className="input-label">Descrição Curta</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Breve resumo sobre o exercício..."
                  value={newExercise.description} 
                  onChange={(e) => setNewExercise({...newExercise, description: e.target.value})} 
                />
              </div>

              <div className="input-group mt-4">
                <label className="input-label">Instruções de Execução</label>
                <textarea 
                  required
                  className="input-field" 
                  rows={4} 
                  placeholder="Passo a passo para a execução correta..."
                  value={newExercise.executionInstructions} 
                  onChange={(e) => setNewExercise({...newExercise, executionInstructions: e.target.value})}
                ></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Exercício</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
