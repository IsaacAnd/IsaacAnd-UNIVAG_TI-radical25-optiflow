
'use client';

import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DemandasHeader } from '@/components/demandas/header';
import { KanbanBoard } from '@/components/demandas/kanban-board';
import { DemandProps } from '@/components/demandas/demand-card';
import { isWithinInterval, endOfWeek, startOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp as FSTimestamp } from 'firebase/firestore';


const getDateFromProp = (dateProp: DemandProps['date']): Date | null => {
    if (!dateProp) return null;
    if (dateProp && typeof (dateProp as FSTimestamp).toDate === 'function') {
      return (dateProp as FSTimestamp).toDate();
    }
    return null;
};


export default function DemandasPage() {
  const firestore = useFirestore();
  const demandsRef = useMemoFirebase(() => collection(firestore, 'demands'), [firestore]);
  const { data: demands, isLoading } = useCollection<DemandProps>(demandsRef);

  const [search, setSearch] = React.useState('');
  const [responsavel, setResponsavel] = React.useState<string[]>([]);
  const [categoria, setCategoria] = React.useState<string[]>([]);
  const [prazo, setPrazo] = React.useState<string[]>([]);


  const handleAddDemand = async (newDemandData: Omit<DemandProps, 'id' | 'isOverdue' | 'assignees' | 'tags' | 'date'> & { dueDate: Date; projectId: string }) => {
    const newDemand = {
      title: newDemandData.title,
      description: newDemandData.description || '',
      projectId: newDemandData.projectId,
      assignees: ['user-avatar-1'], // Placeholder
      tags: [{ label: 'Marketing', color: 'blue' }], // Placeholder
      status: 'Aguardando briefing',
      date: FSTimestamp.fromDate(newDemandData.dueDate),
    };
    await addDoc(demandsRef, newDemand);
  };

  const responsaveisUnicos = React.useMemo(() => {
    if (!demands) return [];
    const allAssignees = demands.flatMap(d => d.assignees);
    const uniqueAssigneeData = PlaceHolderImages.filter(p => allAssignees.includes(p.id));
    const nameIdMap = new Map(uniqueAssigneeData.map(u => {
        const name = u.description.split(' ')[0];
        return [name, u.id];
    }));
    return Array.from(nameIdMap.keys());
  }, [demands]);
  
  const categoriasUnicas = React.useMemo(() => {
      if (!demands) return [];
      const allTags = demands.flatMap(d => d.tags.map(t => t.label));
      return [...new Set(allTags)].filter(t => !['Urgente'].includes(t));
  }, [demands]);

  const demandsWithOverdue = React.useMemo(() => {
    if (!demands) return [];
    return demands.map(d => {
        const demandDate = getDateFromProp(d.date);
        return {
            ...d,
            isOverdue: demandDate ? demandDate < new Date() && d.status !== 'Finalizado' : false,
        }
    });
  }, [demands]);

  const filteredDemands = React.useMemo(() => {
    let newFilteredDemands = [...demandsWithOverdue];

    if (search) {
      newFilteredDemands = newFilteredDemands.filter(
        d =>
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          d.id.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (responsavel.length > 0) {
        const responsavelIds = responsavel.map(r => {
            const user = PlaceHolderImages.find(u => u.description.startsWith(r));
            return user ? user.id : '';
        }).filter(id => id);

        newFilteredDemands = newFilteredDemands.filter(d =>
            d.assignees.some(a => responsavelIds.includes(a))
        );
    }

    if (categoria.length > 0) {
        newFilteredDemands = newFilteredDemands.filter(d =>
            d.tags.some(t => categoria.includes(t.label))
        );
    }

    if (prazo.length > 0) {
        newFilteredDemands = newFilteredDemands.filter(d => {
            const demandDate = getDateFromProp(d.date);
            if (!demandDate) return false;

            const now = new Date();
            let matches = false;
            if (prazo.includes('Atrasados') && d.isOverdue) {
                matches = true;
            }
            if (prazo.includes('Esta semana')) {
                 const start = startOfWeek(now);
                 const end = endOfWeek(now);
                 if(!isNaN(demandDate.getTime()) && isWithinInterval(demandDate, { start, end })) matches = true;
            }
            if (prazo.includes('Este mês')) {
                const start = startOfMonth(now);
                const end = endOfMonth(now);
                if (!isNaN(demandDate.getTime()) && isWithinInterval(demandDate, { start, end })) matches = true;
            }
            return matches;
        });
    }

    return newFilteredDemands;
  }, [search, responsavel, categoria, prazo, demandsWithOverdue]);
  
  const handleStatusChange = async (demandId: string, newStatus: string) => {
    const demandDocRef = doc(firestore, 'demands', demandId);
    await updateDoc(demandDocRef, { status: newStatus });
  };

  if (isLoading) {
    return (
        <div className="flex min-h-screen w-full bg-background">
          <MainSidebar currentPage="demandas" />
          <SidebarInset className="flex flex-col flex-1">
             <div className="flex-1 p-8">Carregando demandas...</div>
          </SidebarInset>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <MainSidebar currentPage="demandas" />
      <SidebarInset className="flex flex-col flex-1">
        <DemandasHeader 
            search={search}
            onSearchChange={setSearch}
            responsavel={responsavel}
            onResponsavelChange={setResponsavel}
            categoria={categoria}
            onCategoriaChange={setCategoria}
            prazo={prazo}
            onPrazoChange={setPrazo}
            responsaveis={responsaveisUnicos}
            categorias={categoriasUnicas}
            onAddDemand={handleAddDemand}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <KanbanBoard demands={filteredDemands} onStatusChange={handleStatusChange} />
        </main>
      </SidebarInset>
    </div>
  );
}

    