'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:h-24 md:px-8">
      <div className="flex-1">
        <h1 className="text-2xl font-bold md:text-3xl">Olá, Ana!</h1>
        <p className="text-base text-muted-foreground">
          Aqui está um resumo das suas atividades e demandas.
        </p>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
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
          <div className="text-right">
            <div className="font-semibold">Ana</div>
            <div className="text-sm text-muted-foreground">Gerente</div>
          </div>
        </div>
      </div>
    </header>
  );
}
