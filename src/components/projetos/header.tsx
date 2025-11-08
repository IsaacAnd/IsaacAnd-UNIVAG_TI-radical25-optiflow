'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, PlusCircle } from 'lucide-react';
import { CreateProjectDialog } from './create-project-dialog';
import { Project } from './projects-table';

interface ProjetosHeaderProps {
    statusFilter: string[];
    onStatusFilterChange: (value: string[]) => void;
    teamFilter: string[];
    onTeamFilterChange: (value: string[]) => void;
    sortBy: string;
    onSortByChange: (value: string) => void;
    teamMembers: string[];
    onAddProject: (data: any) => void;
}

export function ProjetosHeader({
    statusFilter,
    onStatusFilterChange,
    teamFilter,
    onTeamFilterChange,
    sortBy,
    onSortByChange,
    teamMembers,
    onAddProject
}: ProjetosHeaderProps) {

  const handleCheckedChange = (
    setState: React.Dispatch<React.SetStateAction<string[]>>,
    currentValue: string
  ) => {
    return (checked: boolean) => {
      setState(prev => {
        if (checked) {
          return [...prev, currentValue];
        } else {
          return prev.filter(item => item !== currentValue);
        }
      });
    };
  };


  return (
    <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:h-24 md:px-8">
      <div className="flex-1">
        <h1 className="text-3xl font-bold">Gerenciamento de Projetos</h1>
        <div className="flex items-center gap-4 mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Filtrar por Status
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuCheckboxItem checked={statusFilter.includes('Ativo')} onCheckedChange={handleCheckedChange(onStatusFilterChange, 'Ativo')}>Ativo</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={statusFilter.includes('Concluído')} onCheckedChange={handleCheckedChange(onStatusFilterChange, 'Concluído')}>Concluído</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={statusFilter.includes('Em Pausa')} onCheckedChange={handleCheckedChange(onStatusFilterChange, 'Em Pausa')}>Em Pausa</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={statusFilter.includes('Em Risco')} onCheckedChange={handleCheckedChange(onStatusFilterChange, 'Em Risco')}>Em Risco</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Filtrar por Equipe
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
               {teamMembers.map(member => (
                <DropdownMenuCheckboxItem key={member} checked={teamFilter.includes(member)} onCheckedChange={handleCheckedChange(onTeamFilterChange, member)}>
                    {member}
                </DropdownMenuCheckboxItem>
               ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Ordenar Por
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuRadioGroup value={sortBy} onValueChange={onSortByChange}>
                <DropdownMenuRadioItem value="Prazo">Prazo</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Progresso">Progresso</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Status">Status</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <CreateProjectDialog onAddProject={onAddProject} />
      </div>
    </header>
  );
}
