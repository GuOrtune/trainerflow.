import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Dumbbell, PlaySquare, TrendingUp, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export function Sidebar() {
  const { user, logout } = useAuth();

  const adminNavItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/alunos', icon: Users, label: 'Alunos' },
    { path: '/treinos', icon: Dumbbell, label: 'Treinos' },
    { path: '/biblioteca', icon: PlaySquare, label: 'Biblioteca' },
    { path: '/evolucao', icon: TrendingUp, label: 'Evolução Global' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  const studentNavItems = [
    { path: '/', icon: LayoutDashboard, label: 'Meu Painel' },
    { path: '/aluno/evolucao', icon: TrendingUp, label: 'Minha Evolução' },
  ];

  const navItems = user?.role === 'student' ? studentNavItems : adminNavItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Dumbbell className="logo-icon" />
        <h2>TrainerFlow</h2>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon className="nav-icon" size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={logout}>
          <LogOut className="nav-icon" size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
