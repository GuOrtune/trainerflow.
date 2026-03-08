import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

// Models
export interface Student {
  id: string;
  trainerId: string;
  email: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  notes: string;
}

export interface Workout {
  id: string;
  trainerId: string;
  studentId?: string;
  name: string; 
  exercises: {
    exerciseId: string;
    sets: number;
    reps: string;
    notes: string;
  }[];
}

export interface Exercise {
  id: string;
  trainerId?: string;
  name: string;
  muscleGroup: string;
  description: string;
  executionInstructions: string;
}

export interface EvolutionEntry {
  id: string;
  trainerId: string;
  studentId: string;
  date: string;
  weight: number;
  notes: string;
  photoUrl?: string;
}

export interface VideoReview {
  id: string;
  trainerId: string;
  studentId: string;
  workoutName: string;
  exerciseName: string;
  videoUrl: string;
  date: string;
  status: 'pending' | 'reviewed';
  feedback?: string;
}

export interface WorkoutLog {
  id: string;
  trainerId: string;
  studentId: string;
  workoutId: string;
  workoutName: string;
  date: string;
  entries: {
    exerciseId: string;
    weight: number;
    repsDone: number;
  }[];
}

const DEFAULT_EXERCISES: Exercise[] = [
  // PEITO
  { id: '1', name: 'Supino Reto com Barra', muscleGroup: 'Peito', description: 'Exercício básico para desenvolvimento de força e massa no peitoral.', executionInstructions: 'Deite-se no banco, segure a barra com uma pegada um pouco mais larga que os ombros. Desça a barra até o meio do peito e empurre de volta, mantendo os cotovelos a 45 graus do corpo.' },
  { id: '2', name: 'Supino Inclinado com Halteres', muscleGroup: 'Peito', description: 'Foco na parte superior do peitoral.', executionInstructions: 'Ajuste o banco para 30-45 graus. Empurre os halteres para cima, aproximando-os no topo sem bater. Desça até sentir o alongamento do peito.' },
  { id: '3', name: 'Crucifixo Reto', muscleGroup: 'Peito', description: 'Isolador para expansão do peitoral.', executionInstructions: 'Deitado no banco, braços levemente flexionados ("abraço"). Abra os braços até o nível do ombro e feche concentrando a força no peito.' },
  { id: '4', name: 'Crossover Polia Alta', muscleGroup: 'Peito', description: 'Foco na parte inferior e definição.', executionInstructions: 'Incline o corpo levemente à frente. Puxe os cabos de cima para baixo, cruzando as mãos à frente da cintura.' },
  { id: '5', name: 'Pack Deck (Voador)', muscleGroup: 'Peito', description: 'Isolamento frontal do peitoral.', executionInstructions: 'Mantenha as costas apoiadas. Feche os braços à frente, sentindo a contração máxima. Retorne devagar.' },
  { id: '6', name: 'Supino Declinado com Barra', muscleGroup: 'Peito', description: 'Foco na parte inferior do peitoral.', executionInstructions: 'Deite-se no banco declinado, segure a barra com pegada média. Desça a barra até a parte inferior do peito e empurre para cima.' },
  { id: '7', name: 'Flexão de Braço', muscleGroup: 'Peito', description: 'Exercício de peso corporal para peitoral, ombros e tríceps.', executionInstructions: 'Mantenha o corpo reto, desça o peito em direção ao chão e empurre para cima. Variações: joelhos no chão para iniciantes.' },
  { id: '8', name: 'Supino com Halteres', muscleGroup: 'Peito', description: 'Permite maior amplitude de movimento e ativação muscular.', executionInstructions: 'Deite-se no banco, segure um halter em cada mão. Empurre os halteres para cima, aproximando-os no topo. Desça controladamente.' },

  // COSTAS
  { id: '9', name: 'Puxada Aberta (Pulley Frente)', muscleGroup: 'Costas', description: 'Desenvolvimento de largura das costas.', executionInstructions: 'Puxe a barra em direção à parte superior do peito, jogando os cotovelos para baixo e para trás. Evite balançar o tronco.' },
  { id: '10', name: 'Remada Curvada com Barra', muscleGroup: 'Costas', description: 'Espessura e força das costas.', executionInstructions: 'Incline o tronco a 45 graus, costas retas. Puxe a barra em direção ao umbigo, esmagando as escápulas.' },
  { id: '11', name: 'Remada Baixa Sentado', muscleGroup: 'Costas', description: 'Foco no miolo das costas.', executionInstructions: 'Puxe o triângulo em direção ao abdômen. Mantenha os ombros baixos e peito estufado.' },
  { id: '12', name: 'Pulldown com Corda', muscleGroup: 'Costas', description: 'Isolamento da grande dorsal.', executionInstructions: 'Braços quase esticados, puxe a corda em direção às coxas em um movimento de arco.' },
  { id: '13', name: 'Levantamento Terra', muscleGroup: 'Costas/Pernas', description: 'Exercício de força funcional completa.', executionInstructions: 'Mantenha a barra colada nas canelas. Suba usando a força das pernas e glúteos, mantendo a coluna neutra.' },
  { id: '14', name: 'Remada Unilateral com Halteres', muscleGroup: 'Costas', description: 'Trabalho unilateral para correção de assimetrias e força.', executionInstructions: 'Apoie um joelho e uma mão no banco. Puxe o halter em direção ao quadril, mantendo o cotovelo próximo ao corpo.' },
  { id: '15', name: 'Barra Fixa (Pronada)', muscleGroup: 'Costas', description: 'Exercício de peso corporal para largura das costas.', executionInstructions: 'Segure a barra com pegada pronada (palmas para frente), um pouco mais larga que os ombros. Puxe o corpo para cima até o queixo ultrapassar a barra.' },
  { id: '16', name: 'Remada Cavalinho', muscleGroup: 'Costas', description: 'Foco na espessura e densidade das costas.', executionInstructions: 'Posicione-se com os pés afastados, incline o tronco à frente. Puxe a barra em direção ao abdômen, espremendo as escápulas.' },
  { id: '17', name: 'Puxada Supinada (Pulley Fechado)', muscleGroup: 'Costas', description: 'Foco na parte inferior da grande dorsal e bíceps.', executionInstructions: 'Segure a barra com pegada supinada (palmas para você), largura dos ombros. Puxe a barra em direção ao peito, contraindo as costas.' },

  // PERNAS
  { id: '18', name: 'Agachamento Livre', muscleGroup: 'Pernas', description: 'O rei dos exercícios de perna.', executionInstructions: 'Pés na largura dos ombros. Desça como se fosse sentar em uma cadeira, mantendo os joelhos alinhados com a ponta dos pés.' },
  { id: '19', name: 'Leg Press 45', muscleGroup: 'Pernas', description: 'Foco em quadríceps e glúteos.', executionInstructions: 'Não estique totalmente os joelhos no topo (mantenha micro-flexionado). Desça até o máximo sem tirar o quadril do banco.' },
  { id: '20', name: 'Cadeira Extensora', muscleGroup: 'Pernas', description: 'Isolamento de quadríceps.', executionInstructions: 'Estenda as pernas totalmente e contraia o músculo por 1 segundo no topo. Desça controlando o peso.' },
  { id: '21', name: 'Mesa Flexora', muscleGroup: 'Pernas', description: 'Isolamento de posterior de coxa.', executionInstructions: 'Deitado, flexione os joelhos levando os calcanhares em direção ao glúteo. Não tire o quadril do apoio.' },
  { id: '22', name: 'Cadeira Abdutora', muscleGroup: 'Pernas', description: 'Foco em glúteo médio.', executionInstructions: 'Afaste as pernas o máximo possível, mantendo a postura reta. Retorne devagar.' },
  { id: '23', name: 'Stiff com Halteres', muscleGroup: 'Pernas', description: 'Alongamento e força de posterior e glúteo.', executionInstructions: 'Mantenha as pernas quase esticadas. Desça os halteres rente à perna inclinando o tronco, sentindo o posterior alongar.' },
  { id: '24', name: 'Afundo com Halteres', muscleGroup: 'Pernas', description: 'Exercício unilateral para quadríceps e glúteo.', executionInstructions: 'Dê um passo à frente e desça o joelho de trás em direção ao chão. Mantenha o tronco ereto.' },
  { id: '25', name: 'Panturrilha em Pé', muscleGroup: 'Pernas', description: 'Fortalecimento dos músculos da panturrilha.', executionInstructions: 'Suba na ponta dos pés o máximo possível, contraindo a panturrilha. Desça controladamente alongando o músculo.' },
  { id: '26', name: 'Agachamento Búlgaro', muscleGroup: 'Pernas', description: 'Exercício unilateral intenso para glúteos e quadríceps.', executionInstructions: 'Apoie um pé em um banco atrás de você. Desça o corpo, mantendo o tronco ereto, até o joelho de trás quase tocar o chão.' },
  { id: '27', name: 'Cadeira Adutora', muscleGroup: 'Pernas', description: 'Fortalecimento dos músculos adutores da coxa.', executionInstructions: 'Sente-se na máquina e junte as pernas, contraindo os músculos internos da coxa. Retorne devagar.' },
  { id: '28', name: 'Glúteo Máquina', muscleGroup: 'Pernas', description: 'Isolamento do glúteo máximo.', executionInstructions: 'Apoie o joelho e o antebraço na máquina. Empurre a plataforma para trás com o calcanhar, contraindo o glúteo.' },

  // OMBROS
  { id: '29', name: 'Desenvolvimento com Halteres', muscleGroup: 'Ombros', description: 'Desenvolvimento da massa total dos ombros.', executionInstructions: 'Sentado, empurre os halteres para cima das orelhas. Não deixe os halteres se baterem no topo.' },
  { id: '30', name: 'Elevação Lateral', muscleGroup: 'Ombros', description: 'Foco na porção lateral (largura).', executionInstructions: 'Suba os halteres até a linha do ombro, com os cotovelos levemente flexionados. Imagine que está despejando água de uma jarra.' },
  { id: '31', name: 'Elevação Frontal com Barra', muscleGroup: 'Ombros', description: 'Foco na porção anterior.', executionInstructions: 'Suba a barra até o nível dos olhos, sem usar o balanço do corpo.' },
  { id: '32', name: 'Encolhimento com Barra', muscleGroup: 'Ombros', description: 'Foco no trapézio.', executionInstructions: 'Suba os ombros em direção às orelhas, segure por 1 segundo e desça totalmente.' },
  { id: '33', name: 'Crucifixo Inverso no Seat', muscleGroup: 'Ombros', description: 'Foco na porção posterior.', executionInstructions: 'Sentado, incline o tronco à frente. Abra os braços para trás, esmagando a parte de trás dos ombros.' },
  { id: '34', name: 'Desenvolvimento Militar (em pé)', muscleGroup: 'Ombros', description: 'Exercício composto para força e massa dos ombros.', executionInstructions: 'Em pé, segure a barra na altura do peito. Empurre a barra para cima, estendendo os braços. Mantenha o core contraído.' },
  { id: '35', name: 'Remada Alta com Barra', muscleGroup: 'Ombros', description: 'Trabalha deltoides e trapézio.', executionInstructions: 'Segure a barra com pegada fechada. Puxe a barra para cima, levando os cotovelos para o alto, até a altura do queixo.' },

  // BRAÇOS
  { id: '36', name: 'Rosca Direta com Barra W', muscleGroup: 'Braços', description: 'Básico para bíceps.', executionInstructions: 'Mantenha os cotovelos colados ao corpo. Suba a barra até o peito e desça esticando quase todo o braço.' },
  { id: '37', name: 'Rosca Alternada com Halteres', muscleGroup: 'Braços', description: 'Trabalho unilateral de bíceps.', executionInstructions: 'Gire o punho (supinação) enquanto sobe o peso. Alterne os braços suavemente.' },
  { id: '38', name: 'Rosca Concentrada', muscleGroup: 'Braços', description: 'Pico de contração do bíceps.', executionInstructions: 'Sentado, apoie o cotovelo na parte interna da coxa. Suba o halter focando estritamente na contração.' },
  { id: '39', name: 'Tríceps Corda no Pulley', muscleGroup: 'Braços', description: 'Isolamento de tríceps.', executionInstructions: 'No final do movimento de descida, abra a corda para as laterais para maior contração.' },
  { id: '40', name: 'Tríceps Testa com Barra', muscleGroup: 'Braços', description: 'Ganho de massa no tríceps.', executionInstructions: 'Deitado, desça a barra em direção à testa, mantendo os cotovelos apontados para o teto.' },
  { id: '41', name: 'Tríceps Banco (Mergulho)', muscleGroup: 'Braços', description: 'Exercício de peso corporal para tríceps.', executionInstructions: 'Apoie as mãos no banco atrás do corpo. Desça o quadril próximo ao banco e suba usando os braços.' },
  { id: '42', name: 'Rosca Scott', muscleGroup: 'Braços', description: 'Isolamento intenso do bíceps.', executionInstructions: 'Apoie os braços no banco Scott. Suba a barra até a contração máxima e desça controladamente, alongando o bíceps.' },
  { id: '43', name: 'Tríceps Coice com Halteres', muscleGroup: 'Braços', description: 'Isolamento da cabeça longa do tríceps.', executionInstructions: 'Incline o tronco à frente, mantenha o cotovelo fixo. Estenda o braço para trás, contraindo o tríceps.' },
  { id: '44', name: 'Rosca Punho (Antebraço)', muscleGroup: 'Braços', description: 'Fortalecimento dos antebraços.', executionInstructions: 'Sente-se, apoie os antebraços nas coxas com as palmas para cima. Deixe a barra rolar até a ponta dos dedos e puxe para cima usando apenas os punhos.' },

  // ABDÔMEN
  { id: '45', name: 'Abdominal Supra (Solo)', muscleGroup: 'Abdômen', description: 'Foco na parte superior do abdômen.', executionInstructions: 'Tire apenas as escápulas do chão, concentrando a força no abdômen. Não puxe o pescoço.' },
  { id: '46', name: 'Elevação de Pernas', muscleGroup: 'Abdômen', description: 'Foco na parte inferior.', executionInstructions: 'Deitado, suba as pernas esticadas até 90 graus e desça devagar sem encostar no chão.' },
  { id: '47', name: 'Prancha Isométrica', muscleGroup: 'Abdômen', description: 'Fortalecimento do core.', executionInstructions: 'Mantenha o corpo reto como uma tábua, apoiado nos antebraços e pontas dos pés.' },
  { id: '48', name: 'Abdominal Oblíquo (Bicicleta)', muscleGroup: 'Abdômen', description: 'Trabalha os músculos oblíquos.', executionInstructions: 'Deitado, simule um movimento de bicicleta com as pernas, levando o cotovelo oposto ao joelho que se aproxima do peito.' },
  { id: '49', name: 'Abdominal Infra na Barra', muscleGroup: 'Abdômen', description: 'Intenso para a parte inferior do abdômen.', executionInstructions: 'Pendurado na barra, eleve os joelhos em direção ao peito, contraindo o abdômen. Desça controladamente.' },
  { id: '50', name: 'Rotação de Tronco com Bastão', muscleGroup: 'Abdômen', description: 'Fortalecimento dos oblíquos e mobilidade.', executionInstructions: 'Sentado ou em pé, segure um bastão nos ombros. Gire o tronco de um lado para o outro de forma controlada.' },
];

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface DataContextType {
  students: Student[];
  workouts: Workout[];
  exercises: Exercise[];
  evolution: EvolutionEntry[];
  videoReviews: VideoReview[];
  workoutLogs: WorkoutLog[];
  notification: { message: string, type: 'success' | 'error' } | null;
  appNotifications: AppNotification[];
  showNotification: (message: string, type?: 'success' | 'error') => void;
  markNotificationAsRead: (id: string) => void;
  isLoading: boolean;
  
  // Methods to manipulate data
  addStudent: (s: Omit<Student, 'id' | 'trainerId'>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  addWorkout: (w: Omit<Workout, 'id' | 'trainerId'>) => Promise<void>;
  assignWorkout: (studentId: string, templateWorkoutId: string) => Promise<void>;
  removeWorkout: (workoutId: string) => Promise<void>;
  addEvolutionEntry: (e: Omit<EvolutionEntry, 'id' | 'trainerId'>) => Promise<void>;
  addVideoReview: (r: Omit<VideoReview, 'id' | 'status' | 'date' | 'trainerId'>) => Promise<void>;
  updateVideoReview: (id: string, feedback: string) => Promise<void>;
  logWorkout: (log: Omit<WorkoutLog, 'id' | 'trainerId'>) => Promise<void>;
  addExercise: (ex: Omit<Exercise, 'id' | 'trainerId'>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [evolution, setEvolution] = useState<EvolutionEntry[]>([]);
  const [videoReviews, setVideoReviews] = useState<VideoReview[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([
    { id: '1', user_id: user?.id || '', title: 'Bem-vindo!', message: 'Obrigado por escolher o TrainerFlow. Comece cadastrando seus alunos.', created_at: new Date().toISOString(), read: false, type: 'system' }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const markNotificationAsRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) console.error(error);
    setAppNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const addAppNotification = async (userId: string, title: string, message: string, type: string) => {
    const { error } = await supabase.from('notifications').insert([{ user_id: userId, title, message, type }]);
    if (error) console.error(error);
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [
        { data: studentsData },
        { data: workoutsData },
        { data: evolutionData },
        { data: reviewsData },
        { data: logsData },
        { data: notificationsData },
        { data: exData }
      ] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('workouts').select('*'),
        supabase.from('evolution').select('*'),
        supabase.from('video_reviews').select('*'),
        supabase.from('workout_logs').select('*'),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('exercises').select('*')
      ]);

      setStudents((studentsData || []).map(s => ({
        id: s.id,
        trainerId: s.trainer_id,
        name: s.name,
        email: s.email,
        age: s.age,
        weight: s.weight,
        height: s.height,
        goal: s.goal,
        notes: s.notes
      })));

      setWorkouts((workoutsData || []).map(w => ({
        id: w.id,
        trainerId: w.trainer_id,
        studentId: w.student_id,
        name: w.name,
        exercises: w.exercises
      })));

      setEvolution((evolutionData || []).map(e => ({
        id: e.id,
        trainerId: e.trainer_id,
        studentId: e.student_id,
        date: e.date,
        weight: e.weight,
        notes: e.notes,
        photoUrl: e.photo_url
      })));

      setVideoReviews((reviewsData || []).map(r => ({
        id: r.id,
        trainerId: r.trainer_id,
        studentId: r.student_id,
        workoutName: r.workout_name,
        exerciseName: r.exercise_name,
        videoUrl: r.video_url,
        feedback: r.feedback,
        status: r.status,
        date: r.date
      })));

      setWorkoutLogs((logsData || []).map(l => ({
        id: l.id,
        trainerId: l.trainer_id,
        studentId: l.student_id,
        workoutId: l.workout_id,
        workoutName: l.workout_name,
        date: l.date,
        entries: l.entries
      })));

      setAppNotifications(notificationsData || []);
      
      const realExercises = (exData || []).map((ex: any) => ({
        id: ex.id,
        trainerId: ex.trainer_id,
        name: ex.name,
        muscleGroup: ex.muscle_group,
        description: ex.description,
        executionInstructions: ex.execution_instructions
      }));
      
      if (realExercises.length > 0) {
        setExercises(realExercises);
      } else {
        seedExercises();
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const seedExercises = async () => {
    const { error } = await supabase.from('exercises').insert(
      DEFAULT_EXERCISES.map(ex => ({
        name: ex.name,
        muscle_group: ex.muscleGroup,
        description: ex.description,
        execution_instructions: ex.executionInstructions
      }))
    );
    if (!error) {
      fetchAllData();
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
      const channel = supabase
        .channel('realtime_notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const newNotif = payload.new as AppNotification;
            setAppNotifications(prev => [newNotif, ...prev]);
            showNotification(`Nova Notificação: ${newNotif.title}`);
          }
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const addStudent = async (s: Omit<Student, 'id' | 'trainerId'>) => {
    if (!user) return;
    if (user.subscriptionTier === 'free' && students.length >= 5) {
      const error = new Error('Limite de 5 alunos atingido no plano gratuito. Faça upgrade para o plano Pro para adicionar mais alunos.');
      showNotification(error.message, 'error');
      throw error;
    }
    const { data, error } = await supabase.from('students').insert([
      { name: s.name, email: s.email, age: s.age, weight: s.weight, height: s.height, goal: s.goal, notes: s.notes, trainer_id: user.id }
    ]).select();
    if (error) throw error;
    if (data) {
      const resp = data[0];
      setStudents(prev => [...prev, { id: resp.id, trainerId: resp.trainer_id, name: resp.name, email: resp.email, age: resp.age, weight: resp.weight, height: resp.height, goal: resp.goal, notes: resp.notes }]);
    }
    showNotification(`Aluno ${s.name} cadastrado com sucesso!`);
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.age) dbUpdates.age = updates.age;
    if (updates.weight) dbUpdates.weight = updates.weight;
    if (updates.height) dbUpdates.height = updates.height;
    if (updates.goal) dbUpdates.goal = updates.goal;
    if (updates.notes) dbUpdates.notes = updates.notes;

    const { error } = await supabase.from('students').update(dbUpdates).eq('id', id);
    if (error) throw error;
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    showNotification('Perfil do aluno atualizado.');
  };

  const deleteStudent = async (id: string) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
    setStudents(prev => prev.filter(s => s.id !== id));
    showNotification('Aluno removido com sucesso.');
  };
  
  const addWorkout = async (w: Omit<Workout, 'id' | 'trainerId'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('workouts').insert([
      { name: w.name, exercises: w.exercises, student_id: w.studentId, trainer_id: user.id }
    ]).select();
    if (error) throw error;
    if (data) {
      const nw = data[0];
      setWorkouts(prev => [...prev, { id: nw.id, trainerId: nw.trainer_id, studentId: nw.student_id, name: nw.name, exercises: nw.exercises }]);
      if (w.studentId) {
        await addAppNotification(w.studentId, 'Novo Treino Disponível!', `O treinador ${user.name} atualizou sua rotina: ${w.name}`, 'workout_update');
      }
    }
    showNotification('Treino criado com sucesso!');
  };

  const assignWorkout = async (studentId: string, templateWorkoutId: string) => {
    if (!user) return;
    const template = workouts.find(w => w.id === templateWorkoutId);
    if (!template) return;
    const { data, error } = await supabase.from('workouts').insert([
      { trainer_id: user.id, student_id: studentId, name: template.name, exercises: template.exercises }
    ]).select();
    if (error) throw error;
    if (data) {
      const nw = data[0];
      setWorkouts(prev => [...prev, { id: nw.id, trainerId: nw.trainer_id, studentId: nw.student_id, name: nw.name, exercises: nw.exercises }]);
      await addAppNotification(studentId, 'Novo Treino Atribuído!', `Você tem um novo treino: ${template.name}`, 'workout_update');
    }
    showNotification('Treino atribuído ao aluno!');
  };

  const removeWorkout = async (workoutId: string) => {
    const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
    if (error) throw error;
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
    showNotification('Treino removido.', 'success');
  };

  const addEvolutionEntry = async (e: Omit<EvolutionEntry, 'id' | 'trainerId'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('evolution').insert([
      { student_id: e.studentId, date: e.date, weight: e.weight, notes: e.notes, photo_url: e.photoUrl, trainer_id: user.id }
    ]).select();
    if (error) throw error;
    if (data) {
      const ne = data[0];
      const entry = { id: ne.id, trainerId: ne.trainer_id, studentId: ne.student_id, date: ne.date, weight: ne.weight, notes: ne.notes, photoUrl: ne.photo_url };
      setEvolution(prev => [...prev, entry]);
      await addAppNotification(user.id, 'Progresso do Aluno', `Peso atualizado para ${e.weight}kg`, 'evolution_new');
    }
    await updateStudent(e.studentId, { weight: e.weight });
    showNotification('Evolução registrada!');
  };

  const addVideoReview = async (r: Omit<VideoReview, 'id' | 'status' | 'date' | 'trainerId'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('video_reviews').insert([
      { student_id: r.studentId, workout_name: r.workoutName, exercise_name: r.exerciseName, video_url: r.videoUrl, trainer_id: user.id, status: 'pending', date: new Date().toISOString() }
    ]).select();
    if (error) throw error;
    if (data) {
      const nr = data[0];
      setVideoReviews(prev => [...prev, { id: nr.id, trainerId: nr.trainer_id, studentId: nr.student_id, workoutName: nr.workout_name, exerciseName: nr.exercise_name, videoUrl: nr.video_url, status: nr.status, date: nr.date, feedback: nr.feedback }]);
      await addAppNotification(user.id, 'Nova Avaliação em Vídeo', 'Um aluno enviou uma execução para revisão.', 'video_sent');
    }
    showNotification('Vídeo enviado para avaliação!');
  };

  const updateVideoReview = async (id: string, feedback: string) => {
    const { data, error } = await supabase.from('video_reviews').update({ status: 'reviewed', feedback }).eq('id', id).select();
    if (error) throw error;
    if (data && data[0]) {
      setVideoReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'reviewed', feedback } : r));
      await addAppNotification(data[0].student_id, 'Feedback do Treinador', `Sua execução de ${data[0].exercise_name} foi avaliada.`, 'evaluation_new');
    }
    showNotification('Avaliação técnica enviada.');
  };

  const logWorkout = async (log: Omit<WorkoutLog, 'id' | 'trainerId'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('workout_logs').insert([
      { student_id: log.studentId, workout_id: log.workoutId, workout_name: log.workoutName, entries: log.entries, trainer_id: user.id, date: log.date }
    ]).select();
    if (error) throw error;
    if (data) {
      const nl = data[0];
      setWorkoutLogs(prev => [...prev, { id: nl.id, trainerId: nl.trainer_id, studentId: nl.student_id, workoutId: nl.workout_id, workoutName: nl.workout_name, date: nl.date, entries: nl.entries }]);
      await addAppNotification(user.id, 'Treino Concluído!', `Um aluno finalizou o treino ${log.workoutName}`, 'workout_finished');
    }
    showNotification('Treino finalizado! Parabéns! 🎉');
  };

  const addExercise = async (ex: Omit<Exercise, 'id' | 'trainerId'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('exercises').insert([
      { name: ex.name, muscle_group: ex.muscleGroup, description: ex.description, execution_instructions: ex.executionInstructions, trainer_id: user.id }
    ]).select();
    if (error) throw error;
    if (data) {
      const resp = data[0];
      setExercises(prev => [...prev, { 
        id: resp.id, 
        trainerId: resp.trainer_id, 
        name: resp.name, 
        muscleGroup: resp.muscle_group, 
        description: resp.description, 
        executionInstructions: resp.execution_instructions 
      }]);
    }
    showNotification(`Exercício ${ex.name} adicionado à biblioteca.`);
  };

  const deleteExercise = async (id: string) => {
    const { error } = await supabase.from('exercises').delete().eq('id', id);
    if (error) throw error;
    setExercises(prev => prev.filter(ex => ex.id !== id));
    showNotification('Exercício removido.');
  };

  return (
    <DataContext.Provider value={{
      students, workouts, exercises, evolution, videoReviews, workoutLogs,
      notification, appNotifications, showNotification, markNotificationAsRead, isLoading,
      addStudent, updateStudent, deleteStudent, addWorkout, assignWorkout, removeWorkout, addEvolutionEntry, addVideoReview, updateVideoReview, logWorkout, addExercise, deleteExercise
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
