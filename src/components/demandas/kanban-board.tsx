
'use client';
import { KanbanColumn } from './kanban-column';
import { DemandProps } from './demand-card';

interface KanbanBoardProps {
  demands: DemandProps[];
  onStatusChange: (demandId: string, newStatus: string) => void;
}

export function KanbanBoard({ demands, onStatusChange }: KanbanBoardProps) {
  const statuses = ['Aguardando briefing', 'Em produção', 'Aprovando', 'Finalizado'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aguardando briefing':
        return 'bg-yellow-500';
      case 'Em produção':
        return 'bg-blue-500';
      case 'Aprovando':
        return 'bg-purple-500';
      case 'Finalizado':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
      {statuses.map(status => {
        const filteredDemands = demands.filter(d => d.status === status);
        return (
          <KanbanColumn
            key={status}
            title={status}
            count={filteredDemands.length}
            demands={filteredDemands}
            statusColor={getStatusColor(status)}
            onStatusChange={onStatusChange}
          />
        );
      })}
    </div>
  );
}
