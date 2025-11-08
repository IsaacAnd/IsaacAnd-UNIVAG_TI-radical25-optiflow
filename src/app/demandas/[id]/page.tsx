'use client';

import * as React from 'react';
import NextLink from 'next/link';
import {
  ChevronRight,
  User,
  Calendar,
  Zap,
  Paperclip,
  UploadCloud,
  Send,
  Plus,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { notFound, useParams } from 'next/navigation';
import { format, parseISO, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { initialDemands } from '@/lib/demandas-data';
import { DemandProps } from '@/components/demandas/demand-card';

const DEMANDS_STORAGE_KEY = 'multiflow-demands';
const DEMAND_DETAILS_STORAGE_KEY_PREFIX = 'multiflow-demand-details-';

const getPriorityDetails = (priority: string) => {
  switch (priority) {
    case 'Urgente':
      return { label: 'Alta', color: 'text-red-500' };
    case 'Alta':
      return { label: 'Alta', color: 'text-red-500' };
    case 'Média':
      return { label: 'Média', color: 'text-yellow-500' };
    case 'Baixa':
      return { label: 'Baixa', 'color': 'text-gray-500' };
    default:
      return { label: priority, color: 'text-gray-500' };
  }
};

const getStatusDetails = (status: string) => {
  switch (status) {
    case 'Aguardando briefing':
      return { label: status, color: 'text-yellow-500' };
    case 'Em produção':
      return { label: status, color: 'text-blue-500' };
    case 'Aprovando':
      return { label: status, color: 'text-purple-500' };
    case 'Finalizado':
      return { label: status, color: 'text-green-500' };
    default:
      return { label: status, color: 'text-gray-500' };
  }
};

const defaultMockData = {
    description: `Precisamos criar o key-visual para o evento de formatura que acontecerá em 3 semanas.\n\nRequisitos:\n- Seguir o manual da marca.\n- Criar versões para Instagram (Feed e Stories), Facebook e LinkedIn.\n- Incluir o logo dos patrocinadores.\n\nO prazo é apertado, então precisamos de agilidade.`,
    priority: 'Urgente',
    projectId: 'PROJ-1',
};

const initialTasks = [
  { id: '1', label: 'Definir conceito visual', checked: true },
  { id: '2', label: 'Criar versão para Feed', checked: false },
  { id: '3', label: 'Adaptar para Stories', checked: false },
];

const initialComments: any[] = [];


export default function DemandDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [demand, setDemand] = React.useState<DemandProps | null>(null);
  const [tasks, setTasks] = React.useState(initialTasks);
  const [comments, setComments] = React.useState(initialComments);
  const [isLoading, setIsLoading] = React.useState(true);

  const [newComment, setNewComment] = React.useState('');
  const [newTaskLabel, setNewTaskLabel] = React.useState('');
  
  const demandDetailsStorageKey = `${DEMAND_DETAILS_STORAGE_KEY_PREFIX}${id}`;


  React.useEffect(() => {
    let allDemands: DemandProps[] = [];
    try {
      const storedDemands = localStorage.getItem(DEMANDS_STORAGE_KEY);
      if (storedDemands) {
        allDemands = JSON.parse(storedDemands);
      } else {
        allDemands = initialDemands.map((d, i) => ({ ...d, id: `MKT-${102+i}` })) as DemandProps[];
      }
    } catch (e) {
      console.error("Failed to load demands from storage", e);
      allDemands = initialDemands.map((d, i) => ({ ...d, id: `MKT-${102+i}` })) as DemandProps[];
    }
    
    const foundDemand = allDemands.find(d => d.id === id);

    if (foundDemand) {
        // Merge with default mock data for fields that might be missing
        const fullDemand = {
            ...foundDemand,
            description: foundDemand.description || defaultMockData.description,
            priority: (foundDemand.tags.find(t => t.label === "Urgente") ? 'Urgente' : 'Média'),
            projectId: foundDemand.projectId || defaultMockData.projectId,
        };
        setDemand(fullDemand);

        // Load tasks and comments from localStorage
        try {
            const storedDetails = localStorage.getItem(demandDetailsStorageKey);
            if (storedDetails) {
                const { tasks: storedTasks, comments: storedComments } = JSON.parse(storedDetails);
                setTasks(storedTasks);
                setComments(storedComments.map((c: any) => ({...c, timestamp: parseISO(c.timestamp)})));
            } else {
                // If nothing is in storage, ensure comments are empty
                setComments([]);
            }
        } catch (e) {
            console.error("Failed to load demand details from storage", e);
            setComments([]);
        }

    }
    setIsLoading(false);
  }, [id, demandDetailsStorageKey]);

  const updateAndStoreDetails = (newTasks: any[], newComments: any[]) => {
      setTasks(newTasks);
      setComments(newComments);
      try {
        localStorage.setItem(demandDetailsStorageKey, JSON.stringify({tasks: newTasks, comments: newComments}));
      } catch (error) {
          console.error("Failed to write details to localStorage", error);
      }
  }


  const handleTaskCheck = (taskId: string, currentChecked: boolean) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, checked: !currentChecked } : t);
    updateAndStoreDetails(newTasks, comments);
  };

  const handleAddTask = () => {
    if (!newTaskLabel.trim()) return;
    const newTask = { id: String(Date.now()), label: newTaskLabel, checked: false };
    updateAndStoreDetails([...tasks, newTask], comments);
    setNewTaskLabel('');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const newCommentObj = {
      id: String(Date.now()),
      author: 'Ana',
      avatarId: 'user-avatar-1',
      text: newComment,
      timestamp: new Date(),
    };
    updateAndStoreDetails(tasks, [...comments, newCommentObj]);
    setNewComment('');
  };

  const handleStatusChange = (newStatus: string) => {
    if (demand) {
      const updatedDemand = { ...demand, status: newStatus };
      setDemand(updatedDemand);
      try {
        const storedDemands = localStorage.getItem(DEMANDS_STORAGE_KEY);
        if(storedDemands){
          const allDemands: DemandProps[] = JSON.parse(storedDemands);
          const newDemands = allDemands.map(d => d.id === demand.id ? updatedDemand : d);
          localStorage.setItem(DEMANDS_STORAGE_KEY, JSON.stringify(newDemands));
        }
      } catch (error) {
        console.error("Failed to update demand status in localStorage", error);
      }
    }
  };

  const handleRequestApproval = () => {
    handleStatusChange('Aprovando');
  };

  if (isLoading) {
      return <div className="flex h-screen w-full items-center justify-center">Carregando detalhes da demanda...</div>
  }

  if (!demand) {
    notFound();
  }

  const completedTasks = tasks.filter((t) => t.checked).length;
  const totalTasks = tasks.length;
  const checklistProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const priority = getPriorityDetails(demand.priority);
  const status = getStatusDetails(demand.status);
  const userAvatar = PlaceHolderImages.find((p) => p.id === 'user-avatar-1');
  const demandDate = demand.date ? parseISO(demand.date as string) : new Date();

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <MainSidebar currentPage="demandas" />
      <SidebarInset className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center justify-between gap-4 border-b bg-background/80 px-8 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-lg font-medium text-muted-foreground">
            <NextLink href="/projetos">Projetos</NextLink>
            <ChevronRight className="h-5 w-5" />
            <NextLink href={`/projetos`}> 
              Marketing Campaign
            </NextLink>
            <ChevronRight className="h-5 w-5" />
            <span className="text-foreground">{demand.title}</span>
          </div>
          <Button onClick={handleRequestApproval}>Solicitar Aprovação</Button>
        </header>

        <main className="flex-1 p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Main Content */}
          <div className="md:col-span-2 flex flex-col gap-8">
            <Card>
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold mb-4">{demand.title}</h1>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-foreground -mb-1">
                        {demand.assignees
                          .map(
                            (id) =>
                              PlaceHolderImages.find((p) => p.id === id)
                                ?.description.split(' ')[0] || 'N/A'
                          )
                          .join(', ')}
                      </p>
                      <p>Responsáveis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-foreground -mb-1">
                        {format(demandDate, 'dd MMM, yyyy', { locale: ptBR })}
                      </p>
                      <p>Prazo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${status.color.replace('text-', 'bg-')}`}
                    />
                    <div>
                      <p className={`font-medium ${status.color} -mb-1`}>
                        {status.label}
                      </p>
                      <p>Status</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className={`h-4 w-4 ${priority.color}`} />
                    <div>
                      <p className={`font-medium ${priority.color} -mb-1`}>
                        {priority.label}
                      </p>
                      <p>Prioridade</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2">Descrição</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {demand.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Comentários</h2>
                <div className="space-y-6">
                  {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar>
                            <AvatarImage
                              src={
                                PlaceHolderImages.find(
                                  (p) => p.id === comment.avatarId
                                )?.imageUrl
                              }
                            />
                            <AvatarFallback>
                              {comment.author.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{comment.author}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(comment.timestamp, 'PPp', {
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                            <p className="text-muted-foreground">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      ))}
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={userAvatar?.imageUrl} />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                      <Textarea
                        placeholder="Adicionar um comentário..."
                        className="pr-12"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddComment())}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 text-muted-foreground"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-8">
            {/* Checklist */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-2">Checklist</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">
                    {completedTasks} de {totalTasks} concluídas
                  </span>
                  <Progress value={checklistProgress} className="h-2 flex-1" />
                </div>
                <div className="space-y-3 mb-4">
                  {tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3">
                          <Checkbox
                            id={`task-${task.id}`}
                            checked={task.checked}
                            onCheckedChange={() =>
                              handleTaskCheck(task.id, task.checked)
                            }
                          />
                          <Label
                            htmlFor={`task-${task.id}`}
                            className={`flex-1 ${
                              task.checked ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {task.label}
                          </Label>
                        </div>
                      ))}
                </div>
                <div className="relative">
                  <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Adicionar sub-tarefa"
                    className="pl-9"
                    value={newTaskLabel}
                    onChange={(e) => setNewTaskLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Anexos</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Manual_da_Marca.pdf</p>
                        <p className="text-sm text-muted-foreground">1.2 MB</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Roteiro_Campanha.docx</p>
                        <p className="text-sm text-muted-foreground">34 KB</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg text-sm text-muted-foreground cursor-pointer hover:bg-muted/50">
                    <UploadCloud className="h-8 w-8" />
                    <span>Clique para enviar ou arraste e solte</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </div>
  );
}
