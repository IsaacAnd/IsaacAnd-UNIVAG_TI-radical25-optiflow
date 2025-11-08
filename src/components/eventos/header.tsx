'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { Bell, Search } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AvatarImage } from '@radix-ui/react-avatar';

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

export function EventosHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:h-24 md:px-8">
      <div className="flex-1">
        
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por tarefas, eventos..."
            className="w-[300px] pl-10"
          />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-6 w-6" />
          <span className="sr-only">Notificações</span>
        </Button>
        <Avatar className="h-11 w-11">
          {userAvatar && (
            <AvatarImage
              src={userAvatar.imageUrl}
              alt={userAvatar.description}
              data-ai-hint={userAvatar.imageHint}
            />
          )}
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
