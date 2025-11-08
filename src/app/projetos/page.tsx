'use client';
import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { ProjetosHeader } from '@/components/projetos/header';
import { ProjectsTable, Project } from '@/components/projetos/projects-table';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { parseISO } from 'date-fns';
import { initialProjects } from '@/lib/projetos-data';

const PROJECTS_STORAGE_KEY = 'multiflow-projects';

export default function ProjetosPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const [teamFilter, setTeamFilter] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState<string>('');

  React.useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      } else {
        const projectsWithIds = initialProjects.map((p, i) => ({ ...p, id: `PROJ-${i + 1}` }));
        setProjects(projectsWithIds);
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projectsWithIds));
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
      const projectsWithIds = initialProjects.map((p, i) => ({ ...p, id: `PROJ-${i + 1}` }));
      setProjects(projectsWithIds);
    }
    setIsLoading(false);
  }, []);

  const updateAndStoreProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(newProjects));
    } catch (error) {
        console.error("Failed to write to localStorage", error);
    }
  };

  const handleAddProject = (newProjectData: Omit<Project, 'id' | 'status' | 'progress' | 'progressColor' | 'team' | 'deadline'> & {endDate: Date}) => {
    const newProject: Project = {
        ...newProjectData,
        id: `PROJ-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
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
    updateAndStoreProjects([newProject, ...projects]);
  };


  const filteredProjects = React.useMemo(() => {
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
