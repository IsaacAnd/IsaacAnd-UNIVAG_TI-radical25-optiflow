import { collection, getDocs, writeBatch, getFirestore, doc } from 'firebase/firestore';

const today = new Date('2025-11-01T12:00:00');

export const initialProjects = [
  {
    title: 'Campanha Vestibular 2025',
    status: {
      label: 'Ativo',
      color: 'border-blue-500 bg-blue-500/10 text-blue-700',
      bgColor: 'bg-blue-500',
    },
    progress: 75,
    progressColor: '[&>div]:bg-blue-500',
    team: ['user-avatar-2', 'user-avatar-4'],
    deadline: '2026-03-01',
  },
  {
    title: 'Produção de Vídeos Institucionais',
    status: {
      label: 'Concluído',
      color: 'border-green-500 bg-green-500/10 text-green-700',
      bgColor: 'bg-green-500',
    },
    progress: 100,
    progressColor: '[&>div]:bg-green-500',
    team: ['user-avatar-3', 'user-avatar-6'],
    deadline: '2025-12-15',
  },
  {
    title: 'Atualização do Website',
    status: {
      label: 'Em Pausa',
      color: 'border-yellow-500 bg-yellow-500/10 text-yellow-700',
      bgColor: 'bg-yellow-500',
    },
    progress: 30,
    progressColor: '[&>div]:bg-blue-500',
    team: ['user-avatar-5', 'user-avatar-2'],
    deadline: '2026-02-10',
  },
  {
    title: 'Organização Cerimonial de Formatura',
    status: {
      label: 'Ativo',
      color: 'border-blue-500 bg-blue-500/10 text-blue-700',
      bgColor: 'bg-blue-500',
    },
    progress: 90,
    progressColor: '[&>div]:bg-blue-500',
    team: ['user-avatar-1'],
    deadline: '2026-01-20',
  },
  {
    title: 'Feira de Profissões 2025',
    status: {
      label: 'Ativo',
      color: 'border-blue-500 bg-blue-500/10 text-blue-700',
      bgColor: 'bg-blue-500',
    },
    progress: 45,
    progressColor: '[&>div]:bg-blue-500',
    team: ['user-avatar-1', 'user-avatar-3', 'user-avatar-5'],
    deadline: '2026-04-25',
  },
  {
    title: 'Desenvolvimento do Novo App Mobile',
    status: {
      label: 'Ativo',
      color: 'border-blue-500 bg-blue-500/10 text-blue-700',
      bgColor: 'bg-blue-500',
    },
    progress: 15,
    progressColor: '[&>div]:bg-blue-500',
    team: ['user-avatar-2', 'user-avatar-4', 'user-avatar-6'],
    deadline: '2026-06-30',
  },
];


export async function seedProjects(db: ReturnType<typeof getFirestore>) {
    const projectsCollection = collection(db, 'projects');
    const projectsSnapshot = await getDocs(projectsCollection);

    if (projectsSnapshot.empty) {
        console.log('Seeding projects...');
        const batch = writeBatch(db);
        initialProjects.forEach(project => {
            const docRef = doc(projectsCollection);
            batch.set(docRef, project);
        });
        await batch.commit();
        console.log('Projects seeded.');
    } else {
        console.log('Projects collection is not empty. Skipping seed.');
    }
}
