
import { collection, getDocs, writeBatch, getFirestore, doc } from 'firebase/firestore';
import type { DemandProps } from '@/components/demandas/demand-card';
import { subDays, addDays } from 'date-fns';

const today = new Date();

export const initialDemands: Omit<DemandProps, 'id' | 'isOverdue' | 'date'> & {date: string}[] = [
  {
    title: 'Criação de arte para evento de formatura',
    tags: [
      { label: 'Marketing', color: 'blue' },
      { label: 'Urgente', color: 'red' },
    ],
    date: addDays(today, 3).toISOString(),
    assignees: ['user-avatar-2', 'user-avatar-3'],
    status: 'Aguardando briefing',
  },
  {
    title: 'Roteiro para vídeo institucional de 2024',
    tags: [{ label: 'Audiovisual', color: 'purple' }],
    date: addDays(today, 10).toISOString(),
    assignees: ['user-avatar-4'],
    status: 'Aguardando briefing',
  },
    {
    title: 'Organizar coffee break para evento',
    tags: [{ label: 'Cerimonial', color: 'orange' }],
    date: addDays(today, 15).toISOString(),
    assignees: ['user-avatar-1', 'user-avatar-5'],
    status: 'Aguardando briefing',
  },
  {
    title: 'Planejamento do cerimonial da colação',
    tags: [{ label: 'Cerimonial', color: 'orange' }],
    date: addDays(today, 20).toISOString(),
    assignees: ['user-avatar-5'],
    status: 'Aguardando briefing',
  },
  {
    title: 'Gravação do vídeo com o Reitor',
    tags: [{ label: 'Audiovisual', color: 'purple' }],
    date: addDays(today, 1).toISOString(),
    assignees: ['user-avatar-4'],
    status: 'Em produção',
  },
  {
    title: 'Campanha de matrículas para redes sociais',
    tags: [{ label: 'Marketing', color: 'blue' }],
    date: addDays(today, 5).toISOString(),
    assignees: ['user-avatar-1'],
    status: 'Em produção',
  },
    {
    title: 'Atualizar site com novas informações',
    tags: [{ label: 'Marketing', color: 'blue' }],
    date: addDays(today, 8).toISOString(),
    assignees: ['user-avatar-6'],
    status: 'Em produção',
  },
  {
    title: 'Aprovação do convite para o evento',
    tags: [{ label: 'Cerimonial', color: 'orange' }],
    date: addDays(today, 2).toISOString(),
    assignees: ['user-avatar-5'],
    status: 'Aprovando',
  },
  {
    title: 'Post de boas-vindas para calouros',
    tags: [{ label: 'Marketing', color: 'blue' }],
    date: addDays(today, 25).toISOString(),
    assignees: ['user-avatar-6'],
    status: 'Finalizado',
  },
  {
    title: 'Legendar vídeo institucional',
    tags: [{ label: 'Audiovisual', color: 'purple' }],
    date: addDays(today, 30).toISOString(),
    assignees: ['user-avatar-2'],
    status: 'Finalizado',
  },
];

const initialTasks: Record<string, {label: string, checked: boolean}[]> = {
    'MKT-102': [
      { label: 'Definir conceito visual', checked: true },
      { label: 'Criar versão para Feed', checked: false },
      { label: 'Adaptar para Stories', checked: false },
    ]
};

const initialComments: Record<string, {author: string, avatarId: string, timestamp: Date, text: string}[]> = {
    'MKT-102': [
        {
          author: 'João',
          avatarId: 'user-avatar-2',
          timestamp: subDays(today, 1),
          text: 'Já iniciei o rascunho. Vou subir uma primeira versão amanhã para feedback.'
        }
    ]
}


export async function seedDemands(db: ReturnType<typeof getFirestore>) {
    const demandsCollection = collection(db, 'demands');
    const demandsSnapshot = await getDocs(demandsCollection);

    if (demandsSnapshot.empty) {
        console.log('Seeding demands...');
        const batch = writeBatch(db);
        const idMapping: Record<string, string> = {
            'Criação de arte para evento de formatura': 'MKT-102',
            'Roteiro para vídeo institucional de 2024': 'AV-045',
            'Organizar coffee break para evento': 'CER-013',
            'Planejamento do cerimonial da colação': 'CER-012',
            'Gravação do vídeo com o Reitor': 'AV-044',
            'Campanha de matrículas para redes sociais': 'MKT-101',
            'Atualizar site com novas informações': 'MKT-103',
            'Aprovação do convite para o evento': 'CER-011',
            'Post de boas-vindas para calouros': 'MKT-099',
            'Legendar vídeo institucional': 'AV-046',
        }

        initialDemands.forEach(demand => {
            const newId = idMapping[demand.title];
            if (newId) {
                const docRef = doc(db, 'demands', newId);
                batch.set(docRef, demand);

                // Seed subcollections
                if (initialTasks[newId]) {
                    initialTasks[newId].forEach(task => {
                        const taskRef = doc(collection(db, 'demands', newId, 'tasks'));
                        batch.set(taskRef, task);
                    });
                }
                if (initialComments[newId]) {
                    initialComments[newId].forEach(comment => {
                        const commentRef = doc(collection(db, 'demands', newId, 'comments'));
                        batch.set(commentRef, comment);
                    });
                }
            }
        });
        await batch.commit();
        console.log('Demands seeded.');
    } else {
        console.log('Demands collection is not empty. Skipping seed.');
    }
}
