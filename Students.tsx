import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit2, Trash2, ArrowRight, Link as LinkIcon, CheckCircle, Copy } from 'lucide-react';
import './Students.css';

export function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const navigate = useNavigate();

  const { students, addStudent, showNotification } = useData();
  const { user } = useAuth();
  
  const isLimitReached = user?.subscriptionTier === 'free' && students.length >= 5;

  const handleCopyInvite = (id: string) => {
    const link = `${window.location.origin}/convite/${id}`;
    navigator.clipboard.writeText(link);
    showNotification('Link de convite copiado!');
  };
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('Hipertrofia');
  const [notes, setNotes] = useState('');

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStudent({
        name,
        email,
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        goal,
        notes
      });
      setIsModalOpen(false);
      setShowInviteModal(true);
      // Reset form
      setName('');
      setEmail('');
      setAge('');
      setWeight('');
      setHeight('');
      setGoal('Hipertrofia');
      setNotes('');
    } catch (err) {
      // Notification is already shown in DataContext
      console.error(err);
    }
  };

  return (
    <div className="students-container">
      <div className="page-header">
        <div>
          <h1>Meus Alunos</h1>
          <p>
            Gerencie as informações e perfis dos seus alunos.
            {user?.subscriptionTier === 'free' && (
              <span className="badge ml-2" style={{ backgroundColor: isLimitReached ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isLimitReached ? '#ef4444' : '#10b981' }}>
                {students.length} de 5 alunos (Plano Grátis)
              </span>
            )}
          </p>
        </div>
        <button 
          className={`btn ${isLimitReached ? 'btn-secondary' : 'btn-primary'}`} 
          onClick={() => isLimitReached ? navigate('/configuracoes') : setIsModalOpen(true)}
        >
          {isLimitReached ? <LinkIcon size={18} /> : <Plus size={18} />}
          <span>{isLimitReached ? 'Fazer Upgrade' : 'Novo Aluno'}</span>
        </button>
      </div>

      <div className="card list-wrapper">
        <div className="list-toolbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar aluno por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome do Aluno</th>
                <th>Idade</th>
                <th>Peso Inicial</th>
                <th>Objetivo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id} onClick={() => navigate(`/alunos/${student.id}`)} className="clickable-row">
                  <td>
                    <div className="student-cell">
                      <div className="avatar sm">{student.name.charAt(0)}</div>
                      <span className="student-name">{student.name}</span>
                    </div>
                  </td>
                  <td>{student.age} anos</td>
                  <td>{student.weight} kg</td>
                  <td><span className="badge tag-goal">{student.goal}</span></td>
                  <td>
                    <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                      <button className="icon-btn-sm" title="Editar"><Edit2 size={16} /></button>
                      <button className="icon-btn-sm" title="Copiar Convite" onClick={(e) => { e.stopPropagation(); handleCopyInvite(student.id); }}>
                        <LinkIcon size={16} />
                      </button>
                      <button className="icon-btn-sm text-danger" title="Excluir"><Trash2 size={16} /></button>
                      <button className="icon-btn-sm" title="Acessar Perfil" onClick={() => navigate(`/alunos/${student.id}`)}>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-table-state">
                    Nenhum aluno encontrado.
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
              <h2>Adicionar Novo Aluno</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-row columns-2">
                <div className="input-group">
                  <label className="input-label">Nome Completo</label>
                  <input required type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Email do Aluno (para login)</label>
                  <input required type="email" className="input-field" placeholder="aluno@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="form-row columns-3">
                <div className="input-group">
                  <label className="input-label">Idade</label>
                  <input required type="number" className="input-field" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Peso (kg)</label>
                  <input required type="number" className="input-field" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Altura (m)</label>
                  <input required type="number" step="0.01" className="input-field" value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
              </div>

              <div className="input-group mt-4">
                <label className="input-label">Objetivo Principal</label>
                <select className="input-field" value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Emagrecimento">Emagrecimento</option>
                  <option value="Condicionamento">Condicionamento</option>
                  <option value="Força">Força</option>
                </select>
              </div>

              <div className="input-group mt-4">
                <label className="input-label">Observações Médicas / Notas</label>
                <textarea className="input-field" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
              </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Aluno</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-content card text-center" style={{ maxWidth: '400px' }}>
            <div className="flex justify-center mb-4">
              <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-primary)', padding: '1rem', borderRadius: '50%' }}>
                <CheckCircle size={40} />
              </div>
            </div>
            <h2>Aluno Criado!</h2>
            <p className="text-muted mt-2">O perfil do aluno foi criado com sucesso. Agora envie o convite para ele se cadastrar.</p>
            
            <div className="mt-6 p-4 bg-secondary" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', wordBreak: 'break-all' }}>
              <p className="text-xs text-secondary mb-2 uppercase font-bold tracking-wider">Link de Convite</p>
              <code className="text-sm">{window.location.origin}/convite/{students[students.length - 1]?.id}</code>
            </div>

            <div className="modal-footer mt-6 flex-col gap-2">
              <button className="btn btn-primary w-full" onClick={() => {
                handleCopyInvite(students[students.length - 1]?.id);
                setShowInviteModal(false);
              }}>
                <Copy size={16} /> Copiar e Fechar
              </button>
              <button className="btn btn-secondary w-full" onClick={() => setShowInviteModal(false)}>Apenas Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
