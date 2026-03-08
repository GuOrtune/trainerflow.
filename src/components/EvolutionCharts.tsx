import { useMemo, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar
} from 'recharts';
import { useData } from '../context/DataContext';

interface EvolutionChartsProps {
  studentId: string;
}

export function EvolutionCharts({ studentId }: EvolutionChartsProps) {
  const { evolution, workoutLogs, exercises } = useData();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

  // 1. Weight Data Processing
  const weightData = useMemo(() => {
    return evolution
      .filter(e => e.studentId === studentId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(e => ({
        date: new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        peso: e.weight
      }));
  }, [evolution, studentId]);

  // 2. Consistency Data (Workouts per week/month)
  // Let's group by month for a cleaner view in a simple way
  const consistencyData = useMemo(() => {
    const logs = workoutLogs.filter(l => l.studentId === studentId);
    const months: Record<string, number> = {};
    
    logs.forEach(l => {
      const date = new Date(l.date);
      const monthYear = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      months[monthYear] = (months[monthYear] || 0) + 1;
    });

    return Object.entries(months).map(([name, total]) => ({ name, treinos: total }));
  }, [workoutLogs, studentId]);

  // 3. Load Data Processing (for a specific exercise)
  const studentExercises = useMemo(() => {
    const logIds = new Set();
    workoutLogs
      .filter(l => l.studentId === studentId)
      .forEach(l => l.entries.forEach(e => logIds.add(e.exerciseId)));
    
    return exercises.filter(ex => logIds.has(ex.id));
  }, [workoutLogs, studentId, exercises]);

  const loadData = useMemo(() => {
    if (!selectedExerciseId) return [];
    
    const data: any[] = [];
    workoutLogs
      .filter(l => l.studentId === studentId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(l => {
        const entry = l.entries.find(e => e.exerciseId === selectedExerciseId);
        if (entry) {
          data.push({
            date: new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            carga: entry.weight
          });
        }
      });
    return data;
  }, [workoutLogs, studentId, selectedExerciseId]);

  if (weightData.length === 0 && consistencyData.length === 0) {
    return (
      <div className="card text-center p-8">
        <p className="text-muted">Ainda não há dados suficientes para gerar os gráficos.</p>
        <p className="text-sm mt-2">Comece a registrar o peso e concluir treinos para ver sua evolução aqui.</p>
      </div>
    );
  }

  return (
    <div className="evolution-charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
      
      {/* Weight Chart */}
      <div className="card">
        <h3 className="mb-4">Peso Corporal (kg)</h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--accent-primary)' }}
              />
              <Line 
                type="monotone" 
                dataKey="peso" 
                stroke="var(--accent-primary)" 
                strokeWidth={3} 
                dot={{ r: 4, fill: 'var(--accent-primary)' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Consistency Chart */}
      <div className="card">
        <h3 className="mb-4">Consistência (Treinos/Mês)</h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={consistencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(56, 189, 248, 0.1)' }}
                contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
              />
              <Bar dataKey="treinos" fill="var(--accent-emerald)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Load Evolution Chart */}
      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 style={{ margin: 0 }}>Evolução de Carga</h3>
          <select 
            className="input-field" 
            style={{ width: 'auto', minWidth: '200px' }}
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
          >
            <option value="">Selecione um exercício...</option>
            {studentExercises.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>
        
        <div style={{ width: '100%', height: 300 }}>
          {selectedExerciseId ? (
            loadData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={loadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} unit="kg" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  />
                  <Line 
                    type="stepAfter" 
                    dataKey="carga" 
                    stroke="var(--accent-warning)" 
                    strokeWidth={3} 
                    dot={{ r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted">
                São necessários pelo menos 2 registros deste exercício para gerar o gráfico.
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-muted">
              Selecione um exercício acima para ver a evolução das cargas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
