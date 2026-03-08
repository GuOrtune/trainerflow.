import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ArrowLeft, Plus, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Student, EvolutionEntry } from '../../context/DataContext';

export function StudentEvolutionView() {
  const { user } = useAuth();
  const { students, evolution, addEvolutionEntry } = useData();
  const navigate = useNavigate();
  
  const studentProfile = students.find((s: Student) => s.email === user?.email);
  
  const studentEvolutions = evolution.filter((e: EvolutionEntry) => e.studentId === studentProfile?.id)
    .sort((a: EvolutionEntry, b: EvolutionEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    weight: studentProfile?.weight.toString() || '0',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  if (!studentProfile) {
    return (
      <div className="card p-8 text-center mt-10">
        <h2>Perfil não encontrado</h2>
        <p className="text-muted">Seu email ({user?.email}) não está vinculado a uma conta de aluno.</p>
        <button className="btn btn-primary mt-6" onClick={() => navigate('/')}>Voltar</button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEvolutionEntry({
      studentId: studentProfile.id,
      weight: Number(formData.weight),
      notes: formData.notes,
      date: formData.date
    });
    setIsModalOpen(false);
  };

  return (
    <div className="flex-col gap-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex items-center gap-4 mb-2">
        <button className="icon-btn-sm" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Minha Evolução</h1>
            <p className="text-muted m-0">Acompanhe seu peso e fotos de progresso.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Novo Registro
          </button>
        </div>
      </div>

      {/* Seção de Galeria de Progresso (Fotos) */}
      <div className="card mt-4 p-4">
        <h3 className="mb-4">Galeria de Progresso (Fotos)</h3>
        <p className="text-muted mb-4 text-sm">Adicione fotos de frente, lado e costas para comparar seu progresso com o tempo.</p>
        
        <div className="flex gap-4" style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
          
          <label className="card p-4 flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary transition-colors" style={{ minWidth: '150px', border: '1px dashed var(--border-color)', backgroundColor: 'transparent', margin: 0 }}>
            <Camera size={32} className="text-muted mb-2" />
            <span className="text-sm font-medium">Adicionar Foto</span>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64String = reader.result as string;
                    addEvolutionEntry({
                      studentId: studentProfile.id,
                      weight: studentProfile.weight,
                      date: new Date().toISOString(),
                      notes: 'Upload de foto de progresso',
                      photoUrl: base64String
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
          
          {studentEvolutions.filter((e: EvolutionEntry) => e.photoUrl).map((entry: EvolutionEntry) => (
             <div key={entry.id} className="card p-0 overflow-hidden relative" style={{ minWidth: '150px', width: '150px', height: '200px' }}>
             <div className="absolute top-2 left-2 badge text-xs bg-dark text-white">{new Date(entry.date).toLocaleDateString()}</div>
             <img src={entry.photoUrl} alt="Evolução" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           </div>
          ))}

        </div>
      </div>

      <div className="card mt-4">
        <h3 className="mb-4">Histórico de Peso e Medidas</h3>
        <div className="flex-col gap-3">
          {studentEvolutions.map((ev: EvolutionEntry) => (
            <div key={ev.id} className="p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-warning)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{new Date(ev.date).toLocaleDateString()}</span>
                <span className="badge" style={{ fontSize: '1rem', backgroundColor: 'var(--bg-primary)' }}>{ev.weight} kg</span>
              </div>
              {ev.notes && (
                <p className="text-muted text-sm mt-2 m-0 border-t pt-2" style={{ borderColor: 'var(--border-color)' }}>
                  {ev.notes}
                </p>
              )}
            </div>
          ))}

          {studentEvolutions.length === 0 && (
            <div className="p-8 text-center border-dashed rounded text-muted">
              Nenhuma avaliação cadastrada. Clique em "Novo Registro" para adicionar seu peso atual.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Registrar Progresso</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Data</label>
                  <input required type="date" className="input-field" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Peso Atual (kg)</label>
                  <input required type="number" step="0.1" className="input-field" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Anotações (Opcional)</label>
                  <textarea className="input-field" rows={3} placeholder="Como você está se sentindo? Atualizou alguma medida?" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Evolução</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
