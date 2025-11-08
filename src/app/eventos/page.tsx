
'use client';
import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { EventosHeader } from '@/components/eventos/header';
import { Calendar } from '@/components/eventos/calendar';
import type { DemandProps } from '@/components/demandas/demand-card';
import type { Project } from '@/components/projetos/projects-table';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';

interface CalendarEvent {
  date: string;
  title: string;
  color: string;
}

const getDateFromProp = (dateProp: any): Date | null => {
    if (!dateProp) return null;
    if (dateProp && typeof (dateProp as Timestamp).toDate === 'function') {
      return (dateProp as Timestamp).toDate();
    }
     if (typeof dateProp === 'string') {
        const parsed = new Date(dateProp);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
    }
    return null;
};

export default function EventosPage() {
  const firestore = useFirestore();

  const demandsRef = useMemoFirebase(() => collection(firestore, 'demands'), [firestore]);
  const { data: demands, isLoading: isLoadingDemands } = useCollection<DemandProps>(demandsRef);

  const projectsRef = useMemoFirebase(() => collection(firestore, 'projects'), [firestore]);
  const { data: projects, isLoading: isLoadingProjects } = useCollection<Project>(projectsRef);

  const isLoading = isLoadingDemands || isLoadingProjects;

  const getEventColor = (tags?: {label: string}[]) => {
    if (!tags) return 'bg-gray-100 text-gray-800 border-gray-500';
    if (tags.some(t => t.label === 'Marketing')) return 'bg-blue-100 text-blue-800 border-blue-500';
    if (tags.some(t => t.label === 'Audiovisual')) return 'bg-purple-100 text-purple-800 border-purple-500';
    if (tags.some(t => t.label === 'Cerimonial')) return 'bg-orange-100 text-orange-800 border-orange-500';
    return 'bg-gray-100 text-gray-800 border-gray-500';
  }

  const events: CalendarEvent[] = React.useMemo(() => {
    const demandEvents = demands
      ?.filter(d => d.date)
      .map(d => {
        const eventDate = getDateFromProp(d.date);
        return eventDate ? {
          date: eventDate.toISOString(),
          title: d.title,
          color: getEventColor(d.tags),
        } : null;
      })
      .filter((e): e is CalendarEvent => e !== null) || [];

    const projectEvents = projects
      ?.filter(p => p.deadline)
      .map(p => {
         const eventDate = getDateFromProp(p.deadline);
         return eventDate ? {
            date: eventDate.toISOString(),
            title: p.title,
            color: 'bg-green-100 text-green-800 border-green-500', // Projects are green
        } : null;
      })
      .filter((e): e is CalendarEvent => e !== null) || [];

    return [...demandEvents, ...projectEvents];
  }, [demands, projects]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <MainSidebar currentPage="eventos" />
      <SidebarInset className="flex flex-col flex-1">
        <EventosHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {isLoading ? <div className="flex items-center justify-center h-full">Carregando eventos...</div> : <Calendar events={events} />}
        </main>
      </SidebarInset>
    </div>
  );
}
