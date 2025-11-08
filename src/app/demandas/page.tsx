'use client';

import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { DemandasHeader } from '@/components/demandas/header';
import { KanbanBoard } from '@/components/demandas/kanban-board';
import { DemandProps } from '@/components/demandas/demand-card';
import { isWithinInterval, endOfWeek, startOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { initialDemands } from '@/lib/demandas-data';

const DEMANDS_STORAGE_KEY = 'multiflow-demands';

const getDateFromProp = (dateProp: DemandProps['date']): Date | null => {
    if (!dateProp) return null;
    if (typeof dateProp === 'string') {
        try {
            const parsed = parseISO(dateProp);
            if (!isNaN(parsed.getTime())) {
                return parsed;
            }
        } catch (e) {
            return null;
        }
    }
    return null;
};

// Function to generate unique IDs for static data
const addIdsToDemands = (demands: any[]) => {
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
    };
    return demands.map(d => ({ ...d, id: idMapping[d.title] || `DEM-${Math.random().toString(36).substr(2, 5).toUpperCase()}` }));
};


export default function DemandasPage() {
  const [demands, setDemands] = React.useState<DemandProps[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [search, setSearch] = React.useState('');
  const [responsavel, setResponsavel] = React.useState<string[]>([]);
  const [categoria, setCategoria] = React.useState<string[]>([]);
  const [prazo, setPrazo] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Forcing the use of initialDemands from the file to ensure dates are correct.
    const demandsWithIds = addIdsToDemands(initialDemands);
    setDemands(demandsWithIds);
    localStorage.setItem(DEMANDS_STORAGE_KEY, JSON.stringify(demandsWithIds));
    setIsLoading(false);
  }, []);

  const updateAndStoreDemands = (newDemands: DemandProps[]) => {
      setDemands(newDemands);
      try {
          localStorage.setItem(DEMANDS_STORAGE_KEY, JSON.stringify(newDemands));
      } catch (error) {
          console.error("Failed to write to localStorage", error);
      }
  };


  const handleAddDemand = (newDemandData: Omit<DemandProps, 'id' | 'isOverdue' | 'assignees' | 'tags' | 'date'> & { dueDate: Date; projectId: string }) => {
    const newDemand: DemandProps = {
      ...newDemandData,
      id: `DEM-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      assignees: ['user-avatar-1'], // Placeholder
      tags: [{ label: 'Marketing', color: 'blue' }], // Placeholder
      status: 'Aguardando briefing',
      date: newDemandData.dueDate.toISOString(),
    };
    updateAndStoreDemands([newDemand, ...demands]);
  };

  const responsaveisUnicos = React.useMemo(() => {
    const allAssignees = demands.flatMap(d => d.assignees);
    const uniqueAssigneeData = PlaceHolderImages.filter(p => allAssignees.includes(p.id));
    const nameIdMap = new Map(uniqueAssigneeData.map(u => {
        const name = u.description.split(' ')[0];
        return [name, u.id];
    }));
    return Array.from(nameIdMap.keys());
  }, [demands]);
  
  const categoriasUnicas = React.useMemo(() => {
      const allTags = demands.flatMap(d => d.tags.map(t => t.label));
      return [...new Set(allTags)].filter(t => !['Urgente'].includes(t));
  }, [demands]);

  const demandsWithOverdue = React.useMemo(() => {
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
  
  const handleStatusChange = (demandId: string, newStatus: string) => {
    const newDemands = demands.map(d => 
        d.id === demandId ? { ...d, status: newStatus } : d
    );
    updateAndStoreDemands(newDemands);
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
