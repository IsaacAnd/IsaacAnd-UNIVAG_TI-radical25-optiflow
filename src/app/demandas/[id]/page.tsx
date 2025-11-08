
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
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, collection, addDoc, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { DemandProps } from '@/components/demandas/demand-card';
import { Project } from '@/components/projetos/projects-table';

interface Task {
  id: string;
  label: string;
  checked: boolean;
}

interface Comment {
    id: string;
    author: string;
    avatarId: string;
    text: string;
    timestamp: Timestamp;
}

const getPriorityDetails = (priority: string) => {
  switch (priority) {
    case 'Urgente':
      return { label: 'Alta', color: 'text-red-500' };
    case 'Alta':
      return { label: 'Alta', color: 'text-red-500' };
    case 'Média':
      return { label: 'Média', color: 'text-yellow-500' };
    case 'Baixa':
      return { label: 'Baixa', color: 'text-gray-500' };
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


const getDateFromProp = (dateProp: DemandProps['date']): Date | null => {
    if (!dateProp) return null;
    // This part is for Firestore Timestamps
    if (dateProp && typeof (dateProp as Timestamp).toDate === 'function') {
      return (dateProp as Timestamp).toDate();
    }
    return null;
  };


export default function DemandDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();

  const demandRef = useMemoFirebase(() => doc(firestore, 'demands', id), [firestore, id]);
  const { data: demand, isLoading: isDemandLoading } = useDoc<DemandProps>(demandRef);
  
  const projectRef = useMemoFirebase(() => (demand?.projectId ? doc(firestore, 'projects', demand.projectId) : null), [firestore, demand?.projectId]);
  const { data: project, isLoading: isProjectLoading } = useDoc<Project>(projectRef);

  const tasksRef = useMemoFirebase(() => collection(firestore, 'demands', id, 'tasks'), [firestore, id]);
  const { data: tasks, isLoading: areTasksLoading } = useCollection<Task>(tasksRef);
  
  const commentsRef = useMemoFirebase(() => collection(firestore, 'demands', id, 'comments'), [firestore, id]);
  const { data: comments, isLoading: areCommentsLoading } = useCollection<Comment>(commentsRef);

  const [newComment, setNewComment] = React.useState('');
  const [newTaskLabel, setNewTaskLabel] = React.useState('');
  
  const isLoading = isDemandLoading || areTasksLoading || areCommentsLoading || isProjectLoading;


  const handleTaskCheck = async (taskId: string, currentChecked: boolean) => {
    const taskRef = doc(firestore, 'demands', id, 'tasks', taskId);
    await updateDoc(taskRef, { checked: !currentChecked });
  };

  const handleAddTask = async () => {
    if (!newTaskLabel.trim()) return;
    const tasksCollectionRef = collection(firestore, 'demands', id, 'tasks');
    await addDoc(tasksCollectionRef, { label: newTaskLabel, checked: false });
    setNewTaskLabel('');
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    const commentsCollectionRef = collection(firestore, 'demands', id, 'comments');
    await addDoc(commentsCollectionRef, {
      author: user.displayName || 'Ana', // Use logged in user name
      avatarId: 'user-avatar-1', // Placeholder, should be dynamic
      text: newComment,
      timestamp: Timestamp.now(),
    });
    setNewComment('');
  };

  const handleStatusChange = async (newStatus: string) => {
    if (demand) {
      const demandDocRef = doc(firestore, 'demands', id);
      await updateDoc(demandDocRef, { status: newStatus });
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

  const completedTasks = tasks?.filter((t) => t.checked).length || 0;
  const totalTasks = tasks?.length || 0;
  const checklistProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const priority = getPriorityDetails((demand.tags.find(t => t.label === "Urgente") ? 'Urgente' : 'Média'));
  const status = getStatusDetails(demand.status);
  const userAvatar = PlaceHolderImages.find((p) => p.id === 'user-avatar-1');
  const demandDate = getDateFromProp(demand.date);

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <MainSidebar currentPage="demandas" />
      <SidebarInset className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center justify-between gap-4 border-b bg-background/80 px-8 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-lg font-medium text-muted-foreground">
            <NextLink href="/projetos">Projetos</NextLink>
            <ChevronRight className="h-5 w-5" />
            <NextLink href={`/projetos`}> 
              {project?.title || 'Projeto'}
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
                        {demandDate ? format(demandDate, 'dd MMM, yyyy', { locale: ptBR }) : 'Sem prazo'}
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
                    {demand.description || 'Nenhuma descrição fornecida.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Comentários</h2>
                <div className="space-y-6">
                  {comments?.map((comment) => (
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
                                {format(comment.timestamp.toDate(), 'PPp', {
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
                  {tasks?.map((task) => (
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

    