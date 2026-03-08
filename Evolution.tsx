import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Evolution() {
  const { students, evolution, addEvolutionEntry } = useData();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    weight: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return;
    
    setIsSubmitting(true);
    try {
      await addEvolutionEntry({
        studentId: formData.studentId,
        weight: Number(formData.weight),
        notes: formData.notes,
        date: formData.date
      });
      
      setIsModalOpen(false);
      setFormData({ ...formData, studentId: '', weight: '', notes: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="evolution-container flex-col gap-4">
      <div className="page-header">
        <div>
          <h1>Evolução Física</h1>
          <p>Acompanhamento de progresso geral de todos os alunos.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Registrar Avaliação</span>
        </button>
      </div>

      <div className="card list-wrapper mt-4">
        <div className="list-toolbar">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Últimas Avaliações Registradas</h3>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Aluno</th>
                <th>Peso Atual</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {evolution.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => {
                const student = students.find(s => s.id === entry.studentId);
                return (
                  <tr key={entry.id} className="clickable-row" onClick={() => navigate(`/alunos/${entry.studentId}`)}>
                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                    <td>
                      <div className="student-cell">
                        <div className="avatar sm" style={{ backgroundColor: 'var(--accent-warning)', color: '#fff' }}>
                          <TrendingUp size={16} />
                        </div>
                        <span className="student-name">{student?.name || 'Desconhecido'}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{entry.weight} kg</td>
                    <td className="text-muted">{entry.notes || '-'}</td>
                  </tr>
                );
              })}
              {evolution.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-table-state">
                    Nenhuma avaliação física registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>Registrar Nova Avaliação</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Aluno</label>
                  <select required className="input-field" value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})}>
                    <option value="">Selecione o aluno...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row columns-2">
                <div className="input-group">
                  <label className="input-label">Data da Avaliação</label>
                  <input required type="date" className="input-field" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Peso Registrado (kg)</label>
                  <input required type="number" step="0.1" className="input-field" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Observações (Perímetros, Dobras, etc)</label>
                  <textarea className="input-field" rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Avaliação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
