
'use client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Check, CheckCircle, Clock, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '../ui/button';
import type { Timestamp } from 'firebase/firestore';
import NextLink from 'next/link';

export interface DemandProps {
  id: string;
  title: string;
  tags: { label: string; color: 'blue' | 'purple' | 'red' | 'orange' }[];
  date: string | Timestamp | null;
  assignees: string[];
  status: string;
  isOverdue?: boolean;
  projectId?: string;
  description?: string;
}

interface DemandCardProps extends DemandProps {
  onStatusChange?: (demandId: string, newStatus: string) => void;
}

const tagColors = {
  blue: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80',
  purple: 'bg-purple-100 text-purple-800 hover:bg-purple-100/80',
  red: 'bg-red-100 text-red-800 hover:bg-red-100/80',
  orange: 'bg-orange-100 text-orange-800 hover:bg-orange-100/80',
};

const getDateFromProp = (dateProp: DemandProps['date']): Date | null => {
  if (!dateProp) return null;
  if (typeof dateProp === 'string') {
    try {
      const parsed = parseISO(dateProp);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse date string:', dateProp, e);
      return null;
    }
  }
  // This part is for Firestore Timestamps, but we keep it for type compatibility
  if (dateProp && typeof (dateProp as Timestamp).toDate === 'function') {
    return (dateProp as Timestamp).toDate();
  }
  return null;
};

export function DemandCard({ onStatusChange, ...demand }: DemandCardProps) {
  const getAssigneeAvatar = (assigneeId: string) => {
    return PlaceHolderImages.find((p) => p.id === assigneeId);
  };

  const demandDate = getDateFromProp(demand.date);
  const formattedDate = demandDate
    ? format(demandDate, 'dd MMM', { locale: ptBR })
    : 'Sem prazo';

  const dateLabel =
    demand.status === 'Finalizado'
      ? 'Concluído'
      : demand.isOverdue
      ? 'Atrasado'
      : formattedDate;

  const handleApproval = (e: React.MouseEvent, newStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    onStatusChange?.(demand.id, newStatus);
  };

  return (
    <NextLink href={`/demandas/${demand.id}`} className="block">
      <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-4 h-full flex flex-col">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-base">{demand.title}</h3>
            <span className="text-xs text-muted-foreground">{demand.id}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {demand.tags.map((tag) => (
              <Badge
                key={tag.label}
                variant="outline"
                className={cn('font-normal', tag.label !== 'Urgente' ? tagColors[tag.color] : 'bg-red-100 text-red-800 hover:bg-red-100/80')}
              >
                {tag.label}
              </Badge>
            ))}
          </div>

          <div className="flex-grow"></div>

          <div className="flex justify-between items-center">
            <div
              className={cn(
                'flex items-center gap-2 text-sm',
                demand.isOverdue ? 'text-red-600' : 'text-muted-foreground',
                demand.status === 'Finalizado' && 'text-green-600'
              )}
            >
              {demand.status === 'Finalizado' ? (
                <CheckCircle className="h-4 w-4" />
              ) : demand.isOverdue ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              <span>{dateLabel}</span>
            </div>

            <div className="flex -space-x-2">
              {demand.assignees.map((assigneeId) => {
                const avatar = getAssigneeAvatar(assigneeId);
                return (
                  <Avatar
                    key={assigneeId}
                    className="h-7 w-7 border-2 border-background"
                  >
                    {avatar && (
                      <AvatarImage
                        src={avatar.imageUrl}
                        alt={avatar.description}
                      />
                    )}
                    <AvatarFallback>{assigneeId.charAt(0)}</AvatarFallback>
                  </Avatar>
                );
              })}
            </div>
          </div>
        </CardContent>
        {demand.status === 'Aprovando' && onStatusChange && (
          <div className="p-2 border-t flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => handleApproval(e, 'Em produção')}
            >
              <X className="h-4 w-4 mr-1" /> Rejeitar
            </Button>
            <Button
              size="sm"
              className="w-full"
              onClick={(e) => handleApproval(e, 'Finalizado')}
            >
              <Check className="h-4 w-4 mr-1" /> Aprovar
            </Button>
          </div>
        )}
      </Card>
    </NextLink>
  );
}
