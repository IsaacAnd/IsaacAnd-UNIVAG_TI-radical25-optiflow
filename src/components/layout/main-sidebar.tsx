import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Briefcase, Calendar, LayoutGrid, ListChecks, Settings } from 'lucide-react';
import NextLink from 'next/link';

interface MainSidebarProps {
  currentPage?: 'dashboard' |'demandas' | 'projetos' | 'eventos' | 'configuracoes';
}

export function MainSidebar({ currentPage = 'dashboard' }: MainSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H12V12H4V4Z" fill="currentColor" />
              <path d="M12 12H20V20H12V12Z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-foreground">MultiFlow</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={currentPage === 'dashboard'} className="text-base h-12 [&_svg]:w-6 [&_svg]:h-6">
              <NextLink href="/">
                <LayoutGrid />
                Dashboard
              </NextLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={currentPage === 'demandas'} className="text-base h-12 [&_svg]:w-6 [&_svg]:h-6">
               <NextLink href="/demandas">
                <ListChecks />
                Demandas
              </NextLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={currentPage === 'projetos'} className="text-base h-12 [&_svg]:w-6 [&_svg]:h-6">
              <NextLink href="/projetos">
                <Briefcase />
                Projetos
              </NextLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={currentPage === 'eventos'} className="text-base h-12 [&_svg]:w-6 [&_svg]:h-6">
              <NextLink href="/eventos">
                <Calendar />
                Eventos
              </NextLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={currentPage === 'configuracoes'} className="text-base h-12 [&_svg]:w-6 [&_svg]:h-6">
              <NextLink href="#">
                <Settings />
                Configurações
              </NextLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
