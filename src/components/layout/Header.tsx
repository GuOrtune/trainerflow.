import { useState } from 'react';
import { Bell, Search, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import './Header.css';

export function Header() {
  const { user } = useAuth();
  const { appNotifications, markNotificationAsRead } = useData();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = appNotifications.filter(n => !n.read).length;

  return (
    <header className="header">
      <div className="header-search">
        <Search className="search-icon" size={18} />
        <input type="text" placeholder="Buscar alunos, treinos..." />
      </div>
      
      <div className="header-actions">
        <div className="notification-wrapper">
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown card">
              <div className="notifications-header">
                <h3>Notificações</h3>
                <button className="close-btn" onClick={() => setShowNotifications(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="notifications-list">
                {appNotifications.length > 0 ? (
                  appNotifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="notification-content">
                        <p className="notification-title">{notification.title}</p>
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-date">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {!notification.read && <div className="unread-dot"></div>}
                    </div>
                  ))
                ) : (
                  <p className="empty-notifications">Nenhuma notificação por enquanto.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-profile">
          <div className="avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'Personal Trainer'}</span>
            <span className="user-role">{user?.role === 'admin' ? 'Treinador' : 'Aluno'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
