'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, ChevronDown, User, Tag, Calendar, PlusCircle } from 'lucide-react';
import { CreateDemandDialog } from './create-demand-dialog';
import { DemandProps } from './demand-card';

interface DemandasHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  responsavel: string[];
  onResponsavelChange: (value: string[]) => void;
  categoria: string[];
  onCategoriaChange: (value: string[]) => void;
  prazo: string[];
  onPrazoChange: (value: string[]) => void;
  responsaveis: string[];
  categorias: string[];
  onAddDemand: (data: any) => void;
}

export function DemandasHeader({
  search,
  onSearchChange,
  responsavel,
  onResponsavelChange,
  categoria,
  onCategoriaChange,
  prazo,
  onPrazoChange,
  responsaveis,
  categorias,
  onAddDemand,
}: DemandasHeaderProps) {

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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por título ou ID da demanda"
            className="w-full max-w-sm pl-10 text-base"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Responsável
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {responsaveis.map(r => (
              <DropdownMenuCheckboxItem
                key={r}
                checked={responsavel.includes(r)}
                onCheckedChange={handleCheckedChange(onResponsavelChange, r)}
              >
                {r}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4" />
              Categoria
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {categorias.map(c => (
                 <DropdownMenuCheckboxItem
                    key={c}
                    checked={categoria.includes(c)}
                    onCheckedChange={handleCheckedChange(onCategoriaChange, c)}
                 >{c}</DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Prazo
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuCheckboxItem
              checked={prazo.includes('Esta semana')}
              onCheckedChange={handleCheckedChange(onPrazoChange, 'Esta semana')}
            >Esta semana</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={prazo.includes('Este mês')}
              onCheckedChange={handleCheckedChange(onPrazoChange, 'Este mês')}
            >Este mês</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={prazo.includes('Atrasados')}
              onCheckedChange={handleCheckedChange(onPrazoChange, 'Atrasados')}
            >Atrasados</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CreateDemandDialog onAddDemand={onAddDemand} />
      </div>
    </header>
  );
}
