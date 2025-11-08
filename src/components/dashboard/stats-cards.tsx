
'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, ListTodo } from 'lucide-react';
import { isAfter, isBefore, addDays, startOfToday, parseISO } from 'date-fns';
import type { DemandProps } from '@/components/demandas/demand-card';
import { initialDemands } from '@/lib/demandas-data';
import { initialProjects } from '@/lib/projetos-data';

// Assuming a similar shape for Project
interface Project {
  status: { label: string };
  deadline: string;
}

const DEMANDS_STORAGE_KEY = 'multiflow-demands';
const PROJECTS_STORAGE_KEY = 'multiflow-projects';


const getDateFromProp = (dateProp: any): Date | null => {
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

export function StatsCards() {
  const [demands, setDemands] = React.useState<DemandProps[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    try {
        const storedDemands = localStorage.getItem(DEMANDS_STORAGE_KEY);
        setDemands(storedDemands ? JSON.parse(storedDemands) : (initialDemands as DemandProps[]));

        const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
        setProjects(storedProjects ? JSON.parse(storedProjects) : initialProjects);

    } catch (error) {
        console.error("Failed to read from localStorage", error);
        setDemands(initialDemands as DemandProps[]);
        setProjects(initialProjects);
    }
    setIsLoading(false);
  }, []);
  
  const stats = React.useMemo(() => {
    const today = startOfToday();
    const nextWeek = addDays(today, 7);

    const pendingDemands = demands?.filter(d => d.status !== 'Finalizado').length || 0;
    const concludedDemands = demands?.filter(d => d.status === 'Finalizado').length || 0;
    
    const demandsDueSoon = demands?.filter(d => {
      if (d.status === 'Finalizado') return false;
      const demandDate = getDateFromProp(d.date);
      if (!demandDate) return false;
      return isAfter(demandDate, today) && isBefore(demandDate, nextWeek);
    }).length || 0;

    const projectsDueSoon = projects?.filter(p => {
      if (p.status.label === 'Concluído' || !p.deadline) return false;
      const projectDate = getDateFromProp(p.deadline);
       if (!projectDate) return false;
      return isAfter(projectDate, today) && isBefore(projectDate, nextWeek);
    }).length || 0;

    const dueSoonTotal = demandsDueSoon + projectsDueSoon;

    return [
      {
        title: 'Demandas Pendentes',
        value: pendingDemands,
        icon: ListTodo,
        color: 'bg-[#A0C4FF]/20 text-[#2563EB]',
        description: 'Total de demandas não finalizadas',
      },
      {
        title: 'Tarefas Concluídas',
        value: concludedDemands,
        icon: CheckCircle,
        color: 'bg-green-500/10 text-green-600',
        description: 'Demandas finalizadas nesta semana',
      },
      {
        title: 'Prazos Próximos',
        value: dueSoonTotal,
        icon: Clock,
        color: 'bg-red-500/10 text-red-600',
        description: 'Demandas e projetos para 7 dias',
      },
    ];
  }, [demands, projects]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">{stat.title}</CardTitle>
            <div className={`flex h-10 w-10 items-center justify-center rounded-md ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="text-3xl font-bold">-</div>
            ) : (
                <div className="text-3xl font-bold">{stat.value}</div>
            )}
            <p className="text-sm text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
