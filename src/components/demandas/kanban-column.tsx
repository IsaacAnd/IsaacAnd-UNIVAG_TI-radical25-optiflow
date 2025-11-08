
import { DemandCard, DemandProps } from './demand-card';

interface KanbanColumnProps {
  title: string;
  count: number;
  statusColor: string;
  demands: DemandProps[];
  onStatusChange: (demandId: string, newStatus: string) => void;
}

export function KanbanColumn({ title, count, statusColor, demands, onStatusChange }: KanbanColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm font-medium bg-muted text-muted-foreground rounded-full px-2.5 py-0.5">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {demands.map(demand => (
          <DemandCard key={demand.id} {...demand} onStatusChange={onStatusChange} />
        ))}
      </div>
    </div>
  );
}
