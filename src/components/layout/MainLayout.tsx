import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './MainLayout.css';
import { useData } from '../../context/DataContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function MainLayout() {
  const { notification } = useData();

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content-wrapper">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {/* Global Toast Notification */}
      {notification && (
        <div className={`toast-notification ${notification.type}`} style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '12px 20px',
          borderRadius: '12px',
          backgroundColor: notification.type === 'success' ? '#22c55e' : '#ef4444',
          color: 'white',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          animation: 'slideUp 0.3s ease-out'
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontWeight: 500 }}>{notification.message}</span>
        </div>
      )}
    </div>
  );
}
