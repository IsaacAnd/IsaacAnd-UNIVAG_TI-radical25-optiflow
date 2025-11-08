'use client';

import * as React from 'react';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
  isSameMonth,
  addDays,
  subDays,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CalendarEvent {
    date: string;
    title: string;
    color: string;
}

interface CalendarProps {
    events: CalendarEvent[];
}

type View = 'month' | 'week' | 'day';

export function Calendar({ events }: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [view, setView] = React.useState<View>('month');

  let today = startOfToday();
  const firstDayCurrentMonth = parse(format(currentDate, 'MMM-yyyy'), 'MMM-yyyy', new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth, { locale: ptBR }),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth), { locale: ptBR }),
  });

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate, { locale: ptBR }),
    end: endOfWeek(currentDate, { locale: ptBR }),
  });


  function previous() {
    if (view === 'month') {
        setCurrentDate(add(currentDate, { months: -1 }));
    } else if (view === 'week') {
        setCurrentDate(subDays(currentDate, 7));
    } else {
        setCurrentDate(subDays(currentDate, 1));
    }
  }

  function next() {
    if (view === 'month') {
        setCurrentDate(add(currentDate, { months: 1 }));
    } else if (view === 'week') {
        setCurrentDate(addDays(currentDate, 7));
    } else {
        setCurrentDate(addDays(currentDate, 1));
    }
  }

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(parseISO(event.date), day));
  };
  
  const getHeaderTitle = () => {
    if (view === 'month') {
        return format(currentDate, 'MMMM yyyy', { locale: ptBR });
    }
    if (view === 'week') {
        const start = startOfWeek(currentDate, { locale: ptBR });
        const end = endOfWeek(currentDate, { locale: ptBR });
        if (!isSameMonth(start, end)) {
            return `${format(start, 'MMM', { locale: ptBR })} - ${format(end, 'MMM yyyy', { locale: ptBR })}`;
        }
        return format(currentDate, 'MMMM yyyy', { locale: ptBR });
    }
    return format(currentDate, 'dd MMMM yyyy', { locale: ptBR });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold capitalize">
            {getHeaderTitle()}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="month" onValueChange={(value) => setView(value as View)}>
            <TabsList>
              <TabsTrigger value="month">Mês</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="day">Dia</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previous}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={next}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentDate(today)}>
              Hoje
            </Button>
          </div>
        </div>
        {view === 'month' && (
             <div className="grid grid-cols-7 border-t border-l">
                <div className="py-2 px-3 text-center font-medium text-muted-foreground border-r border-b">DOM</div>
                <div className="py-2 px-3 text-center font-medium text-muted-foreground border-r border-b">SEG</div>
                <div className="py-2 px-3 text-center font-medium text-muted-foreground border-r border-b">TER</div>
                <div className="py-2 px-3 text-center font-medium text-muted-foreground border-r border-b">QUA</div>
                <div className="py-2 px-3 text-center font-medium text-muted-foreground border-r border-b">QUI</div>
                <div className="py-2 px-3 text-center font-medium text-muted-foreground border-r border-b">SEX</div>
                <div className="py-2 px-3 text-center font-medium text-muted-foreground border-r border-b">SÁB</div>

                {days.map((day) => (
                    <div
                    key={day.toString()}
                    className={cn(
                        'p-2 border-r border-b h-40 relative flex flex-col',
                        !isSameMonth(day, firstDayCurrentMonth) && 'text-muted-foreground/50 bg-muted/20'
                    )}
                    >
                    <time
                        dateTime={format(day, 'yyyy-MM-dd')}
                        className={cn(
                        'text-sm self-start',
                        isToday(day) && 'flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground font-bold'
                        )}
                    >
                        {format(day, 'd')}
                    </time>
                    <div className="mt-1 space-y-1 overflow-y-auto">
                        {getEventsForDay(day).map((event) => (
                        <div key={event.title} className={cn('text-xs rounded-md px-2 py-1 border-l-4', event.color)}>
                            {event.title}
                        </div>
                        ))}
                    </div>
                    </div>
                ))}
             </div>
        )}
        {view === 'week' && (
            <div className="grid grid-cols-7 border-t border-l">
                 {weekDays.map((day) => (
                    <div key={day.toString()} className="py-2 px-3 text-center font-medium text-muted-foreground border-r border-b">
                        <p>{format(day, 'EEE', {locale: ptBR}).toUpperCase()}</p>
                        <p className={cn('text-2xl', isToday(day) && 'text-primary')}>{format(day, 'd')}</p>
                    </div>
                 ))}
                 {Array.from({length: 7}).map((_, dayIndex) => (
                     <div key={dayIndex} className="p-2 border-r border-b h-96 relative flex flex-col">
                        <div className="space-y-1 overflow-y-auto">
                            {getEventsForDay(weekDays[dayIndex]).map((event) => (
                                <div key={event.title} className={cn('text-sm rounded-md px-2 py-1 border-l-4', event.color)}>
                                    {event.title}
                                </div>
                            ))}
                        </div>
                     </div>
                 ))}
            </div>
        )}
        {view === 'day' && (
             <div className="border-t">
                <div className="grid grid-cols-[100px_1fr]">
                    <div className="border-r">
                         {Array.from({length: 24}).map((_, hour) => (
                            <div key={hour} className="h-16 border-b flex items-center justify-center text-sm text-muted-foreground">
                                {format(new Date(0,0,0,hour), 'HH:mm')}
                            </div>
                         ))}
                    </div>
                    <div className="relative">
                        {getEventsForDay(currentDate).map(event => {
                             const eventHour = 9; // Placeholder time
                             return (
                                <div key={event.title} className={cn("absolute w-[calc(100%-1rem)] ml-2 text-sm rounded-md px-3 py-2 border-l-4", event.color)}
                                 style={{top: `${eventHour * 4}rem`, height: '4rem'}}>
                                    <p className="font-semibold">{event.title}</p>
                                    <p>09:00 - 10:00</p>
                                </div>
                             )
                        })}

                    </div>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
