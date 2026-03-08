import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Search, Plus, Filter } from 'lucide-react';
import './ExerciseLibrary.css';

export function ExerciseLibrary() {
  const { exercises } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const muscleGroups = ['Todos', ...Array.from(new Set(exercises.map(e => e.muscleGroup)))];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'Todos' || exercise.muscleGroup === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="library-container">
      <div className="page-header">
        <div>
          <h1>Biblioteca de Exercícios</h1>
          <p>Catálogo profissional com instruções detalhadas de execução.</p>
        </div>
        <button className="btn btn-primary">
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

              <div className="exercise-footer mt-4">
                <button 
                  className={`btn btn-sm w-full ${expandedExerciseId === exercise.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setExpandedExerciseId(expandedExerciseId === exercise.id ? null : exercise.id)}
                >
                  {expandedExerciseId === exercise.id ? 'Fechar Detalhes' : 'Ver Instruções'}
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
    </div>
  );
}
