import React from 'react';
import { Dumbbell } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { StudentProfile } from './pages/StudentProfile';
import { Workouts } from './pages/Workouts';
import { ExerciseLibrary } from './pages/ExerciseLibrary';
import { Evolution } from './pages/Evolution';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentWorkoutView } from './pages/student/StudentWorkoutView';
import { StudentEvolutionView } from './pages/student/StudentEvolutionView';
import { InviteRegistration } from './pages/InviteRegistration';
import { VerifyEmail } from './pages/VerifyEmail';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'admin' | 'student' }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="logo-icon animate-pulse" style={{ color: 'var(--accent-primary)' }}>
          <Dumbbell size={48} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (!user?.emailConfirmed) {
    return <Navigate to="/verify-email" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

function RouterConfig() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={
          isAuthenticated ? (user?.emailConfirmed ? <Navigate to="/" replace /> : <VerifyEmail />) : <Navigate to="/login" replace />
        } />
        <Route path="/convite/:id" element={<InviteRegistration />} />
        
        {/* Protected Routes (nested inside Layout) */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={
            user?.role === 'student' ? <StudentDashboard /> : <Dashboard />
          } />
          
          {/* Admin Routes */}
          <Route path="alunos" element={<ProtectedRoute requiredRole="admin"><Students /></ProtectedRoute>} />
          <Route path="alunos/:id" element={<ProtectedRoute requiredRole="admin"><StudentProfile /></ProtectedRoute>} />
          <Route path="treinos" element={<ProtectedRoute requiredRole="admin"><Workouts /></ProtectedRoute>} />
          <Route path="biblioteca" element={<ProtectedRoute requiredRole="admin"><ExerciseLibrary /></ProtectedRoute>} />
          <Route path="evolucao" element={<ProtectedRoute requiredRole="admin"><Evolution /></ProtectedRoute>} />
          <Route path="configuracoes" element={<ProtectedRoute requiredRole="admin"><Settings /></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="aluno/treino/:id" element={<ProtectedRoute requiredRole="student"><StudentWorkoutView /></ProtectedRoute>} />
          <Route path="aluno/evolucao" element={<ProtectedRoute requiredRole="student"><StudentEvolutionView /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <RouterConfig />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;

