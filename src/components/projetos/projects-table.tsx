'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { format, parseISO } from 'date-fns';

export interface Project {
  id: string;
  title: string;
  status: {
    label: string;
    color: string;
    bgColor: string;
  };
  progress: number;
  progressColor: string;
  team: string[];
  deadline: string;
}

interface ProjectsTableProps {
    projects: Project[];
    isLoading: boolean;
}


export function ProjectsTable({ projects, isLoading }: ProjectsTableProps) {
    
  const getAssigneeAvatar = (assigneeId: string) => {
    return PlaceHolderImages.find(p => p.id === assigneeId);
  };
    
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Título do Projeto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[20%]">Progresso</TableHead>
              <TableHead>Equipe</TableHead>
              <TableHead className="text-right">Prazo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium"><div className="h-4 bg-muted rounded animate-pulse w-3/4"></div></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20"></div></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <div className="h-2 bg-muted rounded animate-pulse w-full"></div>
                        <div className="h-4 bg-muted rounded animate-pulse w-8"></div>
                    </div>
                  </TableCell>
                  <TableCell><div className="h-7 w-12 bg-muted rounded-full animate-pulse"></div></TableCell>
                  <TableCell className="text-right"><div className="h-4 bg-muted rounded animate-pulse w-24 ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('font-normal', project.status.color)}
                    >
                      <div className={cn("w-2 h-2 rounded-full mr-2", project.status.bgColor)}></div>
                      {project.status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress value={project.progress} className={cn("h-2", project.progressColor)} />
                      <span className="text-muted-foreground">{project.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                  <div className="flex -space-x-2">
                    {project.team.map(assigneeId => {
                      const avatar = getAssigneeAvatar(assigneeId);
                      return (
                        <Avatar key={assigneeId} className="h-7 w-7 border-2 border-background">
                          {avatar && (
                            <AvatarImage src={avatar.imageUrl} alt={avatar.description} />
                          )}
                          <AvatarFallback>{assigneeId.charAt(0)}</AvatarFallback>
                        </Avatar>
                      );
                    })}
                  </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {project.deadline ? format(parseISO(project.deadline), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
