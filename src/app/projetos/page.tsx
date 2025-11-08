'use client';
import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { ProjetosHeader } from '@/components/projetos/header';
import { ProjectsTable, Project } from '@/components/projetos/projects-table';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { parseISO, Timestamp } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';


export default function ProjetosPage() {
  const firestore = useFirestore();
  const projectsRef = useMemoFirebase(() => collection(firestore, 'projects'), [firestore]);
  const { data: projects, isLoading } = useCollection<Project>(projectsRef);

  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const [teamFilter, setTeamFilter] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState<string>('');

  const handleAddProject = async (newProjectData: Omit<Project, 'id' | 'status' | 'progress' | 'progressColor' | 'team' | 'deadline'> & {endDate: Date}) => {
    const newProject: Omit<Project, 'id'> = {
        title: newProjectData.title,
        description: newProjectData.description || '',
        status: {
            label: 'Ativo',
            color: 'border-blue-500 bg-blue-500/10 text-blue-700',
            bgColor: 'bg-blue-500',
        },
        progress: 0,
        progressColor: '[&>div]:bg-blue-500',
        team: ['user-avatar-1'], // Placeholder for current user
        deadline: newProjectData.endDate.toISOString(),
    };
    await addDoc(projectsRef, newProject);
  };


  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    let newFilteredProjects = [...projects];

    if (statusFilter.length > 0) {
      newFilteredProjects = newFilteredProjects.filter(p => statusFilter.includes(p.status.label));
    }
    
    if (teamFilter.length > 0) {
        const teamMemberIds = teamFilter.map(name => {
            const user = PlaceHolderImages.find(u => u.description.startsWith(name));
            return user ? user.id : '';
        }).filter(id => id);

        newFilteredProjects = newFilteredProjects.filter(p => p.team.some(memberId => teamMemberIds.includes(memberId)));
    }
    
    if (sortBy) {
        newFilteredProjects.sort((a, b) => {
            if (sortBy === 'Prazo') {
                if (!a.deadline || !b.deadline) return 0;
                return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
            }
            if (sortBy === 'Progresso') {
                return b.progress - a.progress;
            }
            if (sortBy === 'Status') {
                return a.status.label.localeCompare(b.status.label);
            }
            return 0;
        });
    }

    return newFilteredProjects;
  }, [statusFilter, teamFilter, sortBy, projects]);

  const allTeamMembers = React.useMemo(() => {
      if (!projects) return [];
      const memberIds = new Set(projects.flatMap(p => p.team));
      return PlaceHolderImages.filter(p => memberIds.has(p.id)).map(p => p.description.split(' ')[0]);
  }, [projects]);

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <MainSidebar currentPage="projetos" />
      <SidebarInset className="flex flex-col flex-1">
        <ProjetosHeader 
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            teamFilter={teamFilter}
            onTeamFilterChange={setTeamFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            teamMembers={allTeamMembers}
            onAddProject={handleAddProject}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <ProjectsTable projects={filteredProjects} isLoading={isLoading} />
        </main>
      </SidebarInset>
    </div>
  );
}
